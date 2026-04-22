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
    <div className="flex flex-col w-[300px] shrink-0 h-full">
      {/* Column Header */}
      <div className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
             <div 
              className="w-1.5 h-6 rounded-full" 
              style={{ backgroundColor: stage.color || '#cbd5e1' }} 
            />
            <h3 className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-800 truncate max-w-[160px]">
              {stage.name}
            </h3>
            <span className="bg-slate-100 text-slate-400 text-[10px] font-black px-1.5 py-0.5 rounded">
              {deals.length}
            </span>
          </div>
          <button className="text-slate-300 hover:text-slate-500 transition-colors">
            <MoreHorizontal size={16} />
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-black text-slate-400">
            €{totalValue.toLocaleString()}
          </span>
          {!stage.name.toLowerCase().includes('preanalisi') && (
            <button 
              onClick={onAddDeal}
              className="w-6 h-6 rounded-md bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-100 transition-colors"
            >
              <Plus size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Column Body */}
      <div 
        ref={setNodeRef}
        className={cn(
          "flex-1 p-3 space-y-3 overflow-y-auto no-scrollbar transition-colors",
          isOver && "bg-blue-50/50"
        )}
      >
        {deals.map(deal => (
          <div key={deal.id} onClick={() => onCardClick?.(deal)}>
            <DealCard 
              deal={deal} 
              isPreanalysis={stage.name.toLowerCase().includes('preanalisi')}
            />
          </div>
        ))}
        
        {/* Placeholder for empty column when dragging over */}
        {deals.length === 0 && (
          <div className="h-32 rounded-lg border-2 border-dashed border-slate-100 flex items-center justify-center text-slate-300 italic text-xs">
            Trascina qui un affare
          </div>
        )}
      </div>
    </div>
  );
};
