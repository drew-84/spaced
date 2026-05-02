export type SpaceType =
  | "private-room"
  | "studio"
  | "apartment-1br"
  | "house"
  | "rest-room"
  | "kitchen"
  | "office"
  | "meeting-room"
  | "recording-studio"
  | "podcast-studio"
  | "coworking";

export type Review = {
  id: string;
  alias: string;
  rating: number;
  comment: string;
  date: string;
};

type SpaceCommon = {
  id: string;
  title: string;
  type: SpaceType;
  area: string;
  /** WGS84 latitude */
  lat: number;
  /** WGS84 longitude */
  lng: number;
  instantAccess: boolean;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  description: string;
  amenities: string[];
  reviews: Review[];
};

/** Short blocks (hours) — priced per 30 minutes */
export type HourlySpace = SpaceCommon & {
  stayType: "hourly";
  pricePer30m: number;
};

/** Short stays (nights) — apartments, houses, whole units */
export type NightlySpace = SpaceCommon & {
  stayType: "nightly";
  pricePerNight: number;
  /** Minimum nights for this short-term stay */
  minNights: number;
};

export type Space = HourlySpace | NightlySpace;
