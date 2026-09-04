import { useState } from 'react';
import { X, Send, Search } from 'lucide-react';
import type { SnackWithProfile } from '@/lib/types';
import { demoConversations } from '@/lib/demoData';
import { useToast } from '@/components/Toast';

interface ShareSheetProps {
  snack: SnackWithProfile;
  onClose: () => void;
  onShareToUser: (userId: string) => void;
}

export function ShareSheet({ snack, onClose, onShareToUser }: ShareSheetProps) {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');

  const filtered = demoConversations.filter((c) =>
    c.other_user?.username.toLowerCase().includes(search.toLowerCase()) ||
    c.other_user?.display_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[95] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md glass rounded-t-3xl border-t border-white/10 max-h-[70vh] flex flex-col animate-slide-up safe-bottom">
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3" />

        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <h3 className="font-bold text-base">Share Snack</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Snack preview */}
        <div className="px-4 py-3 flex items-center gap-3 border-b border-white/10">
          <img src={snack.image_url} alt={snack.snack_name ?? 'Snack'} className="w-14 h-14 rounded-xl object-cover" />
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{snack.snack_name ?? 'Snack'}</p>
            <p className="text-xs text-white/40 truncate">{snack.caption}</p>
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass border border-white/10">
            <Search className="w-4 h-4 text-white/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search friends..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-3 pb-4 space-y-1">
          {filtered.map((conv) => (
            <button
              key={conv.id}
              onClick={() => {
                onShareToUser(conv.other_user_id);
                showToast(`Shared with ${conv.other_user?.display_name}`, 'success', 'comment');
                onClose();
              }}
              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors tap-scale text-left"
            >
              <img
                src={conv.other_user?.avatar_url ?? 'https://images.pexels.com/photos/8941776/pexels-photo-8941776.jpeg?auto=compress&cs=tinysrgb&h=100&w=100'}
                alt={conv.other_user?.display_name ?? 'User'}
                className="w-11 h-11 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{conv.other_user?.display_name ?? 'User'}</p>
                <p className="text-xs text-white/40 truncate">@{conv.other_user?.username ?? 'user'}</p>
              </div>
              <div className="w-9 h-9 rounded-full gradient-animated flex items-center justify-center shrink-0">
                <Send className="w-4 h-4 text-white" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
