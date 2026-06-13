import { supabase } from "./supabase";
import type { Space } from "./types";

type SpaceRow = {
  id: string;
  title: string;
  description: string | null;
  type: string | null;
  stay_type: string;
  area: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
  price_per_30m: number | null;
  price_per_night: number | null;
  min_nights: number | null;
  instant_access: boolean;
  amenities: string[];
  image_url: string | null;
  rating: number;
  review_count: number;
};

function rowToSpace(row: SpaceRow): Space {
  const base = {
    id: row.id,
    title: row.title,
    type: (row.type ?? "studio") as Space["type"],
    area: row.area ?? "",
    lat: row.lat ?? 0,
    lng: row.lng ?? 0,
    instantAccess: row.instant_access,
    imageUrl: row.image_url ?? "",
    rating: row.rating,
    reviewCount: row.review_count,
    description: row.description ?? "",
    amenities: row.amenities ?? [],
    reviews: [],
  };

  if (row.stay_type === "nightly") {
    return {
      ...base,
      stayType: "nightly",
      pricePerNight: row.price_per_night ?? 0,
      minNights: row.min_nights ?? 1,
    };
  }

  return {
    ...base,
    stayType: "hourly",
    pricePer30m: row.price_per_30m ?? 0,
  };
}

export async function fetchSpaces(): Promise<Space[]> {
  const { data, error } = await supabase
    .from("spaces")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map(rowToSpace);
}

export async function fetchSpaceById(id: string): Promise<Space | null> {
  const { data, error } = await supabase
    .from("spaces")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return rowToSpace(data);
}
