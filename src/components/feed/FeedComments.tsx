import React, { useState, useEffect } from 'react';
import { FeedPost, FeedComment } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { feedService } from '@/services/feedService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Send, Trash2, Reply } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FeedCommentsProps {
  post: FeedPost;
}

const FeedComments: React.FC<FeedCommentsProps> = ({ post }) => {
  const { profile, tenant } = useAuth();
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!tenant) return;
    const unsub = feedService.subscribeToComments(tenant.id, post.id, (data) => {
      setComments(data);
    });
    return () => unsub();
  }, [tenant, post.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !tenant || !profile) return;

    setIsSubmitting(true);
    try {
      await feedService.addComment(tenant.id, {
        postId: post.id,
        authorId: profile.uid,
        authorName: profile.displayName,
        authorPhoto: profile.photoURL,
        content: newComment,
        mentions: [], // TODO: extract mentions
      });
      setNewComment('');
    } catch (error) {
      toast.error('Errore durante l\'invio del commento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!tenant || !window.confirm('Eliminare questo commento?')) return;
    try {
      await feedService.deleteComment(tenant.id, post.id, commentId);
      toast.success('Commento eliminato');
    } catch (error) {
      toast.error('Errore');
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 group">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={comment.authorPhoto} alt={comment.authorName} />
              <AvatarFallback className="text-[10px]">{comment.authorName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-2xl px-4 py-2 border border-slate-100 shadow-sm relative group-hover:border-slate-200 transition-colors">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-black text-slate-800 text-[12px] tracking-tight hover:text-brand-blue cursor-pointer">
                    {comment.authorName}
                  </span>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-slate-400 hover:text-brand-blue p-0.5"><Reply size={12} /></button>
                    {profile?.uid === comment.authorId && (
                      <button onClick={() => handleDelete(comment.id)} className="text-slate-400 hover:text-red-500 p-0.5"><Trash2 size={12} /></button>
                    )}
                  </div>
                </div>
                <p className="text-slate-600 text-[13px] leading-relaxed break-words">{comment.content}</p>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 ml-2 inline-block">
                {comment.createdAt ? formatDistanceToNow(comment.createdAt.toDate ? comment.createdAt.toDate() : new Date(comment.createdAt), { addSuffix: true, locale: it }) : 'giusto ora'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-6 flex items-center gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={profile?.photoURL} alt={profile?.displayName} />
          <AvatarFallback className="text-[10px]">{profile?.displayName?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 relative">
          <input 
            type="text" 
            placeholder="Scrivi un commento..." 
            className="w-full bg-white border border-slate-200 rounded-full h-10 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 pr-10"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button 
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-blue disabled:opacity-30 p-1 hover:scale-125 transition-transform"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedComments;
