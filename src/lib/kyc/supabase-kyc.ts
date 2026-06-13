import { supabase } from "@/lib/supabase";
import type { KYCCompletePayload } from "@/components/kyc/KYCScreen";

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/jpeg";
  const bytes = atob(data);
  const buf = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) buf[i] = bytes.charCodeAt(i);
  return new Blob([buf], { type: mime });
}

async function uploadIdPhoto(
  uid: string,
  side: "front" | "back",
  dataUrl: string
): Promise<string | null> {
  const blob = dataUrlToBlob(dataUrl);
  const ext = blob.type.split("/")[1] ?? "jpg";
  const path = `${uid}/${side}.${ext}`;

  const { error } = await supabase.storage
    .from("id-photos")
    .upload(path, blob, { upsert: true, contentType: blob.type });

  if (error) return null;

  const { data } = supabase.storage.from("id-photos").getPublicUrl(path);
  return data.publicUrl;
}

export async function submitKyc(
  payload: KYCCompletePayload,
  userType: "guest" | "host"
): Promise<{ error: string | null }> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: "No hay sesión activa." };

  const [frontUrl, backUrl] = await Promise.all([
    payload.idFront ? uploadIdPhoto(user.id, "front", payload.idFront) : Promise.resolve(null),
    payload.idBack  ? uploadIdPhoto(user.id, "back",  payload.idBack)  : Promise.resolve(null),
  ]);

  const { error: upsertError } = await supabase.from("profiles").upsert({
    id:           user.id,
    phone:        payload.phone,
    country_code: payload.country.iso2,
    country_name: payload.country.name,
    user_type:    userType,
    kyc_status:   "verified",
    id_front_url: frontUrl,
    id_back_url:  backUrl,
    updated_at:   new Date().toISOString(),
  });

  if (upsertError) return { error: upsertError.message };
  return { error: null };
}
