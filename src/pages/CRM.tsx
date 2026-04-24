import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useCRMStore } from '@/stores/crmStore';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { CRMStructuresSelector } from '@/components/crm/CRMStructuresSelector';
import { KanbanBoard } from '@/components/crm/Kanban/KanbanBoard';
import { DealList } from '@/components/crm/DealList';
import { DealCalendar } from '@/components/crm/DealCalendar';
import { toast } from 'sonner';
import { 
  BarChart3, 
  Settings, 
  Plus, 
  Search, 
  Filter,
  Users2,
  Building,
  Target,
  Zap,
  Download,
  MoreHorizontal,
  Activity,
  X,
  LayoutGrid,
  List,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { CreateItemModal } from '@/components/crm/CreateItemModal';
import { AdvancedFilters } from '@/components/crm/AdvancedFilters';
import { DetailDrawer } from '@/components/crm/DetailDrawer';

const CRM: React.FC<{ activeTab?: string, setActiveTab: (tab: string) => void }> = ({ activeTab: propActiveTab, setActiveTab }) => {
  const { 
    fetchInitialData, 
    isLoading, 
    structures, 
    activeStructure, 
    switchStructure, 
    error, 
    unsubscribeFromChanges,
    filters,
    setFilters,
    crmView,
    setCRMView
  } = useCRMStore();

  const [activeViewTab, setActiveViewTab] = useState('affari');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const handleOpenDeal = (event: any) => {
      const { dealId } = event.detail;
      const deals = useCRMStore.getState().getFilteredDeals();
      const deal = deals.find((d: any) => d.id === dealId);
      if (deal) {
        setSelectedDeal(deal);
        setIsDrawerOpen(true);
      }
    };

    window.addEventListener('crm:openDeal', handleOpenDeal);
    return () => window.removeEventListener('crm:openDeal', handleOpenDeal);
  }, []);

  useEffect(() => {
    // Force set default if no specific tab or if it's generic 'crm'
    if (!propActiveTab || propActiveTab === 'crm') {
      setActiveViewTab('affari');
    }
    fetchInitialData(propActiveTab);
    return () => unsubscribeFromChanges();
  }, [propActiveTab]);

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white m-8 rounded-3xl shadow-sm border border-rose-100">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-6">
          <Settings size={40} className="animate-spin-slow" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Errore di Sincronizzazione</h2>
        <p className="text-slate-500 max-w-md mt-2 font-medium">
          Non siamo riusciti a connetterci al database o inizializzare le strutture CRM. 
          Assicurati di aver configurato correttamente Supabase e di aver eseguito lo schema SQL.
        </p>
        <div className="bg-rose-50 p-4 rounded-xl mt-6 font-mono text-[10px] text-rose-600 max-w-lg overflow-auto border border-rose-100">
          Error Log: {error}
        </div>
        <Button 
          onClick={() => fetchInitialData(undefined, true)}
          className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full px-8 py-6 h-auto"
        >
          RIPROVA INIZIALIZZAZIONE
        </Button>
      </div>
    );
  }

  useLayoutEffect(() => {
    if (propActiveTab) {
      const tabMap: Record<string, string> = {
        'affari': 'affari',
        'deals': 'affari',
        'crm': 'affari',
        'leads': 'leads',
        'contacts': 'contatti',
        'companies': 'aziende',
        'analytics': 'analytics',
        'activities': 'analytics',
        'preventivi': 'affari'
      };
      const targetTab = tabMap[propActiveTab];
      if (targetTab && activeViewTab !== targetTab) {
        setActiveViewTab(targetTab);
      }
    }
  }, [propActiveTab]);

  const tabs = [
    { id: 'leads', label: 'Lead', icon: Users2 },
    { id: 'affari', label: 'Affari', icon: Target },
    { id: 'contatti', label: 'Contatti', icon: Users2 },
    { id: 'aziende', label: 'Aziende', icon: Building },
    { id: 'analytics', label: 'Analisi', icon: BarChart3 },
    { id: 'automazioni', label: 'Automazioni', icon: Zap },
    { id: 'configurazione', label: 'Configurazione', icon: Settings },
  ];

  return (
    <div className="h-full flex flex-col bg-[#f5f7fb] overflow-hidden relative">
      {/* Bitrix Style Header - Sticky */}
      <div className="bg-white border-b border-slate-200 shrink-0 shadow-sm z-30 sticky top-0 md:relative">
        <div className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="hidden md:flex items-center gap-2">
              <span className="text-[14px] font-medium text-slate-400 capitalize">CRM / </span>
              <span className="text-[14px] font-black text-slate-800 uppercase tracking-tight">Affari</span>
            </div>
            
            <div className="hidden md:block h-6 w-[1px] bg-slate-200" />
            
            <CRMStructuresSelector onSelect={() => {
              setActiveViewTab('affari');
              setActiveTab('affari');
            }} />
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-9 w-9 rounded-full text-blue-500 hover:bg-blue-50 bg-blue-50/50"
                  title="Simula Invio Form Google"
                >
                  <Zap size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[280px] p-2 rounded-xl shadow-2xl border-slate-100">
                <div className="px-3 py-2 border-b border-slate-50 mb-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Simulazione Ingresso</span>
                </div>
                <DropdownMenuItem 
                  onClick={async () => {
                    const payload = {
                      company: "AgriTech Innovative",
                      name: "Elena Verdi",
                      phone: "+39 333 9876543",
                      email: "elena@agritech.it",
                      type: "Credito d'Imposta 4.0",
                      budget: 150000,
                      service: "Finanza Agevolata",
                      notes: "Interessata a bando ministeriale",
                      expectedValue: 150000
                    };
                    try {
                      await supabaseCRMService.processFormSubmission(payload, 'https://forms.gle/RBigx9gHGJ5pEJeS6');
                      await fetchInitialData('finanza-agevolata');
                      toast.success("Affare creato in Finanza Agevolata!");
                    } catch (e) { toast.error("Errore simulazione"); }
                  }}
                  className="p-3 cursor-pointer rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-slate-700 uppercase">Bando Finanza Agevolata (SINCRO)</span>
                    <span className="text-[9px] text-slate-400 font-mono">forms.gle/RBigx9gHGJ5pEJeS6</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={async () => {
                    const payload = {
                      company: "Digital Bloom Agency",
                      name: "Luca Bianchi",
                      phone: "+39 347 1122334",
                      email: "luca@digitalbloom.com",
                      type: "Rifacimento Sito Web SEO",
                      budget: 12000,
                      service: "Digital Marketing",
                      notes: "Richiesta preventivo urgente",
                      expectedValue: 12000
                    };
                    try {
                      await supabaseCRMService.processFormSubmission(payload, 'https://forms.gle/kUaGCoJcW7uYZU44A');
                      await fetchInitialData('servizi-digitali');
                      toast.success("Affare creato in Servizi Digitali!");
                    } catch (e) { toast.error("Errore simulazione"); }
                  }}
                  className="p-3 cursor-pointer rounded-lg hover:bg-orange-50 transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-slate-700 uppercase">Servizi Digitali (SINCRO)</span>
                    <span className="text-[9px] text-slate-400 font-mono">forms.gle/kUaGCoJcW7uYZU44A</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#2FC6F6] hover:bg-[#1eb0e0] text-white font-black rounded-full px-4 md:px-6 h-10 text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100 hidden md:flex"
            >
              <Plus size={16} className="mr-2" /> 
              NUOVO AFFARE
            </Button>
          </div>
        </div>

        {/* Sub-navigation bar - Horizontal scroll on mobile */}
        <div className="px-4 md:px-6 flex items-center gap-6 md:gap-8 border-t border-slate-50 overflow-x-auto no-scrollbar">
           {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveViewTab(tab.id);
                // Update global state too so refresh works correctly
                setActiveTab(tab.id);
              }}
              className={cn(
                "py-3 text-[11px] font-black uppercase tracking-[0.15em] relative transition-all",
                activeViewTab === tab.id ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <div className="flex items-center gap-2">
                <tab.icon size={14} />
                {tab.label}
              </div>
              {activeViewTab === tab.id && (
                <motion.div 
                  layoutId="crmActiveTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main CRM Workspace */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Interaction Bar (Bitrix Style) - Sticky on mobile */}
        <div className="px-4 md:px-6 py-2.5 md:py-3 bg-[#eef2f7] border-b border-slate-200 flex items-center justify-between shrink-0 sticky top-[57px] md:relative z-20">
          <div className="flex items-center gap-3 md:gap-4 overflow-x-auto no-scrollbar flex-1 mr-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => fetchInitialData(activeStructure?.slug, true)}
              className="h-8 md:h-9 text-[9px] md:text-[10px] font-black text-blue-600 uppercase tracking-widest bg-white shadow-sm border border-slate-200 px-3 md:px-4 rounded-md hover:bg-blue-50 transition-colors shrink-0"
              title="Aggiorna dati"
            >
              <Activity size={14} className="mr-1.5 md:mr-2" /> AGGIORNA
            </Button>

            <AdvancedFilters />

            <div className="relative group w-40 md:w-64 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <Input 
                placeholder="Cerca in questa pipeline..." 
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
                className="pl-9 bg-white border-slate-200 h-8 md:h-9 rounded-md text-xs focus-visible:ring-1 focus-visible:ring-blue-400"
              />
              {filters.search && (
                <button 
                  onClick={() => setFilters({ search: '' })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Desktop View Switcher */}
            <div className="hidden lg:flex bg-slate-200/50 p-1 rounded-lg">
              <button 
                onClick={() => setCRMView('kanban')}
                className={cn(
                  "px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all",
                  crmView === 'kanban' ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"
                )}
              >
                Kanban
              </button>
              <button 
                onClick={() => setCRMView('list')}
                className={cn(
                  "px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all",
                  crmView === 'list' ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"
                )}
              >
                Elenco
              </button>
              <button 
                onClick={() => setCRMView('calendar')}
                className={cn(
                  "px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all",
                  crmView === 'calendar' ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"
                )}
              >
                Calendario
              </button>
            </div>

            {/* Mobile/Tablet View Switcher - Icons only */}
            <div className="flex lg:hidden bg-white border border-slate-200 p-1 rounded-lg shadow-sm">
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("h-8 w-8 rounded-md", crmView === 'kanban' ? "bg-blue-50 text-blue-600" : "text-slate-400")}
                onClick={() => setCRMView('kanban')}
              >
                <LayoutGrid size={16} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("h-8 w-8 rounded-md", crmView === 'list' ? "bg-blue-50 text-blue-600" : "text-slate-400")}
                onClick={() => setCRMView('list')}
              >
                <List size={16} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("h-8 w-8 rounded-md", crmView === 'calendar' ? "bg-blue-50 text-blue-600" : "text-slate-400")}
                onClick={() => setCRMView('calendar')}
              >
                <CalendarIcon size={16} />
              </Button>
            </div>
             
            <div className="hidden sm:block h-6 w-[1px] bg-slate-300 mx-2" />

             <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9 text-slate-500 bg-white border border-slate-200 shadow-sm">
              <Download size={15} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9 text-slate-500 bg-white border border-slate-200 shadow-sm">
              <MoreHorizontal size={15} />
            </Button>
          </div>
        </div>

        {/* Kanban Area */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
          <AnimatePresence mode="wait">
            {isLoading && structures.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[60] bg-white/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none"
              >
                <div className="bg-white/80 p-6 rounded-2xl shadow-2xl border border-slate-100 flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sincronizzazione in corso...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {activeViewTab === 'affari' ? (
            <AnimatePresence mode="wait">
              {crmView === 'kanban' && (
                <motion.div
                  key="kanban"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  className="h-full"
                >
                  <KanbanBoard />
                </motion.div>
              )}
              {crmView === 'list' && (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full flex flex-col"
                >
                  <DealList />
                </motion.div>
              )}
              {crmView === 'calendar' && (
                <motion.div
                  key="calendar"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full flex flex-col"
                >
                  <DealCalendar />
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            <motion.div 
              key="fallback"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col items-center justify-center text-center p-20"
            >
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-300 mb-6">
                <Plus size={40} className="rotate-45" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Modulo in fase di sviluppo</h2>
              <p className="text-slate-500 max-w-md mt-2 font-medium">
                Siamo attualmente impegnati nell'implementazione di questa sezione per offrirti un'esperienza CRM completa in stile Bitrix24.
              </p>
              <Button 
                onClick={() => setActiveViewTab('affari')}
                className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full px-8"
              >
                VAI AGLI AFFARI
              </Button>
            </motion.div>
          )}

          {/* Floating Action Button for Mobile */}
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#2FC6F6] text-white rounded-full shadow-2xl flex items-center justify-center z-50 active:scale-95 transition-transform"
          >
            <Plus size={28} />
          </button>
        </div>
      </div>
      <CreateItemModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        type="deal"
        pipelineId={activeStructure?.id}
      />
      
      <DetailDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        item={selectedDeal}
        type={activeViewTab === 'leads' ? 'lead' : 'deal'}
      />
    </div>
  );
};

export default CRM;
