import React from 'react';
import { useCRMStore } from '@/stores/crmStore';
import { cn } from '@/lib/utils';
import { 
  ChevronDown, 
  LayoutGrid, 
  Check,
  Building,
  Globe,
  Settings,
  TrendingUp,
  Calendar,
  Package,
  UserCog,
  Users2,
  Smartphone
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

export const CRMStructuresSelector: React.FC = () => {
  const { structures, activeStructure, switchStructure } = useCRMStore();

  const Icon = activeStructure ? iconMap[activeStructure.slug] || LayoutGrid : LayoutGrid;

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg border border-slate-200 shadow-sm hover:border-blue-300 transition-all group outline-none h-10">
            <div className="text-left">
              <h3 className="text-[12px] font-black text-slate-700 tracking-tight flex items-center gap-2 uppercase">
                <span className="text-slate-400 font-medium normal-case">Pipeline:</span> {activeStructure?.name || 'Seleziona...'}
                <ChevronDown size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
              </h3>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[300px] p-2 rounded-xl shadow-2xl border-slate-100 z-[100]">
          <div className="px-3 py-2 mb-2 border-b border-slate-50">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Seleziona Pipeline</span>
          </div>
          <div className="grid grid-cols-1 gap-1 max-h-[400px] overflow-y-auto nexus-scrollbar">
            {structures.map((s) => {
              const Sicon = iconMap[s.slug] || LayoutGrid;
              const isActive = activeStructure?.id === s.id;
              
              return (
                <DropdownMenuItem 
                  key={s.id}
                  onClick={() => switchStructure(s)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all",
                    isActive ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50 text-slate-600"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-7 h-7 rounded-md flex items-center justify-center text-white"
                      style={{ backgroundColor: s.color }}
                    >
                      <Sicon size={14} />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-tight">{s.name}</span>
                  </div>
                  {isActive && <Check size={16} className="text-blue-500" />}
                </DropdownMenuItem>
              );
            })}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
