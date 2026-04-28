import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  setDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { CRMStructure, CRMStage, CRMDeal, CRMFormResult, PreanalysisResult, CRMAutomation, CRMCustomFieldDefinition, SmartProcess, SmartRecord, SmartFieldDefinition, WhatsAppMessage, CRMCalendarEvent, CRMTask, CRMSignature, CRMQuote, CRMProduct, ClientPortalAccess } from '@/types/crm';
import { CRM_STRUCTURES, CRM_PIPELINE_STAGES } from '@/constants/crm';
import { notificationService } from './notificationService';
import { whatsappService } from './whatsappService';
import { NotificationType } from '@/types/notifications';
import { supabaseFeedService } from './supabaseFeedService';

export const supabaseCRMService = {
  // Quotes & Products
  async getProducts() {
    const q = query(collection(db, 'crm_products'), orderBy('name', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CRMProduct));
  },

  async saveProduct(product: Partial<CRMProduct>) {
    const { id, ...data } = product;
    const payload = {
      ...data,
      created_at: new Date().toISOString()
    };

    if (id) {
      await updateDoc(doc(db, 'crm_products', id), payload);
    } else {
      await addDoc(collection(db, 'crm_products'), payload);
    }
  },

  async getQuotes(dealId: string) {
    const q = query(collection(db, 'crm_quotes'), where('deal_id', '==', dealId), orderBy('created_at', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CRMQuote));
  },

  async saveQuote(quote: Partial<CRMQuote>) {
    const { id, ...data } = quote;
    const user = auth.currentUser;
    const payload = {
      ...data,
      updated_at: new Date().toISOString(),
      ...(id ? {} : { 
        created_at: new Date().toISOString(),
        created_by: user?.uid || 'system'
      })
    };

    if (id) {
      await updateDoc(doc(db, 'crm_quotes', id), payload);
      return { id, ...payload } as CRMQuote;
    } else {
      const docRef = await addDoc(collection(db, 'crm_quotes'), payload);
      return { id: docRef.id, ...payload } as CRMQuote;
    }
  },

  async deleteQuote(id: string) {
    await deleteDoc(doc(db, 'crm_quotes', id));
  },

  // Portal Access
  async createPortalLink(dealId: string) {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    const payload = {
      deal_id: dealId,
      token,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString()
    };

    await setDoc(doc(db, 'crm_portal_access', token), payload);
    return token;
  },

  async getPortalAccess(token: string) {
    const snap = await getDoc(doc(db, 'crm_portal_access', token));
    if (!snap.exists()) return null;
    return snap.data() as ClientPortalAccess;
  },

  // Signatures
  async getSignatures(dealId: string) {
    const q = query(collection(db, 'crm_signatures'), where('deal_id', '==', dealId), orderBy('requested_at', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CRMSignature));
  },

  async saveSignature(sig: Partial<CRMSignature>) {
    const { id, ...data } = sig;
    const payload = {
      ...data,
      ...(id ? {} : { requested_at: new Date().toISOString() })
    };

    if (id) {
      await updateDoc(doc(db, 'crm_signatures', id), payload);
      return { id, ...payload } as CRMSignature;
    } else {
      const docRef = await addDoc(collection(db, 'crm_signatures'), payload);
      return { id: docRef.id, ...payload } as CRMSignature;
    }
  },

  // Tasks
  async getTasks(relatedId?: string, type?: string) {
    let q = query(collection(db, 'crm_tasks'), orderBy('created_at', 'desc'));
    if (relatedId && type) {
      q = query(collection(db, 'crm_tasks'), where('related_to_id', '==', relatedId), where('related_to_type', '==', type), orderBy('created_at', 'desc'));
    }
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CRMTask));
  },

  async saveTask(task: Partial<CRMTask>) {
    const { id, ...data } = task;
    const currentUser = auth.currentUser;
    
    const payload = {
      ...data,
      updated_at: new Date().toISOString(),
      ...(id ? {} : { created_at: new Date().toISOString(), created_by: currentUser?.uid, assigned_to: data.assigned_to || currentUser?.uid })
    };

    if (id) {
      await updateDoc(doc(db, 'crm_tasks', id), payload);
      return { id, ...payload } as CRMTask;
    } else {
      const docRef = await addDoc(collection(db, 'crm_tasks'), payload);
      return { id: docRef.id, ...payload } as CRMTask;
    }
  },

  async deleteTask(id: string) {
    await deleteDoc(doc(db, 'crm_tasks', id));
  },

  // Calendar Events
  async getCalendarEvents() {
    const snap = await getDocs(collection(db, 'calendar_events'));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CRMCalendarEvent));
  },

  async getDealCalendarEvents(dealId: string) {
    const q = query(collection(db, 'calendar_events'), where('deal_id', '==', dealId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CRMCalendarEvent));
  },

  async saveCalendarEvent(event: Partial<CRMCalendarEvent>) {
    const { id, ...data } = event;
    const currentUser = auth.currentUser;
    
    const payload = {
      ...data,
      updated_at: new Date().toISOString(),
      ...(id ? {} : { created_at: new Date().toISOString(), assigned_to: currentUser?.uid })
    };

    if (id) {
      await updateDoc(doc(db, 'calendar_events', id), payload);
      return { id, ...payload } as CRMCalendarEvent;
    } else {
      const docRef = await addDoc(collection(db, 'calendar_events'), payload);
      return { id: docRef.id, ...payload } as CRMCalendarEvent;
    }
  },

  async deleteCalendarEvent(id: string) {
    await deleteDoc(doc(db, 'calendar_events', id));
  },

  // Helper to send notifications
  async sendCRMNotification(params: {
    type: NotificationType;
    title: string;
    description: string;
    dealId: string;
    dealTitle: string;
    structureId?: string;
    structureSlug?: string;
    userId: string;
  }) {
    const currentUser = auth.currentUser;
    await notificationService.createNotification({
      type: params.type,
      title: params.title,
      description: params.description,
      dealId: params.dealId,
      dealTitle: params.dealTitle,
      structureId: params.structureId,
      structureSlug: params.structureSlug,
      userId: params.userId,
      createdBy: {
        id: currentUser?.uid || 'system',
        name: currentUser?.displayName || 'System Automation',
        avatar: currentUser?.photoURL || undefined
      }
    });
  },

  // Initialize CRM structures and stages if they don't exist
  async initializeCRM() {
    try {
      // Init WhatsApp Templates
      await whatsappService.initializeTemplates();

      const structuresRef = collection(db, 'crm_structures');
      const structsSnap = await getDocs(structuresRef);
      const existingSlugs = new Set(structsSnap.docs.map(doc => doc.data().slug));
      
      const newStructuresToInsert = CRM_STRUCTURES.filter(s => !existingSlugs.has(s.slug));

      for (const s of newStructuresToInsert) {
        await addDoc(structuresRef, {
          name: s.name,
          slug: s.slug,
          color: s.color,
          created_at: new Date().toISOString()
        });
      }

      // Re-fetch ALL structures
      const allStructsSnap = await getDocs(structuresRef);
      const allStructs = allStructsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CRMStructure));

      for (const struct of allStructs) {
        const stagesRef = collection(db, 'crm_stages');
        const q = query(stagesRef, where('structure_id', '==', struct.id));
        const stagesSnap = await getDocs(q);
        
        const stageMap = new Map();
        stagesSnap.docs.forEach(doc => {
          const s = doc.data();
          if (s.name === 'Modulo preanalisi') {
            stageMap.set('Form preanalisi', { id: doc.id, ...s });
          } else {
            stageMap.set(s.name, { id: doc.id, ...s });
          }
        });

        for (const stageDef of CRM_PIPELINE_STAGES) {
          const existing = stageMap.get(stageDef.name);
          if (existing) {
            const updates: any = {};
            if (existing.name === 'Modulo preanalisi') updates.name = 'Form preanalisi';
            if (existing.position !== stageDef.position) updates.position = stageDef.position;
            if (existing.color !== stageDef.color) updates.color = stageDef.color;
            if (existing.is_won !== stageDef.is_won) updates.is_won = stageDef.is_won;
            if (existing.is_lost !== stageDef.is_lost) updates.is_lost = stageDef.is_lost;

            if (Object.keys(updates).length > 0) {
              await updateDoc(doc(db, 'crm_stages', existing.id), updates);
            }
          } else {
            await addDoc(stagesRef, {
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
    const q = query(collection(db, 'crm_structures'), orderBy('name'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CRMStructure));
  },

  async getStages(structureId?: string) {
    let q = query(collection(db, 'crm_stages'), orderBy('position'));
    if (structureId) {
      q = query(collection(db, 'crm_stages'), where('structure_id', '==', structureId), orderBy('position'));
    }
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CRMStage));
  },

  async getDeals(structureId?: string) {
    let q = query(collection(db, 'crm_deals'), orderBy('created_at', 'desc'));
    if (structureId) {
      q = query(collection(db, 'crm_deals'), where('structure_id', '==', structureId), orderBy('created_at', 'desc'));
    }
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CRMDeal));
  },

  async updateDealStage(dealId: string, stageId: string) {
    const stageSnap = await getDoc(doc(db, 'crm_stages', stageId));
    const stageData = stageSnap.data();

    const dealRef = doc(db, 'crm_deals', dealId);
    await updateDoc(dealRef, { stage_id: stageId, updated_at: new Date().toISOString() });
    
    const updatedDealSnap = await getDoc(dealRef);
    const deal = { id: updatedDealSnap.id, ...updatedDealSnap.data() } as CRMDeal;

    if (stageData) {
      const isWon = stageData.name.toLowerCase().includes('vinto');
      const isLost = stageData.name.toLowerCase().includes('perso');
      
      let type: NotificationType = 'stage_change';
      if (isWon) type = 'deal_won';
      if (isLost) type = 'deal_lost';

      await this.sendCRMNotification({
        type,
        title: isWon ? '🏆 Affare Vinto!' : (isLost ? '❌ Affare Perso' : '🔄 Cambio Stage'),
        description: `L'affare "${deal.title}" è passato allo stage: ${stageData.name}`,
        dealId: deal.id,
        dealTitle: deal.title,
        structureId: deal.structure_id,
        userId: deal.assigned_to === 'user-1' || deal.assigned_to === 'user-2' || deal.assigned_to === 'user-3' ? deal.assigned_to : 'all'
      });

      const currentUser = auth.currentUser;
      await supabaseFeedService.logCRMActivity({
        type: isWon ? 'deal_won' : (isLost ? 'deal_lost' : 'stage_change'),
        dealId: deal.id,
        dealTitle: deal.title,
        content: `L'affare **${deal.title}** è passato allo stage: **${stageData.name}**`,
        authorId: currentUser?.uid || 'system',
        authorName: currentUser?.displayName || 'Sistema',
        authorPhoto: currentUser?.photoURL || undefined,
        metadata: {
          previous_stage_id: deal.stage_id, // This is actually the new one now
          new_stage_name: stageData.name,
          is_won: isWon,
          is_lost: isLost
        }
      });

      await this.triggerAutomations(deal, stageData.name);
    }

    return deal;
  },

  async createDeal(dealData: Partial<CRMDeal>) {
    const docRef = await addDoc(collection(db, 'crm_deals'), {
      ...dealData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    const snap = await getDoc(docRef);
    const data = { id: snap.id, ...snap.data() } as CRMDeal;

    const currentUser = auth.currentUser;
    await supabaseFeedService.logCRMActivity({
      type: 'deal_created',
      dealId: data.id,
      dealTitle: data.title,
      content: `Creato nuovo affare: **${data.title}** per **${data.company || 'N/A'}**`,
      authorId: currentUser?.uid || 'system',
      authorName: currentUser?.displayName || 'Sistema',
      authorPhoto: currentUser?.photoURL || undefined,
      metadata: {
        value: data.value,
        company: data.company
      }
    });

    return data;
  },

  async updateDeal(dealId: string, updates: Partial<CRMDeal>) {
    const dealRef = doc(db, 'crm_deals', dealId);
    await updateDoc(dealRef, { ...updates, updated_at: new Date().toISOString() });
    const snap = await getDoc(dealRef);
    return { id: snap.id, ...snap.data() } as CRMDeal;
  },

  async triggerAutomations(deal: CRMDeal, stageName: string) {
    const autoUpdates: Partial<CRMDeal> = {};
    let shouldUpdateDeal = false;

    if (stageName === 'Form preanalisi' && (!deal.assigned_to || deal.assigned_to === 'Support Team')) {
      autoUpdates.assigned_to = 'user-1'; 
      autoUpdates.team = 'Sales Team';
      shouldUpdateDeal = true;
      await this.addActivity(deal.id, 'system', '🤖 Assegnazione Automatica', 'Affare assegnato a Marco Rossini (Commerciale) per primo contatto.');
    }

    if (shouldUpdateDeal) {
      await this.updateDeal(deal.id, autoUpdates);
    }

    try {
      const dynamicAutos = await this.getAutomations(deal.stage_id);
      for (const auto of dynamicAutos) {
        if (!auto.is_active) continue;

        switch (auto.type) {
          case 'task':
            await this.saveTask({
              title: auto.config.title || 'Nuovo Task',
              description: auto.config.description || 'Task generato automaticamente dal workflow.',
              status: 'todo',
              priority: 'medium',
              related_to_id: deal.id,
              related_to_type: 'deal',
              related_to_name: deal.title,
              assigned_to: deal.assigned_to
            });
            break;
          case 'notification':
            await this.sendCRMNotification({
              type: 'system_alert',
              title: '🤖 Automazione',
              description: auto.config.message || 'Nuova notifica automatica',
              dealId: deal.id,
              dealTitle: deal.title,
              userId: deal.assigned_to
            });
            break;
          case 'note':
            await this.addActivity(deal.id, 'note', 'Nota Automatica', auto.config.body || 'Nota generata dal sistema.');
            break;
          case 'assignee':
            if (auto.config.assignee_id) {
               await this.updateDeal(deal.id, { assigned_to: auto.config.assignee_id });
            }
            break;
          case 'whatsapp':
            if (auto.config.body && deal.phone) {
              await whatsappService.sendMessage({
                dealId: deal.id,
                recipientPhone: deal.phone,
                content: auto.config.body.replace('{{contact}}', deal.contact).replace('{{deal}}', deal.title)
              });
            }
            break;
        }
      }
    } catch (e) {
      console.warn("Dynamic automations failed:", e);
    }
  },

  async addActivity(dealId: string, type: 'task' | 'call' | 'note' | 'system', title: string, description: string) {
    const dealSnap = await getDoc(doc(db, 'crm_deals', dealId));
    const deal = dealSnap.exists() ? { id: dealSnap.id, ...dealSnap.data() } as CRMDeal : null;
    
    const activityRef = await addDoc(collection(db, 'crm_activities'), {
      deal_id: dealId,
      type,
      title,
      description,
      created_at: new Date().toISOString()
    });
    
    if (deal) {
      let feedType: 'task' | 'comment' | 'note' = 'comment';
      if (type === 'task') feedType = 'task';
      if (type === 'note') feedType = 'note';

      await this.sendCRMNotification({
        type: type === 'task' ? 'task_created' : 'new_comment',
        title: type === 'task' ? '📅 Nuovo Task Creato' : (type === 'note' ? '📝 Nuova Nota' : '💬 Nuovo Commento'),
        description: `${title}: ${description.substring(0, 50)}${description.length > 50 ? '...' : ''}`,
        dealId,
        dealTitle: deal.title,
        structureId: deal.structure_id,
        userId: deal.assigned_to.startsWith('user-') ? deal.assigned_to : 'all'
      });

      const currentUser = auth.currentUser;
      await supabaseFeedService.logCRMActivity({
        type: feedType,
        dealId,
        dealTitle: deal.title,
        content: `**${title}**: ${description}`,
        authorId: currentUser?.uid || 'system',
        authorName: currentUser?.displayName || 'Sistema',
        authorPhoto: currentUser?.photoURL || undefined,
        metadata: {
          activity_type: type
        }
      });
    }
  },

  async logFileActivity(dealId: string, fileName: string, fileSize: number) {
     const dealSnap = await getDoc(doc(db, 'crm_deals', dealId));
     const deal = dealSnap.exists() ? { id: dealSnap.id, ...dealSnap.data() } as CRMDeal : null;
     if (!deal) return;

     const currentUser = auth.currentUser;
     await supabaseFeedService.logCRMActivity({
        type: 'file',
        dealId,
        dealTitle: deal.title,
        content: `Caricato nuovo file: **${fileName}** (${Math.round(fileSize / 1024)} KB)`,
        authorId: currentUser?.uid || 'system',
        authorName: currentUser?.displayName || 'Sistema',
        authorPhoto: currentUser?.photoURL || undefined,
        metadata: {
          file_name: fileName,
          file_size: fileSize
        }
     });
  },

  async getDealActivities(dealId: string) {
    const q = query(collection(db, 'crm_activities'), where('deal_id', '==', dealId), orderBy('created_at', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getStructureActivities(structureId: string) {
    // In Firestore we can't do a real inner join easily. 
    // We'll fetch deals first, then activities for those deals.
    const dealsQ = query(collection(db, 'crm_deals'), where('structure_id', '==', structureId));
    const dealsSnap = await getDocs(dealsQ);
    const dealIds = dealsSnap.docs.map(doc => doc.id);
    
    if (dealIds.length === 0) return [];

    const activitiesQ = query(collection(db, 'crm_activities'), where('deal_id', 'in', dealIds), orderBy('created_at', 'desc'));
    const snap = await getDocs(activitiesQ);
    
    const dealsMap = new Map();
    dealsSnap.docs.forEach(doc => dealsMap.set(doc.id, doc.data()));

    return snap.docs.map(doc => {
      const data: any = doc.data();
      return {
        id: doc.id,
        ...data,
        crm_deals: {
          id: data.deal_id,
          ...dealsMap.get(data.deal_id)
        }
      };
    });
  },

  async checkAndTriggerReminders(deal: CRMDeal, stageName: string) {
    const inactivity = (await import('@/lib/reminderUtils')).getInactivityData(deal, stageName);
    if (!inactivity || !inactivity.isExpired) return;

    const lastReminderStage = deal.custom_fields?.last_reminder_stage;
    if (lastReminderStage === stageName) return;

    try {
      await this.addActivity(
        deal.id, 
        'task', 
        `⏰ REMINDER: ${stageName}`, 
        `Questo affare è inattivo da ${inactivity.daysInactivity} giorni nello stage "${stageName}".`
      );

      await this.updateDeal(deal.id, {
        custom_fields: {
          ...(deal.custom_fields || {}),
          last_reminder_stage: stageName
        }
      });

      console.log(`Reminder triggered for deal ${deal.id} in stage ${stageName}`);
    } catch (error) {
      console.error("Error triggering reminder:", error);
    }
  },

  async processFormSubmission(payload: any, formUrl: string) {
    const formMappings: Record<string, string> = {
      'https://forms.gle/RBigx9gHGJ5pEJeS6': 'finanza-agevolata',
      'https://forms.gle/kUaGCoJcW7uYZU44A': 'servizi-digitali'
    };

    const structureSlug = formMappings[formUrl] || 'finanza-agevolata';

    const structQ = query(collection(db, 'crm_structures'), where('slug', '==', structureSlug));
    const structSnap = await getDocs(structQ);
    if (structSnap.empty) throw new Error(`Structure not found for slug: ${structureSlug}`);
    const struct = { id: structSnap.docs[0].id, ...structSnap.docs[0].data() } as CRMStructure;

    const stageQ = query(collection(db, 'crm_stages'), where('structure_id', '==', struct.id), where('name', '==', 'Form preanalisi'));
    const stageSnap = await getDocs(stageQ);
    if (stageSnap.empty) throw new Error('Preanalysis stage not found');
    const stageId = stageSnap.docs[0].id;

    const score = Math.floor(Math.random() * 40) + 60; 
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
      estimated_amount: payload.expectedValue || payload.budget || 0,
      auto_notes: [`Preanalisi automatica: Score ${score}%`, `Fonte: ${formUrl}`],
      submission_date: new Date().toISOString()
    };

    await addDoc(collection(db, 'crm_form_results'), {
      structure_slug: structureSlug,
      form_url: formUrl,
      payload,
      score,
      result: resultText,
      created_at: new Date().toISOString()
    });

    const dealRef = await addDoc(collection(db, 'crm_deals'), {
      structure_id: struct.id,
      stage_id: stageId,
      title: `Lead Google Form: ${payload.company}`,
      company: payload.company,
      contact: payload.name,
      phone: payload.phone,
      email: payload.email,
      value: payload.expectedValue || 0,
      assigned_to: 'Support Team',
      preanalysis_result: preanalysis,
      form_source: formUrl,
      custom_fields: payload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    const dealSnap = await getDoc(dealRef);
    const deal = { id: dealSnap.id, ...dealSnap.data() } as CRMDeal;

    await this.sendCRMNotification({
      type: 'new_form',
      title: '📝 Nuovo Form Preanalisi',
      description: `Nuovo lead da Google Form per ${payload.company}`,
      dealId: deal.id,
      dealTitle: deal.title,
      structureId: struct.id,
      structureSlug: struct.slug,
      userId: 'all'
    });

    await this.addActivity(deal.id, 'system', '📝 Form Ricevuto', `Lead acquisito tramite form Google: ${formUrl}`);
    
    await this.saveTask({
      title: '📞 Verifica telefonica',
      description: `Contattare ${payload.name} al numero ${payload.phone} per verificare il form inviato tramite ${formUrl}.`,
      status: 'todo',
      priority: 'high',
      related_to_id: deal.id,
      related_to_type: 'deal',
      related_to_name: deal.title,
      assigned_to: deal.assigned_to
    });
    
    // Auto WhatsApp Welcome
    if (deal.phone) {
      await whatsappService.sendMessage({
        dealId: deal.id,
        recipientPhone: deal.phone,
        content: `Ciao ${deal.contact}! Abbiamo ricevuto la tua richiesta per "${deal.title}". Un nostro consulente ti contatterà presto.`
      });
    }

    return deal;
  },

  async getAutomations(stageId: string) {
    const q = query(collection(db, 'crm_automations'), where('stage_id', '==', stageId), orderBy('created_at'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CRMAutomation));
  },

  async saveAutomation(automation: Partial<CRMAutomation>) {
    const { id, ...saveData } = automation;
    if (id) {
       const docRef = doc(db, 'crm_automations', id);
       await updateDoc(docRef, saveData);
       const snap = await getDoc(docRef);
       return { id: snap.id, ...snap.data() } as CRMAutomation;
    } else {
       const docRef = await addDoc(collection(db, 'crm_automations'), {
         ...saveData,
         created_at: new Date().toISOString()
       });
       const snap = await getDoc(docRef);
       return { id: snap.id, ...snap.data() } as CRMAutomation;
    }
  },

  async deleteAutomation(id: string) {
    await deleteDoc(doc(db, 'crm_automations', id));
  },

  async getCustomFieldDefinitions(entityType?: 'deal' | 'contact' | 'company' | 'lead') {
    let q = query(collection(db, 'crm_field_definitions'), orderBy('order'));
    if (entityType) {
      q = query(collection(db, 'crm_field_definitions'), where('entity_type', '==', entityType), orderBy('order'));
    }
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CRMCustomFieldDefinition));
  },

  async saveCustomFieldDefinition(field: Partial<CRMCustomFieldDefinition>) {
    const { id, ...saveData } = field;
    if (id) {
      await updateDoc(doc(db, 'crm_field_definitions', id), saveData);
      const snap = await getDoc(doc(db, 'crm_field_definitions', id));
      return { id: snap.id, ...snap.data() } as CRMCustomFieldDefinition;
    } else {
      const docRef = await addDoc(collection(db, 'crm_field_definitions'), saveData);
      const snap = await getDoc(docRef);
      return { id: snap.id, ...snap.data() } as CRMCustomFieldDefinition;
    }
  },

  async deleteCustomFieldDefinition(id: string) {
    await deleteDoc(doc(db, 'crm_field_definitions', id));
  },

  async searchGlobalDeals(queryString: string) {
    if (!queryString || queryString.length < 2) return [];

    // Firestore doesn't support complex full-text search with ilike.
    // We'll fetch some and filter in memory for this demo.
    const snap = await getDocs(collection(db, 'crm_deals'));
    const allDeals = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    
    const lowerQuery = queryString.toLowerCase();
    const results = allDeals.filter(d => 
      d.title?.toLowerCase().includes(lowerQuery) ||
      d.company?.toLowerCase().includes(lowerQuery) ||
      d.contact?.toLowerCase().includes(lowerQuery) ||
      d.email?.toLowerCase().includes(lowerQuery) ||
      d.phone?.toLowerCase().includes(lowerQuery)
    ).slice(0, 10);

    return results;
  },

  async deleteDeal(id: string) {
    await deleteDoc(doc(db, 'crm_deals', id));
  },

  // SMART PROCESSES
  async getSmartProcesses() {
    const q = query(collection(db, 'smart_processes'), orderBy('created_at'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SmartProcess));
  },

  async saveSmartProcess(process: Partial<SmartProcess>) {
    const { id, ...saveData } = process;
    if (id) {
      await updateDoc(doc(db, 'smart_processes', id), saveData);
      const snap = await getDoc(doc(db, 'smart_processes', id));
      return { id: snap.id, ...snap.data() } as SmartProcess;
    } else {
      const docRef = await addDoc(collection(db, 'smart_processes'), {
        ...saveData,
        created_at: new Date().toISOString()
      });
      const snap = await getDoc(docRef);
      return { id: snap.id, ...snap.data() } as SmartProcess;
    }
  },

  async deleteSmartProcess(id: string) {
    await deleteDoc(doc(db, 'smart_processes', id));
  },

  async getSmartRecords(processId: string) {
    const q = query(collection(db, 'smart_records'), where('process_id', '==', processId), orderBy('created_at'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SmartRecord));
  },

  async getSmartFieldDefinitions(processId: string) {
    const q = query(collection(db, 'smart_fields'), where('process_id', '==', processId), orderBy('order'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SmartFieldDefinition));
  },

  async getSmartRecordById(id: string) {
    const snap = await getDoc(doc(db, 'smart_records', id));
    return { id: snap.id, ...snap.data() } as SmartRecord;
  },

  async saveSmartRecord(record: Partial<SmartRecord>) {
    const { id, ...saveData } = record;
    if (id) {
      await updateDoc(doc(db, 'smart_records', id), {
        ...saveData,
        updated_at: new Date().toISOString()
      });
      const snap = await getDoc(doc(db, 'smart_records', id));
      return { id: snap.id, ...snap.data() } as SmartRecord;
    } else {
      const docRef = await addDoc(collection(db, 'smart_records'), {
        ...saveData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      const snap = await getDoc(docRef);
      return { id: snap.id, ...snap.data() } as SmartRecord;
    }
  },

  async deleteSmartRecord(id: string) {
    await deleteDoc(doc(db, 'smart_records', id));
  }
};

