# PESTA Mobile Release Checklist

Use this list before internal testing or production release.

## 1) Env Configuration

- Ensure `.env` contains:
  - `WEB_URL=https://<your-web-domain>`
  - `SUPABASE_URL=https://<project-ref>.supabase.co`
  - `SUPABASE_ANON_KEY=<anon-key>`
- Verify `app.config.js` reads these values into `expo.extra`.
- Confirm app Settings page shows non-placeholder `WEB_URL` and Supabase configured.

## 2) Supabase SQL Setup

Run these files in Supabase SQL Editor:

- `supabase/memory_reviews.sql`
  - Creates `public.memory_reviews`
  - Adds indexes and RLS policies for per-user review scheduling
- `supabase/captures_bucket.sql`
  - Creates `captures` storage bucket
  - Adds per-user write/update policy and public read policy
- `supabase/notes_capture_fields.sql`
  - Adds `source_type/source_url/attachment_url` to `notes`
  - Enables structured capture storage without string prefixes

## 3) Core Feature Smoke Tests (Real Device)

- Auth
  - Sign in
  - Kill/reopen app, session restored
- Capture
  - Text capture writes to `notes`
  - URL capture validates and writes to `notes`
  - Camera and gallery selection works
  - Local file image uploads to `captures` bucket and stores public URL in `notes`
- Search
  - RAG query returns citations when available
  - If RAG fails/empty, fallback search still returns `notes` results
- Memory
  - Flip cards and rate with `Again/Hard/Good/Easy`
  - App restart preserves local schedule
  - If `memory_reviews` exists, remote sync occurs without blocking local flow
- Action
  - Create task
  - Tap task cycles status `pending -> in_progress -> done -> pending`
  - Filter chips work

## 4) Navigation and UX

- StarMap tab is visually centered.
- All tabs open and render without crashes.
- iPhone home indicator area does not overlap tab controls.

## 5) Build and Quality Gates

- Run TypeScript check:
  - `npx tsc --noEmit`
- Run Expo:
  - `npm run start`
- Verify no runtime red screen on startup and on all main tabs.

## 6) Rollback Notes

If release must be rolled back quickly:

- Keep previous app build available in TestFlight/internal track.
- Revert to previous git commit and rebuild.
- If SQL already applied, no destructive rollback needed (new table/bucket are additive).
