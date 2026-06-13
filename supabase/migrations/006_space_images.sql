-- Migration 006: space-images storage bucket
-- Public bucket for space cover photos.
-- Files stored at {user_id}/{timestamp}.{ext} — public read, owner upload.

insert into storage.buckets (id, name, public)
values ('space-images', 'space-images', true);

-- Authenticated hosts can upload to their own folder
create policy "host_upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'space-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Anyone can read space images (listings are public)
create policy "public_read" on storage.objects
  for select using (bucket_id = 'space-images');
