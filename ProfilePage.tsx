import { useEffect, useState } from 'react';
import { Settings, Grid3x3, Clock, Heart, Bookmark, Loader2, Users, Share2 } from 'lucide-react';
import type { SnackWithProfile } from '@/lib/types';
import { getProfileSnacks, getFollowersCount, getFollowingCount, getFriendsCount, getSavedSnacks } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface ProfilePageProps {
  onOpenComments: (snackId: string) => void;
  onOpenSettings: () => void;
  onOpenFriendsModal: (type: 'followers' | 'following' | 'friends') => void;
}

type Tab = 'grid' | 'timeline' | 'saved';

export function ProfilePage({ onOpenComments, onOpenSettings, onOpenFriendsModal }: ProfilePageProps) {
  const { user, profile } = useAuth();
  const [snacks, setSnacks] = useState<SnackWithProfile[]>([]);
  const [savedSnacks, setSavedSnacks] = useState<SnackWithProfile[]>([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [friends, setFriends] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('grid');
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');

  useEffect(() => {
    if (!user) return;
    setDisplayName(profile?.display_name ?? '');
    setBio(profile?.bio ?? '');
    Promise.all([
      getProfileSnacks(user.id, user.id),
      getSavedSnacks(user.id),
      getFollowersCount(user.id),
      getFollowingCount(user.id),
      getFriendsCount(user.id),
    ]).then(([snackData, savedData, followersCount, followingCount, friendsCount]) => {
      setSnacks(snackData);
      setSavedSnacks(savedData);
      setFollowers(followersCount);
      setFollowing(followingCount);
      setFriends(friendsCount);
      setLoading(false);
    });
  }, [user]);

  async function handleSaveProfile() {
    if (!user) return;
    const { updateProfile } = await import('@/lib/api');
    await updateProfile(user.id, { display_name: displayName, bio });
    setEditing(false);
  }

  return (
    <div className="pb-32">
      <div className="sticky top-0 z-20 glass border-b border-white/5 px-5 py-3 flex items-center justify-between">
        <h1 className="font-extrabold text-lg truncate">@{profile?.username ?? 'user'}</h1>
        <button onClick={onOpenSettings} className="text-white/50 hover:text-white transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Profile header */}
      <div className="px-5 py-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="story-ring">
            <img
              src={profile?.avatar_url ?? 'https://images.pexels.com/photos/8941776/pexels-photo-8941776.jpeg?auto=compress&cs=tinysrgb&h=200&w=200'}
              alt={profile?.display_name ?? 'User'}
              className="w-20 h-20 rounded-full object-cover border-2 border-[#0a0a0f]"
            />
          </div>
          <div className="flex-1">
            {editing ? (
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg glass border border-white/10 text-lg font-bold text-white outline-none focus:border-[#ff2d92]/50 transition-colors"
              />
            ) : (
              <h2 className="text-xl font-extrabold">{profile?.display_name ?? 'User'}</h2>
            )}
            <p className="text-xs text-white/40 mt-0.5">Joined {new Date(profile?.created_at ?? Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
          </div>
        </div>

        {editing ? (
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-lg glass border border-white/10 text-sm text-white outline-none focus:border-[#ff2d92]/50 transition-colors resize-none mb-2"
          />
        ) : (
          <p className="text-sm text-white/60 mb-4">{profile?.bio ?? 'No bio yet'}</p>
        )}

        {editing && (
          <div className="flex gap-2 mb-4">
            <button onClick={handleSaveProfile} className="px-4 py-2 rounded-full gradient-animated text-white text-sm font-bold tap-scale">
              Save
            </button>
            <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-full glass text-white text-sm font-medium tap-scale">
              Cancel
            </button>
          </div>
        )}

        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-1.5 rounded-full glass text-white text-xs font-semibold tap-scale mb-4"
          >
            Edit Profile
          </button>
        )}

        {/* Stats */}
        <div className="flex gap-5">
          <div>
            <p className="text-lg font-extrabold">{profile?.total_snaps ?? snacks.length}</p>
            <p className="text-xs text-white/40">Snacks</p>
          </div>
          <button onClick={() => onOpenFriendsModal('followers')} className="text-left">
            <p className="text-lg font-extrabold">{followers}</p>
            <p className="text-xs text-white/40">Followers</p>
          </button>
          <button onClick={() => onOpenFriendsModal('following')} className="text-left">
            <p className="text-lg font-extrabold">{following}</p>
            <p className="text-xs text-white/40">Following</p>
          </button>
          <button onClick={() => onOpenFriendsModal('friends')} className="text-left">
            <p className="text-lg font-extrabold">{friends}</p>
            <p className="text-xs text-white/40">Friends</p>
          </button>
          <div>
            <p className="text-lg font-extrabold neon-text">{profile?.snack_streak ?? 0}</p>
            <p className="text-xs text-white/40">Streak</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 border-b border-white/5">
        <div className="flex gap-1">
          <TabButton icon={<Grid3x3 className="w-4 h-4" />} label="Posts" active={tab === 'grid'} onClick={() => setTab('grid')} />
          <TabButton icon={<Clock className="w-4 h-4" />} label="Timeline" active={tab === 'timeline'} onClick={() => setTab('timeline')} />
          <TabButton icon={<Bookmark className="w-4 h-4" />} label="Saved" active={tab === 'saved'} onClick={() => setTab('saved')} />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="grid grid-cols-3 gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square rounded-lg skeleton" />
            ))}
          </div>
        ) : tab === 'grid' ? (
          snacks.length === 0 ? (
            <EmptyState text="No snacks posted yet" />
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              {snacks.map((snack) => (
                <div key={snack.id} className="aspect-square rounded-lg overflow-hidden tap-scale relative group">
                  <img src={snack.image_url} alt={snack.snack_name ?? 'Snack'} className="w-full h-full object-cover" loading="lazy" />
                  {snack.rating && (
                    <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/50 text-[9px] font-bold text-[#ffe600]">
                      {snack.rating}★
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        ) : tab === 'timeline' ? (
          snacks.length === 0 ? (
            <EmptyState text="No snacks to show" />
          ) : (
            <div className="space-y-3">
              {snacks.map((snack) => (
                <div key={snack.id} className="rounded-2xl glass-card overflow-hidden hover-lift">
                  <div className="flex">
                    <img src={snack.image_url} alt={snack.snack_name ?? 'Snack'} className="w-24 h-24 object-cover shrink-0" />
                    <div className="p-3 flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{snack.snack_name ?? 'Snack'}</p>
                      <p className="text-xs text-white/40">{new Date(snack.created_at).toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' })}</p>
                      {snack.caption && <p className="text-xs text-white/60 mt-1 line-clamp-2">{snack.caption}</p>}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="flex items-center gap-1 text-xs text-white/40">
                          <Heart className="w-3 h-3" /> {snack.like_count}
                        </span>
                        {snack.rating && <span className="text-xs text-[#ffe600] font-bold">{snack.rating}/5</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          savedSnacks.length === 0 ? (
            <EmptyState text="No saved snacks yet" />
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              {savedSnacks.map((snack) => (
                <div key={snack.id} className="aspect-square rounded-lg overflow-hidden tap-scale relative">
                  <img src={snack.image_url} alt={snack.snack_name ?? 'Snack'} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Bookmark className="w-5 h-5 fill-[#00f0ff] text-[#00f0ff]" />
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function TabButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold transition-colors relative ${active ? 'text-white' : 'text-white/40'}`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 gradient-animated rounded-full" />}
    </button>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full glass flex items-center justify-center mb-4">
        <Grid3x3 className="w-8 h-8 text-white/20" />
      </div>
      <p className="text-white/40 text-sm">{text}</p>
    </div>
  );
}
