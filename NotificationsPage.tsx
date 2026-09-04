import { useEffect, useState } from 'react';
import { Heart, UserPlus, MessageCircle, Bell, Loader2, UserCheck, Share2, Eye, AtSign, Check, X } from 'lucide-react';
import type { NotificationWithActor } from '@/lib/types';
import { getNotifications, markAllNotificationsRead } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/Toast';

export function NotificationsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<NotificationWithActor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getNotifications(user.id).then((data) => {
      setNotifications(data);
      setLoading(false);
    });
  }, [user]);

  async function handleMarkAll() {
    if (!user) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await markAllNotificationsRead(user.id);
    showToast('All marked as read', 'success', 'bell');
  }

  async function handleAcceptFriend(notification: NotificationWithActor) {
    setNotifications((prev) => prev.map((n) =>
      n.id === notification.id ? { ...n, is_read: true, type: 'friend_accepted', text: 'accepted your friend request' } : n
    ));
    showToast('Friend request accepted!', 'success', 'follow');
  }

  async function handleDeclineFriend(notification: NotificationWithActor) {
    setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    showToast('Friend request declined', 'info');
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="pb-32 min-h-screen">
      <div className="sticky top-0 z-20 glass border-b border-white/5 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="font-extrabold text-xl">Notifications</h1>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[#ff2d92] text-white text-[10px] font-bold animate-pulse">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAll} className="text-xs text-[#00f0ff] font-semibold tap-scale">
            Mark all read
          </button>
        )}
      </div>

      <div className="px-4 py-4 space-y-2">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3 p-3.5">
                <div className="w-11 h-11 rounded-full skeleton" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-40 rounded skeleton" />
                  <div className="h-2 w-20 rounded skeleton" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full glass flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-white/20" />
            </div>
            <p className="text-white/40 text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notif) => {
            const { icon, color } = getNotifStyle(notif.type);
            const isFriendRequest = notif.type === 'friend_request';
            return (
              <div
                key={notif.id}
                className={`rounded-2xl p-3.5 flex items-center gap-3 transition-colors animate-slide-up ${notif.is_read ? 'glass-card' : 'glass-card bg-white/5'}`}
              >
                <div className="relative shrink-0">
                  <img
                    src={notif.actor?.avatar_url ?? 'https://images.pexels.com/photos/8941776/pexels-photo-8941776.jpeg?auto=compress&cs=tinysrgb&h=80&w=80'}
                    alt={notif.actor?.display_name ?? 'User'}
                    className="w-11 h-11 rounded-full object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: color }}>
                    {icon}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80 leading-snug">
                    <span className="font-semibold text-white">{notif.actor?.display_name ?? 'Someone'}</span>{' '}
                    {notif.text}
                  </p>
                  <p className="text-xs text-white/30 mt-0.5">{getTimeAgo(notif.created_at)}</p>
                  {isFriendRequest && !notif.is_read && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleAcceptFriend(notif)}
                        className="px-3 py-1 rounded-full gradient-animated text-white text-[10px] font-bold tap-scale flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Accept
                      </button>
                      <button
                        onClick={() => handleDeclineFriend(notif)}
                        className="px-3 py-1 rounded-full glass text-white/60 text-[10px] font-bold tap-scale flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Decline
                      </button>
                    </div>
                  )}
                </div>
                {!notif.is_read && !isFriendRequest && (
                  <div className="w-2 h-2 rounded-full bg-[#ff2d92] shrink-0" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function getNotifStyle(type: string): { icon: React.ReactNode; color: string } {
  switch (type) {
    case 'like':
      return { icon: <Heart className="w-3 h-3 text-white" />, color: '#ff2d92' };
    case 'follow':
      return { icon: <UserPlus className="w-3 h-3 text-white" />, color: '#00f0ff' };
    case 'comment':
      return { icon: <MessageCircle className="w-3 h-3 text-white" />, color: '#b026ff' };
    case 'friend_request':
      return { icon: <UserPlus className="w-3 h-3 text-white" />, color: '#c6ff00' };
    case 'friend_accepted':
      return { icon: <UserCheck className="w-3 h-3 text-white" />, color: '#c6ff00' };
    case 'message':
      return { icon: <MessageCircle className="w-3 h-3 text-white" />, color: '#00f0ff' };
    case 'story':
      return { icon: <Eye className="w-3 h-3 text-white" />, color: '#b026ff' };
    case 'mention':
      return { icon: <AtSign className="w-3 h-3 text-white" />, color: '#ffe600' };
    case 'reply':
      return { icon: <MessageCircle className="w-3 h-3 text-white" />, color: '#ff7a00' };
    case 'share':
      return { icon: <Share2 className="w-3 h-3 text-white" />, color: '#00f0ff' };
    default:
      return { icon: <Bell className="w-3 h-3 text-white" />, color: '#6b6b85' };
  }
}

function getTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
