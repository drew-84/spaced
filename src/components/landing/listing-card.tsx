"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ListingSpace, SpaceCategory } from "@/lib/mock-spaces";
import {
  CARD_AMENITY_CHIP,
  CARD_MEDIA,
  CARD_MEDIA_SCRIM,
  CARD_PRICE,
  CARD_PRICE_UNIT,
  CARD_TITLE,
  DIVIDER_TOP,
  FOCUS_RING_CARD,
  OVERLAY_ICON,
  OVERLAY_INFO,
  OVERLAY_LABEL,
  OVERLAY_LABEL_SM,
  OVERLAY_PILL,
  OVERLAY_RATING_STARS,
  OVERLAY_RATING_VALUE,
  OVERLAY_TEXT_ACTIVE,
  OVERLAY_TEXT_REST,
  OVERLAY_TEXT_SHADOW,
  STATUS_DOT_SM,
} from "@/styles/glass";

/**
 * SPACED — ListingCard (homepage property grid)
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Image-heavy card: a looping muted video fills the top of the card with
 * four pieces of information overlaid on it, and a deliberately minimal
 * body below (title · ≤3 amenity pills · price).
 *
 * Performance:
 *   • Lazy load — the <video> src is only attached once the card nears
 *     the viewport (a 400px-rootMargin IntersectionObserver), so we don't
 *     fetch ten videos on first paint.
 *   • Play/pause — a second IntersectionObserver plays the clip while the
 *     card is on screen and pauses it the moment it scrolls away, freeing
 *     decode resources.
 *   • Poster fallback — the poster image paints instantly and is also the
 *     graceful fallback if the video errors or no clip exists.
 *
 * Overlay text rests at 75% opacity and brightens to 100% on hover
 * (desktop) or when the card is the actively-viewed card (mobile, coarse
 * pointer) — desktop never uses the "active" brightening so only the
 * hovered card lights up.
 */

export const CATEGORY_ICONS: Record<SpaceCategory, string> = {
  Todos: "◈",
  Descanso: "🛏",
  Cocina: "🍳",
  Oficina: "💻",
  Reunión: "🤝",
  Grabación: "🎙",
};

type CardMedia = {
  url: string;
  poster: string;
};

type ListingCardProps = {
  card: ListingSpace;
  /** First clip of the property — the card preview. */
  media: CardMedia;
  /** Pre-formatted walking distance (e.g. "125 metros" / "1.2 km"), or
   *  null when geolocation is unavailable/denied (distance is hidden). */
  distanceText: string | null;
};

