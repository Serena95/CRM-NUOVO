import React, { useRef, useEffect, useMemo } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragEndEvent
} from '@dnd-kit/core';
import { useCRMStore } from '@/stores/crmStore';
import { KanbanColumn } from './KanbanColumn';
import { DealCard } from './DealCard';
import { useState } from 'react';
import { CRMDeal } from '@/types/crm';
import { Loader2, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import { DetailDrawer } from '../DetailDrawer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { CreateItemModal } from '../CreateItemModal';

export const KanbanBoard: React.FC = () => {
  const { stages, getFilteredDeals, activeStructure, moveDeal, isLoading } = useCRMStore();
  const deals = getFilteredDeals();
  const [activeDeal, setActiveDeal] = useState<CRMDeal | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<string | undefined>(undefined);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    })
  );

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll();
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [stages]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -340 : 340,
        behavior: 'smooth'
      });
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveDeal(active.data.current?.deal || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDeal(null);

    if (over && active.id !== over.id) {
      const dealId = active.id as string;
      const toStageId = over.id as string;
      moveDeal(dealId, toStageId);
    }
  };

  if (isLoading && stages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin opacity-40" />
        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Inizializzazione Workspace...</span>
      </div>
    );
  }

  if (!activeStructure) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-20 text-center bg-white/50 m-4 rounded-3xl border border-dashed border-slate-200">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-6">
          <Layers className="animate-pulse" size={32} />
        </div>
        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Benvenuto nel CRM Nexus</h3>
        <p className="text-slate-500 text-sm mt-2 max-w-sm font-medium">
          Per iniziare, clicca sul selettore <span className="font-bold text-blue-600 uppercase">"Pipeline"</span> nella barra in alto oppure premi il tasto <strong>"AGGIORNA"</strong> per inizializzare le strutture predefinite.
        </p>
        <button 
          onClick={() => useCRMStore.getState().fetchInitialData(undefined, true)}
          className="mt-6 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100 transition-all active:scale-95"
        >
          Inizializza Pipeline
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden bg-[#f8fafc] kanban-wrapper">
      {/* Scroll Navigation Arrows - Hidden on Mobile, Visible on Tablet/Desktop */}
      {showLeftArrow && (
        <Button
          variant="secondary"
          size="icon"
          onClick={() => scroll('left')}
          className={cn(
            "absolute left-2 top-1/2 -translate-y-1/2 z-[10] rounded-full h-11 w-11 shadow-2xl bg-white border-slate-200 text-slate-500",
            "hover:bg-slate-50 hover:text-blue-600 hover:scale-110 active:scale-95 transition-all",
            "hidden md:flex" // Mobile hidden, Tablet/Desktop visible
          )}
        >
          <ChevronLeft size={24} />
        </Button>
      )}

      {showRightArrow && (
        <Button
          variant="secondary"
          size="icon"
          onClick={() => scroll('right')}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 z-[10] rounded-full h-11 w-11 shadow-2xl bg-white border-slate-200 text-slate-500",
            "hover:bg-slate-50 hover:text-blue-600 hover:scale-110 active:scale-95 transition-all",
            "hidden md:flex" // Mobile hidden, Tablet/Desktop visible
          )}
        >
          <ChevronRight size={24} />
        </Button>
      )}

      <div 
        ref={scrollContainerRef}
        className={cn(
          "flex-1 flex flex-row items-start gap-3 p-3 overflow-x-auto overflow-y-hidden no-scrollbar scroll-smooth relative"
        )}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {stages.map((stage) => (
            <KanbanColumn 
              key={stage.id} 
              stage={stage} 
              deals={deals.filter(deal => deal.stage_id === stage.id)}
              onCardClick={(deal) => {
                window.dispatchEvent(new CustomEvent('crm:openDeal', { detail: { dealId: deal.id } }));
              }}
              onAddDeal={() => {
                setSelectedStageId(stage.id);
                setIsCreateModalOpen(true);
              }}
            />
          ))}


          <DragOverlay>
            {activeDeal ? (
              <div className="w-[320px] rotate-3 shadow-2xl skew-y-1 pointer-events-none">
                <DealCard deal={activeDeal} isPreanalysis={stages.find(s => s.id === activeDeal.stage_id)?.name.toLowerCase().includes('preanalisi')} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <CreateItemModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        type="deal"
        pipelineId={activeStructure?.id}
        stageId={selectedStageId}
      />
    </div>
  );
};
