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
-- These policies also let the deployed Next.js API use the publishable key if the server secret is missing or invalid.

drop policy if exists "Qaleen catalog can be read" on public.qaleen_catalog;
create policy "Qaleen catalog can be read"
on public.qaleen_catalog
for select
to anon, authenticated
using (true);

drop policy if exists "Qaleen catalog can be inserted" on public.qaleen_catalog;
create policy "Qaleen catalog can be inserted"
on public.qaleen_catalog
for insert
to anon, authenticated
with check (id = 'main');

drop policy if exists "Qaleen catalog can be updated" on public.qaleen_catalog;
create policy "Qaleen catalog can be updated"
on public.qaleen_catalog
for update
to anon, authenticated
using (id = 'main')
with check (id = 'main');

drop policy if exists "Qaleen orders can be read" on public.qaleen_orders;
create policy "Qaleen orders can be read"
on public.qaleen_orders
for select
to anon, authenticated
using (true);

drop policy if exists "Qaleen orders can be inserted" on public.qaleen_orders;
create policy "Qaleen orders can be inserted"
on public.qaleen_orders
for insert
to anon, authenticated
with check (true);

drop policy if exists "Qaleen orders can be updated" on public.qaleen_orders;
create policy "Qaleen orders can be updated"
on public.qaleen_orders
for update
to anon, authenticated
using (true)
with check (true);

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

drop policy if exists "Qaleen images can be uploaded" on storage.objects;
create policy "Qaleen images can be uploaded"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'qaleen-images');

drop policy if exists "Qaleen images can be updated" on storage.objects;
create policy "Qaleen images can be updated"
on storage.objects
for update
to anon, authenticated
using (bucket_id = 'qaleen-images')
with check (bucket_id = 'qaleen-images');
