import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Deal, Lead, Pipeline, PipelineStage, Contact, Company } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, Grid, List as ListIcon, Download, MoreHorizontal, ClipboardCheck, GitBranch, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { KanbanBoard } from '@/components/crm/KanbanBoard';
import { LeadCard, DealCard } from '@/components/crm/CRMCards';
import { DetailDrawer } from '@/components/crm/DetailDrawer';
import { CreateItemModal } from '@/components/crm/CreateItemModal';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';
import { CRM_PIPELINES, DEFAULT_STAGES } from '@/constants/crm';
import { processNewDeal } from '@/services/automationService';
import PipelineSettings from './PipelineSettings';
import FinanzaAgevolataForm from '@/components/crm/FinanzaAgevolataForm';
import ServiziDigitaliForm from '@/components/crm/ServiziDigitaliForm';
import BusinessModule from './BusinessModule';
import QuoteModule from './QuoteModule';
import Analytics from './Analytics';
import Automations from './Automations';
import ChatAgente from '@/components/crm/ChatAgente';

const CRM: React.FC<{ activeTab?: string }> = ({ activeTab: propActiveTab }) => {
  const { tenant } = useAuth();
  const [activeTab, setActiveTab] = useState('leads');
  const [selectedArea, setSelectedArea] = useState<string>('GENERALE');

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  
  // Data States
  const [leads, setLeads] = useState<Lead[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [activePipeline, setActivePipeline] = useState<Pipeline | null>(null);

  useEffect(() => {
    if (propActiveTab) {
      const tab = propActiveTab === 'crm' ? 'leads' : propActiveTab;
      setActiveTab(tab);
      
      if (tab.startsWith('pipeline-')) {
        const pId = tab.replace('pipeline-', '');
        setSelectedArea(pId);
        const p = pipelines.find(pip => pip.id === pId);
        if (p) setActivePipeline(p);
      }
    }
  }, [propActiveTab, pipelines]);

  useEffect(() => {
    if (!pipelines.length) return;
    
    // Try to find the pipeline in the fetched pipelines from Firestore
    let p = pipelines.find(pip => pip.id === selectedArea);
    
    // Fallback: If not found in Firestore, check if it matches by name (case insensitive)
    if (!p) {
      const areaDef = CRM_PIPELINES.find(def => def.id === selectedArea);
      if (areaDef) {
        p = pipelines.find(pip => 
          pip.name.toLowerCase().includes(areaDef.name.toLowerCase())
        );
      }
    }

    // Final Fallback: Use the definition from constants with default stages
    if (!p) {
      const def = CRM_PIPELINES.find(pip => pip.id === selectedArea);
      if (def) {
        p = {
          ...def,
          stages: DEFAULT_STAGES,
          tenantId: tenant?.id || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as Pipeline;
      }
    }
    
    if (p) setActivePipeline(p);
  }, [selectedArea, pipelines, tenant]);
  
  useEffect(() => {
    const handleOpenCreate = (e: any) => {
      setCreateType(e.detail.type);
      setIsCreateModalOpen(true);
    };
    window.addEventListener('crm:openCreate', handleOpenCreate as any);
    return () => window.removeEventListener('crm:openCreate', handleOpenCreate as any);
  }, []);

  // UI States
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createType, setCreateType] = useState<'lead' | 'deal' | 'contact' | 'company'>('lead');
  const [showFinanzaForm, setShowFinanzaForm] = useState(true);
  const [showDigitalForm, setShowDigitalForm] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const tabs = React.useMemo(() => {
    const baseTabs = [
      { id: 'leads', label: 'Lead', badge: leads.length },
      { id: 'deals', label: 'Affari', badge: deals.length },
      { id: 'contacts', label: 'Contatti', badge: contacts.length },
      { id: 'companies', label: 'Aziende', badge: companies.length },
      { id: 'preventivi', label: 'Preventivi' },
      { id: 'ai-agente', label: 'AI Agente' },
      { id: 'activities', label: 'Attività' },
      { id: 'analytics', label: 'Analisi' },
      { id: 'automation', label: 'Automazione' },
    ];

    if (activeTab.startsWith('nexus-') && !baseTabs.find(t => t.id === activeTab)) {
      const nexusLabels: Record<string, string> = {
        'nexus-finanza': 'Finanza Agevolata',
        'nexus-digitale': 'Servizi Digitali',
        'nexus-consulenze': 'Consulenze',
        'nexus-economie': 'Economie',
        'nexus-eventi': 'Organizzazione Eventi',
        'nexus-prodotti': 'Prodotti e Servizi',
        'nexus-formazione': 'Formazione',
        'nexus-coworking': 'Coworking',
        'nexus-prenotazioni': 'Prenotazioni Online',
        'nexus-preventivi': 'Preventivi Nexus',
        'nexus-general': 'Anagrafica Clienti'
      };
      
      baseTabs.push({ 
        id: activeTab, 
        label: nexusLabels[activeTab] || activeTab.replace('nexus-', '').toUpperCase() 
      });
    }

    return baseTabs;
  }, [leads.length, deals.length, contacts.length, companies.length, quotes.length, activeTab]);

  // Scroll refs for navigation
  const tabsRef = React.useRef<HTMLDivElement>(null);
  const pipelinesRef = React.useRef<HTMLDivElement>(null);
  const [canScrollTabs, setCanScrollTabs] = useState({ left: false, right: false });
  const [canScrollPipelines, setCanScrollPipelines] = useState({ left: false, right: false });

  const checkScroll = (ref: React.RefObject<HTMLDivElement>, setter: React.Dispatch<React.SetStateAction<{ left: boolean, right: boolean }>>) => {
    if (ref.current) {
      const { scrollLeft, scrollWidth, clientWidth } = ref.current;
      const left = scrollLeft > 0;
      const right = scrollLeft < scrollWidth - clientWidth - 1;
      
      setter(prev => {
        if (prev.left === left && prev.right === right) return prev;
        return { left, right };
      });
    }
  };

  useEffect(() => {
    const checkAll = () => {
      checkScroll(tabsRef, setCanScrollTabs);
      checkScroll(pipelinesRef, setCanScrollPipelines);
    };
    
    // Initial check
    checkAll();
    
    // Check after a small delay to ensure DOM is ready
    const timer = setTimeout(checkAll, 100);
    
    window.addEventListener('resize', checkAll);
    return () => {
      window.removeEventListener('resize', checkAll);
      clearTimeout(timer);
    };
  }, [tabs.length, CRM_PIPELINES.length, activeTab, selectedArea]);

  const scroll = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 200;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (!tenant) return;

    // Fetch Pipelines
    const unsubPipelines = onSnapshot(collection(db, 'tenants', tenant.id, 'pipelines'), (snap) => {
      const pips = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pipeline));
      setPipelines(pips);
      if (pips.length > 0 && !activePipeline) {
        setActivePipeline(pips[0]);
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, `tenants/${tenant.id}/pipelines`));

    // Fetch Leads
    const unsubLeads = onSnapshot(collection(db, 'tenants', tenant.id, 'leads'), (snap) => {
      setLeads(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `tenants/${tenant.id}/leads`));

    // Fetch Deals
    const unsubDeals = onSnapshot(collection(db, 'tenants', tenant.id, 'deals'), (snap) => {
      setDeals(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Deal)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `tenants/${tenant.id}/deals`));

    // Fetch Contacts
    const unsubContacts = onSnapshot(collection(db, 'tenants', tenant.id, 'contacts'), (snap) => {
      setContacts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contact)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `tenants/${tenant.id}/contacts`));

    // Fetch Companies
    const unsubCompanies = onSnapshot(collection(db, 'tenants', tenant.id, 'companies'), (snap) => {
      setCompanies(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Company)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `tenants/${tenant.id}/companies`));

    // Fetch Quotes for badge
    const unsubQuotes = onSnapshot(collection(db, 'tenants', tenant.id, 'quotes'), (snap) => {
      setQuotes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `tenants/${tenant.id}/quotes`));

    return () => {
      unsubPipelines();
      unsubLeads();
      unsubDeals();
      unsubContacts();
      unsubCompanies();
      unsubQuotes();
    };
  }, [tenant]);

  const handleItemMove = async (itemId: string, newStageId: string) => {
    if (!tenant) return;
    const collectionName = activeTab === 'leads' ? 'leads' : 'deals';
    const itemRef = doc(db, 'tenants', tenant.id, collectionName, itemId);
    await updateDoc(itemRef, { 
      stageId: newStageId,
      updatedAt: serverTimestamp()
    });
  };

  const addItem = async (stageId: string) => {
    if (!tenant) return;
    const collectionName = activeTab === 'leads' ? 'leads' : 'deals';
    const dealData = {
      tenantId: tenant.id,
      title: `Nuovo ${activeTab === 'leads' ? 'Lead' : 'Affare'}`,
      pipelineId: activePipeline?.id || 'default',
      stageId: stageId,
      value: Math.floor(Math.random() * 5000) + 500,
      status: activeTab === 'leads' ? 'active' : undefined,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'tenants', tenant.id, collectionName), dealData);
    
    if (collectionName === 'deals') {
      await processNewDeal(tenant.id, docRef.id, dealData);
    }
  };

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setIsDrawerOpen(true);
  };

  const currentDeals = activeTab === 'deals' || activeTab.startsWith('pipeline-')
    ? deals.filter(d => d.pipelineId === selectedArea)
    : deals;

  const currentLeads = activeTab === 'leads'
    ? leads.filter(l => l.pipelineId === selectedArea || !l.pipelineId)
    : leads;

  const getPipelineColor = () => {
    if (!activePipeline) return '#3b82f6';
    const p = CRM_PIPELINES.find(pip => pip.id === activePipeline.id);
    return p?.color || '#3b82f6';
  };

  return (
    <div className="h-full flex flex-col bg-[#f5f7fb] overflow-hidden w-full max-w-full relative">
      {/* CRM Header (Consolidated & Responsive) */}
      <div className="bg-white border-b border-slate-200 shrink-0 shadow-sm z-20 w-full overflow-visible">
        {/* Top Row: Context & Primary Actions */}
        <div className="px-4 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-visible">
          <div className="flex items-center gap-3 lg:gap-8 overflow-visible flex-1">
            <div className="flex flex-col shrink-0 min-w-0">
              <h1 className="text-lg lg:text-2xl font-black text-brand-blue uppercase tracking-tighter leading-none truncate">
                {activeTab === 'leads' ? 'Lead' : activeTab === 'deals' ? 'Affari' : 'CRM'}
              </h1>
              <span className="text-[10px] lg:text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1 truncate max-w-[150px] sm:max-w-none">
                {activePipeline?.name.replace(/^[0-9.]+\s*/, '') || 'GENERALE'}
              </span>
            </div>
            
            <Button 
              onClick={() => {
                const type = activeTab === 'leads' ? 'lead' : (activeTab === 'deals' || activeTab.startsWith('pipeline-')) ? 'deal' : activeTab === 'contacts' ? 'contact' : 'company';
                setCreateType(type as any);
                setIsCreateModalOpen(true);
              }}
              className="font-black rounded-full px-4 lg:px-6 h-9 lg:h-10 text-[9px] lg:text-[11px] uppercase tracking-widest shadow-lg text-white transition-all hover:scale-105 active:scale-95 bg-brand-blue hover:bg-brand-blue/90 shrink-0"
            >
              <Plus size={14} className="mr-1 lg:mr-2" />
              <span className="hidden xs:inline">NUOVO {activeTab === 'leads' ? 'LEAD' : (activeTab === 'deals' || activeTab.startsWith('pipeline-')) ? 'AFFARE' : activeTab === 'contacts' ? 'CONTATTO' : 'AZIENDA'}</span>
              <span className="xs:hidden">NUOVO</span>
            </Button>
          </div>

          <div className="flex items-center gap-2 lg:gap-3 shrink-0 self-end sm:self-auto">
            <div className="relative group w-40 sm:w-64 hidden xs:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue transition-colors" size={12} />
              <Input 
                placeholder="Cerca..." 
                className="pl-9 bg-slate-50 border-none shadow-inner h-8 rounded-full text-xs focus-visible:ring-2 focus-visible:ring-brand-blue/30 w-full"
              />
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:bg-slate-100">
                <Download size={14} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:bg-slate-100">
                <Settings size={14} />
              </Button>
            </div>
          </div>
        </div>

        {/* Middle Row: Navigation Tabs */}
        <div className="px-4 lg:px-8 flex items-center justify-between border-t border-slate-50 relative group/tabs bg-white overflow-hidden">
          <div className="relative flex-1 overflow-hidden flex items-center h-12 lg:h-14">
            <AnimatePresence>
              {canScrollTabs.left && (
                <button 
                  onClick={() => scroll(tabsRef, 'left')}
                  className="absolute left-0 z-10 h-full px-2 bg-gradient-to-r from-white via-white to-transparent text-slate-400 hover:text-brand-blue transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
              )}
            </AnimatePresence>

            <div 
              ref={tabsRef}
              onScroll={() => checkScroll(tabsRef, setCanScrollTabs)}
              className="flex items-center gap-6 lg:gap-10 h-full overflow-x-auto no-scrollbar scroll-smooth"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "h-full text-[11px] lg:text-[13px] font-black transition-all relative whitespace-nowrap uppercase tracking-[0.12em] lg:tracking-[0.15em] flex items-center",
                    activeTab === tab.id 
                      ? "text-blue-600" 
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  {tab.label}
                  {tab.badge !== undefined && (
                    <span className="ml-2 bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded-full font-black">
                      {tab.badge}
                    </span>
                  )}
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue rounded-full" 
                    />
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence>
              {canScrollTabs.right && (
                <button 
                  onClick={() => scroll(tabsRef, 'right')}
                  className="absolute right-0 z-10 h-full px-2 bg-gradient-to-l from-white via-white to-transparent text-slate-400 hover:text-brand-blue transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              )}
            </AnimatePresence>
          </div>

          <div className="hidden lg:flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100 my-1.5 ml-6 shrink-0">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-7 w-7 rounded-md", viewMode === 'kanban' ? "bg-white shadow-sm text-brand-blue" : "text-slate-400")}
              onClick={() => setViewMode('kanban')}
            >
              <Grid size={14} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-7 w-7 rounded-md", viewMode === 'list' ? "bg-white shadow-sm text-brand-blue" : "text-slate-400")}
              onClick={() => setViewMode('list')}
            >
              <ListIcon size={14} />
            </Button>
          </div>
        </div>

        {/* Bottom Row: Pipeline Switcher (Nexus Style) */}
        <div className="bg-slate-100/80 px-4 lg:px-8 py-2 flex items-center gap-2 border-t border-slate-200 backdrop-blur-sm relative group/pipelines overflow-hidden">
          <div className="flex items-center gap-1.5 mr-2 shrink-0">
            <GitBranch size={14} className="text-slate-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest hidden sm:inline">Area:</span>
          </div>

          <div className="relative flex-1 overflow-hidden flex items-center h-10">
            <AnimatePresence>
              {canScrollPipelines.left && (
                <button 
                  onClick={() => scroll(pipelinesRef, 'left')}
                  className="absolute left-0 z-10 h-full px-2 bg-gradient-to-r from-slate-100 via-slate-100 to-transparent text-slate-500 hover:text-brand-blue transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
              )}
            </AnimatePresence>

            <div 
              ref={pipelinesRef}
              onScroll={() => checkScroll(pipelinesRef, setCanScrollPipelines)}
              className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth h-full py-1"
            >
              {CRM_PIPELINES.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedArea(p.id)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border shadow-sm shrink-0",
                    selectedArea === p.id 
                      ? "bg-white text-brand-blue border-brand-blue/30 ring-2 ring-brand-blue/10" 
                      : "bg-white/60 text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-white"
                  )}
                >
                  {p.name.replace(/^[0-9.]+\s*/, '')}
                </button>
              ))}
            </div>

            <AnimatePresence>
              {canScrollPipelines.right && (
                <button 
                  onClick={() => scroll(pipelinesRef, 'right')}
                  className="absolute right-0 z-10 h-full px-2 bg-gradient-to-l from-slate-100 via-slate-100 to-transparent text-slate-500 hover:text-brand-blue transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* CRM Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col relative w-full max-w-full">
        {/* Filters Bar */}
        <div className="px-4 lg:px-8 py-2 bg-white/50 border-b border-slate-100 flex items-center justify-between shrink-0 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-3 lg:gap-4 shrink-0">
            <Button variant="ghost" size="sm" className="h-7 text-[9px] font-black text-slate-500 uppercase tracking-widest hover:bg-white shrink-0">
              <Filter size={10} className="mr-2" /> FILTRI
            </Button>
            <div className="h-3 w-px bg-slate-200"></div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
              {activeTab === 'leads' ? leads.length : deals.length} elementi
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="ghost" size="sm" className="h-7 text-[9px] font-black text-slate-500 uppercase tracking-widest hover:bg-white shrink-0">
              <Download size={10} className="mr-2" /> ESPORTA
            </Button>
          </div>
        </div>

        <div className={cn(
          "flex-1 overflow-auto w-full max-w-full",
          activeTab === 'leads' || activeTab === 'deals' || activeTab.startsWith('pipeline-') || activeTab === 'contacts' || activeTab === 'companies' 
            ? "p-4 lg:p-8" 
            : "p-0"
        )}>
          {activeTab === 'pipeline-settings' ? (
            <PipelineSettings />
          ) : activeTab === 'leads' && selectedArea === 'FINANZA_AGEVOLATA' && showFinanzaForm ? (
            <div className="space-y-6 max-w-full p-4 lg:p-8">
              <div className="flex justify-end overflow-x-auto no-scrollbar py-1">
                <Button 
                  variant="outline" 
                  onClick={() => setShowFinanzaForm(false)}
                  className="rounded-full border-slate-200 text-slate-500 font-bold text-[10px] sm:text-xs shrink-0"
                >
                  <Grid size={14} className="mr-2" /> PASSA ALLA GESTIONE LEAD
                </Button>
              </div>
              <FinanzaAgevolataForm />
            </div>
          ) : activeTab === 'leads' && selectedArea === 'DIGITALE' && showDigitalForm ? (
            <div className="space-y-6 max-w-full p-4 lg:p-8">
              <div className="flex justify-end overflow-x-auto no-scrollbar py-1">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDigitalForm(false)}
                  className="rounded-full border-slate-200 text-slate-500 font-bold text-[10px] sm:text-xs shrink-0"
                >
                  <Grid size={14} className="mr-2" /> PASSA ALLA GESTIONE LEAD
                </Button>
              </div>
              <ServiziDigitaliForm />
            </div>
          ) : activeTab === 'analytics' ? (
            <Analytics />
          ) : activeTab === 'automation' ? (
            <Automations />
          ) : activePipeline && (activeTab === 'leads' || activeTab === 'deals' || activeTab.startsWith('pipeline-')) ? (
            <div className="space-y-4 max-w-full overflow-x-auto p-4 lg:p-8 pb-4">
              {activeTab === 'leads' && selectedArea === 'FINANZA_AGEVOLATA' && (
                <div className="flex justify-end overflow-x-auto no-scrollbar">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowFinanzaForm(true)}
                    className="rounded-full border-slate-200 text-slate-500 font-bold text-[10px] sm:text-xs shrink-0"
                  >
                    <ClipboardCheck size={14} className="mr-2" /> TORNA AL FORM DI QUALIFICAZIONE
                  </Button>
                </div>
              )}
              {activeTab === 'leads' && selectedArea === 'DIGITALE' && (
                <div className="flex justify-end overflow-x-auto no-scrollbar">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDigitalForm(true)}
                    className="rounded-full border-slate-200 text-slate-500 font-bold text-[10px] sm:text-xs shrink-0"
                  >
                    <ClipboardCheck size={14} className="mr-2" /> TORNA AL FORM DI QUALIFICAZIONE
                  </Button>
                </div>
              )}
              <KanbanBoard 
                stages={activePipeline.stages}
              items={activeTab === 'leads' ? currentLeads : currentDeals}
              onItemMove={handleItemMove}
              onAddItem={addItem}
              onItemClick={handleItemClick}
              renderCard={(item) => activeTab === 'leads' ? <LeadCard lead={item} /> : <DealCard deal={item} />}
            />
          </div>
        ) : activeTab === 'contacts' ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto max-w-full">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Telefono</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Azienda</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Creato il</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {contacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-slate-50/30 transition-colors group cursor-pointer" onClick={() => handleItemClick(contact)}>
                      <td className="px-6 py-4 font-bold text-slate-700 whitespace-nowrap">{contact.firstName} {contact.lastName}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">{contact.emails?.[0] || '--'}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">{contact.phones?.[0] || '--'}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">{contact.companyId || '--'}</td>
                      <td className="px-6 py-4 text-xs text-slate-400 whitespace-nowrap">{contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : '--'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'companies' ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto max-w-full">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Azienda</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Industria</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sito Web</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Creato il</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {companies.map((company) => (
                    <tr key={company.id} className="hover:bg-slate-50/30 transition-colors group cursor-pointer" onClick={() => handleItemClick(company)}>
                      <td className="px-6 py-4 font-bold text-slate-700 whitespace-nowrap">{company.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">{company.industry || '--'}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">{company.email || '--'}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">{company.website || '--'}</td>
                      <td className="px-6 py-4 text-xs text-slate-400 whitespace-nowrap">{company.createdAt ? new Date(company.createdAt).toLocaleDateString() : '--'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'preventivi' || activeTab === 'nexus-preventivi' || activeTab === 'quotes' ? (
            <div className="h-full">
              <QuoteModule />
            </div>
          ) : activeTab === 'nexus-finanza' || activeTab === 'finanza-agevolata' ? (
            <div className="h-full bg-white rounded-2xl p-8 overflow-auto">
              <FinanzaAgevolataForm />
            </div>
          ) : activeTab === 'nexus-digitale' || activeTab === 'servizi-digitali' ? (
            <div className="h-full bg-white rounded-2xl p-8 overflow-auto">
              <ServiziDigitaliForm />
            </div>
          ) : activeTab === 'ai-agente' ? (
            <div className="h-full bg-white rounded-2xl overflow-hidden">
              <ChatAgente clientId="general" />
            </div>
          ) : activeTab === 'analytics' || activeTab === 'crm-analytics' ? (
            <div className="h-full -m-8">
              <Analytics />
            </div>
          ) : activeTab === 'automation' ? (
            <div className="h-full -m-8">
              <Automations />
            </div>
          ) : activeTab.startsWith('nexus-') ? (
            <div className="h-full -m-8">
              <BusinessModule 
                sectionId={activeTab.replace('nexus-', '')} 
                title={tabs.find(t => t.id === activeTab)?.label || 'Modulo Business'} 
              />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-brand-blue/10 rounded-full flex items-center justify-center text-brand-blue mb-6">
                <Plus size={40} className="rotate-45" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Modulo in Sviluppo</h2>
              <p className="text-slate-500 max-w-md mt-2">
                Stiamo lavorando per portare tutte le funzionalità necessarie su questa piattaforma. 
                Il modulo <span className="font-bold text-brand-blue uppercase">"{activeTab}"</span> sarà disponibile a breve.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Drawer */}
      <DetailDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        item={selectedItem}
        type={activeTab === 'leads' ? 'lead' : activeTab === 'deals' ? 'deal' : activeTab === 'contacts' ? 'contact' : 'company'}
      />

      <CreateItemModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        type={createType}
        pipelineId={activePipeline?.id}
      />
    </div>
  );
};

export default CRM;
