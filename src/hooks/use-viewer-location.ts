"use client";

import { useEffect, useState } from "react";
import { DEFAULT_MAP_CENTER, type LatLng } from "@/lib/geo";

export type ViewerLocationSource = "gps" | "default";

export function useViewerLocation() {
  const [origin, setOrigin] = useState<LatLng>(DEFAULT_MAP_CENTER);
  const [source, setSource] = useState<ViewerLocationSource>("default");

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOrigin({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setSource("gps");
      },
      () => {
        /* keep default center */
      },
      { enableHighAccuracy: false, maximumAge: 300_000, timeout: 12_000 },
    );
  }, []);

  return { origin, source };
}
