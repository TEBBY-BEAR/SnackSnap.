import { useEffect, useState } from 'react';
import { X, Search, UserPlus, UserCheck, MessageCircle, Users } from 'lucide-react';
import type { Profile } from '@/lib/types';
import { demoUsers, demoFriends, demoFollowing, demoFollowers } from '@/lib/demoData';
import { getRelationship, toggleFollow, sendFriendRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/Toast';

interface FriendsModalProps {
  userId: string;
  type: 'followers' | 'following' | 'friends';
  onClose: () => void;
  onOpenUserProfile: (userId: string) => void;
  onOpenMessages: (userId: string) => void;
}

export function FriendsModal({ userId, type, onClose, onOpenUserProfile, onOpenMessages }: FriendsModalProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<any[]>([]);

  useEffect(() => {
    if (userId.startsWith('demo-') || userId === 'me') {
      let ids: string[] = [];
      if (type === 'friends') ids = demoFriends;
      else if (type === 'following') ids = demoFollowing;
      else if (type === 'followers') ids = demoFollowers;
      const users = demoUsers.filter((u) => ids.includes(u.id));
      setProfiles(users);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [userId, type]);

  const filtered = profiles.filter((p) =>
    p.username?.toLowerCase().includes(search.toLowerCase()) ||
    p.display_name?.toLowerCase().includes(search.toLowerCase())
  );

  const title = type === 'friends' ? 'Friends' : type === 'following' ? 'Following' : 'Followers';

  return (
    <div className="fixed inset-0 z-[95] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md glass rounded-t-3xl border-t border-white/10 max-h-[75vh] flex flex-col animate-slide-up safe-bottom">
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3" />

        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <h3 className="font-bold text-base">{title}</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass border border-white/10">
            <Search className="w-4 h-4 text-white/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-3 pb-4 space-y-1">
          {loading ? (
            [1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3 items-center p-2">
                <div className="w-11 h-11 rounded-full skeleton" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-24 rounded skeleton" />
                  <div className="h-2 w-32 rounded skeleton" />
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="w-10 h-10 text-white/20 mb-3" />
              <p className="text-white/40 text-sm">No {title.toLowerCase()} found</p>
            </div>
          ) : (
            filtered.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                <button
                  onClick={() => { onOpenUserProfile(p.id); onClose(); }}
                  className="flex items-center gap-3 flex-1 min-w-0 tap-scale text-left"
                >
                  <img
                    src={p.avatar_url ?? 'https://images.pexels.com/photos/8941776/pexels-photo-8941776.jpeg?auto=compress&cs=tinysrgb&h=100&w=100'}
                    alt={p.display_name}
                    className="w-11 h-11 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{p.display_name}</p>
                    <p className="text-xs text-white/40 truncate">@{p.username}</p>
                  </div>
                </button>
                {p.id !== user?.id && (
                  <button
                    onClick={() => onOpenMessages(p.id)}
                    className="w-9 h-9 rounded-full glass flex items-center justify-center tap-scale shrink-0"
                  >
                    <MessageCircle className="w-4 h-4 text-white/60" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
