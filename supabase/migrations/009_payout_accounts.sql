-- Migration 009: payout_accounts table
-- Bank details where a host receives booking payouts (step 7 of the Ofrecer wizard).
-- SENSITIVE: kept off the public spaces table. Owner-only RLS — a host can read/write
-- only their own row; the public listing read never touches this table.

create table public.payout_accounts (
  host_id        uuid references public.profiles(id) on delete cascade primary key,
  titular        text not null,
  banco          text not null,
  numero_cuenta  text not null,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

alter table public.payout_accounts enable row level security;

-- A host can only see their own payout account
create policy "owner_select" on public.payout_accounts
  for select to authenticated
  using (auth.uid() = host_id);

-- A host can only insert their own payout account
create policy "owner_insert" on public.payout_accounts
  for insert to authenticated
  with check (auth.uid() = host_id);

-- A host can only update their own payout account
create policy "owner_update" on public.payout_accounts
  for update to authenticated
  using (auth.uid() = host_id);

-- Explicit grants (project has "expose new tables" disabled — see 003)
grant select, insert, update on public.payout_accounts to authenticated;