export function ListingCard({ card, media, distanceText }: ListingCardProps) {
  const articleRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  /* shouldLoad gates the lazy video source; active drives play/pause and
     the mobile "actively-viewed" brightening. */
  const [shouldLoad, setShouldLoad] = useState(false);
  const [active, setActive] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);

  // Coarse pointer (touch) → the "active" card brightens its overlay.
  // Fine pointer (mouse) relies purely on hover so only one card lights up.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(hover: none)");
    setIsCoarsePointer(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsCoarsePointer(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Lazy-load: attach the video source once the card approaches the
  // viewport, then stop observing.
  useEffect(() => {
    const el = articleRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Play/pause + active tracking as the card enters/leaves the viewport.
  useEffect(() => {
    const el = articleRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const inView = entry.isIntersecting && entry.intersectionRatio >= 0.5;
          setActive(inView);
          const v = videoRef.current;
          if (!v) continue;
          if (inView) {
            v.play().catch(() => {});
          } else {
            v.pause();
          }
        }
      },
      { threshold: [0, 0.5, 1] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // When the source attaches while the card is already on screen, kick
  // off playback (the IO above won't re-fire without an intersection
  // change).
  useEffect(() => {
    if (shouldLoad && active && !videoFailed) {
      videoRef.current?.play().catch(() => {});
    }
  }, [shouldLoad, active, videoFailed]);

  const showVideo = shouldLoad && !videoFailed && Boolean(media.url);
  const overlayHighlighted = isCoarsePointer && active;

  /* Overlay text recipe — base 75%, brightens to 100% on hover (desktop)
     or when actively viewed (mobile). Both tokens live in glass.ts. */
  const overlayText = overlayHighlighted
    ? OVERLAY_TEXT_ACTIVE
    : OVERLAY_TEXT_REST;

  const pricePer45 = Math.round(card.pricePer30m * 1.5);
  const amenities = card.amenities.slice(0, 3);

  return (
    <Link
      href={`/spaces/${card.id}`}
      aria-label={`Ver ${card.title}`}
      className={`group block rounded-2xl ${FOCUS_RING_CARD}`}
    >
      <article
        ref={articleRef}
        className={`flex h-full flex-col overflow-hidden rounded-2xl ${CARD_MEDIA}`}
      >
        {/* ── Media area — video preview with overlaid info ── */}
        <div className="relative aspect-[4/5] overflow-hidden">
          {/* Poster always paints first; it's also the fallback layer. */}
          <img
            src={media.poster}
            alt={card.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
          {showVideo && (
            <video
              ref={videoRef}
              src={media.url}
              poster={media.poster}
              muted
              loop
              playsInline
              preload="none"
              onError={() => setVideoFailed(true)}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}

          {/* Subtle top + bottom darkening so overlay text stays legible
              over any property image. Kept very light per spec. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: CARD_MEDIA_SCRIM }}
          />

          {/* Top-left: category tag + ACCESO INMEDIATO badge */}
          <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
            <span className={`${OVERLAY_PILL} gap-1.5 px-2.5 py-1`}>
              <span className={OVERLAY_ICON}>
                {CATEGORY_ICONS[card.category]}
              </span>
              <span
                className={`${OVERLAY_LABEL} ${overlayText}`}
                style={{ textShadow: OVERLAY_TEXT_SHADOW }}
              >
                {card.categoryLabel}
              </span>
            </span>
            {card.instantAccess && (
              <span className={`${OVERLAY_PILL} gap-1 px-2 py-1`}>
                <span className={STATUS_DOT_SM} />
                <span
                  className={`${OVERLAY_LABEL_SM} ${overlayText}`}
                  style={{ textShadow: OVERLAY_TEXT_SHADOW }}
                >
                  Acceso inmediato
                </span>
              </span>
            )}
          </div>

          {/* Top-right: star rating "★★★★★ 4.97" */}
          <div
            className={`absolute right-3 top-3 flex items-center gap-1 ${overlayText}`}
            style={{ textShadow: OVERLAY_TEXT_SHADOW }}
          >
            <span className={OVERLAY_RATING_STARS}>★★★★★</span>
            <span className={OVERLAY_RATING_VALUE}>
              {card.rating.toFixed(2)}
            </span>
          </div>

          {/* Bottom-left: neighborhood (plain white, no pill) */}
          <p
            className={`absolute bottom-3 left-3 ${OVERLAY_INFO} ${overlayText}`}
            style={{ textShadow: OVERLAY_TEXT_SHADOW }}
          >
            {card.area}
          </p>

          {/* Bottom-right: distance from user (hidden when unavailable) */}
          {distanceText && (
            <p
              className={`absolute bottom-3 right-3 flex items-center gap-1 ${OVERLAY_INFO} ${overlayText}`}
              style={{ textShadow: OVERLAY_TEXT_SHADOW }}
            >
              <PinIcon />
              {distanceText}
            </p>
          )}
        </div>

        {/* ── Body — minimal: title · amenities · price ── */}
        <div className="flex flex-1 flex-col gap-3 p-5">
          <h3 className={`min-h-[2.5rem] line-clamp-2 ${CARD_TITLE}`}>
            {card.title}
          </h3>

          <div className="flex flex-wrap gap-1">
            {amenities.map((a) => (
              <span key={a} className={CARD_AMENITY_CHIP}>
                {a}
              </span>
            ))}
          </div>

          <div className={`mt-auto flex items-baseline gap-1 pt-3 ${DIVIDER_TOP}`}>
            <span className={CARD_PRICE}>${pricePer45}</span>
            <span className={CARD_PRICE_UNIT}>/ 45min</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function PinIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M6 1C3.93 1 2.25 2.68 2.25 4.75c0 2.6 3.06 5.74 3.19 5.87a.78.78 0 0 0 1.12 0c.13-.13 3.19-3.27 3.19-5.87C9.75 2.68 8.07 1 6 1Zm0 5.13a1.38 1.38 0 1 1 0-2.76 1.38 1.38 0 0 1 0 2.76Z"
        fill="currentColor"
      />
    </svg>
  );
}
