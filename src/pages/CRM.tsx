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
import { Plus, Search, Filter, Grid, List as ListIcon, Download, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { KanbanBoard } from '@/components/crm/KanbanBoard';
import { LeadCard, DealCard } from '@/components/crm/CRMCards';
import { DetailDrawer } from '@/components/crm/DetailDrawer';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';

const CRM: React.FC<{ activeTab?: string }> = ({ activeTab: propActiveTab }) => {
  const { tenant } = useAuth();
  const [activeTab, setActiveTab] = useState('leads');

  useEffect(() => {
    if (propActiveTab) {
      const tab = propActiveTab === 'crm' ? 'leads' : propActiveTab;
      setActiveTab(tab);
    }
  }, [propActiveTab]);

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  
  // Data States
  const [leads, setLeads] = useState<Lead[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [activePipeline, setActivePipeline] = useState<Pipeline | null>(null);
  
  // UI States
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

    return () => {
      unsubPipelines();
      unsubLeads();
      unsubDeals();
      unsubContacts();
      unsubCompanies();
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
    await addDoc(collection(db, 'tenants', tenant.id, collectionName), {
      tenantId: tenant.id,
      title: `Nuovo ${activeTab === 'leads' ? 'Lead' : 'Affare'}`,
      pipelineId: activePipeline?.id || 'default',
      stageId: stageId,
      value: Math.floor(Math.random() * 5000) + 500,
      status: activeTab === 'leads' ? 'active' : undefined,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  };

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setIsDrawerOpen(true);
  };

  const tabs = [
    { id: 'leads', label: 'Lead', badge: leads.length },
    { id: 'deals', label: 'Affari', badge: deals.length },
    { id: 'contacts', label: 'Contatti', badge: contacts.length },
    { id: 'companies', label: 'Aziende', badge: companies.length },
    { id: 'analytics', label: 'Analisi' },
    { id: 'automation', label: 'Automazione' },
  ];

  return (
    <div className="h-full flex flex-col bg-[#f5f7fb]">
      {/* CRM Header */}
      <div className="bg-white border-b border-slate-200 px-8 pt-4 shrink-0 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-800 uppercase tracking-tight">CRM</h1>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full text-[10px] font-black text-slate-400 tracking-widest uppercase">
              <Plus size={12} className="text-blue-500" />
              <span>{activePipeline?.name || 'PIPELINE VENDITE'}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative group w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={14} />
              <Input 
                placeholder="Cerca nel CRM..." 
                className="pl-9 bg-slate-50 border-none shadow-sm h-9 rounded-full text-xs focus-visible:ring-2 focus-visible:ring-blue-400/30"
              />
            </div>
            <Button variant="outline" size="sm" className="rounded-full px-4 font-bold text-[10px] uppercase tracking-widest border-slate-200">IMPORTA</Button>
            <Button className="bg-[#2FC6F6] hover:bg-[#1eb0e0] text-white font-bold rounded-full px-6 text-[10px] uppercase tracking-widest shadow-lg shadow-blue-200">
              NUOVO {activeTab === 'leads' ? 'LEAD' : 'AFFARE'}
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8 overflow-x-auto no-scrollbar pb-0.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "pb-3 text-xs font-black transition-all relative whitespace-nowrap uppercase tracking-[0.15em]",
                  activeTab === tab.id 
                    ? "text-blue-500" 
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                {tab.label}
                {tab.badge !== undefined && (
                  <span className="ml-1.5 bg-slate-100 text-slate-500 text-[9px] px-1.5 py-0.5 rounded-full font-black">
                    {tab.badge}
                  </span>
                )}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 mb-3 bg-slate-50 p-1 rounded-lg border border-slate-100">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-7 w-7 rounded-md", viewMode === 'kanban' ? "bg-white shadow-sm text-blue-500" : "text-slate-400")}
              onClick={() => setViewMode('kanban')}
            >
              <Grid size={14} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-7 w-7 rounded-md", viewMode === 'list' ? "bg-white shadow-sm text-blue-500" : "text-slate-400")}
              onClick={() => setViewMode('list')}
            >
              <ListIcon size={14} />
            </Button>
          </div>
        </div>
      </div>

      {/* CRM Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Filters Bar */}
        <div className="px-8 py-3 bg-white/50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-white">
              <Filter size={12} className="mr-2" /> FILTRI
            </Button>
            <div className="h-4 w-px bg-slate-200"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Visualizzati: {activeTab === 'leads' ? leads.length : deals.length} elementi
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-white">
              <Download size={12} className="mr-2" /> ESPORTA
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:bg-white">
              <MoreHorizontal size={16} />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-8">
          {activePipeline && (activeTab === 'leads' || activeTab === 'deals') ? (
            <KanbanBoard 
              stages={activePipeline.stages}
              items={activeTab === 'leads' ? leads : deals}
              onItemMove={handleItemMove}
              onAddItem={addItem}
              onItemClick={handleItemClick}
              renderCard={(item) => activeTab === 'leads' ? <LeadCard lead={item} /> : <DealCard deal={item} />}
            />
          ) : activeTab === 'contacts' ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-left">
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
                      <td className="px-6 py-4 font-bold text-slate-700">{contact.firstName} {contact.lastName}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{contact.emails?.[0] || '--'}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{contact.phones?.[0] || '--'}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{contact.companyId || '--'}</td>
                      <td className="px-6 py-4 text-xs text-slate-400">{contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : '--'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'companies' ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-left">
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
                      <td className="px-6 py-4 font-bold text-slate-700">{company.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{company.industry || '--'}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{company.email || '--'}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{company.website || '--'}</td>
                      <td className="px-6 py-4 text-xs text-slate-400">{company.createdAt ? new Date(company.createdAt).toLocaleDateString() : '--'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-6">
                <Plus size={40} className="rotate-45" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Modulo in Sviluppo</h2>
              <p className="text-slate-500 max-w-md mt-2">
                Stiamo lavorando per portare tutte le funzionalità di Bitrix24 su questa piattaforma. 
                Il modulo <span className="font-bold text-blue-500 uppercase">"{activeTab}"</span> sarà disponibile a breve.
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
        type={activeTab === 'leads' ? 'lead' : 'deal'}
      />
    </div>
  );
};

export default CRM;
