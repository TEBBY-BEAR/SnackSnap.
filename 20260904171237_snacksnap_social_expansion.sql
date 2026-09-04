/*
# SnackSnap — Social Expansion (Friends, Messaging, Saved Posts, Comment Replies)

## Overview
Adds tables for friend relationships, direct messaging, saved posts, and comment replies to support the full social experience.

## New Tables

1. **friend_requests** — Friend request system
   - `id` (uuid, PK)
   - `sender_id` (uuid, FK to auth.users) — who sent the request
   - `receiver_id` (uuid, FK to auth.users) — who receives the request
   - `status` (text, default 'pending') — pending / accepted / declined
   - `created_at` (timestamptz)
   - `responded_at` (timestamptz, nullable)
   - Unique constraint on (sender_id, receiver_id)

2. **friendships** — Accepted friend relationships (bidirectional)
   - `id` (uuid, PK)
   - `user1_id` (uuid, FK to auth.users)
   - `user2_id` (uuid, FK to auth.users)
   - `created_at` (timestamptz)
   - Unique constraint on (user1_id, user2_id) with check user1_id < user2_id

3. **conversations** — DM conversation rooms
   - `id` (uuid, PK)
   - `user1_id` (uuid, FK to auth.users)
   - `user2_id` (uuid, FK to auth.users)
   - `last_message_at` (timestamptz, default now())
   - Unique constraint on (user1_id, user2_id) with check user1_id < user2_id

4. **messages** — Individual messages in conversations
   - `id` (uuid, PK)
   - `conversation_id` (uuid, FK to conversations, ON DELETE CASCADE)
   - `sender_id` (uuid, FK to auth.users, default auth.uid())
   - `text` (text, nullable)
   - `shared_snack_id` (uuid, FK to snacks, nullable, ON DELETE SET NULL)
   - `is_read` (boolean, default false)
   - `created_at` (timestamptz)

5. **message_reactions** — Emoji reactions on messages
   - `id` (uuid, PK)
   - `message_id` (uuid, FK to messages, ON DELETE CASCADE)
   - `user_id` (uuid, FK to auth.users, default auth.uid())
   - `emoji` (text, not null)
   - `created_at` (timestamptz)
   - Unique constraint on (message_id, user_id, emoji)

6. **saved_posts** — Bookmarked snacks
   - `id` (uuid, PK)
   - `user_id` (uuid, FK to auth.users, default auth.uid())
   - `snack_id` (uuid, FK to snacks, ON DELETE CASCADE)
   - `created_at` (timestamptz)
   - Unique constraint on (user_id, snack_id)

7. **comment_replies** — Replies to comments
   - `id` (uuid, PK)
   - `comment_id` (uuid, FK to comments, ON DELETE CASCADE)
   - `user_id` (uuid, FK to auth.users, default auth.uid())
   - `text` (text, not null)
   - `created_at` (timestamptz)

8. **user_status** — Online/last-active tracking
   - `id` (uuid, PK, default auth.uid())
   - `is_online` (boolean, default false)
   - `last_active` (timestamptz, default now())

## Security (RLS)
- All tables have RLS enabled.
- friend_requests: users can read requests they sent or received; users can insert requests they send; users can update requests they received.
- friendships: users can read friendships they are part of; inserts handled via accepting friend requests.
- conversations: users can read conversations they are part of; users can insert conversations where they are user1.
- messages: users can read messages in their conversations; users can insert messages they send; users can update is_read on messages they received.
- message_reactions: users can read all reactions in their conversations; users can insert/delete their own reactions.
- saved_posts: users can read/insert/delete only their own saved posts.
- comment_replies: anyone authenticated can read; users can insert/delete only their own replies.
- user_status: anyone authenticated can read; users can insert/update only their own status.

## Important Notes
1. All owner columns default to auth.uid() for seamless inserts.
2. Friendships and conversations use a canonical ordering (user1_id < user2_id) to prevent duplicates.
3. Messages support both text and shared snack posts.
4. Message reactions use emoji strings with unique constraints per user+message+emoji.
*/

-- FRIEND REQUESTS
CREATE TABLE IF NOT EXISTS friend_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  UNIQUE (sender_id, receiver_id)
);
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_own_friend_requests" ON friend_requests;
CREATE POLICY "read_own_friend_requests" ON friend_requests FOR SELECT
  TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "insert_own_friend_requests" ON friend_requests;
