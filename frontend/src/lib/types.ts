export type SpaceType = "private-room" | "studio" | "apartment-1br";

export type Space = {
  id: string;
  title: string;
  type: SpaceType;
  area: string;
  distanceKm: number;
  pricePer30m: number;
  instantAccess: boolean;
};
