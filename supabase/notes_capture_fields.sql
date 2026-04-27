-- Extend notes schema for structured capture payloads.
-- Run in Supabase SQL Editor.

alter table public.notes
  add column if not exists source_type text,
  add column if not exists source_url text,
  add column if not exists attachment_url text;

create index if not exists notes_source_type_idx on public.notes(source_type);
create index if not exists notes_source_url_idx on public.notes(source_url);
