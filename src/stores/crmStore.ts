import { create } from 'zustand';
import { CRMStructure, CRMStage, CRMDeal } from '@/types/crm';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { CRM_STRUCTURES, CRM_PIPELINE_STAGES } from '@/constants/crm';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface CRMState {
  structures: CRMStructure[];
  activeStructure: CRMStructure | null;
  stages: CRMStage[];
  deals: CRMDeal[];
  isLoading: boolean;
  initialLoadDone: boolean;
  error: string | null;
  subscription: RealtimeChannel | null;

  setStructures: (structures: CRMStructure[]) => void;
  setActiveStructure: (structure: CRMStructure) => void;
  setStages: (stages: CRMStage[]) => void;
  setDeals: (deals: CRMDeal[]) => void;
  
  fetchInitialData: (preferredStructureSlug?: string, force?: boolean) => Promise<void>;
  switchStructure: (structure: CRMStructure) => Promise<void>;
  moveDeal: (dealId: string, toStageId: string) => Promise<void>;
  subscribeToChanges: (structureId: string) => void;
  unsubscribeFromChanges: () => void;
}

export const useCRMStore = create<CRMState>((set, get) => ({
  structures: [],
  activeStructure: null,
  stages: [],
  deals: [],
  isLoading: false,
  initialLoadDone: false,
  error: null,
  subscription: null,

  setStructures: (structures) => set({ structures }),
  setActiveStructure: (activeStructure) => set({ activeStructure }),
  setStages: (stages) => set({ stages }),
  setDeals: (deals) => set({ deals }),

  subscribeToChanges: (structureId) => {
    // Clean up previous subscription
    get().unsubscribeFromChanges();

    const channel = supabase
      .channel(`crm-deals-${structureId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'crm_deals',
          filter: `structure_id=eq.${structureId}`
        },
        async (payload: any) => {
          // Granular update instead of full refresh to improve performance
          const { eventType, new: nextDeal, old: prevDeal } = payload;
          
          set((state) => {
            let nextDeals = [...state.deals];
            if (eventType === 'INSERT') {
              nextDeals = [nextDeal as CRMDeal, ...nextDeals];
            } else if (eventType === 'UPDATE') {
              nextDeals = nextDeals.map(d => d.id === nextDeal.id ? { ...d, ...nextDeal } : d);
            } else if (eventType === 'DELETE') {
              const deletedId = prevDeal?.id || payload.old?.id;
              if (deletedId) {
                nextDeals = nextDeals.filter(d => d.id !== deletedId);
              }
            }
            return { deals: nextDeals };
          });
        }
      )
      .subscribe();

    set({ subscription: channel });
  },

  unsubscribeFromChanges: () => {
    const { subscription } = get();
    if (subscription) {
      supabase.removeChannel(subscription);
      set({ subscription: null });
    }
  },

  fetchInitialData: async (preferredStructureSlug?: string, force = false) => {
    // Avoid double loading or unnecessary re-loading
    const { isLoading, initialLoadDone } = get();
    if (isLoading) return;
    if (initialLoadDone && !preferredStructureSlug && !force) return;
    
    set({ isLoading: true, error: null });
    
    // Safety Timeout for DB connection (5 seconds)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Database Timeout")), 5000)
    );

    try {
      // Race between DB fetching and a 5s timeout
      await Promise.race([
        (async () => {
          try {
            await supabaseCRMService.initializeCRM();
          } catch (e) { console.warn("Init skipped"); }

          const structures = await supabaseCRMService.getStructures();
          if (structures && structures.length > 0) {
            // Find preferred structure or use default
            let activeStruct = structures[0];
            if (preferredStructureSlug) {
               const found = structures.find(s => s.slug === preferredStructureSlug || `nexus-${s.slug}` === preferredStructureSlug);
               if (found) activeStruct = found;
            }

            // Fetch everything before updating state to avoid flickering
            const [stages, deals] = await Promise.all([
              supabaseCRMService.getStages(activeStruct.id),
              supabaseCRMService.getDeals(activeStruct.id)
            ]);
            
            set({ 
              structures, 
              activeStructure: activeStruct,
              stages,
              deals,
              initialLoadDone: true
            });
            
            get().subscribeToChanges(activeStruct.id);
            return true;
          }
          throw new Error("No data in DB");
        })(),
        timeoutPromise
      ]);

    } catch (error: any) {
      console.warn("CRM Fetch failed or timed out, switching to local mode:", error.message);
      
      // FALLBACK: Use Constants
      const fallbackStructures = CRM_STRUCTURES.map(s => ({
        id: `local-${s.slug}`,
        name: s.name,
        slug: s.slug,
        color: s.color,
        created_at: new Date().toISOString()
      }));
      
      set({ structures: fallbackStructures });
      const defaultStruct = fallbackStructures[0];
      set({ activeStructure: defaultStruct });
      
      const fallbackStages = CRM_PIPELINE_STAGES.map((s, i) => ({
        id: `local-stage-${i}`,
        structure_id: defaultStruct.id,
        name: s.name,
        position: s.position,
        color: s.color,
        is_won: s.is_won,
        is_lost: s.is_lost,
        created_at: new Date().toISOString()
      }));
      
      set({ stages: fallbackStages, deals: [], error: null, initialLoadDone: true });
    } finally {
      set({ isLoading: false });
    }
  },

  switchStructure: async (structure) => {
    // Reset stages and deals immediately to prevent layout flickering from previous structure
    set({ 
      isLoading: true, 
      activeStructure: structure, 
      stages: [], 
      deals: [],
      error: null 
    });

    try {
      if (structure.id.startsWith('local-')) {
        // Fallback stages for local structures
        const fallbackStages = CRM_PIPELINE_STAGES.map((s, i) => ({
          id: `local-stage-${i}`,
          structure_id: structure.id,
          name: s.name,
          position: s.position,
          color: s.color,
          is_won: s.is_won,
          is_lost: s.is_lost,
          created_at: new Date().toISOString()
        }));
        set({ stages: fallbackStages, deals: [] });
        get().unsubscribeFromChanges();
      } else {
        const [stages, deals] = await Promise.all([
          supabaseCRMService.getStages(structure.id),
          supabaseCRMService.getDeals(structure.id)
        ]);
        set({ stages, deals });
        get().subscribeToChanges(structure.id);
      }
    } catch (error: any) {
      set({ error: error.message });
      toast.error("Errore nel caricamento della pipeline");
    } finally {
      set({ isLoading: false });
    }
  },

  moveDeal: async (dealId, toStageId) => {
    const originalDeals = get().deals;
    const stages = get().stages;
    const toStage = stages.find(s => s.id === toStageId);
    
    // Constraint: Stage Preanalysis is automatic only
    if (toStage?.name.toLowerCase().includes('preanalisi')) {
      toast.error("Questa colonna è automatica. Non è possibile spostare affari qui manualmente.");
      return;
    }

    const deal = originalDeals.find(d => d.id === dealId);
    if (!deal) return;

    // Optimistic update
    const updatedDeals = originalDeals.map(d => 
      d.id === dealId ? { ...d, stage_id: toStageId } : d
    );
    set({ deals: updatedDeals });

    try {
      await supabaseCRMService.updateDealStage(dealId, toStageId);
    } catch (error: any) {
      set({ deals: originalDeals, error: error.message });
    }
  }
}));
