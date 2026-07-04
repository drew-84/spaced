import { supabase } from "./supabase";

/**
 * Uploads a single walkthrough clip to the public `space-videos` bucket.
 * Path: {uid}/{timestamp}.{ext} — mirrors uploadSpaceCoverPhoto.
 */
async function uploadOne(file: File, uid: string): Promise<string | null> {
  const ext = file.name.split(".").pop() ?? "mp4";
  const path = `${uid}/${Date.now()}-${Math.round(performance.now())}.${ext}`;

  const { error } = await supabase.storage
    .from("space-videos")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) return null;

  const { data } = supabase.storage.from("space-videos").getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Uploads all provided video clips and returns their public URLs.
 * Failed uploads are dropped; order is preserved for successes.
 */
export async function uploadSpaceVideos(
  files: File[],
  uid: string,
): Promise<string[]> {
  const urls = await Promise.all(files.map((f) => uploadOne(f, uid)));
  return urls.filter((u): u is string => u !== null);
}
