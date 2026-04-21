import React, { useState } from 'react';
import { FeedPost } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { feedService } from '@/services/feedService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  ThumbsUp, 
  Share2, 
  MoreHorizontal, 
  Pin, 
  Trash2, 
  Edit2,
  Download,
  FileIcon as LucideFileIcon,
  X,
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import FeedComments from './FeedComments';

interface FeedPostCardProps {
  post: FeedPost;
}

const FeedPostHeader: React.FC<{ post: FeedPost, onPin: () => void, isAuthor: boolean, onEdit: () => void, onDelete: () => void }> = ({ post, onPin, isAuthor, onEdit, onDelete }) => (
  <div className="p-4 lg:p-6 flex items-start justify-between">
    <div className="flex gap-4">
      <Avatar className="h-10 w-10 lg:h-12 lg:w-12 shadow-inner ring-2 ring-white">
        <AvatarImage src={post.authorPhoto} alt={post.authorName} />
        <AvatarFallback>{post.authorName?.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <div className="flex items-center gap-2">
          <span className="font-black text-slate-800 text-[13px] lg:text-[14px] hover:text-brand-blue cursor-pointer transition-colors tracking-tight">
            {post.authorName}
          </span>
          {post.isPinned && <Pin size={12} className="text-brand-blue rotate-45 fill-brand-blue" />}
          {post.type !== 'post' && (
            <span className="bg-slate-100 text-slate-500 text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-widest">
              {post.type.replace('_', ' ')}
            </span>
          )}
        </div>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">
          {post.createdAt ? formatDistanceToNow(post.createdAt.toDate ? post.createdAt.toDate() : new Date(post.createdAt), { addSuffix: true, locale: it }) : 'giusto ora'}
        </span>
      </div>
    </div>

    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 transition-opacity">
          <MoreHorizontal size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onPin}>
          <Pin className="mr-2 h-4 w-4" /> {post.isPinned ? 'Rimuovi dall\'alto' : 'Metti in alto'}
        </DropdownMenuItem>
        {isAuthor && (
          <>
            <DropdownMenuItem onClick={onEdit}>
              <Edit2 className="mr-2 h-4 w-4" /> Modifica
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" /> Elimina
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem onClick={() => toast.info('Link copiato')}>
          <Share2 className="mr-2 h-4 w-4" /> Copia link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);

const FeedPostContent: React.FC<{ post: FeedPost }> = ({ post }) => (
  <div className="px-4 lg:px-6 pb-4">
    <div 
      className="text-slate-700 text-sm lg:text-[15px] leading-relaxed break-words tiptap-content"
      dangerouslySetInnerHTML={{ __html: post.contentHtml || post.content }}
    />
    <FeedAttachments attachments={post.attachments} />
  </div>
);

const FeedAttachments: React.FC<{ attachments?: any[] }> = ({ attachments }) => {
  if (!attachments || attachments.length === 0) return null;
  return (
    <div className={cn(
      "mt-6 grid gap-2",
      attachments.length > 1 ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
    )}>
      {attachments.map((file, idx) => (
        <div key={idx} className="group relative rounded-xl border border-slate-100 overflow-hidden bg-slate-50 flex flex-col">
          {file.type.startsWith('image/') ? (
            <div className="aspect-video w-full overflow-hidden">
              <img src={file.url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105" referrerPolicy="no-referrer" />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center py-6">
              <AttachmentIcon type={file.type} />
            </div>
          )}
          <div className="p-2 flex items-center justify-between bg-white/80 backdrop-blur-sm border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-600 truncate flex-1 pr-2">{file.name}</span>
            <a href={file.url} download={file.name} target="_blank" rel="noopener noreferrer">
              <Download size={14} className="text-brand-blue hover:scale-125 transition-transform" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

const AttachmentIcon: React.FC<{ type: string }> = ({ type }) => {
  if (type.includes('pdf')) return <div className="p-3 bg-red-100 rounded-lg text-red-600 font-black text-xs uppercase">PDF</div>;
  if (type.includes('word') || type.includes('doc')) return <div className="p-3 bg-blue-100 rounded-lg text-blue-600 font-black text-xs uppercase">DOC</div>;
  if (type.includes('sheet') || type.includes('xls')) return <div className="p-3 bg-green-100 rounded-lg text-green-600 font-black text-xs uppercase">XLS</div>;
  return <div className="p-3 bg-slate-100 rounded-lg text-slate-600 font-black text-xs uppercase tracking-tighter">FILE</div>;
};

const FeedPostCard: React.FC<FeedPostCardProps> = ({ post }) => {
  const { profile, tenant } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);

  const isAuthor = profile?.uid === post.authorId;

  const handleLike = async () => {
    if (!tenant || !profile) return;
    try {
      await feedService.toggleReaction(tenant.id, post.id, profile.uid, '👍');
    } catch (error) {
      toast.error('Errore');
    }
  };

  const handleDelete = async () => {
    if (!tenant || !window.confirm('Sei sicuro di voler eliminare questo post?')) return;
    try {
      await feedService.deletePost(tenant.id, post.id);
      toast.success('Post eliminato');
    } catch (error) {
      toast.error('Errore durante l\'eliminazione');
    }
  };

  const handlePin = async () => {
    if (!tenant) return;
    try {
      await feedService.updatePost(tenant.id, post.id, { isPinned: !post.isPinned });
      toast.success(post.isPinned ? 'Post rimosso dall\'alto' : 'Post messo in alto');
    } catch (error) {
      toast.error('Errore');
    }
  };

  const handleUpdate = async () => {
    if (!tenant) return;
    try {
      await feedService.updatePost(tenant.id, post.id, { content: editedContent });
      setIsEditing(false);
      toast.success('Post aggiornato');
    } catch (error) {
      toast.error('Errore');
    }
  };

  const isLiked = profile && post.reactions?.['👍']?.includes(profile.uid);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden group transition-all",
        post.isPinned && "ring-2 ring-brand-blue/20 bg-blue-50/10"
      )}
    >
      <FeedPostHeader 
        post={post} 
        onPin={handlePin} 
        isAuthor={isAuthor} 
        onEdit={() => setIsEditing(true)} 
        onDelete={handleDelete} 
      />

      {isEditing ? (
        <div className="px-4 lg:px-6 pb-4 space-y-4">
          <textarea 
            className="w-full min-h-[100px] p-3 text-sm border rounded-lg focus:ring-2 focus:ring-brand-blue/30 focus:outline-none bg-slate-50"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Annulla</Button>
            <Button size="sm" onClick={handleUpdate}>Invia</Button>
          </div>
        </div>
      ) : (
        <FeedPostContent post={post} />
      )}

      {/* Nexus-Style Interaction Bar */}
      <div className="px-4 lg:px-6 py-2.5 bg-slate-50/50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <button 
            onClick={handleLike}
            className={cn(
              "flex items-center gap-1.5 transition-all group/btn",
              isLiked ? "text-brand-blue" : "text-slate-500 hover:text-brand-blue"
            )}
          >
            <ThumbsUp size={14} className={cn("transition-transform group-active/btn:scale-125", isLiked && "fill-brand-blue/10")} />
            <span className="text-[11px] font-black uppercase tracking-widest">{isLiked ? 'Ti piace' : 'Mi piace'}</span>
            {post.likesCount > 0 && (
              <span className="ml-0.5 bg-slate-200/50 text-slate-500 px-1.5 py-0.5 rounded text-[9px] font-black">
                {post.likesCount}
              </span>
            )}
          </button>

          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 text-slate-500 hover:text-brand-blue transition-all"
          >
            <MessageSquare size={14} />
            <span className="text-[11px] font-black uppercase tracking-widest">Commenta</span>
            {post.commentsCount > 0 && (
              <span className="ml-0.5 bg-slate-200/50 text-slate-500 px-1.5 py-0.5 rounded text-[9px] font-black">
                {post.commentsCount}
              </span>
            )}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 text-slate-500 hover:text-brand-blue transition-all focus:outline-none">
                <Share2 size={14} />
                <span className="text-[11px] font-black uppercase tracking-widest">Altro</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copiato'); }}>
                Copia link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.print()}>
                Stampa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Reaction Summary (Subtle) */}
        <div className="flex items-center gap-2">
           {Object.entries(post.reactions || {}).map(([emoji, users]) => (
            users.length > 0 && emoji !== '👍' && (
              <div key={emoji} className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-400">
                <span>{emoji}</span>
                <span>{users.length}</span>
              </div>
            )
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-100 bg-slate-50/30"
          >
            <FeedComments post={post} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FeedPostCard;
