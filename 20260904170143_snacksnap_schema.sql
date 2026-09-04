/*
# SnackSnap — Full Social Schema

## Overview
Creates the complete backend for SnackSnap, a Gen-Z social app for sharing daily snack packaging photos.
This is a multi-user app with authentication: every user sees their own data and public data from others.

## New Tables

1. **profiles** — Public user profiles (display name, bio, avatar URL, stats)
   - `id` (uuid, PK, FK to auth.users)
   - `username` (text, unique, not null)
   - `display_name` (text, not null)
   - `bio` (text, nullable)
   - `avatar_url` (text, nullable)
   - `snack_streak` (int, default 0) — consecutive days of snacking
   - `total_snaps` (int, default 0) — total snack posts
   - `created_at` (timestamptz, default now())

2. **snacks** — Snack photo posts (the core content)
   - `id` (uuid, PK)
   - `user_id` (uuid, FK to auth.users, default auth.uid())
   - `image_url` (text, not null)
   - `brand` (text, nullable) — AI-detected brand
   - `flavor` (text, nullable) — AI-detected flavor
   - `snack_name` (text, nullable) — AI-detected snack name
   - `caption` (text, nullable)
   - `rating` (int, 1-5, nullable)
   - `mood` (text, nullable) — emoji mood tag
   - `time_of_day` (text, nullable) — morning/afternoon/evening/night
   - `like_count` (int, default 0)
   - `comment_count` (int, default 0)
   - `created_at` (timestamptz, default now())

3. **follows** — User follow relationships
   - `id` (uuid, PK)
   - `follower_id` (uuid, FK to auth.users)
   - `following_id` (uuid, FK to auth.users)
   - `created_at` (timestamptz, default now())
   - Unique constraint on (follower_id, following_id)

4. **likes** — Likes on snacks
   - `id` (uuid, PK)
   - `user_id` (uuid, FK to auth.users, default auth.uid())
   - `snack_id` (uuid, FK to snacks, ON DELETE CASCADE)
   - `created_at` (timestamptz, default now())
   - Unique constraint on (user_id, snack_id)

5. **comments** — Comments on snacks
   - `id` (uuid, PK)
   - `user_id` (uuid, FK to auth.users, default auth.uid())
   - `snack_id` (uuid, FK to snacks, ON DELETE CASCADE)
   - `text` (text, not null)
   - `created_at` (timestamptz, default now())

6. **stories** — Ephemeral snack stories (24h)
   - `id` (uuid, PK)
   - `user_id` (uuid, FK to auth.users, default auth.uid())
   - `image_url` (text, not null)
   - `caption` (text, nullable)
   - `view_count` (int, default 0)
   - `expires_at` (timestamptz, default now() + interval '24 hours')
   - `created_at` (timestamptz, default now())

7. **story_views** — Tracks who viewed a story
   - `id` (uuid, PK)
   - `user_id` (uuid, FK to auth.users, default auth.uid())
   - `story_id` (uuid, FK to stories, ON DELETE CASCADE)
   - `created_at` (timestamptz, default now())
   - Unique constraint on (user_id, story_id)

8. **notifications** — User notifications
   - `id` (uuid, PK)
   - `user_id` (uuid, FK to auth.users) — recipient
   - `actor_id` (uuid, FK to auth.users, nullable) — who triggered it
   - `type` (text, not null) — like/comment/follow/story
   - `snack_id` (uuid, FK to snacks, nullable, ON DELETE CASCADE)
   - `text` (text, not null)
   - `is_read` (boolean, default false)
   - `created_at` (timestamptz, default now())

## Security (RLS)
- All tables have RLS enabled.
- profiles: anyone authenticated can read; users can update only their own.
- snacks: anyone authenticated can read; users can insert/update/delete only their own.
- follows: anyone authenticated can read; users can insert/delete only their own follows.
- likes: anyone authenticated can read; users can insert/delete only their own likes.
- comments: anyone authenticated can read; users can insert/delete only their own comments.
- stories: anyone authenticated can read; users can insert/delete only their own stories.
- story_views: anyone authenticated can read; users can insert only their own views.
- notifications: users can read/update only their own notifications.

## Important Notes
1. Owner columns default to auth.uid() so inserts work without explicitly passing user_id.
2. All foreign keys to auth.users use ON DELETE CASCADE for cleanup.
3. likes and comments have ON DELETE CASCADE on snack_id so they disappear when a snack is deleted.
4. Unique constraints prevent duplicate likes, story views, and follows.
*/

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  display_name text NOT NULL,
  bio text,
  avatar_url text,
  snack_streak int NOT NULL DEFAULT 0,
  total_snaps int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_all_profiles" ON profiles;
CREATE POLICY "read_all_profiles" ON profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- SNACKS
CREATE TABLE IF NOT EXISTS snacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  brand text,
  flavor text,
  snack_name text,
  caption text,
  rating int CHECK (rating >= 1 AND rating <= 5),
  mood text,
  time_of_day text,
  like_count int NOT NULL DEFAULT 0,
  comment_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE snacks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_all_snacks" ON snacks;
CREATE POLICY "read_all_snacks" ON snacks FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_snacks" ON snacks;
CREATE POLICY "insert_own_snacks" ON snacks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_snacks" ON snacks;
CREATE POLICY "update_own_snacks" ON snacks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_snacks" ON snacks;
CREATE POLICY "delete_own_snacks" ON snacks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- FOLLOWS
CREATE TABLE IF NOT EXISTS follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (follower_id, following_id)
);
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_all_follows" ON follows;
CREATE POLICY "read_all_follows" ON follows FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_follows" ON follows;
CREATE POLICY "insert_own_follows" ON follows FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "delete_own_follows" ON follows;
CREATE POLICY "delete_own_follows" ON follows FOR DELETE
  TO authenticated USING (auth.uid() = follower_id);

-- LIKES
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  snack_id uuid NOT NULL REFERENCES snacks(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, snack_id)
);
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_all_likes" ON likes;
CREATE POLICY "read_all_likes" ON likes FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_likes" ON likes;
CREATE POLICY "insert_own_likes" ON likes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_likes" ON likes;
CREATE POLICY "delete_own_likes" ON likes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- COMMENTS
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  snack_id uuid NOT NULL REFERENCES snacks(id) ON DELETE CASCADE,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_all_comments" ON comments;
CREATE POLICY "read_all_comments" ON comments FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_comments" ON comments;
CREATE POLICY "insert_own_comments" ON comments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_comments" ON comments;
CREATE POLICY "delete_own_comments" ON comments FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- STORIES
CREATE TABLE IF NOT EXISTS stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  view_count int NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_all_stories" ON stories;
CREATE POLICY "read_all_stories" ON stories FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_stories" ON stories;
CREATE POLICY "insert_own_stories" ON stories FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_stories" ON stories;
CREATE POLICY "delete_own_stories" ON stories FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- STORY VIEWS
CREATE TABLE IF NOT EXISTS story_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, story_id)
);
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_all_story_views" ON story_views;
CREATE POLICY "read_all_story_views" ON story_views FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_story_views" ON story_views;
CREATE POLICY "insert_own_story_views" ON story_views FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  snack_id uuid REFERENCES snacks(id) ON DELETE CASCADE,
  text text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_own_notifications" ON notifications;
CREATE POLICY "read_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_snacks_user_id ON snacks(user_id);
CREATE INDEX IF NOT EXISTS idx_snacks_created_at ON snacks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_likes_snack_id ON likes(snack_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_snack_id ON comments(snack_id);
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
