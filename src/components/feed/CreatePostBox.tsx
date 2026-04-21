import React, { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Mention from '@tiptap/extension-mention';
import { useAuth } from '@/contexts/AuthContext';
import { feedService } from '@/services/feedService';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Bold, 
  Italic, 
  List, 
  Link as LinkIcon, 
  Smile, 
  Paperclip, 
  AtSign, 
  Send, 
  X,
  FileIcon,
  Image as ImageIcon,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile, FeedAttachment } from '@/types';
import { ReactRenderer } from '@tiptap/react';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import MentionList from './MentionList';

const CreatePostBox: React.FC<{ onPostSuccess?: () => void }> = ({ onPostSuccess }) => {
  const { user, profile, tenant } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [attachments, setAttachments] = useState<FeedAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [postType, setPostType] = useState<'post' | 'announcement' | 'task' | 'crm_activity'>('post');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: 'Che cosa c\'è di nuovo?',
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'mention bg-blue-100 text-blue-700 px-1 rounded font-bold',
        },
        suggestion: {
          items: async ({ query }) => {
            if (!tenant) return [];
            const usersRef = collection(db, 'tenants', tenant.id, 'users');
            const snap = await getDocs(usersRef);
            const users = snap.docs.map(doc => doc.data() as UserProfile);
            return users
              .filter(u => u.displayName.toLowerCase().includes(query.toLowerCase()))
              .slice(0, 5);
          },
          render: () => {
            let component: ReactRenderer;
            let popup: TippyInstance[];

            return {
              onStart: (props) => {
                component = new ReactRenderer(MentionList, {
                  props,
                  editor: props.editor,
                });

                if (!props.clientRect) return;

                popup = tippy('body', {
                  getReferenceClientRect: props.clientRect as any,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'bottom-start',
                });
              },
              onUpdate(props) {
                component.updateProps(props);
                if (!props.clientRect) return;
                popup[0].setProps({
                  getReferenceClientRect: props.clientRect as any,
                });
              },
              onKeyDown(props) {
                if (props.event.key === 'Escape') {
                  popup[0].hide();
                  return true;
                }
                return (component.ref as any)?.onKeyDown(props);
              },
              onExit() {
                popup[0].destroy();
                component.destroy();
              },
            };
          },
        },
      }),
    ],
    content: '',
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!tenant) return;
    setIsUploading(true);
    try {
      const uploadPromises = acceptedFiles.map(file => feedService.uploadAttachment(tenant.id, file));
      const results = await Promise.all(uploadPromises);
      setAttachments(prev => [...prev, ...results]);
      toast.success(`${acceptedFiles.length} file caricati con successo`);
    } catch (error) {
      toast.error('Errore durante l\'upload dei file');
    } finally {
      setIsUploading(false);
    }
  }, [tenant]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handlePublish = async () => {
    if (!editor || (!editor.getText() && attachments.length === 0) || !tenant || !profile) return;

    try {
      const mentions: string[] = [];
      editor.getJSON().content?.forEach((node: any) => {
        if (node.type === 'mention') {
          mentions.push(node.attrs.id);
        }
      });

      await feedService.createPost(tenant.id, {
        tenantId: tenant.id,
        authorId: profile.uid,
        authorName: profile.displayName,
        authorPhoto: profile.photoURL,
        content: editor.getText(),
        contentHtml: editor.getHTML(),
        type: postType,
        attachments,
        mentions,
        likesCount: 0,
        commentsCount: 0,
        reactions: {},
        isPinned: false
      });

      editor.commands.clearContent();
      setAttachments([]);
      setIsExpanded(false);
      setPostType('post');
      toast.success('Post pubblicato con successo');
      if (onPostSuccess) onPostSuccess();
    } catch (error) {
      toast.error('Errore durante la pubblicazione del post');
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300">
      {/* Tabs Header */}
      <div className="flex border-b border-slate-100 bg-slate-50/50">
        {[
          { id: 'post', label: 'Messaggio' },
          { id: 'task', label: 'Incarico' },
          { id: 'announcement', label: 'Annuncio' },
          { id: 'crm_activity', label: 'CRM' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setPostType(tab.id as any); setIsExpanded(true); }}
            className={cn(
              "px-6 py-3 text-[11px] font-black uppercase tracking-widest transition-all relative",
              postType === tab.id ? "text-brand-blue" : "text-slate-400 hover:text-slate-600"
            )}
          >
            {tab.label}
            {postType === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue" />
            )}
          </button>
        ))}
      </div>

      <div className="p-4" onClick={() => setIsExpanded(true)}>
        <div className="flex gap-4">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={profile?.photoURL} alt={profile?.displayName} />
            <AvatarFallback>{profile?.displayName?.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <EditorContent 
              editor={editor} 
              className={cn(
                "min-h-[40px] text-sm text-slate-700 focus:outline-none mention-editor prose prose-sm max-w-none",
                isExpanded ? "min-h-[100px]" : ""
              )}
            />

            {attachments.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {attachments.map((file, idx) => (
                  <div key={idx} className="group relative bg-slate-50 rounded-lg p-2 border border-slate-100 flex items-center gap-2 pr-8">
                    {file.type.startsWith('image/') ? (
                      <div className="w-8 h-8 rounded bg-slate-200 overflow-hidden shrink-0">
                        <img src={file.url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    ) : (
                      <FileIcon size={16} className="text-slate-400 shrink-0" />
                    )}
                    <span className="text-[10px] font-bold text-slate-600 truncate max-w-[150px]">{file.name}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeAttachment(idx); }}
                      className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-slate-400 hover:text-brand-blue hover:bg-white"
              onClick={() => editor?.chain().focus().toggleBold().run()}
            >
              <Bold size={16} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-slate-400 hover:text-brand-blue hover:bg-white"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
            >
              <Italic size={16} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-slate-400 hover:text-brand-blue hover:bg-white"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
            >
              <List size={16} />
            </Button>
            <div className="w-px h-4 bg-slate-200 mx-1" />
            
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("h-8 w-8 text-slate-400 hover:text-brand-blue hover:bg-white", isUploading && "animate-pulse")}
                disabled={isUploading}
              >
                <Paperclip size={16} />
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-slate-400 hover:text-brand-blue hover:bg-white"
              onClick={() => { editor?.commands.insertContent('@'); editor?.commands.focus(); }}
            >
              <AtSign size={16} />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost"
              onClick={() => setIsExpanded(false)}
              className="text-[11px] font-black uppercase tracking-widest text-slate-500 hover:bg-white"
            >
              Annulla
            </Button>
            <Button 
              onClick={handlePublish}
              className="bg-brand-blue hover:bg-brand-blue/90 text-white font-black text-[11px] uppercase tracking-widest px-6 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              Pubblica
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePostBox;
