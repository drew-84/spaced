"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import {
  SPACE_CATEGORIES,
  listingSpaces,
  type SpaceCategory,
} from "@/lib/mock-spaces";
import { buildPropertyDetailFromListing } from "@/components/property-detail/types";
import { distanceKm, type LatLng } from "@/lib/geo";
import { CATEGORY_ICONS, ListingCard } from "./listing-card";
import {
  CTA_PRIMARY,
  CTA_SECONDARY,
  TEXT_BODY,
  TEXT_EYEBROW,
  TEXT_HINT,
  TRANSITION_FLUID,
} from "@/styles/glass";

type PreviewMedia = {
  url: string;
  poster: string;
  lat: number;
  lng: number;
};

/* Format a metric distance per spec: under 1 km → "125 metros",
   otherwise one-decimal km → "1.2 km". */
function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} metros`;
  return `${(meters / 1000).toFixed(1)} km`;
}

/** Dev-only distance diagnostics — never logs in production. Helps
 *  distinguish "GPS blocked" from "Distance Matrix not enabled". */
function devDistanceLog(
  level: "warn" | "debug",
  message: string,
  detail?: unknown,
) {
  if (process.env.NODE_ENV !== "development") return;
  const prefix = "[Spaced · distances]";
  if (level === "warn") {
    console.warn(prefix, message, detail ?? "");
  } else {
    console.debug(prefix, message, detail ?? "");
  }
}

export function HostCardsSection() {
  const [active, setActive] = useState<SpaceCategory>("Todos");
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  /* Distance cache for the session, keyed by listing id. Populated once
     by a single batched Distance Matrix request. */
  const [distances, setDistances] = useState<Record<string, string>>({});

  /* Card preview media + coordinates, derived once from the same
     PropertyDetail recipe the detail page uses — so a card's preview
     clip is exactly that property's first clip, and its coordinates
     match the detail map. */
  const previews = useMemo(() => {
    const map = new Map<string, PreviewMedia>();
    for (const listing of listingSpaces) {
      const detail = buildPropertyDetailFromListing(listing);
      const first = detail.videos[0];
      map.set(listing.id, {
        url: first?.url ?? "",
        poster: first?.poster ?? listing.imageUrl,
        lat: detail.lat,
        lng: detail.lng,
      });
    }
    return map;
  }, []);

  /* Load the Maps JS API (Distance Matrix lives in core). Same loader
     id/key/options as HeroLocationMap + PropertyMap so they all share
     one script singleton. */
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { isLoaded } = useJsApiLoader({
    id: "spaced-google-maps-script",
    googleMapsApiKey: apiKey ?? "",
    language: "es",
    region: "MX",
  });

  /* One batched Distance Matrix call per session. requestedRef guards
     against re-firing on re-renders (filtering, typing, etc.). */
  const requestedRef = useRef(false);
  useEffect(() => {
    if (!isLoaded) return;
    if (!apiKey) {
      devDistanceLog(
        "warn",
        "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is missing — card distances disabled.",
      );
      return;
    }
    if (requestedRef.current) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      devDistanceLog(
        "debug",
        "Geolocation unavailable in this browser — card distances hidden.",
      );
      return;
    }
    requestedRef.current = true;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const origin: LatLng = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        /* Batch ALL listings into ONE request (≤25 destinations). */
        const ordered = listingSpaces.map((l) => previews.get(l.id)!);
        const service = new google.maps.DistanceMatrixService();
        service.getDistanceMatrix(
          {
            origins: [origin],
            destinations: ordered.map((p) => ({ lat: p.lat, lng: p.lng })),
            travelMode: google.maps.TravelMode.WALKING,
          },
          (res, status) => {
            if (status !== "OK" || !res) {
              devDistanceLog(
                "warn",
                "Distance Matrix request failed — enable Distance Matrix API on the key and check billing/referrer restrictions.",
                { status },
              );
              return;
            }
            const row = res.rows[0];
            if (!row) return;
            const next: Record<string, string> = {};
            let fallbackCount = 0;
            row.elements.forEach((el, i) => {
              const listing = listingSpaces[i];
              const p = ordered[i];
              let meters: number;
              if (el.status === "OK" && el.distance) {
                meters = el.distance.value;
              } else {
                fallbackCount += 1;
                /* WALKING can return no route for far points — fall back
                   to straight-line distance so the card still shows
                   something sensible. */
                meters = distanceKm(origin, { lat: p.lat, lng: p.lng }) * 1000;
              }
              next[listing.id] = formatDistance(meters);
            });
            setDistances(next);
            devDistanceLog(
              "debug",
              `Walking distances loaded for ${Object.keys(next).length} listings.`,
              fallbackCount > 0
                ? { straightLineFallbacks: fallbackCount }
                : undefined,
            );
          },
        );
      },
      (err) => {
        /* Permission denied → leave distances empty so cards hide the
           distance line. The GPS-denied neighborhood selector is a
           separate feature. */
        devDistanceLog(
          "debug",
          "Geolocation denied or unavailable — card distances hidden (expected if you blocked location).",
          { code: err.code, message: err.message },
        );
      },
      { enableHighAccuracy: false, maximumAge: 120_000, timeout: 12_000 },
    );
  }, [isLoaded, apiKey, previews]);

  const filtered = listingSpaces.filter((s) => {
    const matchesCategory = active === "Todos" || s.category === active;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      q === "" ||
      s.title.toLowerCase().includes(q) ||
      s.area.toLowerCase().includes(q) ||
      s.categoryLabel.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  return (
    <section
      id="spaces"
      /* `scroll-mt-16` clears the sticky TopNav (~3.5rem tall) so the
         anchor target lands just above the heading + search bar + pill
         filters instead of behind the nav bar. */
      className="relative scroll-mt-16 overflow-hidden bg-[#06070a] py-24 sm:py-32"
    >
      {/* top line — neutral white wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent 0%, rgba(255,255,255,0.12) 30%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.12) 70%, transparent 100%)",
        }}
      />
      {/* ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[360px] w-[800px] -translate-x-1/2 opacity-[0.18]"
        style={{
          background:
            "radial-gradient(ellipse at center top, rgba(255,255,255,0.35), transparent 65%)",
        }}
      />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 sm:px-8">
        {/* heading + CTA */}
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <p className={`${TEXT_EYEBROW} tracking-[0.55em]`}>Publicaciones</p>
            <h2 className="text-3xl font-semibold leading-tight text-white/95 sm:text-4xl">
              Espacios disponibles
              <br />
              <span className="text-white/95">registrados por hosts</span>
            </h2>
            <p className={`max-w-sm text-sm leading-relaxed ${TEXT_BODY}`}>
              Cada publicación fue creada por un host real. Elige el tipo de
              espacio que necesitas y reserva en segundos.
            </p>
          </div>

          <Link href="/ofrecer" className={`shrink-0 ${CTA_PRIMARY}`}>
            Publicar mi espacio →
          </Link>
        </div>

        {/* search bar */}
        <div
          className={[
            "flex items-center gap-3 rounded-2xl border px-5 py-3.5",
            "transition-all duration-300 ease-out motion-reduce:transition-none",
            focused
              ? "border-white/40 bg-white/[0.06] shadow-[0_0_24px_-6px_rgba(255,255,255,0.4),inset_0_1px_0_rgba(255,255,255,0.18)]"
              : "border-white/10 bg-white/[0.03]",
          ].join(" ")}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden
            className="shrink-0 text-white/70"
          >
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M11 11L14.5 14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Busca por nombre, colonia o tipo de espacio…"
            className="flex-1 bg-transparent text-sm text-white/95 placeholder:text-white/35 outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Limpiar búsqueda"
              className="shrink-0 rounded-lg p-1 text-white/60 transition-colors duration-300 ease-out hover:text-white"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        {/* filter tab bar — floating frosted-glass surface */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            role="tablist"
            aria-label="Filtrar por categoría"
            className="relative inline-flex flex-wrap items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.7),0_8px_24px_-12px_rgba(0,0,0,0.45),0_2px_6px_-2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/22 to-transparent"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-black/40 to-transparent"
            />
            {SPACE_CATEGORIES.map((cat) => {
              const isActive = active === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(cat)}
                  className={[
                    "group relative flex items-center gap-1.5 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] outline-none",
                    TRANSITION_FLUID,
                    "focus-visible:ring-1 focus-visible:ring-white/40",
                    isActive
                      ? "border border-white/40 bg-gradient-to-b from-white/[0.18] via-white/[0.08] to-white/[0.04] text-white/95 shadow-[0_2px_10px_-2px_rgba(255,255,255,0.35),0_0_24px_-6px_rgba(255,255,255,0.5),0_0_56px_-12px_rgba(255,255,255,0.32),inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl"
                      : "border border-transparent text-white/60 hover:text-white hover:bg-white/[0.05] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]",
                  ].join(" ")}
                >
                  {isActive && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.22),transparent_70%)]"
                    />
                  )}
                  <span className="relative opacity-90">{CATEGORY_ICONS[cat]}</span>
                  <span className="relative">{cat}</span>
                </button>
              );
            })}
          </div>
          <span className={TEXT_HINT}>
            {filtered.length} espacio{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* cards grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 [&>*:nth-child(n+5)]:hidden [&>*:nth-child(n+5)]:xl:block sm:[&>*:nth-child(n+5)]:block">
          {filtered.map((card) => {
            const preview = previews.get(card.id)!;
            return (
              <ListingCard
                key={card.id}
                card={card}
                media={{ url: preview.url, poster: preview.poster }}
                distanceText={distances[card.id] ?? null}
              />
            );
          })}
        </div>

        {/* bottom CTA */}
        <div className="flex justify-center">
          <button type="button" className={CTA_SECONDARY}>
            Ver todos los espacios
          </button>
        </div>
      </div>
    </section>
  );
}
