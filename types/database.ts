// =====================================================
// DATABASE TYPE DEFINITIONS
// =====================================================
// Type-safe contracts for Supabase queries
// Generated based on schema.sql
// =====================================================

// =====================================================
// TABLE TYPES
// =====================================================

export interface Profile {
  id: string; // UUID from auth.users
  username: string;
  display_name: string;
  bio: string | null;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface Post {
  id: string; // UUID
  user_id: string; // UUID references profiles.id
  content: string;
  created_at: string; // ISO timestamp
}

// =====================================================
// COMPOSITE TYPES (for joined queries)
// =====================================================

export interface FeedPost {
  id: string; // post.id
  content: string;
  created_at: string;
  user_id: string;
  username: string; // from profiles
  display_name: string; // from profiles
  bio: string | null; // from profiles
}

// =====================================================
// INSERT TYPES (client-side mutations)
// =====================================================

export interface ProfileInsert {
  id: string; // Must match auth.uid()
  username: string; // 3-30 chars, alphanumeric + underscore
  display_name: string; // 1-50 chars
  bio?: string | null; // optional, max 500 chars
}

export interface ProfileUpdate {
  username?: string;
  display_name?: string;
  bio?: string | null;
}

export interface PostInsert {
  user_id: string; // Must match auth.uid()
  content: string; // 1-500 chars, trimmed
}

// =====================================================
// DATABASE SCHEMA TYPE
// =====================================================
// Complete database structure for type-safe client

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      posts: {
        Row: Post;
        Insert: PostInsert;
        Update: never; // No updates allowed in MVP
      };
    };
    Views: {
      feed_with_authors: {
        Row: FeedPost;
      };
    };
  };
}

// =====================================================
// VALIDATION CONSTRAINTS (from schema)
// =====================================================

export const VALIDATION = {
  username: {
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_]+$/,
    errorMessage: 'Username must be 3-30 characters, alphanumeric and underscore only',
  },
  displayName: {
    minLength: 1,
    maxLength: 50,
    errorMessage: 'Display name must be 1-50 characters',
  },
  bio: {
    maxLength: 500,
    errorMessage: 'Bio must be 500 characters or less',
  },
  postContent: {
    minLength: 1,
    maxLength: 500,
    errorMessage: 'Post must be 1-500 characters',
  },
} as const;
