-- PESTA capture image storage bucket
-- Run in Supabase SQL Editor.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'captures',
  'captures',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists "captures_insert_own" on storage.objects;
create policy "captures_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'captures'
  and (storage.foldername(name))[1] = 'captures'
  and (storage.foldername(name))[2] = auth.uid()::text
);

drop policy if exists "captures_update_own" on storage.objects;
create policy "captures_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'captures'
  and (storage.foldername(name))[1] = 'captures'
  and (storage.foldername(name))[2] = auth.uid()::text
)
with check (
  bucket_id = 'captures'
  and (storage.foldername(name))[1] = 'captures'
  and (storage.foldername(name))[2] = auth.uid()::text
);

drop policy if exists "captures_select_public" on storage.objects;
create policy "captures_select_public"
on storage.objects
for select
to public
using (bucket_id = 'captures');
