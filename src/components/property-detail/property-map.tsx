"use client";

import { useMemo } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import {
  GLASS_PANEL,
  RIM_HIGHLIGHT_TOP,
  TEXT_EYEBROW,
  TEXT_HINT,
  TEXT_LABEL,
} from "@/styles/glass";

type Props = {
  lat: number;
  lng: number;
  area: string;
  city: string;
};

/**
 * Translucent dark map.
 *  - Custom Google Maps style → deep navy geometry, sky-tinted labels.
 *  - Outer frame matches the modal's inner-card glass recipe.
 *  - Three overlays sit on top of the embed: ambient gradient wash,
 *    edge-vignette mask, and an animated approximation ring/pulse marker
 *    so the dark glass aesthetic feels native (no default red Google pin).
 */
const DARK_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#0a1220" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#3a5070" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#02050d" }] },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1a2a45" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#7393c5" }],
  },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#0d1a2c" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#16243a" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#0c1626" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4a6790" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#1f3357" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#86a5d4" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#101b2e" }],
  },
  {
    featureType: "transit",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3c5478" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#020812" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4a6790" }],
  },
];

function MapFallback({ area, city }: { area: string; city: string }) {
  return (
    <div className="relative h-full w-full">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(36,72,128,0.32), transparent 70%), repeating-linear-gradient(122deg, rgba(255,255,255,0.018) 0 1px, transparent 1px 64px), #060b16",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
        <div>
          <p className={`${TEXT_EYEBROW} tracking-[0.42em]`}>
            Mapa no disponible
          </p>
          <p className="mt-2 text-sm font-light tracking-[0.04em] text-white/80">
            Ubicación aproximada · {area}, {city}
          </p>
          <p className={`mt-2 ${TEXT_HINT}`}>
            Agrega NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para activar el mapa.
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleMapView({
  apiKey,
  lat,
  lng,
}: {
  apiKey: string;
  lat: number;
  lng: number;
}) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "spaced-google-maps-script",
    googleMapsApiKey: apiKey,
    language: "es",
    region: "MX",
  });

  const options = useMemo<google.maps.MapOptions>(
    () => ({
      styles: DARK_MAP_STYLE,
      disableDefaultUI: true,
      zoomControl: false,
      gestureHandling: "cooperative",
      backgroundColor: "#02050d",
      clickableIcons: false,
    }),
    [],
  );

  if (loadError) {
    return (
      <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.3em] text-rose-200/80">
        Error al cargar el mapa
      </div>
    );
  }
  if (!isLoaded) {
    return (
      <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.3em] text-white">
        Cargando mapa…
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerClassName="absolute inset-0 h-full w-full"
      center={{ lat, lng }}
      zoom={14}
      options={options}
    />
  );
}

export function PropertyMap({ lat, lng, area, city }: Props) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <section aria-label="Ubicación aproximada" className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className={`${TEXT_EYEBROW} tracking-[0.42em]`}>
          Ubicación aproximada
        </p>
        <p className={TEXT_LABEL}>
          {area} · {city}
        </p>
      </div>
      <div
        /* Outer frame uses the shared glass panel recipe */
        className={`relative h-[320px] overflow-hidden ${GLASS_PANEL} sm:h-[380px]`}
      >
        {apiKey ? (
          <GoogleMapView apiKey={apiKey} lat={lat} lng={lng} />
        ) : (
          <MapFallback area={area} city={city} />
        )}

        {/* Translucent dark wash + edge vignette on top of the embed */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(2,5,13,0.05), rgba(2,5,13,0.55) 100%), linear-gradient(180deg, rgba(2,5,13,0.18) 0%, transparent 30%, transparent 70%, rgba(2,5,13,0.42) 100%)",
          }}
        />
        {/* Glow ring marker — white pulsing glass marker */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <span className="block h-32 w-32 rounded-full border border-white/30 [animation:mapPulse_3.8s_ease-in-out_infinite] [box-shadow:0_0_42px_-2px_rgba(255,255,255,0.5),inset_0_0_24px_rgba(255,255,255,0.18)]" />
          <span className="absolute left-1/2 top-1/2 block h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.95),0_0_32px_rgba(255,255,255,0.55)]" />
        </div>
        <span aria-hidden className={RIM_HIGHLIGHT_TOP} />
      </div>
      <p className={TEXT_HINT}>
        La ubicación exacta se revela tras la confirmación de la reserva.
      </p>

      <style>{`
        @keyframes mapPulse {
          0%, 100% { transform: scale(0.92); opacity: 0.65; }
          50%      { transform: scale(1.08); opacity: 1; }
        }
      `}</style>
    </section>
  );
}
