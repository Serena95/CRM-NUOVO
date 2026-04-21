import React from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  X, 
  Mail, 
  Phone, 
  MessageSquare, 
  Calendar, 
  Clock, 
  User, 
  Building, 
  Tag, 
  FileText, 
  Paperclip,
  History,
  Zap,
  Plus
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CRM_PIPELINES } from '@/constants/crm';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { GitBranch } from 'lucide-react';

interface DetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  type: 'lead' | 'deal' | 'contact' | 'company';
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({ isOpen, onClose, item, type }) => {
  const { tenant } = useAuth();
  if (!item) return null;

  const handlePipelineChange = async (newPipelineId: string) => {
    if (!tenant) return;
    try {
      const collectionName = type === 'lead' ? 'leads' : 'deals';
      await updateDoc(doc(db, 'tenants', tenant.id, collectionName, item.id), {
        pipelineId: newPipelineId,
        // Reset stage to the first one of the new pipeline if needed
        // For now just keep the stageId or reset to 'new'
        stageId: 'new',
        updatedAt: serverTimestamp()
      });
      toast.success(`Spostato nella pipeline: ${CRM_PIPELINES.find(p => p.id === newPipelineId)?.name}`);
    } catch (error) {
      toast.error("Errore durante lo spostamento della pipeline");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[600px] p-0 border-none shadow-2xl">
        <div className="h-full flex flex-col bg-white">
          {/* Drawer Header */}
          <div className="bg-slate-50 border-b border-slate-100 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  {type === 'lead' ? <User size={24} /> : <Building size={24} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-600 border-none text-[10px] font-bold uppercase tracking-wider">
                      {type}
                    </Badge>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {item.id.slice(0, 8)}</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 mt-1">{item.title || item.name}</h2>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white">
                <X size={20} />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button className="bg-[#2FC6F6] hover:bg-[#1eb0e0] text-white font-bold rounded-full px-6 text-xs shadow-md shadow-blue-200">
                MODIFICA
              </Button>
              <Button variant="outline" size="icon" className="rounded-full border-slate-200"><Mail size={16} /></Button>
              <Button variant="outline" size="icon" className="rounded-full border-slate-200"><Phone size={16} /></Button>
              <Button variant="outline" size="icon" className="rounded-full border-slate-200"><MessageSquare size={16} /></Button>
            </div>
          </div>

          {/* Drawer Tabs */}
          <Tabs defaultValue="general" className="flex-1 flex flex-col">
            <div className="px-6 border-b border-slate-100">
              <TabsList className="bg-transparent h-12 gap-6">
                <TabsTrigger value="general" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-500 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none h-full px-0 text-xs font-bold uppercase tracking-widest text-slate-400">Generale</TabsTrigger>
                <TabsTrigger value="activities" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-500 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none h-full px-0 text-xs font-bold uppercase tracking-widest text-slate-400">Attività</TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-500 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none h-full px-0 text-xs font-bold uppercase tracking-widest text-slate-400">Cronologia</TabsTrigger>
                <TabsTrigger value="automation" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-500 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none h-full px-0 text-xs font-bold uppercase tracking-widest text-slate-400">Automazione</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <TabsContent value="general" className="mt-0 space-y-8">
                {/* Information Section */}
                <section>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <FileText size={12} />
                    Informazioni Principali
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase">Valore</Label>
                      <p className="text-sm font-bold text-slate-800">€{item.value?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase">Stato</Label>
                      <Badge className="bg-blue-50 text-blue-600 border-none font-bold uppercase text-[9px]">{item.status}</Badge>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase">Responsabile</Label>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[8px] bg-slate-100 text-slate-500">US</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-bold text-slate-700">Team Sales</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase">Creato il</Label>
                      <p className="text-sm font-bold text-slate-800">14 Maggio 2024</p>
                    </div>
                  </div>
                </section>

                {/* Pipeline Section */}
                {(type === 'lead' || type === 'deal') && (
                  <section>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <GitBranch size={12} />
                      Tunnel di Vendita (Pipeline)
                    </h3>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase">Pipeline Attuale</Label>
                      <Select 
                        defaultValue={item.pipelineId || 'GENERALE'} 
                        onValueChange={handlePipelineChange}
                      >
                        <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-xl h-10">
                          <SelectValue placeholder="Seleziona Pipeline" />
                        </SelectTrigger>
                        <SelectContent className="z-[110]">
                          {CRM_PIPELINES.map(p => (
                            <SelectItem key={p.id} value={p.id}>
                              <div className="flex items-center gap-2">
                                <p.icon size={14} className="text-slate-400" />
                                <span>{p.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-[10px] text-slate-400 leading-relaxed italic">
                        Spostando l'elemento in un'altra pipeline, lo stato verrà resettato a "Nuovo".
                      </p>
                    </div>
                  </section>
                )}

                {/* Contact Section */}
                <section>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <User size={12} />
                    Contatto
                  </h3>
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-white text-slate-400">JD</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-bold text-slate-800">John Doe</p>
                        <p className="text-xs text-slate-400 font-medium">CEO presso Enterprise Corp</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Mail size={14} className="text-slate-400" />
                        <span>john.doe@enterprise.com</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Phone size={14} className="text-slate-400" />
                        <span>+39 333 1234567</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Notes Section */}
                <section>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Tag size={12} />
                    Note e Tag
                  </h3>
                  <Textarea 
                    placeholder="Aggiungi una nota..." 
                    className="bg-slate-50 border-none rounded-2xl text-sm min-h-[100px] focus-visible:ring-blue-400/30"
                  />
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Badge variant="outline" className="rounded-full border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-wider">#importante</Badge>
                    <Badge variant="outline" className="rounded-full border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-wider">#q2-2024</Badge>
                    <Button variant="ghost" size="sm" className="h-6 rounded-full text-[10px] font-bold text-blue-500 hover:bg-blue-50">
                      <Plus size={12} className="mr-1" /> AGGIUNGI TAG
                    </Button>
                  </div>
                </section>
              </TabsContent>

              <TabsContent value="activities" className="mt-0">
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                    <Calendar size={32} />
                  </div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Nessuna attività pianificata</p>
                  <Button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full px-6 text-xs shadow-md shadow-blue-200">
                    PIANIFICA ORA
                  </Button>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};
