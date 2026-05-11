## Goal

Build a minimal social network where users can sign up, create a profile, post status updates, and view a feed.

Timebox: 2 hours.

Primary success criteria:

auth → profile → post → feed → deploy

## Core User Flow

1. User opens app.
2. User signs up or signs in.
3. User creates or edits profile.
4. User writes a status update.
5. User sees a feed of posts from users.
6. User can refresh and still see persisted data.

## MVP Scope

### Must-have

- Supabase Auth
- Profile creation/editing
- Create text post
- Feed of posts
- Feed shows author info
- Newest posts first
- Loading states
- Empty states
- Basic error states
- Public deployed URL

### Stretch

Only after MVP is working and deployed:

1. Likes
2. Comments
3. Follows

Priority if time remains:
- Likes first
- Comments second
- Follows third

## Non-goals

- No realtime
- No image uploads
- No direct messages
- No notifications
- No complex recommendation algorithm
- No advanced profile pages
- No admin tools
- No search

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase Postgres
- Vercel

## Data Model

### profiles

Fields:
- id uuid primary key references auth.users(id)
- username text unique not null
- display_name text not null
- bio text
- created_at timestamptz default now()
- updated_at timestamptz default now()

Rules:
- publicly readable
- authenticated users can insert only their own profile
- authenticated users can update only their own profile

### posts

Fields:
- id uuid primary key default gen_random_uuid()
- user_id uuid not null references profiles(id)
- content text not null
- created_at timestamptz default now()

Rules:
- publicly readable
- authenticated users can insert only their own posts
- newest first in feed

## Required Queries

### Get current profile

Input:
- current auth user id

Output:
- profile row for current user

Used by:
- profile page
- navigation
- post composer guard

### Upsert profile

Input:
- id
- username
- display_name
- bio

Used by:
- profile form

### Create post

Input:
- user_id
- content

Used by:
- post composer

### Get feed

Output:
- posts with joined profile data

Sort:
- created_at descending

Used by:
- feed page

## Routes

Target routes:

- `/`
  - landing or redirect based on auth state

- `/signin`
  - sign in form

- `/signup`
  - sign up form

- `/profile`
  - create/edit profile

- `/feed`
  - post composer and feed

Route names may be adjusted for Next.js conventions, but keep the flow simple.

## Components

Suggested components:

- `AuthForm`
- `ProfileForm`
- `PostComposer`
- `Feed`
- `FeedPost`
- `Navbar`
- `ErrorMessage`
- `LoadingState`
- `EmptyState`

## Phases

## Phase 0 — Planning and First Commit

Goal:
Create planning/context files and commit before implementation.

Tasks:
- Add `CLAUDE.md`
- Add `plan.md`
- Add `.claude/agents`
- Add `.claude/commands`
- Commit

Acceptance criteria:
- Claude Code context is ready.
- Scope is explicit.
- First commit starts the timer intentionally.

Suggested commit:
`Add Claude Code planning files`

---

## Phase 1 — Setup

Goal:
Initialize app and Supabase client.

Tasks:
- Create or verify Next.js app.
- Install Supabase client packages.
- Configure Tailwind.
- Create Supabase client helpers.
- Add `.env.example`.
- Add basic layout/navigation.

Acceptance criteria:
- App runs locally.
- Supabase env vars are documented.
- No secrets are committed.

Suggested commit:
`Set up Next.js and Supabase client`

---

## Phase 2 — Schema and RLS

Goal:
Create minimal database schema.

Tasks:
- Create `profiles` table.
- Create `posts` table.
- Add indexes.
- Enable RLS.
- Add MVP policies.
- Document required queries.

Acceptance criteria:
- Schema supports auth/profile/post/feed.
- RLS allows MVP operations.
- No stretch tables exist.

Suggested commit:
`Add Supabase schema for profiles and posts`

---

## Phase 3 — Auth and Profile

Goal:
Implement sign up/sign in and profile flow.

Tasks:
- Build sign up/sign in UI.
- Handle Supabase Auth session.
- Add sign out.
- Build profile form.
- Save profile to Supabase.
- Redirect signed-in user to profile or feed as appropriate.

Acceptance criteria:
- User can sign up or sign in.
- User can create/update profile.
- Unauthenticated users cannot access protected app flow.
- Errors are visible.

Suggested commit:
`Implement auth and profile flow`

---

## Phase 4 — Posts and Feed

Goal:
Implement core social network loop.

Tasks:
- Build post composer.
- Validate post content.
- Insert post into Supabase.
- Query feed with author profile.
- Display posts newest first.
- Add loading/empty/error states.

Acceptance criteria:
- Authenticated user can create post.
- Feed displays posts.
- Feed displays author info.
- Feed persists after refresh.
- Empty feed has useful message.

Suggested commit:
`Implement posts and feed`

---

## Phase 5 — Reliability and Polish

Goal:
Make the MVP demo-safe.

Tasks:
- Run build.
- Fix type/build errors.
- Check unhappy paths.
- Improve loading states.
- Improve empty states.
- Add basic README notes if useful.
- Confirm env vars for deployment.

Acceptance criteria:
- `npm run build` passes.
- MVP checklist passes.
- App is usable enough for demo.

Suggested commit:
`Stabilize MVP for demo`

---

## Phase 6 — Deploy

Goal:
Ship public URL.

Tasks:
- Push to main.
- Configure Vercel env vars.
- Verify deployed app loads.
- Smoke test deployed auth/profile/post/feed flow.

Acceptance criteria:
- Public URL works.
- Deployed app connects to Supabase.
- Deployed app can complete MVP flow.

Suggested commit:
`Prepare deployment`

---

## Phase 7 — Stretch Gate

Goal:
Decide whether to add stretch features.

Allowed only if:
- app is deployed or deploy-ready
- build passes
- auth works
- profile works
- posts work
- feed works

Stretch priority:
1. Likes
2. Comments
3. Follows

Default decision:
If less than 20 minutes remain, do not add stretch. Polish and prepare demo instead.

## Verification Checklist

### Local

- [ ] App starts locally
- [ ] Supabase env vars configured
- [ ] User can sign up
- [ ] User can sign in
- [ ] User can sign out
- [ ] User can create profile
- [ ] User can edit profile
- [ ] User can create post
- [ ] Feed displays posts
- [ ] Feed displays author info
- [ ] Feed sorted newest first
- [ ] Empty states exist
- [ ] Error states exist
- [ ] `npm run build` passes

### Deployment

- [ ] Vercel env vars set
- [ ] Deployment succeeds
- [ ] Public URL loads
- [ ] Auth works on deployed URL
- [ ] Profile works on deployed URL
- [ ] Posts work on deployed URL
- [ ] Feed works on deployed URL

## Known Tradeoffs

Intentional cuts:
- no realtime
- no images
- no DMs
- no notifications
- no advanced social graph
- no recommendation algorithm
- no elaborate styling

Reason:
The challenge rewards a working core loop, clean architecture, deployment, and clear reasoning over feature breadth.

## Demo Notes

During review, explain:
- I optimized for a complete deployed MVP.
- I used Claude Code subagents to separate schema, auth/profile, feed, QA, and demo preparation.
- I kept schema minimal: profiles and posts.
- I used RLS to protect user-owned writes.
- I cut stretch features until the core loop was verified.
- With more time, I would add likes first, then comments, then follows.