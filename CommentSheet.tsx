import { useEffect, useState } from 'react';
import { X, Send } from 'lucide-react';
import type { CommentWithProfile } from '@/lib/types';
import { getComments, addComment } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface CommentSheetProps {
  snackId: string;
  onClose: () => void;
}

export function CommentSheet({ snackId, onClose }: CommentSheetProps) {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getComments(snackId).then((data) => {
      setComments(data);
      setLoading(false);
    });
  }, [snackId]);

  async function handleSend() {
    if (!user || !text.trim()) return;
    setSending(true);
    const success = await addComment(snackId, user.id, text.trim());
    if (success) {
      const newComment: CommentWithProfile = {
        id: `temp-${Date.now()}`,
        user_id: user.id,
        snack_id: snackId,
        text: text.trim(),
        created_at: new Date().toISOString(),
        profiles: profile ? {
          id: profile.id,
          username: profile.username,
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
        } : null,
      };
      setComments((c) => [newComment, ...c]);
      setText('');
    }
    setSending(false);
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md glass rounded-t-3xl border-t border-white/10 max-h-[70vh] flex flex-col animate-slide-up">
        {/* Handle */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <h3 className="font-bold text-base">Comments</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full skeleton" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 w-20 rounded skeleton" />
                    <div className="h-4 w-48 rounded skeleton" />
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12 text-white/40">
              <p className="text-sm">No comments yet. Be the first to say something!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 animate-slide-up">
                <img
                  src={comment.profiles?.avatar_url ?? 'https://images.pexels.com/photos/8941776/pexels-photo-8941776.jpeg?auto=compress&cs=tinysrgb&h=80&w=80'}
                  alt={comment.profiles?.display_name ?? 'User'}
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white/70">{comment.profiles?.display_name ?? 'User'}</p>
                  <p className="text-sm text-white/90 leading-relaxed">{comment.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10 flex items-center gap-2 safe-bottom">
          {profile?.avatar_url && (
            <img src={profile.avatar_url} alt="You" className="w-8 h-8 rounded-full object-cover" />
          )}
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Add a comment..."
            className="flex-1 px-4 py-2.5 rounded-full glass border border-white/10 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#ff2d92]/50 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="w-10 h-10 rounded-full gradient-animated flex items-center justify-center tap-scale disabled:opacity-40"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
