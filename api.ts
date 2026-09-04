import { supabase } from './supabase';
import {
  demoSnacks, demoStories, demoNotifications, demoUsers,
  demoConversations, demoMessages, demoFriendRequests, demoFriends,
  demoFollowing, demoFollowers, demoMutuals, demoSavedSnacks,
  suggestedUsers, trendingCreators,
  type DemoSnack, type DemoStory, type DemoNotification,
  type DemoProfile, type DemoConversation, type DemoMessage,
} from './demoData';
import type {
  SnackWithProfile, StoryWithProfile, NotificationWithActor,
  Profile, CommentWithProfile, FriendRequestWithProfile,
  ConversationWithProfile, MessageWithSender, RelationshipType,
} from './types';

export async function getFeedSnacks(currentUserId: string): Promise<SnackWithProfile[]> {
  const { data, error } = await supabase
    .from('snacks')
    .select(`*, profiles:profiles!snacks_user_id_fkey ( id, username, display_name, avatar_url )`)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !data || data.length === 0) return demoSnacks as unknown as SnackWithProfile[];

  const userSnacks = data as SnackWithProfile[];
  const snackIds = userSnacks.map((s) => s.id);
  const [{ data: likes }, { data: saved }] = await Promise.all([
    supabase.from('likes').select('snack_id').eq('user_id', currentUserId).in('snack_id', snackIds),
    supabase.from('saved_posts').select('snack_id').eq('user_id', currentUserId).in('snack_id', snackIds),
  ]);

  const likedIds = new Set(likes?.map((l) => l.snack_id) ?? []);
  const savedIds = new Set(saved?.map((s) => s.snack_id) ?? []);
  userSnacks.forEach((s) => {
    s.liked_by_me = likedIds.has(s.id);
    s.saved_by_me = savedIds.has(s.id);
  });

  return userSnacks;
}

export async function getStories(currentUserId: string): Promise<StoryWithProfile[]> {
  const { data, error } = await supabase
    .from('stories')
    .select(`*, profiles:profiles!stories_user_id_fkey ( id, username, display_name, avatar_url )`)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(20);

  if (error || !data || data.length === 0) return demoStories as unknown as StoryWithProfile[];

  const stories = data as StoryWithProfile[];
  const storyIds = stories.map((s) => s.id);
  const { data: views } = await supabase.from('story_views').select('story_id').eq('user_id', currentUserId).in('story_id', storyIds);
  const viewedIds = new Set(views?.map((v) => v.story_id) ?? []);
  stories.forEach((s) => { s.viewed_by_me = viewedIds.has(s.id); });

  return stories;
}

export async function getExploreSnacks(currentUserId: string): Promise<SnackWithProfile[]> {
  const { data, error } = await supabase
    .from('snacks')
    .select(`*, profiles:profiles!snacks_user_id_fkey ( id, username, display_name, avatar_url )`)
    .order('like_count', { ascending: false })
    .limit(24);

  if (error || !data || data.length === 0) return demoSnacks as unknown as SnackWithProfile[];

  const snackIds = data.map((s) => s.id);
  const [{ data: likes }, { data: saved }] = await Promise.all([
    supabase.from('likes').select('snack_id').eq('user_id', currentUserId).in('snack_id', snackIds),
    supabase.from('saved_posts').select('snack_id').eq('user_id', currentUserId).in('snack_id', snackIds),
  ]);

  const likedIds = new Set(likes?.map((l) => l.snack_id) ?? []);
  const savedIds = new Set(saved?.map((s) => s.snack_id) ?? []);
  data.forEach((s) => {
    (s as SnackWithProfile).liked_by_me = likedIds.has(s.id);
    (s as SnackWithProfile).saved_by_me = savedIds.has(s.id);
  });

  return data as SnackWithProfile[];
}

