"use client";

import { useViewerLocation } from "@/hooks/use-viewer-location";
import { distanceKm } from "@/lib/geo";

type SpaceDistanceProps = {
  lat: number;
  lng: number;
};

export function SpaceDistance({ lat, lng }: SpaceDistanceProps) {
  const { origin, source } = useViewerLocation();
  const km = distanceKm(origin, { lat, lng });

  return (
    <span>
      {km.toFixed(1)} km {source === "gps" ? "de ti" : "(aprox.)"}
    </span>
  );
}
