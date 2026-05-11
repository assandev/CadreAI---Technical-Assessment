# CLAUDE.md

## Project Goal

Build a minimal social network in a 2-hour timebox.

Prioritize a complete working core loop:

auth → profile → post → feed → deploy

The app should feel like a very small Facebook circa 2004:
users can create an account, set up a profile, post a status update, and see a feed of posts from users.

## Evaluation Context

This is an AI-assisted engineering challenge.

Optimize for:
- working deployed MVP
- clear scope control
- simple architecture
- clean data model
- fast verification
- ability to explain tradeoffs in review

Do not optimize for feature breadth or visual complexity.

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase Postgres
- Vercel deployment

## Core Product Flow

1. User signs up or signs in.
2. User creates or edits their profile.
3. User writes a text status update.
4. User sees a feed of posts from all users.
5. Feed displays author information and newest posts first.

## MVP Requirements

Must have:
- authentication
- profile creation/editing
- create post
- feed of posts
- author information on feed posts
- loading states
- empty states
- basic error states
- deployed public URL

Stretch only after MVP works:
- likes
- comments
- follows

## Non-goals

Do not build:
- realtime feed
- image uploads
- direct messages
- notifications
- complex recommendations
- admin tooling
- search
- password reset customization
- email templates
- advanced profile pages
- responsive perfection beyond basic usability

## Timebox Rules

Core loop first.

Do not start stretch features until:
- auth works
- profile works
- posts work
- feed works
- app builds
- deployment path is clear

Prefer one working simple flow over several incomplete flows.

When in doubt, cut scope.

## File Structure

Use this structure unless the existing Next.js setup requires small adjustments:

```
/app
  /(auth)
    /signin
    /signup
  /profile
  /feed
  /page.tsx
/components
  AuthForm.tsx
  ProfileForm.tsx
  PostComposer.tsx
  Feed.tsx
  FeedPost.tsx
/lib
  supabase
    client.ts
    server.ts
  validation.ts
/types
  database.ts
supabase
  schema.sql
```

## Supabase Rules

Use Supabase Auth for users.

Use these MVP tables:

1. profiles
2. posts

### Expected relationship:

- profiles.id references auth.users.id
- posts.user_id references profiles.id

Use Row Level Security.

Expected RLS:

profiles are readable by everyone
authenticated users can insert their own profile
authenticated users can update only their own profile
posts are readable by everyone
authenticated users can insert their own posts

Do not use service role key in the frontend.

Only expose:

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
Coding Standards
Keep components small.
Keep Supabase logic centralized.
Avoid duplicate client setup.
Use clear names.
Validate user input.
Add loading states.
Add error states.
Add empty states.
Prefer simple forms.
Prefer direct Supabase queries unless an API route is clearly needed.
Avoid unnecessary dependencies.
Avoid overengineering.
Validation Rules

### Profiles:

- username is required
- display_name is required
- bio is optional
- username should be reasonably short

### Posts:

- content is required
- content should be trimmed
- empty posts are invalid
- use a simple max length, e.g. 280 or 500 characters
- UI Direction

### Keep UI simple:

- centered auth form
- simple navigation
- profile form
- post composer
- feed list
- clear empty states

Use Tailwind but do not spend excessive time on design.

### Agent Strategy

Use subagents deliberately:

1. schema-architect
- use first
- designs schema, RLS, and data contracts
- does not write app UI code
2. auth-profile-builder
- implements authentication and profile flow
- does not implement posts/feed unless asked
- feed-builder
- implements post composer and feed
- uses existing schema/data contracts
- does not modify auth unless required
3. qa-reviewer
- verifies build and MVP requirements
- identifies blockers
- does not rewrite code
4. demo-coach
- prepares review/demo narrative
- does not write code

### Custom Commands

#### Use:

- /scope before coding or when scope feels unclear
- /schema before app implementation
- /mvp-next between phases
- /verify after each major feature
- /deploy before pushing/deploying
- /stretch-gate before any likes/comments/follows
- /demo at the end

### Implementation Order
1. Setup project and Supabase config.
2. Create schema/RLS.
3. Implement auth.
4. Implement profile.
5. Implement post composer.
6. Implement feed.
7. Verify build.
8. Deploy.
9. Polish only if time remains.
10. Stretch only if MVP is deployed.

### Verification Before Done

#### Before marking complete:

- npm run build passes
- user can sign up or sign in
- user can create or update profile
- user can create post
- feed displays posts
- feed displays author info
- empty and error states exist
- required env vars are documented
- app is deployed

#### What NOT To Do
- Do not build DMs.
- Do not add notifications.
- Do not build realtime.
- Do not add image uploads.
- Do not add likes/comments/follows before MVP works.
- Do not add a complex design system.
- Do not spend time on unnecessary animations.
- Do not create a large backend API if Supabase client queries are enough.
- Do not hide errors silently.
- Do not claim something works without verifying it.

### Review Notes

#### Be ready to explain:

- why this schema was chosen
- how Supabase Auth maps to profiles
- what RLS policies protect
- why scope was cut
- what Claude Code generated
- what was manually verified
- what would be added next with more time