-- Migration 003: grants + storage policy fix
--
-- Required because "Automatically expose new tables" was disabled at project
-- creation, so the authenticated role needs explicit table-level grants.
-- Storage policies also need the `to authenticated` qualifier to work correctly.

-- Grant table access to authenticated users
grant usage on schema public to authenticated;
grant select, insert, update on public.profiles to authenticated;

-- Drop and recreate storage policies with explicit role binding
drop policy if exists "owner_upload" on storage.objects;
drop policy if exists "owner_read"   on storage.objects;

create policy "owner_upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'id-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "owner_read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'id-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
