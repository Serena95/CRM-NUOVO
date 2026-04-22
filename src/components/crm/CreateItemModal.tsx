import React, { useState, useMemo } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';
import { processNewLead, processNewDeal } from '@/services/automationService';
import { useCRMStore } from '@/stores/crmStore';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { toast } from 'sonner';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'lead' | 'deal' | 'contact' | 'company';
  pipelineId?: string;
  stageId?: string;
}

export const CreateItemModal: React.FC<CreateItemModalProps> = ({ isOpen, onClose, type, pipelineId, stageId: propStageId }) => {
  const { tenant, user } = useAuth();
  const { stages, activeStructure, fetchInitialData } = useCRMStore();
  const [loading, setLoading] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState(propStageId || '');
  const [formData, setFormData] = useState<any>({
    title: '',
    name: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    contact: '',
    value: 0,
    notes: ''
  });

  // Filter out stages where manual creation is forbidden
  const availableStages = useMemo(() => {
    return stages.filter(s => !s.name.toLowerCase().includes('preanalisi'));
  }, [stages]);

  // Set default stage if none provided
  React.useEffect(() => {
    if (!propStageId && type === 'deal' && availableStages.length > 0) {
      setSelectedStageId(availableStages[0].id);
    }
  }, [propStageId, type, availableStages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant || !user) return;
    setLoading(true);

    try {
      if (type === 'deal') {
        const payload = {
          structure_id: pipelineId || activeStructure?.id,
          stage_id: selectedStageId || propStageId,
          title: formData.title,
          company: formData.company || formData.title,
          contact: formData.contact,
          phone: formData.phone,
          email: formData.email,
          value: formData.value,
          assigned_to: user.email || 'Admin',
          custom_fields: { notes: formData.notes }
        };

        if (!payload.stage_id) {
          throw new Error("Seleziona una fase valida");
        }

        await supabaseCRMService.createDeal(payload);
        toast.success("Affare creato con successo");
        await fetchInitialData();
      } else {
        // Fallback for other types using Firestore for now
        const collectionName = type === 'lead' ? 'leads' : type === 'contact' ? 'contacts' : 'companies';
        const data: any = {
          tenantId: tenant.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          ...formData
        };

        if (type === 'lead') {
          data.pipelineId = pipelineId || 'GENERALE';
          data.stageId = propStageId || 'new';
          data.status = 'active';
        }

        if (formData.email) data.emails = [formData.email];
        if (formData.phone) data.phones = [formData.phone];

        const docRef = await addDoc(collection(db, 'tenants', tenant.id, collectionName), data);
        if (type === 'lead') await processNewLead(tenant.id, docRef.id, data);
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} creato con successo`);
      }

      onClose();
      setFormData({ title: '', name: '', firstName: '', lastName: '', email: '', phone: '', company: '', contact: '', value: 0, notes: '' });
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Errore durante la creazione");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800 uppercase tracking-tight">
            Nuovo {type === 'deal' ? 'Affare' : type.charAt(0).toUpperCase() + type.slice(1)}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {type === 'deal' && (
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-400 uppercase">Fase Pipeline</Label>
              <Select value={selectedStageId} onValueChange={setSelectedStageId}>
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue placeholder="Seleziona fase..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {availableStages.map(s => (
                    <SelectItem key={s.id} value={s.id} className="text-xs font-bold uppercase">{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(type === 'lead' || type === 'deal') && (
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-400 uppercase">Titolo Affare</Label>
              <Input 
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Es: Consulenza Startup"
                className="rounded-xl border-slate-200"
              />
            </div>
          )}

          {type === 'deal' && (
             <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-slate-400 uppercase">Azienda</Label>
                <Input 
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  className="rounded-xl border-slate-200"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-slate-400 uppercase">Persona di Contatto</Label>
                <Input 
                  value={formData.contact}
                  onChange={(e) => setFormData({...formData, contact: e.target.value})}
                  className="rounded-xl border-slate-200"
                />
              </div>
            </div>
          )}

          {(type === 'contact' || type === 'lead') && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-slate-400 uppercase">Nome</Label>
                <Input 
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="rounded-xl border-slate-200"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-slate-400 uppercase">Cognome</Label>
                <Input 
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="rounded-xl border-slate-200"
                />
              </div>
            </div>
          )}
          {type === 'company' && (
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-400 uppercase">Ragione Sociale</Label>
              <Input 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="rounded-xl border-slate-200"
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-400 uppercase">Email</Label>
              <Input 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="rounded-xl border-slate-200"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-400 uppercase">Telefono</Label>
              <Input 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="rounded-xl border-slate-200"
              />
            </div>
          </div>
          {(type === 'lead' || type === 'deal') && (
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-400 uppercase">Valore Stimato (€)</Label>
              <Input 
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({...formData, value: Number(e.target.value)})}
                className="rounded-xl border-slate-200"
              />
            </div>
          )}
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-slate-400 uppercase">Note</Label>
            <Textarea 
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="rounded-xl border-slate-200 min-h-[80px]"
            />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-full font-bold text-xs text-slate-400">ANNULLA</Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full px-8 text-xs shadow-lg shadow-blue-100 uppercase tracking-widest"
            >
              {loading ? 'SALVATAGGIO...' : 'SALVA AFFARE'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
