-- Migration 004: spaces table
-- Stores all rental listings. Public read, authenticated insert/update by host.

create table public.spaces (
  id              uuid default gen_random_uuid() primary key,
  host_id         uuid references public.profiles(id) on delete set null,
  title           text not null,
  description     text,
  type            text,
  stay_type       text default 'hourly' check (stay_type in ('hourly', 'nightly')),
  area            text,
  city            text,
  lat             numeric,
  lng             numeric,
  price_per_30m   numeric,
  price_per_night numeric,
  min_nights      int,
  instant_access  boolean default false,
  amenities       text[] default '{}',
  image_url       text,
  rating          numeric default 0,
  review_count    int default 0,
  created_at      timestamptz default now()
);

alter table public.spaces enable row level security;

-- Anyone (anon + authenticated) can browse spaces
create policy "public_select" on public.spaces
  for select using (true);

-- Only authenticated hosts can insert their own space
create policy "host_insert" on public.spaces
  for insert to authenticated
  with check (auth.uid() = host_id);

-- Only the host can update their own space
create policy "host_update" on public.spaces
  for update to authenticated
  using (auth.uid() = host_id);

grant select on public.spaces to anon;
grant select, insert, update on public.spaces to authenticated;