export async function getMySnacks(userId: string): Promise<SnackWithProfile[]> {
  const { data, error } = await supabase
    .from('snacks')
    .select(`*, profiles:profiles!snacks_user_id_fkey ( id, username, display_name, avatar_url )`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data as SnackWithProfile[];
}

export async function getProfileSnacks(userId: string, currentUserId: string): Promise<SnackWithProfile[]> {
  const { data, error } = await supabase
    .from('snacks')
    .select(`*, profiles:profiles!snacks_user_id_fkey ( id, username, display_name, avatar_url )`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  const snackIds = data.map((s) => s.id);
  const [{ data: likes }, { data: saved }] = await Promise.all([
    supabase.from('likes').select('snack_id').eq('user_id', currentUserId).in('snack_id', snackIds),
    supabase.from('saved_posts').select('snack_id').eq('user_id', currentUserId).in('snack_id', snackIds),
  ]);

  const likedIds = new Set(likes?.map((l) => l.snack_id) ?? []);
  const savedIds = new Set(saved?.map((s) => s.snack_id) ?? []);
  data.forEach((s) => {
    (s as SnackWithProfile).liked_by_me = likedIds.has(s.id);
    (s as SnackWithProfile).saved_by_me = savedIds.has(s.id);
  });

  return data as SnackWithProfile[];
}

export async function getSavedSnacks(currentUserId: string): Promise<SnackWithProfile[]> {
  const { data, error } = await supabase
    .from('saved_posts')
    .select(`snack:snacks ( *, profiles:profiles!snacks_user_id_fkey ( id, username, display_name, avatar_url ) )`)
    .eq('user_id', currentUserId)
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) return demoSavedSnacks as unknown as SnackWithProfile[];

  return data.map((item: any) => item.snack) as SnackWithProfile[];
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  return data as Profile | null;
}

export async function toggleLike(snackId: string, userId: string, isLiked: boolean): Promise<boolean> {
  if (isLiked) {
    const { error } = await supabase.from('likes').delete().eq('snack_id', snackId).eq('user_id', userId);
    if (error) return false;
    const { data: snack } = await supabase.from('snacks').select('like_count').eq('id', snackId).maybeSingle();
    await supabase.from('snacks').update({ like_count: Math.max(0, (snack?.like_count ?? 1) - 1) }).eq('id', snackId);
    return true;
  } else {
    const { error } = await supabase.from('likes').insert({ snack_id: snackId, user_id: userId });
    if (error) return false;
    const { data: snack } = await supabase.from('snacks').select('like_count').eq('id', snackId).maybeSingle();
    await supabase.from('snacks').update({ like_count: (snack?.like_count ?? 0) + 1 }).eq('id', snackId);
    return true;
  }
}

export async function toggleSave(snackId: string, userId: string, isSaved: boolean): Promise<boolean> {
  if (isSaved) {
    const { error } = await supabase.from('saved_posts').delete().eq('snack_id', snackId).eq('user_id', userId);
    return !error;
  } else {
    const { error } = await supabase.from('saved_posts').insert({ snack_id: snackId, user_id: userId });
    return !error;
  }
}

export async function getComments(snackId: string): Promise<CommentWithProfile[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(`*, profiles:profiles!comments_user_id_fkey ( id, username, display_name, avatar_url )`)
    .eq('snack_id', snackId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data as CommentWithProfile[];
}

export async function addComment(snackId: string, userId: string, text: string): Promise<boolean> {
  const { error } = await supabase.from('comments').insert({ snack_id: snackId, user_id: userId, text });
  if (error) return false;
  const { data: snack } = await supabase.from('snacks').select('comment_count').eq('id', snackId).maybeSingle();
  await supabase.from('snacks').update({ comment_count: (snack?.comment_count ?? 0) + 1 }).eq('id', snackId);
  return true;
}

export async function getNotifications(userId: string): Promise<NotificationWithActor[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !data || data.length === 0) return demoNotifications as unknown as NotificationWithActor[];

  const actorIds = [...new Set(data.map((n) => n.actor_id).filter(Boolean))] as string[];
  const { data: actors } = await supabase.from('profiles').select('id, username, display_name, avatar_url').in('id', actorIds);
  const actorMap = new Map(actors?.map((a) => [a.id, a]) ?? []);
  return data.map((n) => ({ ...n, actor: n.actor_id ? actorMap.get(n.actor_id) ?? null : null })) as NotificationWithActor[];
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
}

export async function getFollowersCount(userId: string): Promise<number> {
  const { count } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId);
  return count ?? 0;
}

export async function getFollowingCount(userId: string): Promise<number> {
  const { count } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId);
  return count ?? 0;
}

export async function getFriendsCount(userId: string): Promise<number> {
  const { count } = await supabase.from('friendships')
    .select('*', { count: 'exact', head: true })
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);
  return count ?? 0;
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const { data } = await supabase.from('follows').select('id').eq('follower_id', followerId).eq('following_id', followingId).maybeSingle();
  return !!data;
}

export async function toggleFollow(followerId: string, followingId: string, isFollowing: boolean): Promise<boolean> {
  if (isFollowing) {
    const { error } = await supabase.from('follows').delete().eq('follower_id', followerId).eq('following_id', followingId);
    return !error;
  } else {
    const { error } = await supabase.from('follows').insert({ follower_id: followerId, following_id: followingId });
    return !error;
  }
}

