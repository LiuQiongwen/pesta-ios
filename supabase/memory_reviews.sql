-- PESTA memory spaced-repetition schedule table
-- Run this in Supabase SQL Editor.

create table if not exists public.memory_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id text not null,
  interval_days integer not null default 0,
  ease double precision not null default 2.3,
  due_at timestamptz not null default now(),
  reps integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists memory_reviews_user_card_uidx
  on public.memory_reviews(user_id, card_id);

create index if not exists memory_reviews_user_due_idx
  on public.memory_reviews(user_id, due_at);

alter table public.memory_reviews enable row level security;

drop policy if exists "memory_reviews_select_own" on public.memory_reviews;
create policy "memory_reviews_select_own"
on public.memory_reviews
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "memory_reviews_insert_own" on public.memory_reviews;
create policy "memory_reviews_insert_own"
on public.memory_reviews
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "memory_reviews_update_own" on public.memory_reviews;
create policy "memory_reviews_update_own"
on public.memory_reviews
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "memory_reviews_delete_own" on public.memory_reviews;
create policy "memory_reviews_delete_own"
on public.memory_reviews
for delete
to authenticated
using (auth.uid() = user_id);
