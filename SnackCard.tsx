import { useState } from 'react';
import { Heart, MessageCircle, Star, MoreHorizontal, Clock, Bookmark, Share2, UserPlus, UserCheck } from 'lucide-react';
import type { SnackWithProfile } from '@/lib/types';
import { toggleLike, toggleSave, toggleFollow } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/Toast';

interface SnackCardProps {
  snack: SnackWithProfile;
  onOpenComments?: (snackId: string) => void;
  onOpenProfile?: (userId: string) => void;
  onShare?: (snack: SnackWithProfile) => void;
}

export function SnackCard({ snack, onOpenComments, onOpenProfile, onShare }: SnackCardProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [liked, setLiked] = useState(snack.liked_by_me ?? false);
  const [likeCount, setLikeCount] = useState(snack.like_count);
  const [saved, setSaved] = useState(snack.saved_by_me ?? false);
  const [animateHeart, setAnimateHeart] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  async function handleLike() {
    if (!user) return;
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((c) => c + (newLiked ? 1 : -1));
    if (newLiked) {
      setAnimateHeart(true);
      setTimeout(() => setAnimateHeart(false), 600);
    }
    await toggleLike(snack.id, user.id, !newLiked);
  }

  async function handleSave() {
    if (!user) return;
    const newSaved = !saved;
    setSaved(newSaved);
    showToast(newSaved ? 'Saved to collection' : 'Removed from saved', newSaved ? 'success' : 'info');
    await toggleSave(snack.id, user.id, !newSaved);
  }

  async function handleFollowCreator() {
    if (!user || !snack.profiles) return;
    const newState = !isFollowing;
    setIsFollowing(newState);
    showToast(newState ? `Following @${snack.profiles?.username}` : 'Unfollowed', newState ? 'success' : 'info', 'follow');
    await toggleFollow(user.id, snack.profiles.id, !newState);
  }

  const profile = snack.profiles;
  const timeAgo = getTimeAgo(snack.created_at);
  const isOwnPost = user?.id === snack.user_id;

  return (
    <div className="rounded-2xl glass-card overflow-hidden hover-lift animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3 p-3">
        <button
          onClick={() => profile && onOpenProfile?.(profile.id)}
          className="story-ring tap-scale"
        >
          <img
            src={profile?.avatar_url ?? 'https://images.pexels.com/photos/8941776/pexels-photo-8941776.jpeg?auto=compress&cs=tinysrgb&h=100&w=100'}
            alt={profile?.display_name ?? 'User'}
            className="w-10 h-10 rounded-full object-cover border-2 border-[#0a0a0f]"
          />
        </button>
        <button onClick={() => profile && onOpenProfile?.(profile.id)} className="flex-1 min-w-0 text-left">
          <p className="font-semibold text-sm truncate">{profile?.display_name ?? 'Unknown'}</p>
          <p className="text-xs text-white/40 truncate">@{profile?.username ?? 'user'}</p>
        </button>
        <div className="flex items-center gap-1 text-white/30 text-xs">
          <Clock className="w-3 h-3" />
          <span>{timeAgo}</span>
        </div>
        {!isOwnPost && (
          <button
            onClick={handleFollowCreator}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold tap-scale transition-all ${
              isFollowing ? 'glass text-white/50' : 'gradient-animated text-white'
            }`}
          >
            {isFollowing ? (
              <span className="flex items-center gap-0.5"><UserCheck className="w-2.5 h-2.5" /> Following</span>
            ) : (
              <span className="flex items-center gap-0.5"><UserPlus className="w-2.5 h-2.5" /> Follow</span>
            )}
          </button>
        )}
        <button onClick={() => setShowMenu(!showMenu)} className="text-white/40 hover:text-white/70 transition-colors relative">
          <MoreHorizontal className="w-5 h-5" />
          {showMenu && (
            <div className="absolute right-0 top-7 glass rounded-xl py-1 w-36 z-10 animate-scale-in">
              <button onClick={() => { onShare?.(snack); setShowMenu(false); }} className="w-full px-3 py-2 text-xs text-left text-white/70 hover:bg-white/5 flex items-center gap-2">
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
              <button onClick={() => { handleSave(); setShowMenu(false); }} className="w-full px-3 py-2 text-xs text-left text-white/70 hover:bg-white/5 flex items-center gap-2">
                <Bookmark className="w-3.5 h-3.5" /> {saved ? 'Unsave' : 'Save'}
              </button>
            </div>
          )}
        </button>
      </div>

      {/* Image */}
      <div className="relative aspect-square overflow-hidden" onDoubleClick={handleLike}>
        <img
          src={snack.image_url}
          alt={snack.snack_name ?? 'Snack'}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {animateHeart && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Heart className="w-20 h-20 fill-[#ff2d92] text-[#ff2d92] animate-bounce-in" />
          </div>
        )}
        {snack.mood && (
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full glass text-xs font-semibold text-white/90">
            #{snack.mood}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-3">
        <div className="flex items-center gap-4 mb-3">
          <button onClick={handleLike} className="flex items-center gap-1.5 tap-scale">
            <Heart
              className={`w-5 h-5 transition-all ${liked ? 'fill-[#ff2d92] text-[#ff2d92] scale-110' : 'text-white/60'}`}
            />
            <span className="text-sm font-medium text-white/70">{likeCount}</span>
          </button>
          <button onClick={() => onOpenComments?.(snack.id)} className="flex items-center gap-1.5 tap-scale">
            <MessageCircle className="w-5 h-5 text-white/60" />
            <span className="text-sm font-medium text-white/70">{snack.comment_count}</span>
          </button>
          <button onClick={() => onShare?.(snack)} className="tap-scale">
            <Share2 className="w-5 h-5 text-white/60" />
          </button>
          <button onClick={handleSave} className="ml-auto tap-scale">
            <Bookmark
              className={`w-5 h-5 transition-all ${saved ? 'fill-[#00f0ff] text-[#00f0ff]' : 'text-white/60'}`}
            />
          </button>
          {snack.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-[#ffe600] text-[#ffe600]" />
              <span className="text-sm font-bold text-white/80">{snack.rating}/5</span>
            </div>
          )}
        </div>

        {/* Caption */}
        {snack.caption && (
          <p className="text-sm text-white/80 leading-relaxed mb-2">
            <button onClick={() => profile && onOpenProfile?.(profile.id)} className="font-semibold text-white hover:underline">
              @{profile?.username ?? 'user'}
            </button>{' '}
            {snack.caption}
          </p>
        )}

        {/* Snack info */}
        {snack.snack_name && (
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="px-2.5 py-1 rounded-lg bg-[#ff2d92]/15 text-[#ff2d92] text-xs font-medium">
              {snack.snack_name}
            </span>
            {snack.flavor && (
              <span className="px-2.5 py-1 rounded-lg bg-[#00f0ff]/15 text-[#00f0ff] text-xs font-medium">
                {snack.flavor}
              </span>
            )}
            {snack.brand && (
              <span className="px-2.5 py-1 rounded-lg bg-[#c6ff00]/15 text-[#c6ff00] text-xs font-medium">
                {snack.brand}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}
