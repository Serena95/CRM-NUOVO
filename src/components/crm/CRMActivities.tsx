import React, { useEffect, useState } from 'react';
import { supabaseCRMService } from '@/services/supabaseCRMService';
import { supabase } from '@/lib/supabase';
import { 
  Phone, 
  CheckSquare, 
  StickyNote, 
  Zap, 
  Clock, 
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface CRMActivity {
  id: string;
  type: 'task' | 'call' | 'note' | 'system';
  title: string;
  description: string;
  status: string;
  created_at: string;
}

export const CRMActivities: React.FC<{ dealId: string }> = ({ dealId }) => {
  const [activities, setActivities] = useState<CRMActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const loadActivities = async () => {
    try {
      const data = await supabaseCRMService.getDealActivities(dealId);
      setActivities(data as any[]);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadActivities().finally(() => setLoading(false));

    // Subscribe to real-time updates for this deal's activities
    const channel = supabase
      .channel(`activities-${dealId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'crm_activities',
          filter: `deal_id=eq.${dealId}`
        },
        () => {
          loadActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dealId]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone size={14} className="text-blue-500" />;
      case 'task': return <CheckSquare size={14} className="text-purple-500" />;
      case 'note': return <StickyNote size={14} className="text-amber-500" />;
      case 'system': return <Zap size={14} className="text-emerald-500" />;
      default: return <Clock size={14} className="text-slate-400" />;
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400 text-xs font-black uppercase tracking-widest animate-pulse">Caricamento attività...</div>;

  return (
    <div className="space-y-6 relative before:absolute before:left-3.5 before:top-4 before:bottom-4 before:w-px before:bg-slate-100">
      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center opacity-40">
            <Clock size={48} className="mb-4 text-slate-200" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nessuna attività registrata</p>
        </div>
      ) : (
        activities.map((activity, idx) => (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={activity.id} 
            className="flex gap-6 group relative z-10"
          >
            <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-sm shrink-0",
                activity.type === 'task' ? "bg-purple-50" :
                activity.type === 'call' ? "bg-blue-50" :
                activity.type === 'system' ? "bg-emerald-50" : "bg-slate-50"
            )}>
              {getIcon(activity.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm hover:border-blue-100 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-[12px] font-black text-slate-700 uppercase tracking-tight truncate pr-4">
                    {activity.title}
                  </h4>
                  <span className="text-[9px] font-black text-slate-300 uppercase shrink-0">
                    {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-3">
                  {activity.description}
                </p>
                
                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                   <div className="flex items-center gap-1.5">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        activity.status === 'completed' ? "bg-emerald-500" : "bg-amber-500"
                      )} />
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                        {activity.status === 'completed' ? 'Completato' : 'In sospeso'}
                      </span>
                   </div>
                   <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight size={14} className="text-slate-300" />
                   </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
};
