import { supabase } from '@/lib/supabase';
import { CRMStructure, CRMStage, CRMDeal, CRMFormResult, PreanalysisResult } from '@/types/crm';
import { CRM_STRUCTURES, CRM_PIPELINE_STAGES } from '@/constants/crm';

export const supabaseCRMService = {
  // Initialize CRM structures and stages if they don't exist
  async initializeCRM() {
    try {
      // 1. Get existing structures
      const { data: existingStructs, error: fetchStructError } = await supabase
        .from('crm_structures')
        .select('slug');
      
      if (fetchStructError) throw fetchStructError;
      
      const existingSlugs = new Set(existingStructs?.map(s => s.slug) || []);
      const newStructuresToInsert = CRM_STRUCTURES.filter(s => !existingSlugs.has(s.slug));

      // 2. Insert missing structures
      if (newStructuresToInsert.length > 0) {
        const { error: structError } = await supabase
          .from('crm_structures')
          .insert(newStructuresToInsert.map(s => ({
            name: s.name,
            slug: s.slug,
            color: s.color
          })));
        if (structError) throw structError;
      }

      // 3. Re-fetch ALL structures
      const { data: allStructs, error: allFetchError } = await supabase
        .from('crm_structures')
        .select('*');
      
      if (allFetchError) throw allFetchError;

      // 4. For each structure, sync required stages
      for (const struct of allStructs) {
        const { data: currentStages, error: fetchStagesError } = await supabase
          .from('crm_stages')
          .select('*')
          .eq('structure_id', struct.id);
        
        if (fetchStagesError) throw fetchStagesError;
        
        const stageMap = new Map(currentStages?.map(s => [s.name, s]) || []);

        for (const stageDef of CRM_PIPELINE_STAGES) {
          const existing = stageMap.get(stageDef.name);
          if (existing) {
            // Update position/attributes if changed
            if (existing.position !== stageDef.position || existing.color !== stageDef.color) {
              await supabase.from('crm_stages').update({
                position: stageDef.position,
                color: stageDef.color,
                is_won: stageDef.is_won,
                is_lost: stageDef.is_lost
              }).eq('id', existing.id);
            }
          } else {
            // Insert missing stage
            await supabase.from('crm_stages').insert({
              structure_id: struct.id,
              name: stageDef.name,
              position: stageDef.position,
              is_won: stageDef.is_won,
              is_lost: stageDef.is_lost,
              color: stageDef.color
            });
          }
        }
      }
    } catch (error) {
      console.error("CRM Sync failed:", error);
      throw error;
    }
  },

  async getStructures() {
    const { data, error } = await supabase
      .from('crm_structures')
      .select('*')
      .order('name');
    if (error) throw error;
    return data as CRMStructure[];
  },

  async getStages(structureId: string) {
    const { data, error } = await supabase
      .from('crm_stages')
      .select('*')
      .eq('structure_id', structureId)
      .order('position');
    if (error) throw error;
    return data as CRMStage[];
  },

  async getDeals(structureId: string) {
    const { data, error } = await supabase
      .from('crm_deals')
      .select('*')
      .eq('structure_id', structureId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as CRMDeal[];
  },

  async updateDealStage(dealId: string, stageId: string) {
    const { data: stage } = await supabase
      .from('crm_stages')
      .select('name')
      .eq('id', stageId)
      .single();

    const { data, error } = await supabase
      .from('crm_deals')
      .update({ stage_id: stageId, updated_at: new Date().toISOString() })
      .eq('id', dealId)
      .select()
      .single();
    
    if (error) throw error;

    // Trigger automations based on stage transition
    if (stage) {
      await this.triggerAutomations(data as CRMDeal, stage.name);
    }

    return data as CRMDeal;
  },

  async createDeal(dealData: Partial<CRMDeal>) {
    const { data, error } = await supabase
      .from('crm_deals')
      .insert({
        ...dealData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as CRMDeal;
  },

  async triggerAutomations(deal: CRMDeal, stageName: string) {
    const automations: Record<string, () => Promise<any>> = {
      'Verifica telefonica': async () => 
        this.addActivity(deal.id, 'task', '📞 Task: Chiamata', `Effettuare chiamata di verifica per ${deal.contact} (${deal.company}).`),
      
      'Invio preventivo': async () => 
        this.addActivity(deal.id, 'task', '📋 Task: Follow-up', `Eseguire follow-up per il preventivo inviato a ${deal.company}.`),
      
      'Contratto': async () => 
        this.addActivity(deal.id, 'task', '✍️ Task: Firma', `Verificare e sollecitare la firma del contratto per ${deal.title}.`),
      
      'Pagamento': async () => {
        console.log(`[NOTIFICA ADMIN] Pagamento per deal ${deal.title}`);
        return this.addActivity(deal.id, 'system', '💰 Notifica Admin', 'Affare in fase pagamento. Notifica inviata all\'amministrazione per incasso.');
      },
      
      'Affare vinto': async () => {
        await this.addActivity(deal.id, 'system', '🏆 Affare Vinto', 'Il deal è stato chiuso positivamente.');
        // Qui potremmo aggiungere logica per "chiudere" l'affare se avessimo un campo status
      },
      
      'Affare perso': async () => {
        await this.addActivity(deal.id, 'system', '❌ Affare Perso', 'Il deal è stato chiuso negativamente.');
      }
    };

    if (automations[stageName]) {
      await automations[stageName]();
    }
  },

  async addActivity(dealId: string, type: 'task' | 'call' | 'note' | 'system', title: string, description: string) {
    const { error } = await supabase
      .from('crm_activities')
      .insert({
        deal_id: dealId,
        type,
        title,
        description
      });
    
    if (error) console.error('Error adding activity:', error);
  },

  async getDealActivities(dealId: string) {
    const { data, error } = await supabase
      .from('crm_activities')
      .select('*')
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async processFormSubmission(payload: any, formUrl: string) {
    // 1. Map form URL to structure slug
    const formMappings: Record<string, string> = {
      'https://forms.gle/RBigx9gHGJ5pEJeS6': 'finanza-agevolata',
      'https://forms.gle/kUaGCoJcW7uYZU44A': 'servizi-digitali'
    };

    const structureSlug = formMappings[formUrl] || 'finanza-agevolata';

    // 2. Get structure and preanalysis stage
    const { data: struct } = await supabase
      .from('crm_structures')
      .select('*')
      .eq('slug', structureSlug)
      .single();

    if (!struct) throw new Error(`Structure not found for slug: ${structureSlug}`);

    const { data: stage } = await supabase
      .from('crm_stages')
      .select('id')
      .eq('structure_id', struct.id)
      .eq('name', 'Form preanalisi')
      .single();

    if (!stage) throw new Error('Preanalysis stage not found');

    // 3. Score logic (demo)
    const score = Math.floor(Math.random() * 40) + 60; // 60-100 range
    const resultText = score > 85 ? 'Positivo' : (score > 70 ? 'Dubbio' : 'Negativo');

    const preanalysis: PreanalysisResult = {
      score,
      result: resultText,
      company_data: {
        name: payload.company || 'N/A',
        vat: payload.vat
      },
      contact_data: {
        name: payload.name || 'N/A',
        phone: payload.phone || 'N/A',
        email: payload.email || 'N/A'
      },
      request_type: payload.type || 'N/A',
      budget: payload.budget || payload.expectedValue || 0,
      service_requested: payload.service || 'N/A',
      notes: payload.notes || 'N/A',
      estimated_amount: payload.expectedValue || 0,
      auto_notes: [`Preanalisi automatica: Score ${score}%`, `Fonte: ${formUrl}`],
      submission_date: new Date().toISOString()
    };

    // 4. Create form result audit
    await supabase.from('crm_form_results').insert({
      structure_slug: structureSlug,
      form_url: formUrl,
      payload,
      score,
      result: resultText
    });

    // 5. Create Deal
    const { data: deal, error: dealError } = await supabase
      .from('crm_deals')
      .insert({
        structure_id: struct.id,
        stage_id: stage.id,
        title: `Lead Google Form: ${payload.company}`,
        company: payload.company,
        contact: payload.name,
        phone: payload.phone,
        email: payload.email,
        value: payload.expectedValue || 0,
        assigned_to: 'Support Team', // Default commerciale
        preanalysis_result: preanalysis,
        form_source: formUrl,
        custom_fields: payload
      })
      .select()
      .single();

    if (dealError) throw dealError;

    // 6. AUTOMATIONS
    // A. Add Activity "Form Ricevuto"
    await this.addActivity(deal.id, 'system', '📝 Form Ricevuto', `Lead acquisito tramite form Google: ${formUrl}`);
    
    // B. Create task "Verifica telefonica"
    await this.addActivity(deal.id, 'task', '📞 Verifica telefonica', `Contattare ${payload.name} al numero ${payload.phone} per verificare il form inviato.`);
    
    // C. Send notification (simulated)
    console.log(`[NOTIFICA COMMERCIALE] Nuovo deal creato in ${struct.name}: ${deal.title}`);

    return deal;
  }
};
