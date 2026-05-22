"use client";

import { useEffect, useMemo, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { GLASS_PANEL, TEXT_BODY } from "@/styles/glass";
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
    <div
      className={`flex h-full min-h-[240px] w-full flex-col justify-between ${GLASS_PANEL} p-1`}
    >
      <div className="flex flex-1 flex-col items-center justify-center rounded-[1.85rem] bg-white/[0.03] px-4 text-center">
        <p className="text-sm font-medium text-white/80">{title}</p>
        {subtitle ? (
          <p className={`mt-2 text-xs leading-relaxed ${TEXT_BODY}`}>
            {subtitle}
          </p>
        ) : null}
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-sm">
        <div className="h-2 w-1/3 rounded-full bg-white/30" />
        <div className="mt-3 h-2 w-2/3 rounded-full bg-white/20" />
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
      <div className="flex h-full min-h-[240px] items-center justify-center rounded-[2rem] border border-white/10 bg-white/[0.03]">
        <p className={`text-sm ${TEXT_BODY}`}>Cargando mapa…</p>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[240px] w-full overflow-hidden rounded-[2rem] border border-white/15 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.5)] [&_.gm-style]:rounded-[2rem]">
      <GoogleMap
        mapContainerClassName="h-full w-full min-h-[220px]"
        center={center}
        zoom={zoom}
        options={mapOptions}
      >
        <Marker position={center} title="Tu ubicación" />
      </GoogleMap>
      <div
        className="pointer-events-none absolute bottom-3 left-3 right-3 rounded-xl border border-white/10 bg-[#02050d]/85 px-3 py-2 text-center text-[11px] leading-snug shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-sm"
      >
        <span className="text-white/70">
          {geoState === "pending" && "Obteniendo tu ubicación…"}
          {geoState === "gps" && "Mapa centrado en tu ubicación actual."}
          {geoState === "fallback" &&
            "Ubicación aproximada (centro CDMX). Activa el permiso de ubicación en el navegador para ver tu posición."}
        </span>
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
