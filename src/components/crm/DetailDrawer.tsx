import React from 'react';
import { 
  X, 
  Mail, 
  Phone, 
  MessageSquare, 
  User, 
  Building, 
  TrendingUp, 
  Info,
  StickyNote,
  Zap,
  Calendar
} from 'lucide-react';
import { 
  Sheet, 
  SheetContent 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CRMStructure, CRMStage, CRMDeal } from '@/types/crm';
import { CRM_STRUCTURES } from '@/constants/crm';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { CRMActivities } from './CRMActivities';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  type: 'lead' | 'deal' | 'contact' | 'company';
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({ isOpen, onClose, item: initialItem, type }) => {
  const [item, setItem] = React.useState(initialItem);
  const [activeTab, setActiveTabValue] = React.useState('details');

  React.useEffect(() => {
    setItem(initialItem);
  }, [initialItem]);

  if (!item) return null;

  const isPreanalysis = item.stage_id && item.preanalysis_result;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-xl p-0 border-none shadow-2xl flex flex-col h-full bg-[#f8fafc]">
        {/* Detail Header */}
        <div className="bg-white border-b border-slate-100 p-6 shadow-sm z-10 shrink-0">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                {type === 'lead' ? <User size={28} /> : (type === 'deal' ? <TrendingUp size={28} /> : <Building size={28} />)}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <Badge className="bg-blue-50 text-blue-600 border-none text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
                    {type}
                  </Badge>
                  <span className="text-[10px] text-slate-300 font-black uppercase tracking-[0.2em]">ID: {item.id.slice(0, 8)}</span>
                </div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
                  {item.title || item.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                   <div className="w-2 h-2 rounded-full bg-emerald-500" />
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Attivo ora</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-10 w-10 text-slate-400 hover:bg-slate-50">
              <X size={20} />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl px-8 h-11 text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-100 transition-all active:scale-95">
              AVVIA CHIAMATA
            </Button>
            <div className="h-6 w-px bg-slate-100 mx-1" />
            <Button variant="outline" size="icon" className="rounded-xl border-slate-200 h-11 w-11 hover:bg-slate-50"><Mail size={18} className="text-slate-500" /></Button>
            <Button variant="outline" size="icon" className="rounded-xl border-slate-200 h-11 w-11 hover:bg-slate-50"><Phone size={18} className="text-slate-500" /></Button>
            <Button variant="outline" size="icon" className="rounded-xl border-slate-200 h-11 w-11 hover:bg-slate-50"><MessageSquare size={18} className="text-slate-500" /></Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs defaultValue="details" className="flex-1 flex flex-col overflow-hidden" onValueChange={setActiveTabValue}>
          <div className="bg-white px-6 shrink-0 shadow-sm border-b border-slate-50">
            <TabsList className="bg-transparent h-14 w-full justify-start gap-10">
              <TabsTrigger value="details" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-600 data-[state=active]:border-b-4 data-[state=active]:border-blue-600 rounded-none h-full px-0 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 transition-all">Dettagli</TabsTrigger>
              {isPreanalysis && (
                <TabsTrigger value="preanalysis" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-600 data-[state=active]:border-b-4 data-[state=active]:border-blue-600 rounded-none h-full px-0 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 transition-all">Preanalisi</TabsTrigger>
              )}
              <TabsTrigger value="activities" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-600 data-[state=active]:border-b-4 data-[state=active]:border-blue-600 rounded-none h-full px-0 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 transition-all">Attività</TabsTrigger>
              <TabsTrigger value="notes" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-600 data-[state=active]:border-b-4 data-[state=active]:border-blue-600 rounded-none h-full px-0 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 transition-all">Note</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-auto bg-[#f8fafc] nexus-scrollbar">
            <TabsContent value="details" className="m-0 p-6 space-y-8 focus-visible:outline-none">
              {/* CRM Info Blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <User size={12} className="text-blue-500" /> Informazioni Base
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Azienda</span>
                      <span className="text-xs font-black text-slate-700">{item.company || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Referente</span>
                      <span className="text-xs font-black text-slate-700">{item.contact || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Valore</span>
                      <span className="text-xs font-black text-blue-600">€ {item.value?.toLocaleString() || '0'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Phone size={12} className="text-purple-500" /> Recapiti
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Telefono</span>
                      <span className="text-xs font-black text-slate-700 font-mono tracking-tighter">{item.phone || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Email</span>
                      <span className="text-xs font-black text-slate-700 truncate max-w-[120px]">{item.email || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Assegnato</span>
                      <div className="flex items-center gap-1.5">
                        <Avatar className="h-4 w-4">
                           <AvatarFallback className="text-[6px] bg-blue-100 text-blue-600">AD</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-bold text-slate-500">{item.assigned_to || 'Admin'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preanalysis" className="m-0 p-6 space-y-6 focus-visible:outline-none">
              {isPreanalysis && (
                <>
                  <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden mb-6">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Zap size={120} />
                    </div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-center mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                              <TrendingUp size={20} />
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Risultato Preanalisi</p>
                              <h4 className="text-xl font-black uppercase tracking-tight">Analisi Automatica</h4>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-4xl font-black text-brand-yellow leading-none">{item.preanalysis_result.score}%</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mt-1">Score</p>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6 py-4 border-y border-white/10">
                          <div>
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Importo Stima</p>
                            <p className="text-sm font-black italic">€ {item.preanalysis_result.estimated_amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Tipo Richiesta</p>
                            <p className="text-[11px] font-bold text-white/80">{item.preanalysis_result.request_type}</p>
                          </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                      <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-tight">Dati Originali Form</h3>
                      <Badge variant="outline" className="text-[9px] font-black uppercase border-slate-200">Google Form Response</Badge>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Azienda Dichiarata</span>
                        <span className="text-sm font-black text-slate-800 block">{item.preanalysis_result.company_data.name}</span>
                      </div>

                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase block mb-2">Note riportate dal cliente</span>
                        <p className="text-[11px] text-slate-600 font-medium leading-relaxed italic">
                          "{item.preanalysis_result.notes || 'Nessuna nota fornita.'}"
                        </p>
                      </div>

                      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex items-start gap-3">
                        <Zap size={16} className="text-blue-500 mt-1 shrink-0" />
                        <div>
                          <span className="text-[10px] font-black text-blue-700 uppercase block mb-1">Suggerimento IA</span>
                          <p className="text-[11px] text-blue-600 font-medium italic leading-relaxed">
                            {item.preanalysis_result.auto_notes?.[0] || 'In attesa di analisi approfondita.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="activities" className="m-0 p-6 focus-visible:outline-none">
               <CRMActivities dealId={item.id} />
            </TabsContent>

            <TabsContent value="notes" className="m-0 p-6 focus-visible:outline-none">
               <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4 h-full flex flex-col">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <StickyNote size={12} className="text-amber-500" /> Note Interne
                    </h3>
                    <Button variant="ghost" size="sm" className="h-6 text-[9px] font-black text-blue-500 uppercase tracking-widest">Salva</Button>
                  </div>
                  <Textarea 
                    placeholder="Annota informazioni importanti su questo affare..." 
                    className="flex-1 min-h-[300px] bg-slate-50 border-none rounded-xl text-xs font-medium focus-visible:ring-blue-100"
                    defaultValue={item.custom_fields?.notes || ''}
                  />
               </div>
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};
