import React, { useState } from 'react';
import { useCRMStore } from '@/stores/crmStore';
import { cn } from '@/lib/utils';
import { 
  X, 
  ChevronDown, 
  LayoutGrid, 
  Check, 
  TrendingUp, 
  Globe, 
  Building, 
  Settings, 
  Calendar, 
  Package, 
  UserCog, 
  Users2, 
  Smartphone 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const iconMap: Record<string, any> = {
  'finanza-agevolata': TrendingUp,
  'servizi-digitali': Globe,
  'consulenze': Building,
  'economie': Settings,
  'organizzazione-eventi': Calendar,
  'prodotti-e-servizi': Package,
  'formazione': UserCog,
  'coworking': Users2,
  'prenotazione-online': Smartphone,
};

export const CRMStructuresSelector: React.FC<{ onSelect?: () => void }> = ({ onSelect }) => {
  const { structures, activeStructure, switchStructure } = useCRMStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (s: any) => {
    switchStructure(s);
    if (onSelect) onSelect();
    setIsOpen(false);
  };

  const Trigger = () => (
    <button 
      onClick={() => setIsOpen(true)}
      className="flex items-center gap-3 text-[14px] font-bold text-blue-600 hover:text-blue-700 transition-all uppercase tracking-tight outline-none h-10 px-5 rounded-full bg-blue-50 border border-blue-100 hover:border-blue-200 group whitespace-nowrap"
    >
      <LayoutGrid size={16} className="text-blue-500" />
      <span className="truncate max-w-[120px] md:max-w-none">{activeStructure?.name || 'Scegli Pipeline'}</span>
      <ChevronDown size={14} className="text-blue-400 group-hover:translate-y-0.5 transition-transform shrink-0" />
    </button>
  );

  return (
    <div className="flex items-center gap-2">
      <Trigger />
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-2xl p-0 rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-white ring-0">
          <div className="bg-white px-6 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 z-20">
            <div className="space-y-0.5">
              <DialogTitle className="text-xl font-bold text-slate-900 uppercase tracking-tight">
                Nexus Pipelines
              </DialogTitle>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest opacity-80">
                Seleziona la struttura di lavoro
              </p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-100"
            >
              <X size={18} />
            </button>
          </div>

          <div className="overflow-y-auto p-4 bg-slate-50/30 max-h-[70vh] md:max-h-[480px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {structures.map((s) => {
                const Sicon = iconMap[s.slug] || LayoutGrid;
                const isActive = activeStructure?.id === s.id;
                
                return (
                  <button
                    key={s.id}
                    onClick={() => handleSelect(s)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left border relative group cursor-pointer",
                      isActive 
                        ? "bg-blue-600 border-blue-700 text-white shadow-lg z-10" 
                        : "bg-white border-slate-200 shadow-sm text-slate-700 hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                    )}
                  >
                    <div 
                      className={cn(
                        "w-11 h-11 rounded-lg flex items-center justify-center text-white shadow-sm shrink-0",
                        isActive ? "bg-white/20" : ""
                      )}
                      style={!isActive ? { backgroundColor: s.color } : {}}
                    >
                      <Sicon size={22} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-bold uppercase tracking-tight block truncate">
                        {s.name}
                      </span>
                      <span className={cn(
                        "text-[9px] font-medium uppercase tracking-wider block mt-1",
                        isActive ? "text-white/80" : "text-slate-400"
                      )}>
                        {isActive ? 'Attiva' : 'Clicca per aprire'}
                      </span>
                    </div>
                    {isActive && (
                      <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-end shrink-0">
            <button 
              onClick={() => setIsOpen(false)}
              className="text-[10px] font-bold text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors"
            >
              Annulla operazione
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