export async function sendFriendRequest(senderId: string, receiverId: string): Promise<boolean> {
  const { error } = await supabase.from('friend_requests').insert({ sender_id: senderId, receiver_id: receiverId });
  return !error;
}

export async function respondToFriendRequest(requestId: string, status: 'accepted' | 'declined'): Promise<boolean> {
  const { data: req, error: reqError } = await supabase
    .from('friend_requests').update({ status, responded_at: new Date().toISOString() })
    .eq('id', requestId).select('sender_id, receiver_id').single();
  if (reqError || !req) return false;

  if (status === 'accepted') {
    const [user1Id, user2Id] = [req.sender_id, req.receiver_id].sort();
    await supabase.from('friendships').insert({ user1_id: user1Id, user2_id: user2Id });
  }
  return true;
}

export async function removeFriend(userId: string, otherUserId: string): Promise<boolean> {
  const [user1Id, user2Id] = [userId, otherUserId].sort();
  const { error } = await supabase.from('friendships').delete()
    .eq('user1_id', user1Id).eq('user2_id', user2Id);
  return !error;
}

export async function getFriendRequests(userId: string): Promise<FriendRequestWithProfile[]> {
  const { data, error } = await supabase
    .from('friend_requests')
    .select(`*, sender:profiles!friend_requests_sender_id_fkey ( id, username, display_name, avatar_url )`)
    .eq('receiver_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) return demoFriendRequests as unknown as FriendRequestWithProfile[];
  return data.map((r: any) => ({ ...r, sender: r.sender })) as FriendRequestWithProfile[];
}

export async function getRelationship(currentUserId: string, otherUserId: string): Promise<RelationshipType> {
  if (otherUserId.startsWith('demo-')) {
    if (demoFriends.includes(otherUserId)) return 'friends';
    if (demoFollowing.includes(otherUserId)) return 'following';
    const sentReq = demoFriendRequests.find((r) => r.sender_id === 'me' && r.receiver_id === otherUserId);
    if (sentReq) return 'pending_sent';
    const receivedReq = demoFriendRequests.find((r) => r.sender_id === otherUserId && r.receiver_id === 'me');
    if (receivedReq) return 'pending_received';
    if (demoFollowers.includes(otherUserId)) return 'follows_you';
    return 'none';
  }

  const [followCheck, friendCheck, sentReqCheck, receivedReqCheck] = await Promise.all([
    supabase.from('follows').select('id').eq('follower_id', currentUserId).eq('following_id', otherUserId).maybeSingle(),
    supabase.from('friendships').select('id').or(`and(user1_id.eq.${currentUserId},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${currentUserId})`).maybeSingle(),
    supabase.from('friend_requests').select('id').eq('sender_id', currentUserId).eq('receiver_id', otherUserId).eq('status', 'pending').maybeSingle(),
    supabase.from('friend_requests').select('id').eq('sender_id', otherUserId).eq('receiver_id', currentUserId).eq('status', 'pending').maybeSingle(),
  ]);

  if (friendCheck.data) return 'friends';
  if (sentReqCheck.data) return 'pending_sent';
  if (receivedReqCheck.data) return 'pending_received';
  if (followCheck.data) return 'following';
  const { data: reverseFollow } = await supabase.from('follows').select('id').eq('follower_id', otherUserId).eq('following_id', currentUserId).maybeSingle();
  if (reverseFollow) return 'follows_you';
  return 'none';
}

export async function getMutualFriendsCount(currentUserId: string, otherUserId: string): Promise<number> {
  if (otherUserId.startsWith('demo-')) {
    return (demoMutuals[otherUserId] ?? []).length;
  }
  return 0;
}

export async function searchUsers(query: string): Promise<Profile[]> {
  if (!query.trim()) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', `%${query}%`)
    .limit(10);

  if (error || !data) return demoUsers.filter((u) => u.username.includes(query.toLowerCase())) as unknown as Profile[];
  return data as Profile[];
}

export async function getSuggestedUsers(currentUserId: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .neq('id', currentUserId)
    .limit(5);

  if (error || !data || data.length === 0) return suggestedUsers as unknown as Profile[];
  return data as Profile[];
}

export function getTrendingCreators(): DemoProfile[] {
  return trendingCreators;
}

export async function getConversations(currentUserId: string): Promise<ConversationWithProfile[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select(`*, user1:profiles!conversations_user1_id_fkey ( id, username, display_name, avatar_url ), user2:profiles!conversations_user2_id_fkey ( id, username, display_name, avatar_url )`)
    .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`)
    .order('last_message_at', { ascending: false });

  if (error || !data || data.length === 0) return demoConversations as unknown as ConversationWithProfile[];

  const conversations = data.map((c: any) => {
    const isUser1 = c.user1_id === currentUserId;
    const otherUser = isUser1 ? c.user2 : c.user1;
    return {
      ...c,
      other_user: otherUser,
    };
  }) as ConversationWithProfile[];

  for (const conv of conversations) {
    const { count } = await supabase.from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conv.id).eq('is_read', false).neq('sender_id', currentUserId);
    conv.unread_count = count ?? 0;
  }

  return conversations;
}

export async function getMessages(conversationId: string): Promise<MessageWithSender[]> {
  const { data, error } = await supabase
    .from('messages')
    .select(`*, sender:profiles!messages_sender_id_fkey ( id, username, display_name, avatar_url )`)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error || !data || data.length === 0) return demoMessages[conversationId] as unknown as MessageWithSender[] ?? [];
  return data as unknown as MessageWithSender[];
}

export async function sendMessage(conversationId: string, senderId: string, text: string | null, sharedSnackId?: string | null): Promise<boolean> {
  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: senderId,
    text,
    shared_snack_id: sharedSnackId ?? null,
  });
  if (error) return false;
  await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', conversationId);
  return true;
}

export async function toggleMessageReaction(messageId: string, userId: string, emoji: string): Promise<boolean> {
  const { data: existing } = await supabase.from('message_reactions')
    .select('id').eq('message_id', messageId).eq('user_id', userId).eq('emoji', emoji).maybeSingle();

  if (existing) {
    const { error } = await supabase.from('message_reactions').delete().eq('id', existing.id);
    return !error;
  } else {
    const { error } = await supabase.from('message_reactions').insert({ message_id: messageId, user_id: userId, emoji });
    return !error;
  }
}

export async function markMessageRead(messageId: string): Promise<void> {
  await supabase.from('messages').update({ is_read: true }).eq('id', messageId);
}

export async function getUnreadMessageCount(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('conversations')
    .select(`id, messages!inner ( is_read, sender_id )`)
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

  if (error || !data) {
    return demoConversations.reduce((sum, c) => sum + c.unread_count, 0);
  }

  let count = 0;
  for (const conv of data as any[]) {
    if (conv.messages) {
      count += conv.messages.filter((m: any) => !m.is_read && m.sender_id !== userId).length;
    }
  }
  return count;
}

export async function insertSnack(
  userId: string, imageUrl: string, brand: string | null, flavor: string | null,
  snackName: string | null, caption: string | null, rating: number | null,
  mood: string | null, timeOfDay: string | null,
): Promise<string | null> {
  const { data, error } = await supabase.from('snacks').insert({
    user_id: userId, image_url: imageUrl, brand, flavor, snack_name: snackName,
    caption, rating, mood, time_of_day: timeOfDay,
  }).select('id').single();

  if (error || !data) return null;

  const { data: profile } = await supabase.from('profiles').select('total_snaps').eq('id', userId).maybeSingle();
  await supabase.from('profiles').update({ total_snaps: (profile?.total_snaps ?? 0) + 1 }).eq('id', userId);

  return data.id;
}

export async function insertStory(userId: string, imageUrl: string, caption: string | null): Promise<boolean> {
  const { error } = await supabase.from('stories').insert({ user_id: userId, image_url: imageUrl, caption });
  return !error;
}

export async function recordStoryView(userId: string, storyId: string): Promise<void> {
  await supabase.from('story_views').insert({ user_id: userId, story_id: storyId }).maybeSingle();
  const { data: story } = await supabase.from('stories').select('view_count').eq('id', storyId).maybeSingle();
  if (story) {
    await supabase.from('stories').update({ view_count: story.view_count + 1 }).eq('id', storyId);
  }
}

export async function updateProfile(userId: string, updates: Partial<Pick<Profile, 'display_name' | 'bio' | 'avatar_url'>>): Promise<boolean> {
  const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
  return !error;
}

export async function updateOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
  await supabase.from('user_status').upsert({
    id: userId, is_online: isOnline, last_active: new Date().toISOString(),
  });
}

export {
  demoUsers, demoSnacks, demoStories, demoNotifications,
  demoConversations, demoMessages, demoFriendRequests, demoFriends,
  demoFollowing, demoFollowers, demoMutuals, demoSavedSnacks,
  suggestedUsers, trendingCreators,
  type DemoProfile, type DemoSnack, type DemoStory, type DemoNotification,
  type DemoConversation, type DemoMessage,
};
