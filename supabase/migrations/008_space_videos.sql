-- Migration 008: space-videos storage bucket
-- Public bucket for space walkthrough clips (step 4 of the Ofrecer wizard).
-- Files stored at {user_id}/{timestamp}.{ext} — public read, owner upload.
-- Mirrors the space-images bucket (006).

insert into storage.buckets (id, name, public)
values ('space-videos', 'space-videos', true)
on conflict (id) do nothing;

-- Authenticated hosts can upload to their own folder
create policy "space_videos_host_upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'space-videos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Anyone can read space videos (listings are public)
create policy "space_videos_public_read" on storage.objects
  for select using (bucket_id = 'space-videos');
