import React, { useState } from 'react';
import { useCRMStore } from '@/stores/crmStore';
import { CRM_USERS } from '@/constants/crm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Filter, 
  X, 
  Check, 
  Calendar as CalendarIcon, 
  User, 
  Target, 
  TrendingUp, 
  Building2,
  Trash2,
  Save,
  ChevronDown,
  Clock,
  Layout
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Slider } from "@/components/ui/slider";
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export const AdvancedFilters: React.FC = () => {
  const { 
    filters, 
    setFilters, 
    resetFilters, 
    stages, 
    structures, 
    savedFilters, 
    applySavedFilter, 
    saveCurrentFilter,
    activeSavedFilterId
  } = useCRMStore();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [isSavePopoverOpen, setIsSavePopoverOpen] = useState(false);

  const handleToggleResponsabile = (id: string) => {
    const current = filters.responsabile;
    const next = current.includes(id) 
      ? current.filter(i => i !== id)
      : [...current, id];
    setFilters({ responsabile: next });
  };

  const handleToggleStage = (id: string) => {
    const current = filters.stage;
    const next = current.includes(id)
      ? current.filter(i => i !== id)
      : [...current, id];
    setFilters({ stage: next });
  };

  const handleToggleStato = (id: string) => {
    const current = filters.stato;
    const next = current.includes(id)
      ? current.filter(i => i !== id)
      : [...current, id];
    setFilters({ stato: next });
  };

  const handleToggleStruttura = (id: string) => {
    const current = filters.struttura;
    const next = current.includes(id)
      ? current.filter(i => i !== id)
      : [...current, id];
    setFilters({ struttura: next });
  };

  const activeFiltersCount = Object.entries(filters).reduce((acc, [key, value]) => {
    if (key === 'search' && value !== '') return acc;
    if (key === 'valore' && (value[0] !== 0 || value[1] !== 1000000)) return acc + 1;
    if (key === 'scorePreanalisi' && (value[0] !== 0 || value[1] !== 100)) return acc + 1;
    if (key === 'ultimaAttivita' && value !== 'all') return acc + 1;
    if (Array.isArray(value) && value.length > 0 && key !== 'valore' && key !== 'scorePreanalisi') return acc + 1;
    if (key === 'dataCreazione' && (value.from || value.to)) return acc + 1;
    return acc;
  }, 0);

  const FilterContent = ({ className }: { className?: string }) => (
    <div className={cn("flex flex-col gap-6 p-4", className)}>
      <div className="space-y-4">
        {/* Saved Filters Presets */}
        <div>
          <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 block">Filtri Rapidi</Label>
          <div className="flex flex-wrap gap-2">
            {savedFilters.map(sf => (
              <Button
                key={sf.id}
                variant={activeSavedFilterId === sf.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => applySavedFilter(sf.id)}
                className={cn(
                  "text-[9px] font-black uppercase rounded-full px-3 h-7",
                  activeSavedFilterId === sf.id ? "bg-blue-600 shadow-lg shadow-blue-100" : "text-slate-500 border-slate-200"
                )}
              >
                {sf.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Responsabile */}
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
             <User size={12} className="text-blue-500" /> Responsabile
          </Label>
          <div className="grid grid-cols-1 gap-2">
            {CRM_USERS.map(user => (
              <div key={user.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`user-${user.id}`} 
                  checked={filters.responsabile.includes(user.id)}
                  onCheckedChange={() => handleToggleResponsabile(user.id)}
                />
                <label 
                  htmlFor={`user-${user.id}`} 
                  className="text-[11px] font-bold text-slate-700 cursor-pointer"
                >
                  {user.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Stage */}
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
             <Target size={12} className="text-blue-500" /> Stage
          </Label>
          <div className="max-h-[150px] overflow-y-auto pr-2 space-y-2 no-scrollbar">
            {stages.map(stage => (
              <div key={stage.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`stage-${stage.id}`} 
                  checked={filters.stage.includes(stage.id)}
                  onCheckedChange={() => handleToggleStage(stage.id)}
                />
                <label 
                  htmlFor={`stage-${stage.id}`} 
                  className="text-[11px] font-bold text-slate-700 cursor-pointer flex items-center gap-2"
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                  {stage.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Stato */}
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
             <Check size={12} className="text-blue-500" /> Stato
          </Label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'attivo', label: 'Attivo' },
              { id: 'vinto', label: 'Vinto' },
              { id: 'perso', label: 'Perso' }
            ].map(s => (
              <div key={s.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`stato-${s.id}`} 
                  checked={filters.stato.includes(s.id)}
                  onCheckedChange={() => handleToggleStato(s.id)}
                />
                <label 
                  htmlFor={`stato-${s.id}`} 
                  className="text-[11px] font-bold text-slate-700 cursor-pointer"
                >
                  {s.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Struttura */}
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
             <Layout size={12} className="text-blue-500" /> Struttura
          </Label>
          <div className="max-h-[150px] overflow-y-auto pr-2 space-y-2 no-scrollbar">
            {structures.map(struct => (
              <div key={struct.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`struct-${struct.id}`} 
                  checked={filters.struttura.includes(struct.id)}
                  onCheckedChange={() => handleToggleStruttura(struct.id)}
                />
                <label 
                  htmlFor={`struct-${struct.id}`} 
                  className="text-[11px] font-bold text-slate-700 cursor-pointer"
                >
                  {struct.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Ultima Attività */}
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
             <Clock size={12} className="text-blue-500" /> Ultima Attività
          </Label>
          <Select 
            value={filters.ultimaAttivita} 
            onValueChange={(val) => setFilters({ ultimaAttivita: val })}
          >
            <SelectTrigger className="h-9 text-[11px] font-bold border-slate-200">
              <SelectValue placeholder="Seleziona..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Qualsiasi</SelectItem>
              <SelectItem value="today">Oggi</SelectItem>
              <SelectItem value="week">Ultimi 7 giorni</SelectItem>
              <SelectItem value="month">Ultimi 30 giorni</SelectItem>
              <SelectItem value="inactive">Inattivo (+5 giorni)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Valore Range */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
               <TrendingUp size={12} className="text-blue-500" /> Valore
            </Label>
            <span className="text-[9px] font-mono text-slate-500">€{filters.valore[0].toLocaleString()} - €{filters.valore[1].toLocaleString()}</span>
          </div>
          <Slider
            defaultValue={[0, 1000000]}
            min={0}
            max={1000000}
            step={5000}
            value={filters.valore}
            onValueChange={(val) => setFilters({ valore: val as [number, number] })}
            className="py-4"
          />
        </div>

        {/* Data Creazione */}
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
             <CalendarIcon size={12} className="text-blue-500" /> Data Creazione
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-bold text-[10px] h-9 px-3 border-slate-200", !filters.dataCreazione.from && "text-slate-400")}>
                  {filters.dataCreazione.from ? format(filters.dataCreazione.from, 'dd/MM/yyyy') : 'Dal'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dataCreazione.from}
                  onSelect={(date) => setFilters({ dataCreazione: { ...filters.dataCreazione, from: date } })}
                  locale={it}
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-bold text-[10px] h-9 px-3 border-slate-200", !filters.dataCreazione.to && "text-slate-400")}>
                  {filters.dataCreazione.to ? format(filters.dataCreazione.to, 'dd/MM/yyyy') : 'Al'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dataCreazione.to}
                  onSelect={(date) => setFilters({ dataCreazione: { ...filters.dataCreazione, to: date } })}
                  locale={it}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Score Preanalisi */}
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center">
            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
               <Check size={12} className="text-blue-500" /> Score Preanalisi
            </Label>
            <span className="text-[9px] font-mono text-slate-500">{filters.scorePreanalisi[0]}% - {filters.scorePreanalisi[1]}%</span>
          </div>
          <Slider
            defaultValue={[0, 100]}
            min={0}
            max={100}
            step={1}
            value={filters.scorePreanalisi}
            onValueChange={(val) => setFilters({ scorePreanalisi: val as [number, number] })}
            className="py-4"
          />
        </div>
      </div>

      <div className="mt-4 pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
        <Button 
          variant="outline" 
          onClick={resetFilters}
          className="flex-1 h-10 rounded-xl border-rose-100 text-rose-500 hover:bg-rose-50 hover:text-rose-600 text-[10px] font-black uppercase tracking-widest"
        >
          <Trash2 size={14} className="mr-2" /> Reset
        </Button>
        <Popover open={isSavePopoverOpen} onOpenChange={setIsSavePopoverOpen}>
          <PopoverTrigger asChild>
            <Button 
              className="flex-1 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100"
            >
              <Save size={14} className="mr-2" /> Salva
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[240px] p-4 rounded-2xl shadow-2xl border-slate-100" side="top">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Nome Filtro</Label>
              <Input 
                value={saveName} 
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Es. Alta priorità..."
                className="h-9 text-xs"
              />
              <Button 
                onClick={() => {
                  if (saveName) {
                    saveCurrentFilter(saveName);
                    setSaveName('');
                    setIsSavePopoverOpen(false);
                  }
                }}
                className="w-full h-9 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase"
              >
                CONFERMA
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop View: Dropdown or Mini-In-place (User asked for panel dropdown) */}
      <div className="hidden lg:block relative">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "h-8 md:h-9 text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-white shadow-sm border px-3 md:px-4 rounded-md transition-all",
                activeFiltersCount > 0 ? "text-blue-600 border-blue-200 bg-blue-50/50" : "text-slate-500 border-slate-200"
              )}
            >
              <Filter size={14} className={cn("mr-1.5 md:mr-2", activeFiltersCount > 0 ? "text-blue-600" : "text-blue-500")} /> 
              FILTRI {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent translate="no" align="start" className="w-[360px] max-h-[80vh] overflow-y-auto p-0 rounded-2xl shadow-3xl border-slate-100 no-scrollbar">
             <FilterContent />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tablet View: Lateral Drawer (Sheet) */}
      <div className="hidden md:block lg:hidden">
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "h-9 text-[10px] font-black uppercase tracking-widest bg-white shadow-sm border px-4 rounded-md transition-all",
                activeFiltersCount > 0 ? "text-blue-600 border-blue-200 bg-blue-50/50" : "text-slate-500 border-slate-200"
              )}
            >
              <Filter size={14} className="mr-2 text-blue-500" /> FILTRI {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[350px] p-0 border-l border-slate-100 sm:max-w-[350px]">
             <SheetHeader className="p-6 border-b border-slate-50">
               <SheetTitle className="text-[14px] font-black uppercase tracking-tighter text-slate-800">Filtri Avanzati</SheetTitle>
             </SheetHeader>
             <FilterContent className="flex-1 overflow-y-auto" />
          </SheetContent>
        </Sheet>
      </div>

      {/* Mobile View: Fullscreen Dialog/Sheet */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button 
               variant="ghost" 
               size="sm" 
               className={cn(
                 "h-8 text-[9px] font-black uppercase tracking-widest bg-white shadow-sm border px-3 rounded-md transition-all",
                 activeFiltersCount > 0 ? "text-blue-600 border-blue-200 bg-blue-50/50" : "text-slate-500 border-slate-200"
               )}
             >
               <Filter size={14} className="mr-1.5 text-blue-500" /> FILTRI
             </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[92vh] flex flex-col p-0 rounded-t-[32px] border-none shadow-2xl">
             <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 shrink-0" />
             <SheetHeader className="p-6 pt-2 shrink-0 border-b border-slate-50">
               <SheetTitle className="text-xl font-black uppercase tracking-tight text-slate-800 text-center">Filtri Avanzati</SheetTitle>
             </SheetHeader>
             <FilterContent className="flex-1 overflow-y-auto no-scrollbar pb-24" />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};
