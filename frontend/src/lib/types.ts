export type SpaceType = "private-room" | "studio" | "apartment-1br";

export type Review = {
  id: string;
  alias: string;
  rating: number;
  comment: string;
  date: string;
};

export type Space = {
  id: string;
  title: string;
  type: SpaceType;
  area: string;
  distanceKm: number;
  pricePer30m: number;
  instantAccess: boolean;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  description: string;
  amenities: string[];
  reviews: Review[];
};
