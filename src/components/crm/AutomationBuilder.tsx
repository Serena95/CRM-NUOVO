import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  X, 
  Zap, 
  Mail, 
  CheckSquare, 
  UserPlus, 
  StickyNote, 
  Webhook, 
  Bell, 
  Timer,
  ChevronRight,
  Trash2,
  Save,
  Play,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CRMStage, CRMAutomation, CRMAutomationType } from '@/types/crm';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AutomationBuilderProps {
  stage: CRMStage;
  onClose: () => void;
}

const AUTOMATION_TYPES: { type: CRMAutomationType; label: string; icon: any; color: string; description: string }[] = [
  { type: 'task', label: 'Crea Task', icon: CheckSquare, color: 'text-purple-500 bg-purple-50', description: 'Crea un incarico automatico per il team' },
  { type: 'email', label: 'Invia Email', icon: Mail, color: 'text-blue-500 bg-blue-50', description: 'Invia un template email al cliente' },
  { type: 'assignee', label: 'Cambia Resp.', icon: UserPlus, color: 'text-emerald-500 bg-emerald-50', description: 'Riassegna l\'affare a un altro utente' },
  { type: 'note', label: 'Aggiungi Nota', icon: StickyNote, color: 'text-amber-500 bg-amber-50', description: 'Logga una nota interna automatica' },
  { type: 'webhook', label: 'Webhook', icon: Webhook, color: 'text-rose-500 bg-rose-50', description: 'Invia dati a un URL esterno' },
  { type: 'notification', label: 'Notifica', icon: Bell, color: 'text-indigo-500 bg-indigo-50', description: 'Invia un avviso push o in-app' },
  { type: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, color: 'text-emerald-500 bg-emerald-50', description: 'Invia un messaggio WhatsApp automatico' },
  { type: 'timer', label: 'Timer', icon: Timer, color: 'text-slate-500 bg-slate-50', description: 'Attendi prima di eseguire l\'azione successiva' },
];

import { useCRMPermissions } from '@/hooks/useCRMPermissions';

