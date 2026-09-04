import { useEffect, useState } from 'react';
import { TrendingUp, Flame, Search, Loader2, UserPlus, UserCheck, Star } from 'lucide-react';
import type { SnackWithProfile, Profile } from '@/lib/types';
import { getExploreSnacks, getSuggestedUsers, getTrendingCreators, toggleFollow } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/Toast';
import { SnackCard } from '@/components/SnackCard';
import { trendingTags, demoUsers } from '@/lib/demoData';

interface ExplorePageProps {
  onOpenComments: (snackId: string) => void;
  onOpenProfile: (userId: string) => void;
  onShare: (snack: SnackWithProfile) => void;
}

export function ExplorePage({ onOpenComments, onOpenProfile, onShare }: ExplorePageProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [snacks, setSnacks] = useState<SnackWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    getExploreSnacks(user.id).then((data) => {
      setSnacks(data);
      setLoading(false);
    });
  }, [user]);

  const trendingCreators = getTrendingCreators();
  const suggested = demoUsers.filter((u) => !followingIds.has(u.id)).slice(0, 5);

  const filteredSnacks = activeTag
    ? snacks.filter((s) => s.mood === activeTag.replace('#', ''))
    : snacks;

  async function handleFollow(userId: string) {
    if (!user) return;
    const isFollowing = followingIds.has(userId);
    if (isFollowing) {
      setFollowingIds((prev) => { const next = new Set(prev); next.delete(userId); return next; });
      showToast('Unfollowed', 'info');
    } else {
      setFollowingIds((prev) => new Set(prev).add(userId));
      showToast('Following!', 'success', 'follow');
    }
    await toggleFollow(user.id, userId, isFollowing);
  }

  return (
    <div className="pb-32">
      {/* Header */}
      <div className="sticky top-0 z-20 glass border-b border-white/5 px-5 py-3">
        <h1 className="font-extrabold text-xl mb-3">Explore</h1>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl glass border border-white/10">
          <Search className="w-4 h-4 text-white/40" />
          <input
            placeholder="Search snacks, brands, flavors..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
          />
        </div>
      </div>

      {/* Trending tags */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-4 h-4 text-[#ff7a00]" />
          <h2 className="font-bold text-sm">Trending Now</h2>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTag(null)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap tap-scale transition-colors ${activeTag === null ? 'gradient-animated text-white' : 'glass text-white/60'}`}
          >
            All
          </button>
          {trendingTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap tap-scale transition-colors ${activeTag === tag ? 'gradient-animated text-white' : 'glass text-white/60'}`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Trending creators */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-4 h-4 text-[#ffe600]" />
          <h2 className="font-bold text-sm">Trending Creators</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {trendingCreators.map((creator) => (
            <div key={creator.id} className="shrink-0 w-28 rounded-2xl glass-card p-3 text-center">
              <button onClick={() => onOpenProfile(creator.id)} className="tap-scale">
                <img
                  src={creator.avatar_url ?? 'https://images.pexels.com/photos/8941776/pexels-photo-8941776.jpeg?auto=compress&cs=tinysrgb&h=100&w=100'}
                  alt={creator.display_name}
                  className="w-14 h-14 rounded-full object-cover mx-auto mb-2"
                />
                <p className="font-semibold text-xs truncate">{creator.display_name}</p>
                <p className="text-[10px] text-white/40 truncate">@{creator.username}</p>
              </button>
              <p className="text-[10px] text-white/30 mt-1">{creator.total_snaps} snacks</p>
              <button
                onClick={() => handleFollow(creator.id)}
                className={`mt-2 w-full px-2 py-1 rounded-full text-[10px] font-bold tap-scale transition-all ${
                  followingIds.has(creator.id) ? 'glass text-white/50' : 'gradient-animated text-white'
                }`}
              >
                {followingIds.has(creator.id) ? 'Following' : 'Follow'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested users */}
      {suggested.length > 0 && (
        <div className="px-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <UserPlus className="w-4 h-4 text-[#00f0ff]" />
            <h2 className="font-bold text-sm">Suggested for You</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {suggested.map((sUser) => (
              <div key={sUser.id} className="shrink-0 w-28 rounded-2xl glass-card p-3 text-center">
                <button onClick={() => onOpenProfile(sUser.id)} className="tap-scale">
                  <img
                    src={sUser.avatar_url ?? 'https://images.pexels.com/photos/8941776/pexels-photo-8941776.jpeg?auto=compress&cs=tinysrgb&h=100&w=100'}
                    alt={sUser.display_name}
                    className="w-14 h-14 rounded-full object-cover mx-auto mb-2"
                  />
                  <p className="font-semibold text-xs truncate">{sUser.display_name}</p>
                  <p className="text-[10px] text-white/40 truncate">@{sUser.username}</p>
                </button>
                <button
                  onClick={() => handleFollow(sUser.id)}
                  className={`mt-2 w-full px-2 py-1 rounded-full text-[10px] font-bold tap-scale transition-all ${
                    followingIds.has(sUser.id) ? 'glass text-white/50' : 'gradient-animated text-white'
                  }`}
                >
                  {followingIds.has(sUser.id) ? 'Following' : 'Follow'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top snacks grid */}
      <div className="px-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-[#c6ff00]" />
          <h2 className="font-bold text-sm">Most Liked Snacks</h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#ff2d92]" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredSnacks.slice(0, 6).map((snack) => (
              <div key={snack.id} className="rounded-2xl glass-card overflow-hidden hover-lift">
                <div className="relative aspect-square">
                  <img src={snack.image_url} alt={snack.snack_name ?? 'Snack'} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                    <p className="text-xs font-semibold text-white truncate">{snack.snack_name ?? 'Snack'}</p>
                    <p className="text-[10px] text-white/60">@{snack.profiles?.username ?? 'user'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full feed */}
      <div className="px-4 mt-6 space-y-4">
        {filteredSnacks.map((snack) => (
          <SnackCard key={snack.id} snack={snack} onOpenComments={onOpenComments} onOpenProfile={onOpenProfile} onShare={onShare} />
        ))}
      </div>
    </div>
  );
}
