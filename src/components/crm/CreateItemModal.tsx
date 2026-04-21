import React, { useState } from 'react';
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

interface CreateItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'lead' | 'deal' | 'contact' | 'company';
  pipelineId?: string;
  stageId?: string;
}

export const CreateItemModal: React.FC<CreateItemModalProps> = ({ isOpen, onClose, type, pipelineId, stageId }) => {
  const { tenant, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({
    title: '',
    name: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    value: 0,
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant || !user) return;
    setLoading(true);

    try {
      const collectionName = type === 'lead' ? 'leads' : type === 'deal' ? 'deals' : type === 'contact' ? 'contacts' : 'companies';
      const data: any = {
        tenantId: tenant.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...formData
      };

      if (type === 'lead' || type === 'deal') {
        data.pipelineId = pipelineId || 'GENERALE';
        data.stageId = stageId || 'new';
        data.status = 'active';
      }

      // Map single email/phone to arrays if needed by schema
      if (formData.email) data.emails = [formData.email];
      if (formData.phone) data.phones = [formData.phone];

      const docRef = await addDoc(collection(db, 'tenants', tenant.id, collectionName), data);
      
      // Esegui automazioni
      if (type === 'lead') {
        await processNewLead(tenant.id, docRef.id, data);
      } else if (type === 'deal') {
        await processNewDeal(tenant.id, docRef.id, data);
      }

      onClose();
      setFormData({ title: '', name: '', firstName: '', lastName: '', email: '', phone: '', value: 0, notes: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `tenants/${tenant.id}/${type}s`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800 uppercase tracking-tight">
            Nuovo {type.charAt(0).toUpperCase() + type.slice(1)}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {(type === 'lead' || type === 'deal') && (
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-400 uppercase">Titolo</Label>
              <Input 
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Es: Sviluppo Web App"
                className="rounded-xl border-slate-200"
              />
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
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-full font-bold text-xs">ANNULLA</Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full px-8 text-xs shadow-lg shadow-blue-100"
            >
              {loading ? 'SALVATAGGIO...' : 'SALVA'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
