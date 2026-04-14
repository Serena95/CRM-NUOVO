import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, Phone, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Lead } from '@/types';

export const LeadCard: React.FC<{ lead: Lead }> = ({ lead }) => {
  return (
    <Card className="hover:shadow-lg transition-all cursor-pointer border-none shadow-sm rounded-xl overflow-hidden bg-white group-hover:ring-2 group-hover:ring-blue-400/30">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h4 className="font-bold text-sm text-slate-800 leading-tight flex-1 group-hover:text-blue-600 transition-colors pr-6">
            {lead.title}
          </h4>
        </div>
        
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg font-black text-slate-900">€{lead.value.toLocaleString()}</span>
          {lead.source && (
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-slate-100 text-slate-500 border-none uppercase tracking-wider font-bold">
              {lead.source}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6 ring-2 ring-white">
              <AvatarFallback className="text-[10px] bg-slate-100 text-slate-500">
                <User size={10} />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Responsabile</span>
              <span className="text-[11px] text-slate-600 font-bold -mt-0.5">Team Sales</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-slate-400 hover:text-blue-500 hover:bg-blue-50">
              <Mail size={14} />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10">
              <Phone size={14} />
            </Button>
          </div>
        </div>
        
        {lead.nextActivityAt && (
          <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
            <Clock size={10} />
            <span className="uppercase tracking-wider">Prossima attività oggi</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const DealCard: React.FC<{ deal: any }> = ({ deal }) => {
  return (
    <Card className="hover:shadow-lg transition-all cursor-pointer border-none shadow-sm rounded-xl overflow-hidden bg-white group-hover:ring-2 group-hover:ring-blue-400/30">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h4 className="font-bold text-sm text-slate-800 leading-tight flex-1 group-hover:text-blue-600 transition-colors pr-6">
            {deal.title}
          </h4>
        </div>
        
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg font-black text-slate-900">€{deal.value.toLocaleString()}</span>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-blue-50 text-blue-600 border-none">
            {deal.probability}%
          </Badge>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6 ring-2 ring-white">
              <AvatarFallback className="text-[10px] bg-slate-100 text-slate-500">
                <User size={10} />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Contatto</span>
              <span className="text-[11px] text-slate-600 font-bold -mt-0.5">Cliente Potenziale</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-slate-400 hover:text-blue-500 hover:bg-blue-50">
              <Mail size={14} />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10">
              <Phone size={14} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
