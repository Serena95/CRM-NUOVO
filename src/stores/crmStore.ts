import { create } from 'zustand';
import { CRMStructure, CRMStage, CRMDeal } from '@/types/crm';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { CRM_STRUCTURES, CRM_PIPELINE_STAGES } from '@/constants/crm';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface CRMFilters {
  search: string;
  responsabile: string[];
  stage: string[];
  valore: [number, number];
  dataCreazione: { from?: Date; to?: Date };
  ultimaAttivita: string;
  scorePreanalisi: [number, number];
  struttura: string[];
  stato: string[];
}

interface SavedFilter {
  id: string;
  label: string;
  filters: Partial<CRMFilters>;
}

interface CRMState {
  structures: CRMStructure[];
  activeStructure: CRMStructure | null;
  stages: CRMStage[];
  deals: CRMDeal[];
  isLoading: boolean;
  initialLoadDone: boolean;
  error: string | null;
  subscription: RealtimeChannel | null;
  
  // Filters
  filters: CRMFilters;
  savedFilters: SavedFilter[];
  activeSavedFilterId: string | null;

  // Global Search
  globalSearchQuery: string;
  globalSearchResults: any[];
  isGlobalSearching: boolean;

  crmView: 'kanban' | 'list' | 'calendar';

  setStructures: (structures: CRMStructure[]) => void;
  setActiveStructure: (structure: CRMStructure) => void;
  setStages: (stages: CRMStage[]) => void;
  setDeals: (deals: CRMDeal[]) => void;
  
  setFilters: (filters: Partial<CRMFilters>) => void;
  setCRMView: (view: 'kanban' | 'list' | 'calendar') => void;
  resetFilters: () => void;
  applySavedFilter: (id: string) => void;
  saveCurrentFilter: (label: string) => void;
  
  setGlobalSearchQuery: (query: string) => void;
  searchGlobal: (query: string) => Promise<void>;
  
  fetchInitialData: (preferredStructureSlug?: string, force?: boolean) => Promise<void>;
  switchStructure: (structure: CRMStructure) => Promise<void>;
  moveDeal: (dealId: string, toStageId: string) => Promise<void>;
  subscribeToChanges: (structureId: string) => void;
  unsubscribeFromChanges: () => void;
  
  getFilteredDeals: () => CRMDeal[];
}

const DEFAULT_FILTERS: CRMFilters = {
  search: '',
  responsabile: [],
  stage: [],
  valore: [0, 1000000],
  dataCreazione: {},
  ultimaAttivita: 'all',
  scorePreanalisi: [0, 100],
  struttura: [],
  stato: []
};

export const useCRMStore = create<CRMState>((set, get) => ({
  structures: [],
  activeStructure: null,
  stages: [],
  deals: [],
  isLoading: false,
  initialLoadDone: false,
  error: null,
  subscription: null,

  // Filters state
  filters: DEFAULT_FILTERS,
  savedFilters: [
    { id: 'miei', label: 'I miei affari', filters: { responsabile: ['user-1'] } }, // Example for Marco
    { id: 'richiamare', label: 'Da richiamare', filters: { stage: ['verifica-telefonica'] } },
    { id: 'trattativa', label: 'In trattativa', filters: { stage: ['invio-preventivo'] } },
    { id: 'contratti', label: 'Contratti', filters: { stage: ['contratto'] } },
    { id: 'vinti', label: 'Vinti', filters: { stage: ['affare-vinto'] } },
  ],
  activeSavedFilterId: null,

  globalSearchQuery: '',
  globalSearchResults: [],
  isGlobalSearching: false,
  crmView: 'kanban',

  setStructures: (structures) => set({ structures }),
  setActiveStructure: (activeStructure) => set({ activeStructure }),
  setStages: (stages) => set({ stages }),
  setDeals: (deals) => set({ deals }),

  setFilters: (newFilters) => set((state) => ({ 
    filters: { ...state.filters, ...newFilters },
    activeSavedFilterId: null 
  })),

  setCRMView: (crmView) => set({ crmView }),

  resetFilters: () => set({ filters: DEFAULT_FILTERS, activeSavedFilterId: null }),

  applySavedFilter: (id) => {
    const saved = get().savedFilters.find(f => f.id === id);
    if (saved) {
      set({ 
        filters: { ...DEFAULT_FILTERS, ...saved.filters },
        activeSavedFilterId: id
      });
    }
  },

  saveCurrentFilter: (label) => {
    const newFilter: SavedFilter = {
      id: `custom-${Date.now()}`,
      label,
      filters: { ...get().filters }
    };
    set((state) => ({
      savedFilters: [...state.savedFilters, newFilter],
      activeSavedFilterId: newFilter.id
    }));
  },

  setGlobalSearchQuery: (query) => set({ globalSearchQuery: query }),

  searchGlobal: async (query) => {
    if (!query || query.length < 2) {
      set({ globalSearchResults: [], isGlobalSearching: false });
      return;
    }
    set({ isGlobalSearching: true });
    try {
      const results = await supabaseCRMService.searchGlobalDeals(query);
      set({ globalSearchResults: results });
    } catch (e) {
      console.error("Global search error:", e);
    } finally {
      set({ isGlobalSearching: false });
    }
  },

  getFilteredDeals: () => {
    const { deals, filters, stages } = get();
    return deals.filter(deal => {
      // Search text
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          deal.title?.toLowerCase().includes(searchLower) ||
          deal.company?.toLowerCase().includes(searchLower) ||
          deal.contact?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Responsabile
      if (filters.responsabile.length > 0 && !filters.responsabile.includes(deal.assigned_to)) {
        return false;
      }

      // Stage
      if (filters.stage.length > 0 && !filters.stage.includes(deal.stage_id)) {
        return false;
      }

      // Valore
      if (deal.value < filters.valore[0] || deal.value > filters.valore[1]) {
        return false;
      }

      // Score Preanalisi
      if (deal.preanalysis_result) {
        const score = deal.preanalysis_result.score;
        if (score < filters.scorePreanalisi[0] || score > filters.scorePreanalisi[1]) {
          return false;
        }
      }

      // Data Creazione
      if (filters.dataCreazione.from || filters.dataCreazione.to) {
        const created = new Date(deal.created_at);
        if (filters.dataCreazione.from && created < filters.dataCreazione.from) return false;
        if (filters.dataCreazione.to && created > filters.dataCreazione.to) return false;
      }

      // Stato (Vinto/Perso/Attivo)
      if (filters.stato.length > 0) {
        const stage = stages.find(s => s.id === deal.stage_id);
        const dealStatus = stage?.is_won ? 'vinto' : (stage?.is_lost ? 'perso' : 'attivo');
        if (!filters.stato.includes(dealStatus)) return false;
      }

      // Ultima Attività
      if (filters.ultimaAttivita !== 'all') {
        const lastUpdate = new Date(deal.updated_at || deal.created_at);
        const diffDays = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (filters.ultimaAttivita === 'today' && diffDays > 1) return false;
        if (filters.ultimaAttivita === 'week' && diffDays > 7) return false;
        if (filters.ultimaAttivita === 'month' && diffDays > 30) return false;
        if (filters.ultimaAttivita === 'inactive' && diffDays < 5) return false;
      }

      // Struttura (slug)
      if (filters.struttura.length > 0 && !filters.struttura.includes(deal.structure_id)) {
        // Note: deal.structure_id is usually a UUID, structure slug might be what filters.struttura contains
        // We'll check if the deal's structure matches any of the selected structure IDs
        return false;
      }

      return true;
    });
  },

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
