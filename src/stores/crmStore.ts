import { create } from 'zustand';
import { CRMStructure, CRMStage, CRMDeal, CRMCustomFieldDefinition, SmartProcess } from '@/types/crm';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { CRM_STRUCTURES, CRM_PIPELINE_STAGES } from '@/constants/crm';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, Unsubscribe } from 'firebase/firestore';

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
  customFields: CRMCustomFieldDefinition[];
  smartProcesses: SmartProcess[];
  isLoading: boolean;
  initialLoadDone: boolean;
  error: string | null;
  unsubscribeFn: Unsubscribe | null;
  
  // Filters
  filters: CRMFilters;
  savedFilters: SavedFilter[];
  activeSavedFilterId: string | null;
  activeSavedFilterLabel: string | null;

  // Global Search
  globalSearchQuery: string;
  globalSearchResults: any[];
  isGlobalSearching: boolean;

  crmView: 'kanban' | 'list' | 'calendar';

  setStructures: (structures: CRMStructure[]) => void;
  setActiveStructure: (structure: CRMStructure) => void;
  setStages: (stages: CRMStage[]) => void;
  setDeals: (deals: CRMDeal[]) => void;
  setCustomFields: (fields: CRMCustomFieldDefinition[]) => void;
  
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
  customFields: [],
  smartProcesses: [],
  isLoading: false,
  initialLoadDone: false,
  error: null,
  unsubscribeFn: null,

  // Filters state
  filters: DEFAULT_FILTERS,
  savedFilters: [
    { id: 'miei', label: 'I miei affari', filters: { responsabile: ['user-1'] } }, 
    { id: 'richiamare', label: 'Da richiamare', filters: { stage: ['verifica-telefonica'] } },
    { id: 'trattativa', label: 'In trattativa', filters: { stage: ['invio-preventivo'] } },
    { id: 'contratti', label: 'Contratti', filters: { stage: ['contratto'] } },
    { id: 'vinti', label: 'Vinti', filters: { stage: ['affare-vinto'] } },
  ],
  activeSavedFilterId: null,
  activeSavedFilterLabel: null,

  globalSearchQuery: '',
  globalSearchResults: [],
  isGlobalSearching: false,
  crmView: 'kanban',

  setStructures: (structures) => set({ structures }),
  setActiveStructure: (activeStructure) => set({ activeStructure }),
  setStages: (stages) => set({ stages }),
  setDeals: (deals) => set({ deals }),
  setCustomFields: (customFields) => set({ customFields }),

  setFilters: (newFilters) => set((state) => ({ 
    filters: { ...state.filters, ...newFilters },
    activeSavedFilterId: null,
    activeSavedFilterLabel: null
  })),

  setCRMView: (crmView) => set({ crmView }),

  resetFilters: () => set({ filters: DEFAULT_FILTERS, activeSavedFilterId: null, activeSavedFilterLabel: null }),

  applySavedFilter: (id) => {
    const saved = get().savedFilters.find(f => f.id === id);
    if (saved) {
      set({ 
        filters: { ...DEFAULT_FILTERS, ...saved.filters },
        activeSavedFilterId: id,
        activeSavedFilterLabel: saved.label
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
      activeSavedFilterId: newFilter.id,
      activeSavedFilterLabel: label
    }));
  },

  setGlobalSearchQuery: (query) => set({ globalSearchQuery: query }),

  searchGlobal: async (queryStr) => {
    if (!queryStr || queryStr.length < 2) {
      set({ globalSearchResults: [], isGlobalSearching: false });
      return;
    }
    set({ isGlobalSearching: true });
    try {
      const results = await supabaseCRMService.searchGlobalDeals(queryStr);
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
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          deal.title?.toLowerCase().includes(searchLower) ||
          deal.company?.toLowerCase().includes(searchLower) ||
          deal.contact?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      if (filters.responsabile.length > 0 && !filters.responsabile.includes(deal.assigned_to)) return false;
      if (filters.stage.length > 0 && !filters.stage.includes(deal.stage_id)) return false;
      if (deal.value < filters.valore[0] || deal.value > filters.valore[1]) return false;
      if (deal.preanalysis_result) {
        const score = deal.preanalysis_result.score;
        if (score < filters.scorePreanalisi[0] || score > filters.scorePreanalisi[1]) return false;
      }
      if (filters.dataCreazione.from || filters.dataCreazione.to) {
        const created = new Date(deal.created_at);
        if (filters.dataCreazione.from && created < filters.dataCreazione.from) return false;
        if (filters.dataCreazione.to && created > filters.dataCreazione.to) return false;
      }
      if (filters.stato.length > 0) {
        const stage = stages.find(s => s.id === deal.stage_id);
        const dealStatus = stage?.is_won ? 'vinto' : (stage?.is_lost ? 'perso' : 'attivo');
        if (!filters.stato.includes(dealStatus)) return false;
      }
      if (filters.ultimaAttivita !== 'all') {
        const lastUpdate = new Date(deal.updated_at || deal.created_at);
        const diffDays = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
        if (filters.ultimaAttivita === 'today' && diffDays > 1) return false;
        if (filters.ultimaAttivita === 'week' && diffDays > 7) return false;
        if (filters.ultimaAttivita === 'month' && diffDays > 30) return false;
        if (filters.ultimaAttivita === 'inactive' && diffDays < 5) return false;
      }
      return true;
    });
  },

  subscribeToChanges: (structureId) => {
    get().unsubscribeFromChanges();

    const q = query(
      collection(db, 'crm_deals'), 
      where('structure_id', '==', structureId)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const deals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CRMDeal));
      set({ deals: deals.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) });
    });

    set({ unsubscribeFn: unsub });
  },

  unsubscribeFromChanges: () => {
    const { unsubscribeFn } = get();
    if (unsubscribeFn) {
      unsubscribeFn();
      set({ unsubscribeFn: null });
    }
  },

  fetchInitialData: async (preferredStructureSlug?: string, force = false) => {
    const { isLoading, initialLoadDone } = get();
    if (isLoading) return;
    if (initialLoadDone && !preferredStructureSlug && !force) return;
    
    set({ isLoading: true, error: null });
    
    try {
      try {
        await supabaseCRMService.initializeCRM();
      } catch (e) { 
        console.warn("Init skipped or already done"); 
      }

      const structures = await supabaseCRMService.getStructures();
      if (structures && structures.length > 0) {
        let activeStruct = structures[0];
        if (preferredStructureSlug) {
           const found = structures.find(s => s.slug === preferredStructureSlug || `nexus-${s.slug}` === preferredStructureSlug);
           if (found) activeStruct = found;
        }

        const [stages, deals, customFields, smartProcesses] = await Promise.all([
          supabaseCRMService.getStages(activeStruct.id),
          supabaseCRMService.getDeals(activeStruct.id),
          supabaseCRMService.getCustomFieldDefinitions(),
          supabaseCRMService.getSmartProcesses()
        ]);
        
        set({ 
          structures, 
          activeStructure: activeStruct,
          stages,
          deals,
          customFields,
          smartProcesses,
          initialLoadDone: true
        });
        
        get().subscribeToChanges(activeStruct.id);
      } else {
        throw new Error("No CRM data found");
      }
    } catch (error: any) {
      console.warn("CRM Fetch failed, using fallback:", error.message);
      
      const fallbackStructures = CRM_STRUCTURES.map(s => ({
        id: `local-${s.slug}`,
        name: s.name,
        slug: s.slug,
        color: s.color,
        created_at: new Date().toISOString()
      }));
      
      const defaultStruct = fallbackStructures[0];
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
      
      set({ 
        structures: fallbackStructures, 
        activeStructure: defaultStruct, 
        stages: fallbackStages, 
        deals: [], 
        initialLoadDone: true 
      });
    } finally {
      set({ isLoading: false });
    }
  },

  switchStructure: async (structure) => {
    set({ isLoading: true, activeStructure: structure, stages: [], deals: [], error: null });

    try {
      if (structure.id.startsWith('local-')) {
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
    
    if (toStage?.name.toLowerCase().includes('preanalisi')) {
      toast.error("Questa colonna è automatica. Non è possibile spostare affari qui manualmente.");
      return;
    }

    const deal = originalDeals.find(d => d.id === dealId);
    if (!deal) return;

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

