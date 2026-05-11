# Supabase Schema - Social Network MVP

## Quick Start

1. **Run the schema:**
   ```bash
   # Copy contents of schema.sql into Supabase SQL Editor and execute
   ```

2. **Set environment variables:**
   ```bash
   # .env.local
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Use the types:**
   ```typescript
   import type { Database, Profile, Post, FeedPost } from '@/types/database';
   ```

---

## Files in This Directory

| File | Purpose |
|------|---------|
| `schema.sql` | Complete SQL schema - run this in Supabase |
| `DATA_CONTRACT.md` | Full documentation of data model and contracts |
| `QUERIES.md` | Frontend query patterns and examples |
| `SCHEMA_SUMMARY.md` | Quick reference - tables, RLS, risks |
| `README.md` | This file - quick start guide |

---

## Database Structure

```
auth.users (Supabase managed)
    ↓
profiles (public profile data)
    ↓
posts (status updates)
```

### Tables

**profiles**
- `id` → auth.users.id
- `username` (unique, 3-30 chars)
- `display_name` (1-50 chars)
- `bio` (optional, max 500 chars)
- `created_at`, `updated_at`

**posts**
- `id` (UUID, auto-generated)
- `user_id` → profiles.id
- `content` (1-500 chars)
- `created_at`

### Views

**feed_with_authors**
- Joins posts with profile data
- Ordered by created_at DESC
- Use this for feed queries

---

## Security (RLS)

### profiles
- Everyone can **read** (public)
- Auth users can **insert** their own
- Auth users can **update** their own only

### posts
- Everyone can **read** (public)
- Auth users can **insert** their own
- No updates/deletes in MVP

---

## Core Queries

### Create Profile
```typescript
await supabase.from('profiles').insert({
  id: user.id,
  username: 'johndoe',
  display_name: 'John Doe',
  bio: 'Hello!', // optional
});
```

### Create Post
```typescript
await supabase.from('posts').insert({
  user_id: user.id,
  content: 'My first post!',
});
```

### Get Feed
```typescript
const { data } = await supabase
  .from('feed_with_authors')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(50);
```

---

## Validation Rules

From `/types/database.ts`:

```typescript
username: 3-30 chars, alphanumeric + underscore
display_name: 1-50 chars, required
bio: optional, max 500 chars
post content: 1-500 chars, trimmed
```

---

## Next Steps

1. Run `schema.sql` in Supabase SQL Editor
2. Verify tables created successfully
3. Copy types from `/types/database.ts` to your project
4. Implement auth flow (signup/signin)
5. Implement profile creation/editing
6. Implement post creation
7. Implement feed display

---

## Need Help?

- Full documentation: `DATA_CONTRACT.md`
- Query examples: `QUERIES.md`
- Quick reference: `SCHEMA_SUMMARY.md`
- Main schema: `schema.sql`

---

## Schema Ready For Implementation

The backend data model is complete and optimized for the 2-hour MVP timebox.

**Next agent:** auth-profile-builder (implement authentication and profile flows)
