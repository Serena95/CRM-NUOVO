import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useCRMStore } from '@/stores/crmStore';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { CRMStructuresSelector } from '@/components/crm/CRMStructuresSelector';
import { KanbanBoard } from '@/components/crm/Kanban/KanbanBoard';
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
  Activity
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

const CRM: React.FC<{ activeTab?: string, setActiveTab: (tab: string) => void }> = ({ activeTab: propActiveTab, setActiveTab }) => {
  const { fetchInitialData, isLoading, structures, activeStructure, switchStructure, error, unsubscribeFromChanges } = useCRMStore();
  const [activeViewTab, setActiveViewTab] = useState('affari');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
      {/* Bitrix Style Header */}
      <div className="bg-white border-b border-slate-200 shrink-0 shadow-sm z-30">
        <div className="px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-medium text-slate-400 capitalize">CRM / </span>
              <span className="text-[14px] font-black text-slate-800 uppercase tracking-tight">Affari</span>
            </div>
            
            <div className="h-6 w-[1px] bg-slate-200" />
            
            <CRMStructuresSelector onSelect={() => {
              setActiveViewTab('affari');
              setActiveTab('affari');
            }} />
          </div>

          <div className="flex items-center gap-3">
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
              className="bg-[#2FC6F6] hover:bg-[#1eb0e0] text-white font-black rounded-full px-6 h-10 text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100"
            >
              <Plus size={16} className="mr-2" /> 
              NUOVO AFFARE
            </Button>
          </div>
        </div>

        {/* Sub-navigation bar (Tabs style like Bitrix top bar) */}
        <div className="px-6 flex items-center gap-8 border-t border-slate-50">
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
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Interaction Bar (Bitrix Style) */}
        <div className="px-6 py-3 bg-[#eef2f7] border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => fetchInitialData(activeStructure?.slug, true)}
              className="h-9 text-[10px] font-black text-blue-600 uppercase tracking-widest bg-white shadow-sm border border-slate-200 px-4 rounded-md hover:bg-blue-50 transition-colors"
              title="Aggiorna dati"
            >
              <Activity size={14} className="mr-2" /> AGGIORNA
            </Button>

            <Button variant="ghost" size="sm" className="h-9 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white shadow-sm border border-slate-200 px-4 rounded-md hover:bg-slate-50 transition-colors">
              <Filter size={14} className="mr-2 text-blue-500" /> FILTRI
            </Button>

            <div className="relative group w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <Input 
                placeholder="Cerca in questa pipeline..." 
                className="pl-9 bg-white border-slate-200 h-9 rounded-md text-xs focus-visible:ring-1 focus-visible:ring-blue-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
             <div className="flex bg-slate-200/50 p-1 rounded-lg">
               <button className="px-4 py-1.5 bg-white shadow-sm rounded-md text-[10px] font-black text-blue-600 uppercase tracking-widest transition-all">Kanban</button>
               <button className="px-4 py-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-700 transition-all">Elenco</button>
             </div>
             
             <div className="h-6 w-[1px] bg-slate-300 mx-2" />

             <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 bg-white border border-slate-200 shadow-sm">
              <Download size={15} />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 bg-white border border-slate-200 shadow-sm">
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
            <KanbanBoard key="kanban" />
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
        </div>
      </div>
      <CreateItemModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        type="deal"
        pipelineId={activeStructure?.id}
      />
    </div>
  );
};

export default CRM;
