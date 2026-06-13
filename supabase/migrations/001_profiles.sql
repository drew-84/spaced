-- Migration 001: profiles table
-- Stores KYC data for each authenticated user.
-- Linked 1-to-1 with auth.users via the same UUID primary key.

create table public.profiles (
  id           uuid references auth.users(id) on delete cascade primary key,
  phone        text,
  country_code text,
  country_name text,
  user_type    text check (user_type in ('guest', 'host')),
  kyc_status   text default 'pending' check (kyc_status in ('pending', 'verified')),
  id_front_url text,
  id_back_url  text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

alter table public.profiles enable row level security;

-- Users can only read/write their own profile row
create policy "owner_select" on public.profiles
  for select using (auth.uid() = id);

create policy "owner_insert" on public.profiles
  for insert with check (auth.uid() = id);

create policy "owner_update" on public.profiles
  for update using (auth.uid() = id);
