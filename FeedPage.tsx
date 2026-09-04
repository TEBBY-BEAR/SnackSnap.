import { useEffect, useState } from 'react';
import { Camera, Plus, Loader2, UserPlus, X } from 'lucide-react';
import type { SnackWithProfile, StoryWithProfile } from '@/lib/types';
import { getFeedSnacks, getStories, toggleFollow } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/Toast';
import { SnackCard } from '@/components/SnackCard';
import { StoryViewer } from '@/components/StoryViewer';
import { demoUsers } from '@/lib/demoData';

interface FeedPageProps {
  onSnap: () => void;
  onOpenComments: (snackId: string) => void;
  onOpenProfile: (userId: string) => void;
  onShare: (snack: SnackWithProfile) => void;
}

export function FeedPage({ onSnap, onOpenComments, onOpenProfile, onShare }: FeedPageProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [snacks, setSnacks] = useState<SnackWithProfile[]>([]);
  const [stories, setStories] = useState<StoryWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [storyViewerIndex, setStoryViewerIndex] = useState<number | null>(null);
  const [showSuggested, setShowSuggested] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getFeedSnacks(user.id),
      getStories(user.id),
    ]).then(([snackData, storyData]) => {
      setSnacks(snackData);
      setStories(storyData);
      setLoading(false);
    });
  }, [user]);

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

  const suggested = demoUsers.filter((u) => !followingIds.has(u.id)).slice(0, 5);

  return (
    <div className="pb-32">
      {/* Header */}
      <div className="sticky top-0 z-20 glass border-b border-white/5 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-animated flex items-center justify-center">
            <Camera className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-lg">SnackSnap</span>
        </div>
        <button
          onClick={onSnap}
          className="w-10 h-10 rounded-full gradient-animated flex items-center justify-center tap-scale hover:scale-110 transition-transform"
        >
          <Plus className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Stories row */}
      <div className="px-4 py-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-4">
          <button className="flex flex-col items-center gap-1.5 shrink-0 tap-scale">
            <div className="relative">
              <div className="w-16 h-16 rounded-full glass border-2 border-dashed border-white/30 flex items-center justify-center">
                <Plus className="w-6 h-6 text-white/50" />
              </div>
            </div>
            <span className="text-[10px] text-white/50">Your Story</span>
          </button>

          {stories.map((story, i) => (
            <button
              key={story.id}
              onClick={() => setStoryViewerIndex(i)}
              className="flex flex-col items-center gap-1.5 shrink-0 tap-scale"
            >
              <div className={story.viewed_by_me ? 'story-ring-viewed' : 'story-ring'}>
                <img
                  src={story.profiles?.avatar_url ?? 'https://images.pexels.com/photos/8941776/pexels-photo-8941776.jpeg?auto=compress&cs=tinysrgb&h=100&w=100'}
                  alt={story.profiles?.display_name ?? 'User'}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#0a0a0f]"
                />
              </div>
              <span className="text-[10px] text-white/50 truncate max-w-[64px]">
                {story.profiles?.display_name ?? 'User'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Suggested users */}
      {showSuggested && suggested.length > 0 && (
        <div className="px-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#00f0ff]" />
              <h2 className="font-bold text-sm">Suggested Snackers</h2>
            </div>
            <button onClick={() => setShowSuggested(false)} className="text-white/30 hover:text-white/60 transition-colors">
              <X className="w-4 h-4" />
            </button>
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

      {/* Feed */}
      <div className="px-4 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#ff2d92]" />
            <p className="text-white/40 text-sm mt-3">Loading snacks...</p>
          </div>
        ) : (
          snacks.map((snack) => (
            <SnackCard key={snack.id} snack={snack} onOpenComments={onOpenComments} onOpenProfile={onOpenProfile} onShare={onShare} />
          ))
        )}
      </div>

      {storyViewerIndex !== null && (
        <StoryViewer
          stories={stories}
          initialIndex={storyViewerIndex}
          onClose={() => setStoryViewerIndex(null)}
        />
      )}
    </div>
  );
}
