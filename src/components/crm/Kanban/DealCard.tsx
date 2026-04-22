import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CRMDeal } from '@/types/crm';
import { useCRMStore } from '@/stores/crmStore';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Phone, 
  Mail, 
  TrendingUp, 
  User,
  AlertCircle,
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface DealCardProps {
  deal: CRMDeal;
  isPreanalysis?: boolean;
}

export const DealCard: React.FC<DealCardProps> = ({ deal, isPreanalysis }) => {
  const { structures } = useCRMStore();
  const structure = structures.find(s => s.id === deal.structure_id);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: deal.id,
    data: { deal }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : {};

  const cardStyle = {
    ...style,
    borderLeftColor: structure?.color || '#cbd5e1'
  };

  if (isPreanalysis && deal.preanalysis_result) {
    const res = deal.preanalysis_result;
    return (
      <div
        ref={setNodeRef}
        style={cardStyle}
        {...listeners}
        {...attributes}
        className={cn(
          "bg-white rounded-lg shadow-sm border-l-4 p-4 space-y-3 cursor-grab active:cursor-grabbing transition-all hover:shadow-md",
          isDragging && "opacity-50 grayscale scale-95"
        )}
      >
        <div className="flex justify-between items-start gap-2">
          <div className="flex flex-col">
            <h3 className="font-black text-slate-800 text-[13px] leading-tight flex-1 uppercase tracking-tight">
              {res.company_data.name}
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {structure?.name}
            </span>
          </div>
          <Badge className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase px-2 py-0.5 border-none shadow-none">
            {res.score}%
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[11px] text-slate-600 font-bold overflow-hidden">
            <User size={12} className="text-slate-400 shrink-0" />
            <span className="truncate">{res.contact_data.name}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
            <Phone size={12} className="text-slate-400 shrink-0" />
            <span>{res.contact_data.phone}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-50">
           <div className="bg-slate-50 p-2 rounded-md border border-slate-100">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[9px] font-black text-slate-400 uppercase">Tipo richiesta</span>
            </div>
            <span className="text-[11px] font-black text-blue-600 leading-tight block uppercase">{res.request_type}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-200 uppercase tracking-tighter">
            <Calendar size={10} />
            {new Date(deal.created_at).toLocaleDateString('it-IT')}
          </div>
          <div className="flex items-center -space-x-2">
            <Avatar className="h-6 w-6 rounded-md border-2 border-white">
              <AvatarFallback className="bg-blue-50 text-blue-600 text-[10px] font-black">A</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={cardStyle}
      {...listeners}
      {...attributes}
      className={cn(
        "bg-white rounded-lg shadow-sm border-l-4 border-slate-200 p-3 space-y-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all",
        isDragging && "opacity-50 grayscale"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col">
          <h4 className="text-[13px] font-black text-slate-800 leading-tight flex-1 uppercase tracking-tight">{deal.title}</h4>
          <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{structure?.name}</span>
        </div>
        {deal.preanalysis_result && (
          <Badge className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase px-1.5 py-0 border-none shadow-none">
            {deal.preanalysis_result.score}%
          </Badge>
        )}
      </div>

      <div className="space-y-1.5 pt-1">
        <div className="flex items-center gap-2">
          <Building2 size={12} className="text-slate-400 shrink-0" />
          <span className="text-[11px] font-bold text-slate-600 truncate">{deal.company}</span>
        </div>
        <div className="flex items-center gap-2">
          <User size={12} className="text-slate-400 shrink-0" />
          <span className="text-[10px] font-medium text-slate-500 truncate">{deal.contact}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
        <span className="text-[12px] font-black text-emerald-600 tracking-tight">€{deal.value.toLocaleString()}</span>
        <div className="flex items-center -space-x-1.5">
          <Avatar className="h-6 w-6 rounded-md border-2 border-white">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${deal.assigned_to}`} />
            <AvatarFallback className="text-[9px] font-black bg-blue-100 text-blue-600">A</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
};
