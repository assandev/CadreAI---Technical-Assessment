-- =====================================================
-- SOCIAL NETWORK MVP - DATABASE SCHEMA
-- =====================================================
-- Purpose: Minimal schema for auth → profile → post → feed
-- Timebox: 2-hour MVP implementation
-- Stack: Supabase Auth + Postgres + RLS
-- =====================================================

-- =====================================================
-- TABLE: profiles
-- =====================================================
-- Links auth.users to public profile data
-- One profile per authenticated user
-- =====================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  CONSTRAINT display_name_length CHECK (char_length(display_name) >= 1 AND char_length(display_name) <= 50),
  CONSTRAINT bio_length CHECK (bio IS NULL OR char_length(bio) <= 500),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

-- Index for username lookups (used in profile pages, search)
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);

-- Index for created_at (useful for ordering new users)
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON public.profiles(created_at DESC);

COMMENT ON TABLE public.profiles IS 'User profile information linked to Supabase Auth users';
COMMENT ON COLUMN public.profiles.id IS 'References auth.users.id - one profile per user';
COMMENT ON COLUMN public.profiles.username IS 'Unique username, 3-30 chars, alphanumeric + underscore';
COMMENT ON COLUMN public.profiles.display_name IS 'Display name shown in UI, 1-50 chars';
COMMENT ON COLUMN public.profiles.bio IS 'Optional bio, max 500 chars';

-- =====================================================
-- TABLE: posts
-- =====================================================
-- Status updates from users
-- Core content of the feed
-- =====================================================

CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT content_not_empty CHECK (char_length(trim(content)) > 0),
  CONSTRAINT content_length CHECK (char_length(content) <= 500)
);

-- Index for feed queries (most recent posts first)
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON public.posts(created_at DESC);

-- Index for user's posts (profile page, user-specific queries)
CREATE INDEX IF NOT EXISTS posts_user_id_idx ON public.posts(user_id);

-- Composite index for efficient feed pagination
CREATE INDEX IF NOT EXISTS posts_user_created_idx ON public.posts(user_id, created_at DESC);

COMMENT ON TABLE public.posts IS 'User status updates - core content for feed';
COMMENT ON COLUMN public.posts.user_id IS 'References profiles.id - author of the post';
COMMENT ON COLUMN public.posts.content IS 'Post content, 1-500 chars, trimmed';
COMMENT ON COLUMN public.posts.created_at IS 'Post creation timestamp - used for feed ordering';

-- =====================================================
-- FUNCTION: update_updated_at
-- =====================================================
-- Auto-update updated_at timestamp on profile changes
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update profiles.updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on both tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS: profiles
-- =====================================================

-- Policy: Anyone can read all profiles (public data)
CREATE POLICY "profiles_select_public"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert their own profile
-- This happens after signup
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update only their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Users can delete their own profile (optional for MVP)
CREATE POLICY "profiles_delete_own"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

COMMENT ON POLICY "profiles_select_public" ON public.profiles IS 'All profiles are publicly readable';
COMMENT ON POLICY "profiles_insert_own" ON public.profiles IS 'Users can create their own profile after signup';
COMMENT ON POLICY "profiles_update_own" ON public.profiles IS 'Users can update only their own profile';

-- =====================================================
-- RLS: posts
-- =====================================================

-- Policy: Anyone can read all posts (public feed)
CREATE POLICY "posts_select_public"
  ON public.posts
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert their own posts
CREATE POLICY "posts_insert_own"
  ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Note: No update/delete policies for MVP
-- Users cannot edit or delete posts in this version
-- This is intentional scope reduction for 2-hour timebox

COMMENT ON POLICY "posts_select_public" ON public.posts IS 'All posts are publicly readable for feed';
COMMENT ON POLICY "posts_insert_own" ON public.posts IS 'Authenticated users can create posts';

-- =====================================================
-- HELPER VIEW: feed_with_authors (optional)
-- =====================================================
-- Pre-joined view for feed queries
-- Simplifies frontend queries and ensures consistent data shape
-- =====================================================

CREATE OR REPLACE VIEW public.feed_with_authors AS
SELECT
  posts.id,
  posts.content,
  posts.created_at,
  posts.user_id,
  profiles.username,
  profiles.display_name,
  profiles.bio
FROM public.posts
INNER JOIN public.profiles ON posts.user_id = profiles.id
ORDER BY posts.created_at DESC;

COMMENT ON VIEW public.feed_with_authors IS 'Feed posts joined with author profile data - use for main feed query';

-- Grant access to the view
GRANT SELECT ON public.feed_with_authors TO authenticated, anon;

-- =====================================================
-- TABLE: likes
-- =====================================================

CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT likes_unique UNIQUE (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS likes_post_id_idx ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS likes_user_id_idx ON public.likes(user_id);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "likes_select_public"
  ON public.likes FOR SELECT USING (true);

CREATE POLICY "likes_insert_own"
  ON public.likes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "likes_delete_own"
  ON public.likes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: comments
-- =====================================================

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT comment_content_not_empty CHECK (char_length(trim(content)) > 0),
  CONSTRAINT comment_content_length CHECK (char_length(content) <= 280)
);

CREATE INDEX IF NOT EXISTS comments_post_id_idx ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON public.comments(created_at ASC);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_select_public"
  ON public.comments FOR SELECT USING (true);

CREATE POLICY "comments_insert_own"
  ON public.comments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- TABLE: follows
-- =====================================================

CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT follows_unique UNIQUE (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS follows_follower_id_idx ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS follows_following_id_idx ON public.follows(following_id);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "follows_select_public"
  ON public.follows FOR SELECT USING (true);

CREATE POLICY "follows_insert_own"
  ON public.follows FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "follows_delete_own"
  ON public.follows FOR DELETE TO authenticated
  USING (auth.uid() = follower_id);

-- =====================================================
-- INITIAL SETUP COMPLETE
-- =====================================================
