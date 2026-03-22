import type { Space } from "@/lib/types";

export const mockSpaces: Space[] = [
  {
    id: "space-001",
    title: "Quiet Loft - Roma Norte",
    type: "studio",
    area: "Roma Norte",
    distanceKm: 0.8,
    pricePer30m: 14,
    instantAccess: true,
  },
  {
    id: "space-002",
    title: "Private Room - Condesa",
    type: "private-room",
    area: "Condesa",
    distanceKm: 1.4,
    pricePer30m: 12,
    instantAccess: true,
  },
  {
    id: "space-003",
    title: "1BR Apartment - Juarez",
    type: "apartment-1br",
    area: "Juarez",
    distanceKm: 2.2,
    pricePer30m: 18,
    instantAccess: true,
  },
];
