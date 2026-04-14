import React from 'react';
import { Mail, Inbox, Send, FileSignature, Search, Plus, Star, Trash2, Archive, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Webmail: React.FC = () => {
  return (
    <div className="flex h-full bg-white">
      {/* Sidebar Mail */}
      <div className="w-64 border-r border-slate-100 flex flex-col shrink-0">
        <div className="p-4">
          <Button className="w-full bg-[#2FC6F6] hover:bg-[#1eb0e0] text-white rounded-full font-bold">
            <Plus size={18} className="mr-2" />
            SCRIVI
          </Button>
        </div>
        <nav className="flex-1 px-2 space-y-1">
          {[
            { icon: Inbox, label: 'Posta in arrivo', count: 12, active: true },
            { icon: Send, label: 'Inviati', count: 0 },
            { icon: Star, label: 'Speciali', count: 2 },
            { icon: FileSignature, label: 'Bozze', count: 5 },
            { icon: Archive, label: 'Archivio', count: 0 },
            { icon: Trash2, label: 'Cestino', count: 0 },
          ].map((item, i) => (
            <button
              key={i}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                item.active ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} />
                {item.label}
              </div>
              {item.count > 0 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-600 border-none">
                  {item.count}
                </Badge>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Mail Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input placeholder="Cerca email..." className="pl-10 bg-slate-50 border-none" />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon"><Archive size={20} className="text-slate-500" /></Button>
            <Button variant="ghost" size="icon"><Trash2 size={20} className="text-slate-500" /></Button>
            <Button variant="ghost" size="icon"><MoreVertical size={20} className="text-slate-500" /></Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {[
            { from: 'Mario Rossi', subject: 'Aggiornamento Progetto X', preview: 'Ciao, ti invio gli ultimi aggiornamenti riguardanti...', date: '10:30', unread: true },
            { from: 'Supporto Bitrix24', subject: 'Nuove funzionalità disponibili', preview: 'Scopri le ultime novità introdotte nella piattaforma...', date: '09:15', unread: true },
            { from: 'Google Cloud', subject: 'Fattura Aprile 2024', preview: 'La tua fattura per il mese di Aprile è ora disponibile...', date: 'Ieri', unread: false },
            { from: 'LinkedIn', subject: 'Nuove opportunità di lavoro', preview: 'Abbiamo trovato nuove posizioni che potrebbero interessarti...', date: 'Ieri', unread: false },
          ].map((mail, i) => (
            <div 
              key={i} 
              className={`flex items-center gap-4 px-6 py-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${
                mail.unread ? 'bg-blue-50/30' : ''
              }`}
            >
              <div className={`w-2 h-2 rounded-full shrink-0 ${mail.unread ? 'bg-blue-500' : 'bg-transparent'}`}></div>
              <div className="w-48 shrink-0 font-semibold text-slate-800 truncate">{mail.from}</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-800 truncate">{mail.subject}</div>
                <div className="text-sm text-slate-500 truncate">{mail.preview}</div>
              </div>
              <div className="w-16 text-right text-xs text-slate-400">{mail.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Webmail;
