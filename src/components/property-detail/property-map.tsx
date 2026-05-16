"use client";

import { useMemo } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";

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
          <p className="text-[10px] uppercase tracking-[0.42em] text-sky-100/55">
            Mapa no disponible
          </p>
          <p className="mt-2 text-sm font-light tracking-[0.04em] text-white/55">
            Ubicación aproximada · {area}, {city}
          </p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.24em] text-white/30">
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
      <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.3em] text-rose-100/55">
        Error al cargar el mapa
      </div>
    );
  }
  if (!isLoaded) {
    return (
      <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.3em] text-white/35">
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
        <p className="text-[10px] uppercase tracking-[0.42em] text-sky-100/55">
          Ubicación aproximada
        </p>
        <p className="text-[10px] uppercase tracking-[0.24em] text-white/30">
          {area} · {city}
        </p>
      </div>
      <div
        /* Outer frame mirrors the modal's right inner-card recipe */
        className="relative h-[320px] overflow-hidden rounded-[28px] border border-sky-100/[0.075] bg-white/[0.018] shadow-[0_28px_80px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.11),inset_0_-28px_70px_rgba(2,6,16,0.32)] backdrop-blur-xl sm:h-[380px]"
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
        {/* Glow ring marker — replaces the default Google red pin so the whole
            map reads as glass. Animated via inline keyframes below. */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <span className="block h-32 w-32 rounded-full border border-sky-200/30 [animation:mapPulse_3.8s_ease-in-out_infinite] [box-shadow:0_0_42px_-2px_rgba(96,165,250,0.45),inset_0_0_24px_rgba(96,165,250,0.18)]" />
          <span className="absolute left-1/2 top-1/2 block h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-100 shadow-[0_0_18px_rgba(186,230,253,0.95),0_0_32px_rgba(96,165,250,0.6)]" />
        </div>
        {/* Top rim highlight */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
        />
      </div>
      <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">
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
