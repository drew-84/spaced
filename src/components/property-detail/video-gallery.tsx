"use client";

import { useEffect, useRef, useState } from "react";
import { GLASS_PANEL, RIM_HIGHLIGHT_TOP } from "@/styles/glass";
import type { PropertyVideo } from "./types";

type Props = {
  videos: PropertyVideo[];
};

/**
 * Compact video gallery — main player + thumbnail row.
 *
 * Outer frame uses the shared GLASS_PANEL recipe from `src/styles/glass.ts`.
 * Contained on purpose — capped width keeps gallery from dominating.
 */
export function VideoGallery({ videos }: Props) {
  const [active, setActive] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const current = videos[active];
  const hasVideo = Boolean(current?.url);

  /* Each time the active source changes, reload + try to autoplay (muted).
     Skipped for poster-only entries (no uploaded clip → just the image). */
  useEffect(() => {
    if (!hasVideo) return;
    const el = videoRef.current;
    if (!el) return;
    el.load();
    void el.play().catch(() => {});
  }, [active, hasVideo]);

  if (videos.length === 0) return null;

  return (
    <section aria-label="Galería del espacio" className="mx-auto w-full max-w-[760px]">
      <div className={`relative overflow-hidden ${GLASS_PANEL}`}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 38% at 78% 0%, rgba(255,255,255,0.08), transparent 60%), linear-gradient(150deg, transparent 0%, transparent 60%, rgba(255,255,255,0.04) 100%)",
          }}
        />
        <span aria-hidden className={`z-10 ${RIM_HIGHLIGHT_TOP}`} />

        <div className="relative aspect-video w-full">
          {hasVideo ? (
            <video
              ref={videoRef}
              key={current.id}
              src={current.url}
              poster={current.poster}
              className="absolute inset-0 h-full w-full object-cover"
              playsInline
              muted
              loop
              autoPlay
              controls
            />
          ) : (
            <img
              key={current.id}
              src={current.poster}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          {/* Soft bottom gradient so future overlays/captions stay readable */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#02050d]/55 via-transparent to-transparent"
          />
        </div>
      </div>

      {videos.length > 1 && (
        <div
          role="tablist"
          aria-label="Selecciona un clip"
          className="mt-4 flex items-center justify-center gap-3"
        >
          {videos.map((v, i) => {
            const isActive = i === active;
            return (
              <button
                key={v.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(i)}
                className={[
                  "group relative h-16 w-24 shrink-0 overflow-hidden rounded-[14px] border outline-none",
                  "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
                  "focus-visible:ring-1 focus-visible:ring-white/40",
                  isActive
                    ? "border-white/45 opacity-100 shadow-[0_10px_28px_rgba(0,0,0,0.34),0_0_22px_-4px_rgba(255,255,255,0.55),inset_0_1px_0_rgba(255,255,255,0.22)]"
                    : "border-white/15 opacity-70 shadow-[0_6px_16px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.1)] hover:border-white/40 hover:opacity-100",
                ].join(" ")}
              >
                <span
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${v.poster})` }}
                  aria-hidden
                />
                <span
                  aria-hidden
                  className={[
                    "pointer-events-none absolute inset-0 transition-colors duration-300",
                    isActive
                      ? "bg-gradient-to-t from-[#02050d]/30 via-transparent to-transparent"
                      : "bg-[#02050d]/40",
                  ].join(" ")}
                />
                {/* Tiny active dot */}
                <span
                  aria-hidden
                  className={[
                    "absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full transition-all duration-300 ease-out",
                    isActive
                      ? "bg-white shadow-[0_0_10px_rgba(255,255,255,0.85)]"
                      : "bg-white/40",
                  ].join(" ")}
                />
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
