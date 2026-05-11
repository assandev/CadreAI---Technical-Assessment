# Schema Summary - Social Network MVP

## Overview

Minimal Supabase schema for 2-hour social network MVP.

**Goal:** auth → profile → post → feed → deploy

---

## 1. Tables

### profiles
```
id           UUID PK (→ auth.users.id)
username     TEXT UNIQUE (3-30 chars, alphanumeric + _)
display_name TEXT (1-50 chars)
bio          TEXT NULLABLE (max 500 chars)
created_at   TIMESTAMPTZ
updated_at   TIMESTAMPTZ (auto-updated via trigger)
```

**Purpose:** Public user profile data
**Relationship:** 1:1 with auth.users
**Indexes:** username (unique), created_at DESC

---

### posts
```
id          UUID PK (auto-generated)
user_id     UUID (→ profiles.id)
content     TEXT (1-500 chars, trimmed)
created_at  TIMESTAMPTZ
```

**Purpose:** User status updates
**Relationship:** Many posts → 1 profile
**Indexes:** created_at DESC, user_id, (user_id, created_at DESC)

---

## 2. RLS Policies

### profiles
- **SELECT:** Public (anyone can read)
- **INSERT:** Authenticated users can insert their own (`auth.uid() = id`)
- **UPDATE:** Authenticated users can update their own only
- **DELETE:** Authenticated users can delete their own only

### posts
- **SELECT:** Public (anyone can read)
- **INSERT:** Authenticated users can insert their own (`auth.uid() = user_id`)
- **UPDATE:** Not allowed in MVP
- **DELETE:** Not allowed in MVP

---

## 3. Required Queries

### Create Profile
```typescript
supabase.from('profiles').insert({ id, username, display_name, bio })
```

### Update Profile
```typescript
supabase.from('profiles').update({ display_name, bio }).eq('id', userId)
```

### Create Post
```typescript
supabase.from('posts').insert({ user_id, content })
```

### Get Feed
```typescript
supabase.from('feed_with_authors').select('*').order('created_at', { ascending: false })
```

---

## 4. Data Contracts

See `/types/database.ts` for TypeScript types:
- `Profile` - profile table row
- `Post` - post table row
- `FeedPost` - joined feed data
- `ProfileInsert`, `ProfileUpdate`, `PostInsert` - mutation types
- `VALIDATION` - validation constraints

---

## 5. Implementation Notes

### Key Decisions

1. **One profile per user:** `profiles.id` references `auth.users.id` directly. No separate user ID.

2. **Immutable posts:** Users cannot edit/delete posts in MVP. Simplifies data model and RLS.

3. **Public feed:** All posts visible to everyone (including unauthenticated users).

4. **View for feed:** `feed_with_authors` pre-joins posts with profile data for simpler frontend queries.

5. **Username constraints:** Alphanumeric + underscore, unique, 3-30 chars. Can be changed but may conflict.

6. **Content limit:** 500 chars for posts and bio. Simple Twitter-like limit.

7. **Auto-updated timestamps:** `profiles.updated_at` auto-updates via trigger.

8. **Cascade deletes:** Deleting auth user → deletes profile → deletes all posts.

### Schema Files

- `/supabase/schema.sql` - Complete SQL schema with comments
- `/types/database.ts` - TypeScript types and validation
- `/supabase/DATA_CONTRACT.md` - Full documentation
- `/supabase/QUERIES.md` - Query reference for frontend

### Setup Steps

1. Create Supabase project
2. Run `schema.sql` in SQL Editor
3. Verify tables and RLS policies
4. Copy env vars to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
5. Implement frontend using query patterns

---

## 6. Risks / Assumptions

### Assumptions

1. **One profile per user** - Users cannot have multiple profiles
2. **Public data** - All profiles and posts are public
3. **No pagination** - Feed loads last 50 posts
4. **Text-only** - No images, links, or media
5. **No editing** - Posts are immutable once created
6. **UTC timestamps** - Frontend handles timezone conversion
7. **No moderation** - Content moderation is out of scope

### Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Username conflicts on update | Medium | Validate before update, consider making immutable |
| User signs up but doesn't create profile | High | Redirect to /profile after signup, check existence |
| RLS misconfiguration | Critical | Test with different user roles, review logs |
| Feed performance with many posts | Medium | Indexes handle 1000s of posts, add pagination if needed |
| No content moderation | Medium | Accept for MVP, add admin tools post-launch |
| Users cannot edit typos | Low | Accepted tradeoff for simplicity |

### Security Notes

- Frontend uses anon key only (never service role)
- RLS enforces all permissions at database level
- Even if frontend is compromised, users cannot modify others' data
- Supabase Auth handles password hashing, JWT, etc.

---

## 7. Extension Path (Post-MVP)

When adding features beyond MVP:

1. **Likes:** New `likes` table with `(user_id, post_id)` composite PK
2. **Comments:** New `comments` table similar to posts structure
3. **Follows:** New `follows` table with `(follower_id, following_id)`
4. **Filtered feed:** Modify feed query to show only followed users
5. **Pagination:** Add cursor-based pagination using `created_at`
6. **Edit posts:** Add `updated_at` to posts, track edit history
7. **Media:** Add `media_url` column, integrate Supabase Storage
8. **Private profiles:** Add `is_private` flag, update RLS

---

## Quick Start Checklist

- [ ] Run `/supabase/schema.sql` in Supabase SQL Editor
- [ ] Verify tables created: `profiles`, `posts`
- [ ] Verify view created: `feed_with_authors`
- [ ] Verify RLS enabled on both tables
- [ ] Test INSERT profile as authenticated user
- [ ] Test INSERT post as authenticated user
- [ ] Test SELECT feed (unauthenticated should work)
- [ ] Copy types from `/types/database.ts` to project
- [ ] Set up Supabase env vars in `.env.local`
- [ ] Implement auth flow using patterns from `/supabase/QUERIES.md`

---

## Summary

**Schema is ready for immediate implementation.**

Two tables (`profiles`, `posts`) + one view (`feed_with_authors`) + RLS policies = complete MVP backend.

Frontend can now implement:
1. Auth (signup/signin)
2. Profile creation/editing
3. Post creation
4. Feed display

**Next agent:** auth-profile-builder (implement auth and profile flows)
