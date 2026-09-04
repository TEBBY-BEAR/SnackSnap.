export interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  snack_streak: number;
  total_snaps: number;
  created_at: string;
}

export interface Snack {
  id: string;
  user_id: string;
  image_url: string;
  brand: string | null;
  flavor: string | null;
  snack_name: string | null;
  caption: string | null;
  rating: number | null;
  mood: string | null;
  time_of_day: string | null;
  like_count: number;
  comment_count: number;
  created_at: string;
}

export interface SnackWithProfile extends Snack {
  profiles: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'> | null;
  liked_by_me?: boolean;
  saved_by_me?: boolean;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface Like {
  id: string;
  user_id: string;
  snack_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  snack_id: string;
  text: string;
  created_at: string;
}

export interface CommentReply {
  id: string;
  comment_id: string;
  user_id: string;
  text: string;
  created_at: string;
}

export interface CommentWithProfile extends Comment {
  profiles: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'> | null;
  replies?: CommentReplyWithProfile[];
}

export interface CommentReplyWithProfile extends CommentReply {
  profiles: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'> | null;
}

export interface Story {
  id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  view_count: number;
  expires_at: string;
  created_at: string;
}

export interface StoryWithProfile extends Story {
  profiles: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'> | null;
  viewed_by_me?: boolean;
}

export interface StoryView {
  id: string;
  user_id: string;
  story_id: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: string;
  snack_id: string | null;
  text: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationWithActor extends Notification {
  actor: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'> | null;
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  responded_at: string | null;
}

export interface FriendRequestWithProfile extends FriendRequest {
  sender: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'> | null;
}

export interface Friendship {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message_at: string;
}

export interface ConversationWithProfile extends Conversation {
  other_user: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'> | null;
  last_message?: Message | null;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string | null;
  shared_snack_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface MessageWithSender extends Message {
  sender: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'> | null;
  reactions?: MessageReactionWithUser[];
  shared_snack?: SnackWithProfile | null;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface MessageReactionWithUser extends MessageReaction {
  user: Pick<Profile, 'id' | 'username' | 'display_name'> | null;
}

export interface SavedPost {
  id: string;
  user_id: string;
  snack_id: string;
  created_at: string;
}

export interface UserStatus {
  id: string;
  is_online: boolean;
  last_active: string;
}

export type RelationshipType = 'none' | 'following' | 'follows_you' | 'mutual' | 'friends' | 'pending_sent' | 'pending_received';
