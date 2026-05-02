/** Reference point when the user has not shared location (Ciudad de México centro). */
export const DEFAULT_MAP_CENTER = {
  lat: 19.432608,
  lng: -99.133209,
} as const;

export type LatLng = { lat: number; lng: number };

/**
 * Great-circle distance between two WGS84 points, in kilometers.
 */
export function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = deg2rad(b.lat - a.lat);
  const dLng = deg2rad(b.lng - a.lng);
  const lat1 = deg2rad(a.lat);
  const lat2 = deg2rad(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function deg2rad(d: number) {
  return (d * Math.PI) / 180;
}
