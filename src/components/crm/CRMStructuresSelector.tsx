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
      className="flex items-center gap-3 text-[14px] font-bold text-blue-600 hover:text-blue-700 transition-all uppercase tracking-tight outline-none h-10 px-5 rounded-full bg-blue-50/50 border border-blue-100 hover:border-blue-200 group whitespace-nowrap"
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
        <DialogContent className="max-w-[95vw] md:max-w-[600px] p-0 rounded-[32px] overflow-hidden border-none shadow-2xl bg-[#f8fafc] z-[200]">
          <div className="bg-white px-8 py-6 border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
            <DialogHeader className="p-0 space-y-0 text-left">
              <DialogTitle className="text-[18px] font-black text-slate-800 uppercase tracking-tight">
                Piattaforme CRM Nexus
              </DialogTitle>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                {structures.length} Pipeline disponibili nel sistema
              </p>
            </DialogHeader>
            <button 
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-100"
            >
              <X size={20} />
            </button>
          </div>

          <ScrollArea className="h-[70vh] md:max-h-[500px] w-full px-6 py-6 border-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-8">
              {structures.map((s) => {
                const Sicon = iconMap[s.slug] || LayoutGrid;
                const isActive = activeStructure?.id === s.id;
                
                return (
                  <button
                    key={s.id}
                    onClick={() => handleSelect(s)}
                    className={cn(
                      "w-full flex items-center gap-4 p-5 rounded-3xl transition-all text-left group",
                      isActive 
                        ? "bg-blue-600 text-white shadow-xl shadow-blue-100" 
                        : "bg-white border border-slate-100 shadow-xs text-slate-600 hover:border-blue-200 hover:shadow-md active:scale-[0.98]"
                    )}
                  >
                    <div 
                      className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0 transition-transform group-hover:scale-105",
                        isActive ? "bg-white/20" : ""
                      )}
                      style={!isActive ? { backgroundColor: s.color } : {}}
                    >
                      <Sicon size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[14px] font-black uppercase tracking-tight block leading-tight truncate">
                        {s.name}
                      </span>
                      <span className={cn(
                        "text-[9px] font-bold uppercase tracking-widest mt-1 block",
                        isActive ? "text-white/70" : "text-slate-400"
                      )}>
                        {isActive ? 'In uso' : 'Seleziona'}
                      </span>
                    </div>
                    {isActive && (
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                        <Check size={14} strokeWidth={4} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
          
          <div className="bg-white/80 backdrop-blur-sm px-8 py-4 border-t border-slate-100 flex items-center justify-center shrink-0">
            <button 
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors flex items-center gap-2"
            >
              Uscita senza selezione <X size={12} />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
