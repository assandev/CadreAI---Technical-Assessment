# Frontend Query Reference

Quick reference for Supabase queries in the Next.js app.

---

## Setup

```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';

const supabase = createClientComponentClient<Database>();
```

---

## Auth Queries

### Sign Up
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
});
```

### Sign In
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});
```

### Sign Out
```typescript
const { error } = await supabase.auth.signOut();
```

### Get Current User
```typescript
const { data: { user } } = await supabase.auth.getUser();
```

---

## Profile Queries

### Create Profile (after signup)
```typescript
const { data, error } = await supabase
  .from('profiles')
  .insert({
    id: user.id,
    username: 'johndoe',
    display_name: 'John Doe',
    bio: 'Software developer', // optional
  })
  .select()
  .single();
```

### Get Current User's Profile
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();
```

### Update Profile
```typescript
const { data, error } = await supabase
  .from('profiles')
  .update({
    display_name: 'Jane Doe',
    bio: 'Updated bio',
  })
  .eq('id', user.id)
  .select()
  .single();
```

### Get Profile by Username (optional)
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('username', username)
  .single();
```

---

## Post Queries

### Create Post
```typescript
const { data, error } = await supabase
  .from('posts')
  .insert({
    user_id: user.id,
    content: content.trim(),
  })
  .select()
  .single();
```

### Get Feed (recommended: using view)
```typescript
const { data, error } = await supabase
  .from('feed_with_authors')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(50);

// Returns FeedPost[]
```

### Get Feed (alternative: manual join)
```typescript
const { data, error } = await supabase
  .from('posts')
  .select(`
    id,
    content,
    created_at,
    user_id,
    profiles:user_id (
      username,
      display_name,
      bio
    )
  `)
  .order('created_at', { ascending: false })
  .limit(50);
```

### Get User's Posts (stretch)
```typescript
const { data, error } = await supabase
  .from('posts')
  .select(`
    id,
    content,
    created_at,
    user_id,
    profiles:user_id (
      username,
      display_name
    )
  `)
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(20);
```

---

## Error Handling Pattern

```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();

if (error) {
  console.error('Error fetching profile:', error);
  // Handle error state
  return;
}

if (!data) {
  // Handle no data state
  return;
}

// Use data
```

---

## Loading State Pattern

```typescript
const [loading, setLoading] = useState(true);
const [data, setData] = useState(null);
const [error, setError] = useState(null);

useEffect(() => {
  async function fetchData() {
    setLoading(true);
    const { data, error } = await supabase
      .from('feed_with_authors')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    setData(data);
  }

  fetchData();
}, []);
```

---

## Validation Before Insert

```typescript
import { VALIDATION } from '@/types/database';

function validateUsername(username: string): string | null {
  if (username.length < VALIDATION.username.minLength) {
    return `Username must be at least ${VALIDATION.username.minLength} characters`;
  }
  if (username.length > VALIDATION.username.maxLength) {
    return `Username must be at most ${VALIDATION.username.maxLength} characters`;
  }
  if (!VALIDATION.username.pattern.test(username)) {
    return VALIDATION.username.errorMessage;
  }
  return null;
}

function validatePostContent(content: string): string | null {
  const trimmed = content.trim();
  if (trimmed.length < VALIDATION.postContent.minLength) {
    return 'Post cannot be empty';
  }
  if (trimmed.length > VALIDATION.postContent.maxLength) {
    return `Post must be ${VALIDATION.postContent.maxLength} characters or less`;
  }
  return null;
}
```

---

## Common Patterns

### Check if user has profile
```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('id')
  .eq('id', user.id)
  .single();

const hasProfile = !!profile;
```

### Optimistic UI update (after post creation)
```typescript
// Create post
const { data: newPost, error } = await supabase
  .from('posts')
  .insert({ user_id: user.id, content })
  .select()
  .single();

if (!error && newPost) {
  // Add to feed immediately (optimistic)
  const feedPost: FeedPost = {
    ...newPost,
    username: currentUser.username,
    display_name: currentUser.display_name,
    bio: currentUser.bio,
  };
  setFeed([feedPost, ...feed]);
}
```

---

## Server Component Pattern (Next.js)

```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

export default async function FeedPage() {
  const supabase = createServerComponentClient<Database>({ cookies });

  const { data: feed } = await supabase
    .from('feed_with_authors')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  return <Feed initialFeed={feed || []} />;
}
```

---

## Notes

- Always trim user input before inserting
- Always validate before insert
- Use `.single()` when expecting one row
- Use `.select()` after insert to get created data
- Handle loading, error, and empty states
- Use TypeScript types from `database.ts`
