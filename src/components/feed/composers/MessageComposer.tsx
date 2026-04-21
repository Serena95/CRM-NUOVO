import React, { useState } from 'react';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { Button } from '@/components/ui/button';
import { 
  Paperclip, 
  FileText, 
  AtSign, 
  Smile, 
  Video, 
  Tags,
  Plus,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseFeedService } from '@/services/supabaseFeedService';
import { toast } from 'sonner';

interface MessageComposerProps {
  onCancel: () => void;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({ onCancel }) => {
  const { profile, tenant } = useAuth();
  const [contentHtml, setContentHtml] = useState('');
  const [recipients, setRecipients] = useState<string[]>(['all']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSend = async () => {
    if (!contentHtml.replace(/<[^>]*>/g, '').trim() || !tenant || !profile) return;
    
    setIsSubmitting(true);
    try {
      await supabaseFeedService.createPost({
        author_id: profile.uid,
        type: 'message',
        content: contentHtml.replace(/<[^>]*>/g, ''), // Plain text version
        content_html: contentHtml,
        targets: recipients,
        reactions: [],
        comments_count: 0,
        is_pinned: false
      });
      setContentHtml('');
      toast.success('Messaggio pubblicato nel feed');
    } catch (error) {
      toast.error('Errore durante la pubblicazione');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Editor Area */}
      <div className="p-4 min-h-[140px]">
        <RichTextEditor 
          content={contentHtml} 
          onChange={setContentHtml} 
          placeholder="Scrivi un messaggio..."
          className="text-sm"
        />
      </div>

      {/* Recipient Selector (Bitrix Style) */}
      <div className="px-4 py-2 bg-slate-50/50 border-t border-slate-100 flex items-center flex-wrap gap-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">A:</span>
        {recipients.map((r) => (
          <div key={r} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            {r === 'all' ? 'Tutti i dipendenti' : r}
            <button className="hover:text-blue-800">×</button>
          </div>
        ))}
        <button className="text-blue-500 hover:text-blue-600 text-xs font-bold flex items-center gap-1 ml-2">
          <Plus size={12} /> Aggiungi
        </button>
      </div>

      {/* Toolbar & Buttons */}
      <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-1">
          {[
            { icon: Paperclip, title: "Allega" },
            { icon: FileText, title: "File" },
            { icon: AtSign, title: "Menziona" },
            { icon: Smile, title: "Emoji" },
            { icon: Video, title: "Registra" },
            { icon: Tags, title: "Tag" }
          ].map((item, idx) => (
            <button 
              key={idx} 
              title={item.title}
              className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-slate-50 rounded transition-all"
            >
              <item.icon size={16} />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button 
            disabled={isSubmitting}
            onClick={handleSend}
            className="bg-[#2FC6F6] hover:bg-[#1eb0e0] text-white font-bold px-6 h-9 rounded text-xs uppercase tracking-widest"
          >
            {isSubmitting ? 'INVIO...' : 'INVIA'}
          </Button>
          <Button 
            variant="ghost" 
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 font-bold px-4 h-9 rounded text-xs uppercase tracking-widest"
          >
            ANNULLA
          </Button>
        </div>
      </div>
    </div>
  );
};
