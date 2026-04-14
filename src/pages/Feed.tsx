import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare, 
  ThumbsUp, 
  Share2, 
  MoreHorizontal, 
  Image as ImageIcon, 
  Paperclip, 
  Video, 
  Smile,
  Clock,
  User,
  Plus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const Feed: React.FC = () => {
  const { profile } = useAuth();
  const [postText, setPostText] = useState('');

  const posts = [
    {
      id: 1,
      user: 'Marco Rossi',
      avatar: '',
      content: 'Abbiamo appena chiuso il deal con Enterprise Corp! Ottimo lavoro a tutto il team commerciale. 🚀',
      time: '10 minuti fa',
      likes: 12,
      comments: 3,
      type: 'announcement'
    },
    {
      id: 2,
      user: 'Giulia Bianchi',
      avatar: '',
      content: 'Qualcuno ha il template aggiornato per le proposte commerciali 2024?',
      time: '1 ora fa',
      likes: 2,
      comments: 5,
      type: 'question'
    },
    {
      id: 3,
      user: 'Luca Neri',
      avatar: '',
      content: 'Nuovo aggiornamento rilasciato per il modulo CRM. Controllate la sezione Automazione per le nuove feature.',
      time: '3 ore fa',
      likes: 8,
      comments: 1,
      type: 'update'
    }
  ];

  return (
    <div className="h-full flex flex-col bg-[#f5f7fb]">
      {/* Feed Header */}
      <div className="bg-white border-b border-slate-200 px-8 pt-4 shrink-0 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-slate-800">Feed</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-full px-4 font-bold text-xs border-slate-200">FILTRA</Button>
            <Button className="bg-[#2FC6F6] hover:bg-[#1eb0e0] text-white font-bold rounded-full px-6 text-xs shadow-lg shadow-blue-200">
              NUOVO POST
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          {['Tutti', 'Annunci', 'Task', 'Sondaggi', 'Altro'].map((tab, i) => (
            <button
              key={tab}
              className={cn(
                "pb-3 text-sm font-bold transition-all relative",
                i === 0 ? "text-blue-500" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {tab}
              {i === 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Create Post */}
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 border-b border-slate-50">
                <div className="flex gap-4">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={profile?.photoURL} />
                    <AvatarFallback className="bg-blue-500 text-white">{profile?.displayName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <textarea 
                    placeholder="Cosa c'è di nuovo?"
                    className="w-full bg-transparent border-none focus:ring-0 text-sm resize-none py-2 min-h-[80px]"
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                  />
                </div>
              </div>
              <div className="px-4 py-3 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-500 h-8 w-8">
                    <ImageIcon size={18} />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-500 h-8 w-8">
                    <Paperclip size={18} />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-500 h-8 w-8">
                    <Video size={18} />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-500 h-8 w-8">
                    <Smile size={18} />
                  </Button>
                </div>
                <Button 
                  disabled={!postText.trim()}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full px-6 text-xs shadow-md shadow-blue-200"
                >
                  INVIA
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Posts List */}
          {posts.map((post) => (
            <Card key={post.id} className="border-none shadow-sm rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-slate-100 text-slate-500 text-xs font-bold">
                        {post.user.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">{post.user}</h3>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                        <Clock size={10} />
                        <span>{post.time}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-slate-300 hover:text-slate-600 h-8 w-8">
                    <MoreHorizontal size={18} />
                  </Button>
                </div>

                <div className="text-sm text-slate-600 leading-relaxed mb-6">
                  {post.content}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1.5 text-slate-400 hover:text-blue-500 transition-colors group">
                      <ThumbsUp size={16} className="group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-slate-400 hover:text-blue-500 transition-colors group">
                      <MessageSquare size={16} className="group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold">{post.comments}</span>
                    </button>
                  </div>
                  <button className="flex items-center gap-1.5 text-slate-400 hover:text-blue-500 transition-colors group">
                    <Share2 size={16} className="group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-widest">Condividi</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Feed;
