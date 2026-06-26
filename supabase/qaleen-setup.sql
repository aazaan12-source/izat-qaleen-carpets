-- Qaleen Supabase setup
-- Run this once in Supabase Dashboard > SQL Editor.

create table if not exists public.qaleen_catalog (
  id text primary key default 'main' check (id = 'main'),
  catalog jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.qaleen_orders (
  id text primary key,
  order_data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.qaleen_catalog enable row level security;
alter table public.qaleen_orders enable row level security;

-- Public visitors read and write through Next.js API routes only.
-- Keep table policies closed; the server-side Supabase secret key performs admin actions.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'qaleen-images',
  'qaleen-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read qaleen images" on storage.objects;
create policy "Public can read qaleen images"
on storage.objects
for select
to public
using (bucket_id = 'qaleen-images');
