import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  MoreHorizontal,
  Filter,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Calendar: React.FC = () => {
  const [view, setView] = useState('month');
  
  const days = Array.from({ length: 35 }, (_, i) => i + 1);
  const weekDays = ['LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM'];

  const events = [
    { id: 1, title: 'Meeting Commerciale', time: '10:00', color: 'bg-blue-500', day: 14 },
    { id: 2, title: 'Demo Prodotto', time: '14:30', color: 'bg-emerald-500', day: 15 },
    { id: 3, title: 'Review Trimestrale', time: '09:00', color: 'bg-amber-500', day: 18 },
  ];

  return (
    <div className="h-full flex flex-col bg-[#f5f7fb]">
      {/* Calendar Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 shrink-0 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-slate-800">Calendario</h1>
            <div className="flex items-center bg-slate-100 rounded-full p-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn("rounded-full px-4 text-xs font-bold h-7", view === 'day' ? "bg-white shadow-sm text-blue-500" : "text-slate-500")}
                onClick={() => setView('day')}
              >
                GIORNO
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn("rounded-full px-4 text-xs font-bold h-7", view === 'week' ? "bg-white shadow-sm text-blue-500" : "text-slate-500")}
                onClick={() => setView('week')}
              >
                SETTIMANA
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn("rounded-full px-4 text-xs font-bold h-7", view === 'month' ? "bg-white shadow-sm text-blue-500" : "text-slate-500")}
                onClick={() => setView('month')}
              >
                MESE
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-full px-3 py-1">
              <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400"><ChevronLeft size={16} /></Button>
              <span className="text-sm font-bold text-slate-700 min-w-[120px] text-center uppercase tracking-wider">Maggio 2024</span>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400"><ChevronRight size={16} /></Button>
            </div>
            <Button className="bg-[#2FC6F6] hover:bg-[#1eb0e0] text-white font-bold rounded-full px-6 text-xs shadow-lg shadow-blue-200">
              NUOVO EVENTO
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-auto">
        <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {weekDays.map(day => (
            <div key={day} className="bg-slate-50 p-4 text-center text-[10px] font-black text-slate-400 tracking-widest uppercase">
              {day}
            </div>
          ))}
          
          {days.map(day => {
            const dayEvents = events.filter(e => e.day === day);
            const isToday = day === 14;
            
            return (
              <div key={day} className={cn(
                "bg-white min-h-[120px] p-2 transition-colors hover:bg-slate-50/50 group",
                day > 31 ? "bg-slate-50/30" : ""
              )}>
                <div className="flex justify-between items-start mb-2">
                  <span className={cn(
                    "w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold",
                    isToday ? "bg-blue-500 text-white shadow-md" : "text-slate-400"
                  )}>
                    {day > 31 ? day - 31 : day}
                  </span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-slate-300">
                    <Plus size={14} />
                  </Button>
                </div>
                
                <div className="space-y-1">
                  {dayEvents.map(event => (
                    <div 
                      key={event.id} 
                      className={cn(
                        "px-2 py-1 rounded text-[10px] font-bold text-white truncate cursor-pointer hover:opacity-90 transition-opacity",
                        event.color
                      )}
                    >
                      {event.time} {event.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
