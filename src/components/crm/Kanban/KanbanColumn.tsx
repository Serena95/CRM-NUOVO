import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { CRMStage, CRMDeal } from '@/types/crm';
import { DealCard } from './DealCard';
import { cn } from '@/lib/utils';
import { MoreHorizontal, Plus } from 'lucide-react';

interface KanbanColumnProps {
  stage: CRMStage;
  deals: CRMDeal[];
  onCardClick?: (deal: CRMDeal) => void;
  onAddDeal?: () => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ stage, deals, onCardClick, onAddDeal }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  const totalValue = deals.reduce((acc, deal) => acc + (deal.value || 0), 0);

  return (
    <div className={cn(
      "flex flex-col shrink-0 select-none",
      "w-[320px] min-w-[320px] pb-4"
    )}>
      {/* Column Header - Always visible at top */}
      <div className="bg-white border-b border-slate-200 p-[8px_12px] relative z-[2] shrink-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 min-w-0">
             <div 
              className="w-1.5 h-6 rounded-full shrink-0" 
              style={{ backgroundColor: stage.color || '#cbd5e1' }} 
            />
            <h3 className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-800 truncate">
              {stage.name}
            </h3>
            <span className="bg-slate-100 text-slate-400 text-[10px] font-black px-1.5 py-0.5 rounded shrink-0">
              {deals.length}
            </span>
          </div>
          <button className="text-slate-300 hover:text-slate-500 transition-colors shrink-0">
            <MoreHorizontal size={16} />
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-black text-slate-400">
            €{totalValue.toLocaleString()}
          </span>
          {!stage.name.toLowerCase().includes('preanalisi') && (
            <button 
              onClick={onAddDeal}
              className="w-6 h-6 rounded-md bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-100 transition-colors"
            >
              <Plus size={12} className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Column Body - Cards list */}
      <div 
        ref={setNodeRef}
        className={cn(
          "flex flex-col gap-2 p-2 transition-colors min-h-[100px]",
          isOver && "bg-blue-50/50"
        )}
      >
        {deals.map(deal => (
          <div key={deal.id} onClick={() => onCardClick?.(deal)} className="flex flex-col">
            <DealCard 
              deal={deal} 
              isPreanalysis={stage.name.toLowerCase().includes('preanalisi')}
            />
          </div>
        ))}
        
        {/* Placeholder for empty column when dragging over */}
        {deals.length === 0 && (
          <div className="h-24 rounded-lg border-2 border-dashed border-slate-100 flex items-center justify-center text-slate-300 italic text-[10px]">
            Trascina qui un affare
          </div>
        )}
      </div>
    </div>
  );
};
