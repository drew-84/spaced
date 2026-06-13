import { supabase } from "./supabase";

export async function uploadSpaceCoverPhoto(
  file: File,
  uid: string
): Promise<string | null> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${uid}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("space-images")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) return null;

  const { data } = supabase.storage.from("space-images").getPublicUrl(path);
  return data.publicUrl;
}
