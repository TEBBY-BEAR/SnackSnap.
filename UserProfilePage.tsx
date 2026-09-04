import { useEffect, useState } from 'react';
import { ArrowLeft, Settings, MessageCircle, UserPlus, UserCheck, UserX, Heart, Grid3x3, Clock, Share2, Users } from 'lucide-react';
import type { SnackWithProfile, RelationshipType } from '@/lib/types';
import { getProfileSnacks, getProfile, getFollowersCount, getFollowingCount, getFriendsCount, getRelationship, toggleFollow, sendFriendRequest, removeFriend, getMutualFriendsCount } from '@/lib/api';
import { demoUsers } from '@/lib/demoData';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/Toast';

interface UserProfilePageProps {
  userId: string;
  onBack: () => void;
  onOpenComments: (snackId: string) => void;
  onOpenMessages: (userId: string) => void;
  onOpenFriendsModal: (userId: string, type: 'followers' | 'following' | 'friends') => void;
}

type Tab = 'grid' | 'timeline';

export function UserProfilePage({ userId, onBack, onOpenComments, onOpenMessages, onOpenFriendsModal }: UserProfilePageProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [snacks, setSnacks] = useState<SnackWithProfile[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [friends, setFriends] = useState(0);
  const [relationship, setRelationship] = useState<RelationshipType>('none');
  const [mutuals, setMutuals] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('grid');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      getProfileSnacks(userId, user.id),
      getProfile(userId),
      getFollowersCount(userId),
      getFollowingCount(userId),
      getFriendsCount(userId),
      getRelationship(user.id, userId),
      getMutualFriendsCount(user.id, userId),
    ]).then(([snackData, profileData, followersCount, followingCount, friendsCount, rel, mutualCount]) => {
      setSnacks(snackData);
      setProfile(profileData);
      setFollowers(followersCount);
      setFollowing(followingCount);
      setFriends(friendsCount);
      setRelationship(rel);
      setMutuals(mutualCount);
      setLoading(false);
    });
  }, [userId, user]);

  async function handleFollow() {
    if (!user) return;
    const newRel = relationship === 'following' ? 'none' : 'following';
    setRelationship(newRel);
    if (newRel === 'following') {
      showToast(`Followed @${profile?.username ?? 'user'}`, 'success', 'follow');
      setFollowers((f) => f + 1);
    } else {
      showToast('Unfollowed', 'info');
      setFollowers((f) => Math.max(0, f - 1));
    }
    await toggleFollow(user.id, userId, relationship === 'following');
  }

  async function handleFriendRequest() {
    if (relationship === 'friends') {
      await removeFriend(user!.id, userId);
      setRelationship('none');
      setFriends((f) => Math.max(0, f - 1));
      showToast('Removed friend', 'info');
    } else if (relationship === 'pending_sent') {
      showToast('Friend request already sent', 'info');
    } else {
      await sendFriendRequest(user!.id, userId);
      setRelationship('pending_sent');
      showToast('Friend request sent!', 'success', 'follow');
    }
  }

  const isOwnProfile = userId === user?.id;

  const displayName = profile?.display_name ?? demoUsers.find((u) => u.id === userId)?.display_name ?? 'User';
  const username = profile?.username ?? demoUsers.find((u) => u.id === userId)?.username ?? 'user';
  const bio = profile?.bio ?? demoUsers.find((u) => u.id === userId)?.bio ?? 'No bio yet';
  const avatarUrl = profile?.avatar_url ?? demoUsers.find((u) => u.id === userId)?.avatar_url;
  const snackStreak = profile?.snack_streak ?? demoUsers.find((u) => u.id === userId)?.snack_streak ?? 0;
  const totalSnaps = profile?.total_snaps ?? snacks.length;

  return (
    <div className="pb-32">
      <div className="sticky top-0 z-20 glass border-b border-white/5 px-5 py-3 flex items-center gap-3">
        <button onClick={onBack} className="tap-scale">
          <ArrowLeft className="w-5 h-5 text-white/70" />
        </button>
        <h1 className="font-extrabold text-lg truncate">@{username}</h1>
      </div>

      {/* Profile header */}
      <div className="px-5 py-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="story-ring">
            <img
              src={avatarUrl ?? 'https://images.pexels.com/photos/8941776/pexels-photo-8941776.jpeg?auto=compress&cs=tinysrgb&h=200&w=200'}
              alt={displayName}
              className="w-20 h-20 rounded-full object-cover border-2 border-[#0a0a0f]"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-extrabold">{displayName}</h2>
            <p className="text-xs text-white/40 mt-0.5">
              {mutuals > 0 && `${mutuals} mutual friend${mutuals > 1 ? 's' : ''}`}
              {mutuals > 0 && ' · '}
              Joined {new Date(profile?.created_at ?? Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        <p className="text-sm text-white/60 mb-4">{bio}</p>

        {/* Action buttons */}
        {!isOwnProfile && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={handleFollow}
              className={`px-4 py-2 rounded-full text-xs font-bold tap-scale transition-all ${
                relationship === 'following' || relationship === 'mutual'
                  ? 'glass text-white'
                  : 'gradient-animated text-white'
              }`}
            >
              {relationship === 'following' || relationship === 'mutual' ? (
                <span className="flex items-center gap-1"><UserCheck className="w-3.5 h-3.5" /> Following</span>
              ) : (
                <span className="flex items-center gap-1"><UserPlus className="w-3.5 h-3.5" /> Follow</span>
              )}
            </button>

            <button
              onClick={handleFriendRequest}
              className={`px-4 py-2 rounded-full text-xs font-bold tap-scale transition-all ${
                relationship === 'friends' ? 'glass text-white' :
                relationship === 'pending_sent' ? 'glass text-white/50' :
                'glass text-[#00f0ff]'
              }`}
            >
              {relationship === 'friends' ? (
                <span className="flex items-center gap-1"><UserCheck className="w-3.5 h-3.5" /> Friends</span>
              ) : relationship === 'pending_sent' ? (
                <span className="text-white/50">Pending...</span>
              ) : (
                <span className="flex items-center gap-1"><UserPlus className="w-3.5 h-3.5" /> Add Friend</span>
              )}
            </button>

            <button
              onClick={() => onOpenMessages(userId)}
              className="px-4 py-2 rounded-full glass text-white text-xs font-bold tap-scale flex items-center gap-1"
            >
              <MessageCircle className="w-3.5 h-3.5" /> Message
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-6">
          <button onClick={() => onOpenFriendsModal(userId, 'snacks')} className="text-left">
            <p className="text-lg font-extrabold">{totalSnaps}</p>
            <p className="text-xs text-white/40">Snacks</p>
          </button>
          <button onClick={() => onOpenFriendsModal(userId, 'followers')} className="text-left">
            <p className="text-lg font-extrabold">{followers}</p>
            <p className="text-xs text-white/40">Followers</p>
          </button>
          <button onClick={() => onOpenFriendsModal(userId, 'following')} className="text-left">
            <p className="text-lg font-extrabold">{following}</p>
            <p className="text-xs text-white/40">Following</p>
          </button>
          <button onClick={() => onOpenFriendsModal(userId, 'friends')} className="text-left">
            <p className="text-lg font-extrabold">{friends}</p>
            <p className="text-xs text-white/40">Friends</p>
          </button>
          <div>
            <p className="text-lg font-extrabold neon-text">{snackStreak}</p>
            <p className="text-xs text-white/40">Streak</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 border-b border-white/5">
        <div className="flex gap-1">
          <TabButton icon={<Grid3x3 className="w-4 h-4" />} label="Grid" active={tab === 'grid'} onClick={() => setTab('grid')} />
          <TabButton icon={<Clock className="w-4 h-4" />} label="Timeline" active={tab === 'timeline'} onClick={() => setTab('timeline')} />
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
        ) : snacks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full glass flex items-center justify-center mb-4">
              <Grid3x3 className="w-8 h-8 text-white/20" />
            </div>
            <p className="text-white/40 text-sm">No snacks yet</p>
          </div>
        ) : tab === 'grid' ? (
          <div className="grid grid-cols-3 gap-1.5">
            {snacks.map((snack) => (
              <div key={snack.id} className="aspect-square rounded-lg overflow-hidden tap-scale relative">
                <img src={snack.image_url} alt={snack.snack_name ?? 'Snack'} className="w-full h-full object-cover" loading="lazy" />
                {snack.rating && (
                  <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/50 text-[9px] font-bold text-[#ffe600]">
                    {snack.rating}★
                  </div>
                )}
              </div>
            ))}
          </div>
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