export const AutomationBuilder: React.FC<AutomationBuilderProps> = ({ stage, onClose }) => {
  const [automations, setAutomations] = useState<CRMAutomation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedType, setSelectedType] = useState<CRMAutomationType | null>(null);
  const { canModifyAutomations } = useCRMPermissions();

  useEffect(() => {
    const fetchAutomations = async () => {
      try {
        const data = await supabaseCRMService.getAutomations(stage.id);
        setAutomations(data);
      } catch (error) {
        console.error('Error fetching automations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAutomations();
  }, [stage.id]);

  const handleAddAutomation = (type: CRMAutomationType) => {
    const newAuto: CRMAutomation = {
      id: '', // Temporary
      stage_id: stage.id,
      type,
      config: {
        title: type === 'task' ? 'Nuovo Task' : '',
        message: type === 'notification' ? 'Ehi! L\'affare è arrivato qui.' : '',
      },
      is_active: true,
      created_at: new Date().toISOString()
    };
    setAutomations([...automations, newAuto]);
    setSelectedType(null);
  };

  const removeAutomation = async (index: number) => {
    const auto = automations[index];
    if (auto.id) {
       try {
         await supabaseCRMService.deleteAutomation(auto.id);
       } catch (error) {
         toast.error('Errore durante l\'eliminazione');
         return;
       }
    }
    setAutomations(automations.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      for (const auto of automations) {
        await supabaseCRMService.saveAutomation(auto);
      }
      toast.success('Automazioni salvate per ' + stage.name);
      onClose();
    } catch (error) {
      toast.error('Errore durante il salvataggio');
    } finally {
      setIsSaving(false);
    }
  };

  const updateConfig = (index: number, key: string, value: any) => {
    const newAutos = [...automations];
    newAutos[index].config = { ...newAutos[index].config, [key]: value };
    setAutomations(newAutos);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-4xl h-[80vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-slate-200"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
              <Zap size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Builder Automazioni</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stage: <span className="text-blue-600">{stage.name}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Content: Automation List */}
          <div className="flex-1 overflow-y-auto p-8 bg-[#fbfcfd] border-r border-slate-100 space-y-6">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-black">1</div>
               <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest">Evento: Quando un affare entra in questo stage</h3>
            </div>

            <div className="relative pl-4 space-y-6">
              <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-slate-100 border-l border-dashed border-slate-300 ml-[-1px]" />
              
              <AnimatePresence mode="popLayout">
                {automations.map((auto, idx) => {
                  const typeInfo = AUTOMATION_TYPES.find(t => t.type === auto.type);
                  return (
                    <motion.div 
                      key={idx}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="relative bg-white border border-slate-200 rounded-[20px] p-5 shadow-sm group hover:border-blue-200 hover:shadow-md transition-all ml-10"
                    >
                      <div className="absolute -left-14 top-4 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center z-10 shadow-md">
                        <Play size={12} fill="white" />
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", typeInfo?.color)}>
                            {typeInfo && <typeInfo.icon size={20} />}
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Azione {idx + 1}</p>
                            <h4 className="font-bold text-slate-800">{typeInfo?.label}</h4>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeAutomation(idx)}
                          className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Config Form */}
                      <div className="grid grid-cols-1 gap-4">
                        {auto.type === 'task' && (
                          <input 
                            placeholder="Titolo del task..."
                            value={auto.config.title}
                            onChange={(e) => updateConfig(idx, 'title', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                          />
                        )}
                        {auto.type === 'notification' && (
                          <textarea 
                            placeholder="Messaggio di notifica..."
                            value={auto.config.message}
                            onChange={(e) => updateConfig(idx, 'message', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 min-h-[80px]"
                          />
                        )}
                        {auto.type === 'whatsapp' && (
                          <div className="space-y-2">
                             <textarea 
                              placeholder="Messaggio WhatsApp... Usa {{contact}} per il nome e {{deal}} per l'affare."
                              value={auto.config.body}
                              onChange={(e) => updateConfig(idx, 'body', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 min-h-[100px]"
                            />
                            <p className="text-[10px] text-slate-400 italic">Il messaggio verrà inviato al numero di telefono associato all'affare.</p>
                          </div>
                        )}
                        {/* More type-specific configs would go here */}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {automations.length === 0 && !isLoading && (
                <div className="ml-10 py-12 text-center bg-white border border-dashed border-slate-200 rounded-[24px]">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nessuna automazione attiva per questo stage</p>
                </div>
              )}
            </div>
            
            <div className="ml-10 pt-4">
               {selectedType ? (
                 <div className="bg-white border border-blue-100 rounded-[24px] p-6 shadow-xl shadow-blue-900/5">
                   <div className="flex items-center justify-between mb-4">
                     <h5 className="text-xs font-black text-slate-700 uppercase tracking-widest">Scegli il tipo di azione</h5>
                     <button onClick={() => setSelectedType(null)} className="text-slate-400"><X size={14} /></button>
                   </div>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                     {AUTOMATION_TYPES.map(t => (
                       <button 
                         key={t.type}
                         disabled={!canModifyAutomations}
                         onClick={() => handleAddAutomation(t.type)}
                         className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-center group disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                         <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm", t.color)}>
                            <t.icon size={18} />
                         </div>
                         <span className="text-[10px] font-black uppercase tracking-tight text-slate-600">{t.label}</span>
                       </button>
                     ))}
                   </div>
                 </div>
               ) : (
                 <button 
                   disabled={!canModifyAutomations}
                   onClick={() => setSelectedType('task')}
                   className="flex items-center gap-3 px-6 h-12 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:shadow-lg transition-all font-black text-[11px] uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   <Plus size={16} /> Aggiungi Azione Automatica
                 </button>
               )}
            </div>
          </div>

          {/* Sidebar: Automation Catalog */}
          <div className="w-[300px] bg-white hidden md:flex flex-col p-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 px-2">Azioni disponibili</h3>
            <div className="space-y-4 overflow-y-auto no-scrollbar">
              {AUTOMATION_TYPES.map(t => (
                <div 
                  key={t.type}
                  draggable
                  onDragEnd={() => handleAddAutomation(t.type)}
                  className="p-4 rounded-2xl border border-slate-100 bg-slate-50/30 hover:border-blue-100 hover:bg-white hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", t.color)}>
                      <t.icon size={16} />
                    </div>
                    <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{t.label}</span>
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 leading-tight">{t.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-100 bg-white flex items-center justify-between">
           <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
             <Zap size={14} className="text-amber-500" />
             Queste azioni verranno eseguite in ordine sequenziale.
           </div>
           <div className="flex items-center gap-3">
             <button 
               onClick={onClose}
               className="px-6 h-10 rounded-full text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
             >
               Chiudi
             </button>
             {canModifyAutomations && (
               <Button 
                 disabled={isSaving}
                 onClick={handleSave}
                 className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-10 rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-200"
               >
                 {isSaving ? 'Salvataggio...' : 'Salva Automazioni'}
               </Button>
             )}
           </div>
        </div>
      </motion.div>
    </div>
  );
};
