"use client";

import { useEffect, useMemo, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { DEFAULT_MAP_CENTER, type LatLng } from "@/lib/geo";

type GeoState = "pending" | "gps" | "fallback";

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  gestureHandling: "cooperative" as const,
};

function MapFallback({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex h-full min-h-[240px] w-full flex-col justify-between rounded-[2rem] bg-gradient-to-br from-stone-200 via-[#e8e4dc] to-amber-100/70 p-1 shadow-[0_24px_60px_-12px_rgba(28,25,23,0.18)] ring-1 ring-stone-300/40">
      <div className="flex flex-1 flex-col items-center justify-center rounded-[1.85rem] bg-stone-100/80 px-4 text-center">
        <p className="text-sm font-medium text-stone-700">{title}</p>
        {subtitle ? (
          <p className="mt-2 text-xs leading-relaxed text-stone-500">{subtitle}</p>
        ) : null}
      </div>
      <div className="rounded-2xl bg-white/85 p-4 shadow-lg ring-1 ring-stone-200/80 backdrop-blur-sm">
        <div className="h-2 w-1/3 rounded-full bg-stone-300/80" />
        <div className="mt-3 h-2 w-2/3 rounded-full bg-stone-200/90" />
      </div>
    </div>
  );
}

function GoogleMapView({ apiKey }: { apiKey: string }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "spaced-google-maps-script",
    googleMapsApiKey: apiKey,
    language: "es",
    region: "MX",
  });

  const [center, setCenter] = useState<LatLng>(DEFAULT_MAP_CENTER);
  const [geoState, setGeoState] = useState<GeoState>("pending");

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoState("fallback");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setGeoState("gps");
      },
      () => setGeoState("fallback"),
      { enableHighAccuracy: false, maximumAge: 120_000, timeout: 12_000 },
    );
  }, []);

  const zoom = useMemo(() => (geoState === "gps" ? 15 : 13), [geoState]);

  if (loadError) {
    return (
      <MapFallback
        title="No se pudo cargar Google Maps"
        subtitle="Comprueba la clave de API y la facturación en Google Cloud."
      />
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full min-h-[240px] items-center justify-center rounded-[2rem] bg-stone-100 ring-1 ring-stone-200/80">
        <p className="text-sm text-stone-600">Cargando mapa…</p>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[240px] w-full overflow-hidden rounded-[2rem] shadow-[0_24px_60px_-12px_rgba(28,25,23,0.18)] ring-1 ring-stone-300/40 [&_.gm-style]:rounded-[2rem]">
      <GoogleMap
        mapContainerClassName="h-full w-full min-h-[220px]"
        center={center}
        zoom={zoom}
        options={mapOptions}
      >
        <Marker position={center} title="Tu ubicación" />
      </GoogleMap>
      <div className="pointer-events-none absolute bottom-3 left-3 right-3 rounded-xl bg-white/90 px-3 py-2 text-center text-[11px] leading-snug text-stone-600 shadow-sm ring-1 ring-stone-200/80 backdrop-blur-sm">
        {geoState === "pending" && "Obteniendo tu ubicación…"}
        {geoState === "gps" && "Mapa centrado en tu ubicación actual."}
        {geoState === "fallback" &&
          "Ubicación aproximada (centro CDMX). Activa el permiso de ubicación en el navegador para ver tu posición."}
      </div>
    </div>
  );
}

export function HeroLocationMap() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="h-full w-full">
        <MapFallback
          title="Mapa no configurado"
          subtitle="Añade NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en .env.local (Google Cloud Console → Maps JavaScript API)."
        />
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <GoogleMapView apiKey={apiKey} />
    </div>
  );
}
