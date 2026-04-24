import React, { useState, useEffect } from 'react';
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
  Calendar,
  FileText,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  Clock,
  MoreVertical,
  Paperclip,
  Save,
  ChevronLeft,
  MoreHorizontal,
  UserPlus,
  Users2,
  Trash2,
  ShieldCheck,
  ChevronRight
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
import { CRMDeal, CRMUser } from '@/types/crm';
import { CRMActivities } from './CRMActivities';
import { useCRMStore } from '@/stores/crmStore';
import { CRM_USERS, CRM_TEAMS } from '@/constants/crm';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

interface DetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  type: 'lead' | 'deal' | 'contact' | 'company';
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({ isOpen, onClose, item: initialItem, type }) => {
  const [item, setItem] = useState(initialItem);
  const [activeTab, setActiveTabValue] = useState('details');
  const [preanalysisStep, setPreanalysisStep] = useState(0);
  const { structures, stages, activeStructure, fetchInitialData } = useCRMStore();

  useEffect(() => {
    setItem(initialItem);
    // Reset step when item changes
    setPreanalysisStep(0);
  }, [initialItem]);

  if (!item) return null;

  const currentStage = stages.find(s => s.id === item.stage_id);
  const currentPipeline = structures.find(s => s.id === item.structure_id);
  const isPreanalysis = !!(item.stage_id && item.preanalysis_result);

  // Define available tabs for navigation
  const availableTabs = [
    'details',
    ...(isPreanalysis ? ['preanalysis'] : []),
    'activities',
    'notes',
    'files'
  ];

  const currentTabIndex = availableTabs.indexOf(activeTab);

  const nextTab = () => {
    if (currentTabIndex < availableTabs.length - 1) {
      setActiveTabValue(availableTabs[currentTabIndex + 1]);
    }
  };

  const prevTab = () => {
    if (currentTabIndex > 0) {
      setActiveTabValue(availableTabs[currentTabIndex - 1]);
    }
  };

  const nextStep = () => {
    // If in preanalysis and not at last step, go to next step
    if (activeTab === 'preanalysis' && preanalysisStep < 3) {
      setPreanalysisStep(prev => prev + 1);
    } else {
      nextTab();
    }
  };

  const prevStep = () => {
    // If in preanalysis and not at first step, go to prev step
    if (activeTab === 'preanalysis' && preanalysisStep > 0) {
      setPreanalysisStep(prev => prev - 1);
    } else {
      prevTab();
    }
  };

  const handleUpdate = async (updates: Partial<CRMDeal>) => {
    try {
      await supabaseCRMService.updateDeal(item.id, updates);
      toast.success("Affare aggiornato");
      fetchInitialData(activeStructure?.slug);
    } catch (e) {
      toast.error("Errore aggiornamento");
    }
  };

  const currentResponsible = CRM_USERS.find(u => u.id === item.assigned_to || u.name === item.assigned_to) || CRM_USERS[0];
  const currentAssistants = (item.assistants || []).map(id => CRM_USERS.find(u => u.id === id)).filter(Boolean) as CRMUser[];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className={cn(
          "p-0 border-none shadow-2xl flex flex-col h-full bg-[#f8fafc] transition-all duration-300",
          "w-full sm:w-[80%] xl:w-[420px]", // Responsive widths
          "xl:shadow-none xl:border-l xl:border-slate-100" // Desktop styling
        )}
        // Force hide overlay and blur on desktop if possible via tailwind in the parent or overlay component
      >
        {/* RESPONSIVE HEADER */}
        <div className="bg-white border-b border-slate-100 p-4 md:p-5 shadow-sm z-10 shrink-0">
          <div className="flex justify-between items-center mb-4">
            {/* Mobile Back Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose} 
              className="md:hidden rounded-full h-8 w-8 text-slate-500"
            >
              <ChevronLeft size={20} />
            </Button>

            <div className="flex items-center gap-3 flex-1 px-2 md:px-0">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100 shrink-0">
                {type === 'deal' ? <TrendingUp className="w-[22px] h-[22px] md:w-6 md:h-6" /> : <User className="w-[22px] h-[22px] md:w-6 md:h-6" />}
              </div>
              <div className="min-w-0">
                <h2 className="text-sm md:text-lg font-black text-slate-800 truncate leading-tight uppercase tracking-tight">
                  {item.company || item.title || 'Senza Nome'}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="bg-blue-50 text-blue-600 border-none text-[7px] md:text-[8px] font-black px-1.5 py-0">
                    {type.toUpperCase()}
                  </Badge>
                  <span className="text-[9px] md:text-[10px] text-slate-400 font-bold">ID: {item.id.slice(0, 8)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 md:gap-2 shrink-0">
              {/* Mobile Options Menu */}
              <Button variant="ghost" size="icon" className="md:hidden h-8 w-8 text-slate-400">
                <MoreHorizontal size={18} />
              </Button>
              {/* Tablet/Desktop Close Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose} 
                className="hidden md:flex rounded-full h-8 w-8 text-slate-400 hover:bg-slate-50"
              >
                <X size={18} />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-slate-50/50 rounded-2xl p-3 border border-slate-100">
            <div className="min-w-0">
              <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Pipeline</p>
              <p className="text-[10px] md:text-[11px] font-bold text-slate-700 truncate">{currentPipeline?.name || 'Nexus Default'}</p>
            </div>
            <div className="min-w-0">
              <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Stage</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-blue-500" />
                <p className="text-[10px] md:text-[11px] font-bold text-blue-600 truncate">{currentStage?.name || 'N/A'}</p>
              </div>
            </div>
            <div className="col-span-2 md:col-span-1 min-w-0">
              <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Responsabile</p>
              <div className="flex items-center gap-1.5">
                <Avatar className="h-4 w-4 md:h-5 md:w-5">
                   <AvatarImage src={currentResponsible.avatar} />
                   <AvatarFallback className="text-[5px] md:text-[6px] bg-blue-100 text-blue-600 font-bold">
                     {currentResponsible.name[0]}
                   </AvatarFallback>
                </Avatar>
                <p className="text-[10px] md:text-[11px] font-bold text-slate-600 truncate">{currentResponsible.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* RESPONSIVE NAVIGATION TABS - Sticky on mobile */}
        <Tabs value={activeTab} className="flex-1 flex flex-col overflow-hidden" onValueChange={setActiveTabValue}>
          <div className="bg-white border-b border-slate-100 px-4 shrink-0 relative flex items-center z-20">
            {/* Tab navigation arrows */}
            <div className="absolute left-0 bottom-0 top-0 w-10 bg-gradient-to-r from-white to-transparent z-30 pointer-events-none md:hidden" />
            <div className="absolute right-0 bottom-0 top-0 w-10 bg-gradient-to-l from-white to-transparent z-30 pointer-events-none md:hidden" />
            
            <TabsList className="bg-transparent h-12 w-full justify-start gap-4 md:gap-6 flex-nowrap overflow-x-auto no-scrollbar snap-x snap-mandatory min-w-max px-2">
              <TabsTrigger value="details" className="snap-start data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full px-0 text-[10px] font-black uppercase tracking-widest text-slate-400">Dettagli</TabsTrigger>
              {isPreanalysis && (
                <TabsTrigger value="preanalysis" className="snap-start data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full px-0 text-[10px] font-black uppercase tracking-widest text-slate-400">Preanalisi</TabsTrigger>
              )}
              <TabsTrigger value="activities" className="snap-start data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full px-0 text-[10px] font-black uppercase tracking-widest text-slate-400">Attività</TabsTrigger>
              <TabsTrigger value="notes" className="snap-start data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full px-0 text-[10px] font-black uppercase tracking-widest text-slate-400">Note</TabsTrigger>
              <TabsTrigger value="files" className="snap-start data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full px-0 text-[10px] font-black uppercase tracking-widest text-slate-400">File</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden bg-[#f8fafc]">
            {/* TAB DETTAGLI RESPONSIVE */}
            <TabsContent value="details" className="m-0 flex-1 flex flex-col overflow-hidden focus-visible:outline-none">
              <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-6 pb-32">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-4"
                >
                <h3 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                  <Info size={12} className="text-blue-500" /> Informazioni Affare
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="flex justify-between md:block text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Azienda</span>
                    <span className="font-black text-slate-700">{item.company || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between md:block text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Contatto</span>
                    <span className="font-black text-slate-700">{item.contact || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between md:block text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Telefono</span>
                    <a href={`tel:${item.phone}`} className="font-black text-blue-600 hover:underline">{item.phone || '-'}</a>
                  </div>
                  <div className="flex justify-between md:block text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Email</span>
                    <span className="font-black text-slate-700 truncate max-w-[120px] md:max-w-full block">{item.email || '-'}</span>
                  </div>
                  <div className="flex justify-between md:block text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Valore</span>
                    <span className="font-black text-emerald-600 italic">€ {item.value?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between md:block text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Responsabile</span>
                    <Select defaultValue={item.assigned_to} onValueChange={(val) => handleUpdate({ assigned_to: val })}>
                      <SelectTrigger className="h-8 border-slate-100 bg-slate-50/50 text-[11px] font-bold">
                        <SelectValue placeholder="Seleziona..." />
                      </SelectTrigger>
                      <SelectContent>
                        {CRM_USERS.map(u => (
                          <SelectItem key={u.id} value={u.id} className="text-[11px]">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-4 w-4">
                                <AvatarImage src={u.avatar} />
                                <AvatarFallback className="text-[6px]">{u.name[0]}</AvatarFallback>
                              </Avatar>
                              {u.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-between md:block text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Team</span>
                    <Select defaultValue={item.team} onValueChange={(val) => handleUpdate({ team: val })}>
                      <SelectTrigger className="h-8 border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-widest">
                        <SelectValue placeholder="Team..." />
                      </SelectTrigger>
                      <SelectContent>
                        {CRM_TEAMS.map(t => (
                          <SelectItem key={t} value={t} className="text-[11px] uppercase tracking-widest font-black">{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Assistenti</span>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 text-[9px] font-black uppercase text-blue-600">
                             <UserPlus size={10} className="mr-1" /> Aggiungi
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-2 rounded-xl shadow-2xl border-slate-100">
                           <div className="space-y-1">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-1">Seleziona Assistenti</p>
                             {CRM_USERS.filter(u => u.id !== item.assigned_to).map(u => {
                               const isSelected = item.assistants?.includes(u.id);
                               return (
                                 <div key={u.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer" onClick={() => {
                                   const newAssistants = isSelected 
                                    ? (item.assistants || []).filter(id => id !== u.id)
                                    : [...(item.assistants || []), u.id];
                                   handleUpdate({ assistants: newAssistants });
                                 }}>
                                   <Checkbox checked={isSelected} className="rounded-sm border-slate-200" />
                                   <Avatar className="h-5 w-5">
                                      <AvatarImage src={u.avatar} />
                                      <AvatarFallback className="text-[8px]">{u.name[0]}</AvatarFallback>
                                   </Avatar>
                                   <div className="flex flex-col">
                                     <span className="text-[11px] font-bold text-slate-700">{u.name}</span>
                                     <span className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">{u.role}</span>
                                   </div>
                                 </div>
                               );
                             })}
                           </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5">
                       {currentAssistants.length === 0 ? (
                         <div className="text-[10px] text-slate-400 italic">Nessun assistente assegnato</div>
                       ) : (
                         currentAssistants.map(u => (
                           <Badge key={u.id} className="bg-white border border-slate-100 shadow-sm text-[10px] font-bold text-slate-600 gap-1.5 px-2 py-1 pr-1 group">
                             <Avatar className="h-3 w-3">
                               <AvatarImage src={u.avatar} />
                               <AvatarFallback className="text-[5px]">{u.name[0]}</AvatarFallback>
                             </Avatar>
                             {u.name}
                             <button 
                              onClick={() => handleUpdate({ assistants: (item.assistants || []).filter(id => id !== u.id) })}
                              className="text-slate-300 hover:text-rose-500 transition-colors"
                             >
                               <X size={10} />
                             </button>
                           </Badge>
                         ))
                       )}
                    </div>
                  </div>
                  <div className="flex justify-between md:block text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Pipeline</span>
                    <span className="font-black text-slate-700">{currentPipeline?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between md:block text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Stage</span>
                    <Badge variant="outline" className="font-black text-[9px] md:text-[10px] border-slate-200 bg-slate-50 uppercase">{currentStage?.name || 'N/A'}</Badge>
                  </div>
                </div>
              </motion.div>
            </div>
          </TabsContent>

            {/* TAB PREANALISI RESPONSIVE - STEPPED VERSION */}
            <TabsContent value="preanalysis" className="m-0 flex flex-col h-full focus-visible:outline-none">
              {isPreanalysis && (
                <div className="flex flex-col h-full">
                  {/* Stepper Header / Progress bar */}
                  <div className="px-5 py-4 bg-white border-b border-slate-50 shrink-0">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-sm font-black text-slate-800 uppercase tracking-tighter">
                        Sezione Preanalisi
                      </h2>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-1">Step {preanalysisStep + 1} di 4</span>
                        <div className="flex gap-1">
                          {[0, 1, 2, 3].map((s) => (
                            <div 
                              key={s} 
                              className={cn(
                                "h-1.5 w-4 rounded-full transition-all duration-300",
                                s === preanalysisStep ? "bg-blue-600 w-8" : "bg-slate-100"
                              )} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step Content Container - SCROLLABLE AND SEPARATED */}
                  <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 relative space-y-6">
                    {preanalysisStep === 0 && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                      >
                        <div className="bg-blue-600 rounded-[28px] p-6 text-white shadow-xl shadow-blue-100 relative overflow-hidden">
                          <Zap size={80} className="absolute -right-4 -bottom-4 text-white/10" />
                          <div className="relative z-10">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 block mb-1">Esito Qualifica</span>
                            <div className="flex items-end justify-between">
                              <h3 className="text-4xl font-black">{item.preanalysis_result.score}%</h3>
                              <Badge className={cn(
                                "font-black text-[11px] uppercase px-4 py-1.5 rounded-xl border-none shadow-sm",
                                item.preanalysis_result.result === 'Idoneo' || item.preanalysis_result.result === 'Positivo' ? "bg-emerald-400 text-emerald-950" : 
                                item.preanalysis_result.result === 'Non idoneo' || item.preanalysis_result.result === 'Negativo' ? "bg-rose-400 text-rose-950" : 
                                "bg-blue-400 text-blue-950"
                              )}>
                                {item.preanalysis_result.result === 'Positivo' ? 'Idoneo' : 
                                 item.preanalysis_result.result === 'Negativo' ? 'Non idoneo' : 
                                 item.preanalysis_result.result === 'Dubbio' ? 'In valutazione' : item.preanalysis_result.result}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tipo Richiesta</span>
                            <p className="text-xs font-bold text-slate-700">{item.preanalysis_result.request_type}</p>
                          </div>
                          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Importo</span>
                            <p className="text-xs font-black text-emerald-600">€ {item.preanalysis_result.estimated_amount?.toLocaleString()}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {preanalysisStep === 1 && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                      >
                        <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest px-1">Dati Societari</h3>
                        <div className="grid grid-cols-1 gap-3">
                          {[
                            { label: "Ragione Sociale", value: item.preanalysis_result.company_data.name, icon: Building },
                            { label: "P.IVA / CF", value: item.preanalysis_result.company_data.vat || '-', icon: Info },
                            { label: "Settore", value: item.preanalysis_result.company_data.industry || 'Agricoltura/Industry', icon: TrendingUp },
                            { label: "Referente", value: item.preanalysis_result.contact_data?.name || item.contact, icon: User },
                            { label: "Telefono", value: item.preanalysis_result.contact_data?.phone || item.phone, icon: Phone },
                            { label: "Email", value: item.preanalysis_result.contact_data?.email || item.email, icon: Mail },
                          ].map((field, i) => (
                            <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                              <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                <field.icon size={16} />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">{field.label}</span>
                                <p className="text-[13px] font-bold text-slate-700 truncate">{field.value}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {preanalysisStep === 2 && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                      >
                         <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest px-1">Risposte Form Completo</h3>
                         <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                           <div className="divide-y divide-slate-50">
                             {[
                               { q: "Tipo Investimento", a: item.preanalysis_result.request_type },
                               { q: "Budget Previsto", a: `€ ${item.preanalysis_result.estimated_amount?.toLocaleString()}` },
                               { q: "Note Cliente", a: item.preanalysis_result.notes || 'Nessuna nota fornita' }
                             ].map((resp, i) => (
                               <div key={i} className="p-4 space-y-1">
                                 <span className="text-[9px] font-black text-blue-500 uppercase tracking-tighter block">{resp.q}</span>
                                 <p className="text-xs font-semibold text-slate-700 leading-relaxed italic">"{resp.a}"</p>
                               </div>
                             ))}
                           </div>
                         </div>
                      </motion.div>
                    )}

                    {preanalysisStep === 3 && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-5"
                      >
                         <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 relative overflow-hidden">
                           <Badge className="bg-emerald-600 text-white font-black uppercase text-[8px] tracking-[0.2em] mb-4">Nexus Core Analysis</Badge>
                           <h3 className="text-lg font-black text-emerald-900 uppercase tracking-tighter mb-4 flex items-center gap-2">
                             <Zap size={18} className="text-emerald-500" /> Insights AI
                           </h3>
                           <div className="space-y-3">
                             {item.preanalysis_result.auto_notes?.map((note: string, i: number) => (
                               <div key={i} className="flex gap-3 bg-white/60 p-3 rounded-2xl border border-emerald-100/30">
                                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                  <p className="text-[11px] text-emerald-900/80 font-bold leading-relaxed">{note}</p>
                               </div>
                             ))}
                             {(!item.preanalysis_result.auto_notes || item.preanalysis_result.auto_notes.length === 0) && (
                               <p className="text-[11px] text-slate-400 font-bold italic">Nessun insight automatico generato per questo lead.</p>
                             )}
                           </div>
                         </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* TAB ATTIVITÀ RESPONSIVE */}
            <TabsContent value="activities" className="m-0 flex-1 flex flex-col overflow-hidden focus-visible:outline-none">
              <div className="flex-1 overflow-y-auto p-4 md:p-5 pb-32 space-y-6">
                {/* Editor - Integrated and isolated */}
                <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm focus-within:border-blue-400 transition-colors">
                  <Textarea 
                    placeholder="Documenta un aggiornamento o scrivi un feedback..." 
                    className="min-h-[80px] border-none focus-visible:ring-0 text-xs font-medium resize-none p-0 bg-transparent leading-relaxed"
                  />
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-50">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-slate-400 hover:text-blue-500"><Paperclip size={14} /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-slate-400 hover:text-blue-500"><LinkIcon size={14} /></Button>
                    </div>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-[10px] uppercase tracking-widest px-4 shadow-lg shadow-blue-100">Invia</Button>
                  </div>
                </div>
                
                <CRMActivities dealId={item.id} />
              </div>
            </TabsContent>

            {/* TAB NOTE RESPONSIVE */}
            <TabsContent value="notes" className="m-0 flex-1 flex flex-col overflow-hidden focus-visible:outline-none">
              <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 pb-32">
                <div className="flex justify-between items-center shrink-0">
                  <h3 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <StickyNote size={12} className="text-amber-500" /> Note Personali
                  </h3>
                  <div className="flex items-center gap-1 text-[8px] md:text-[9px] font-bold text-slate-300">
                    <Clock size={10} /> Auto-save
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col min-h-[300px]">
                  <div className="border-b border-slate-50 p-2 flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400"><Save size={12} /></Button>
                  </div>
                  <Textarea 
                    placeholder="Dettagli critici..." 
                    className="flex-1 border-none focus-visible:ring-0 resize-none text-[11px] md:text-xs font-medium p-4 leading-relaxed bg-transparent w-full"
                    defaultValue={item.custom_fields?.internal_notes || ''}
                  />
                </div>
              </div>
            </TabsContent>

            {/* TAB FILE RESPONSIVE */}
            <TabsContent value="files" className="m-0 flex-1 flex flex-col overflow-hidden focus-visible:outline-none">
              <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-6 pb-32">
                <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-blue-100 transition-all">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <p className="text-[10px] md:text-xs font-black text-blue-700 uppercase tracking-tight">Carica Allegati</p>
                  <p className="text-[8px] md:text-[10px] text-blue-400 font-bold mt-1">Trascina qui o clicca</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[9px] md:text-[10px] font-black text-slate-800 uppercase tracking-widest">Allegati (2)</h3>
                    <Button variant="ghost" size="sm" className="h-6 text-[8px] md:text-[9px] font-black text-blue-500 uppercase tracking-widest">Vedi Tutti</Button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-white p-3 rounded-2xl border border-slate-100 flex items-center gap-3 shadow-sm group">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
                        <FileText size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] md:text-[11px] font-black text-slate-700 uppercase tracking-tight truncate">Contratto_Firma.pdf</p>
                        <p className="text-[8px] md:text-[9px] text-slate-400 font-bold uppercase">1.2 MB • 12/05/2024</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 group-hover:text-blue-500"><MoreVertical size={14} /></Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>

          {/* GLOBAL NAVIGATION ARROWS - FIXED ABOVE ACTIONS FOOTER */}
          <div className="absolute bottom-[85px] left-0 right-0 px-6 flex justify-between items-center pointer-events-none z-50">
            <Button 
                variant="secondary"
                size="icon"
                disabled={activeTab === availableTabs[0] && (activeTab !== 'preanalysis' || preanalysisStep === 0)}
                onClick={prevStep}
                className={cn(
                "pointer-events-auto h-12 w-12 rounded-full shadow-2xl bg-white border border-slate-200 text-slate-600 transition-all active:scale-95",
                (activeTab === availableTabs[0] && (activeTab !== 'preanalysis' || preanalysisStep === 0)) ? "opacity-0 translate-x-[-10px]" : "opacity-100 translate-x-0"
                )}
            >
                <ChevronLeft size={24} />
            </Button>
            <Button 
                variant="secondary"
                size="icon"
                disabled={activeTab === availableTabs[availableTabs.length - 1] && (activeTab !== 'preanalysis' || preanalysisStep === 3)}
                onClick={nextStep}
                className={cn(
                "pointer-events-auto h-12 w-12 rounded-full shadow-2xl bg-blue-600 text-white transition-all active:scale-95 hover:bg-blue-700",
                (activeTab === availableTabs[availableTabs.length - 1] && (activeTab !== 'preanalysis' || preanalysisStep === 3)) ? "opacity-0 translate-x-[10px]" : "opacity-100 translate-x-0"
                )}
            >
                <ChevronRight size={24} />
            </Button>
          </div>
        </Tabs>

        {/* RESPONSIVE ACTIONS FOOTER */}
        <div className="bg-white border-t border-slate-100 p-4 grid grid-cols-2 gap-3 shrink-0 sticky bottom-0">
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl h-10 text-[9px] md:text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-50 active:scale-95 transition-all">
            AZIONI
          </Button>
          <Button variant="outline" className="border-slate-200 text-slate-500 font-black rounded-xl h-10 text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-slate-50">
            CHIUDI
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