CREATE POLICY "insert_own_friend_requests" ON friend_requests FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "update_received_friend_requests" ON friend_requests;
CREATE POLICY "update_received_friend_requests" ON friend_requests FOR UPDATE
  TO authenticated USING (auth.uid() = receiver_id) WITH CHECK (auth.uid() = receiver_id);

-- FRIENDSHIPS
CREATE TABLE IF NOT EXISTS friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user1_id, user2_id),
  CHECK (user1_id < user2_id)
);
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_own_friendships" ON friendships;
CREATE POLICY "read_own_friendships" ON friendships FOR SELECT
  TO authenticated USING (auth.uid() = user1_id OR auth.uid() = user2_id);

DROP POLICY IF EXISTS "insert_own_friendships" ON friendships;
CREATE POLICY "insert_own_friendships" ON friendships FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

DROP POLICY IF EXISTS "delete_own_friendships" ON friendships;
CREATE POLICY "delete_own_friendships" ON friendships FOR DELETE
  TO authenticated USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- CONVERSATIONS
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user1_id, user2_id),
  CHECK (user1_id < user2_id)
);
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_own_conversations" ON conversations;
CREATE POLICY "read_own_conversations" ON conversations FOR SELECT
  TO authenticated USING (auth.uid() = user1_id OR auth.uid() = user2_id);

DROP POLICY IF EXISTS "insert_own_conversations" ON conversations;
CREATE POLICY "insert_own_conversations" ON conversations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

DROP POLICY IF EXISTS "update_own_conversations" ON conversations;
CREATE POLICY "update_own_conversations" ON conversations FOR UPDATE
  TO authenticated USING (auth.uid() = user1_id OR auth.uid() = user2_id) WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- MESSAGES
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  text text,
  shared_snack_id uuid REFERENCES snacks(id) ON DELETE SET NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_own_messages" ON messages;
CREATE POLICY "read_own_messages" ON messages FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "insert_own_messages" ON messages;
CREATE POLICY "insert_own_messages" ON messages FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    ) AND auth.uid() = sender_id
  );

DROP POLICY IF EXISTS "update_received_messages" ON messages;
CREATE POLICY "update_received_messages" ON messages FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    ) AND auth.uid() != sender_id
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );

-- MESSAGE REACTIONS
CREATE TABLE IF NOT EXISTS message_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_id, emoji)
);
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_message_reactions" ON message_reactions;
CREATE POLICY "read_message_reactions" ON message_reactions FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = message_reactions.message_id
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "insert_own_message_reactions" ON message_reactions;
CREATE POLICY "insert_own_message_reactions" ON message_reactions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_message_reactions" ON message_reactions;
CREATE POLICY "delete_own_message_reactions" ON message_reactions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- SAVED POSTS
CREATE TABLE IF NOT EXISTS saved_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  snack_id uuid NOT NULL REFERENCES snacks(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, snack_id)
);
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_own_saved_posts" ON saved_posts;
CREATE POLICY "read_own_saved_posts" ON saved_posts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_saved_posts" ON saved_posts;
CREATE POLICY "insert_own_saved_posts" ON saved_posts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_saved_posts" ON saved_posts;
CREATE POLICY "delete_own_saved_posts" ON saved_posts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- COMMENT REPLIES
CREATE TABLE IF NOT EXISTS comment_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE comment_replies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_all_comment_replies" ON comment_replies;
CREATE POLICY "read_all_comment_replies" ON comment_replies FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_comment_replies" ON comment_replies;
CREATE POLICY "insert_own_comment_replies" ON comment_replies FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_comment_replies" ON comment_replies;
CREATE POLICY "delete_own_comment_replies" ON comment_replies FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- USER STATUS
CREATE TABLE IF NOT EXISTS user_status (
  id uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  is_online boolean NOT NULL DEFAULT false,
  last_active timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE user_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_all_user_status" ON user_status;
CREATE POLICY "read_all_user_status" ON user_status FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_user_status" ON user_status;
CREATE POLICY "insert_own_user_status" ON user_status FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_user_status" ON user_status;
CREATE POLICY "update_own_user_status" ON user_status FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_sender ON friend_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_friendships_user1 ON friendships(user1_id);
CREATE INDEX IF NOT EXISTS idx_friendships_user2 ON friendships(user2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user1 ON conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user2 ON conversations(user2_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_saved_posts_user ON saved_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_replies_comment ON comment_replies(comment_id);
