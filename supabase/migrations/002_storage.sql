-- Migration 002: id-photos storage bucket
-- Private bucket for KYC identity document images.
-- Files are stored at {user_id}/front.jpg and {user_id}/back.jpg.

insert into storage.buckets (id, name, public)
values ('id-photos', 'id-photos', false);

-- Only the authenticated owner can upload to their own folder
create policy "owner_upload" on storage.objects
  for insert with check (
    bucket_id = 'id-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Only the authenticated owner can read their own files
create policy "owner_read" on storage.objects
  for select using (
    bucket_id = 'id-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
