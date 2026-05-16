"use client";

import { useEffect, useRef, useState } from "react";
import type { PropertyVideo } from "./types";

type Props = {
  videos: PropertyVideo[];
};

/**
 * Compact video gallery — main player + thumbnail row.
 * Style lifted from the OFRECER modal's inner cards:
 *   rounded-[32px] border border-sky-100/[0.075] bg-white/[0.026]
 *   shadow-[0_28px_80px_..., inset_..._70px_rgba(2,6,16,0.32)]
 *   backdrop-blur-xl
 * Contained on purpose — capped width keeps gallery from dominating.
 */
export function VideoGallery({ videos }: Props) {
  const [active, setActive] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  /* Each time the active source changes, reload + try to autoplay (muted). */
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.load();
    void el.play().catch(() => {});
  }, [active]);

  if (videos.length === 0) return null;
  const current = videos[active];

  return (
    <section aria-label="Galería del espacio" className="mx-auto w-full max-w-[760px]">
      <div className="relative overflow-hidden rounded-[28px] border border-sky-100/[0.075] bg-white/[0.026] shadow-[0_28px_80px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.11),inset_0_-28px_70px_rgba(2,6,16,0.32)] backdrop-blur-xl">
        {/* Inner ambient wash (matches modal recipe) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 38% at 78% 0%, rgba(147,197,253,0.1), transparent 60%), linear-gradient(150deg, transparent 0%, transparent 60%, rgba(96,165,250,0.05) 100%)",
          }}
        />
        {/* Top rim highlight */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-10 top-0 z-10 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent"
        />

        <div className="relative aspect-video w-full">
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
                  "transition-[border-color,box-shadow,opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                  "focus-visible:ring-1 focus-visible:ring-sky-200/40",
                  isActive
                    ? "border-sky-100/45 opacity-100 shadow-[0_10px_28px_rgba(0,0,0,0.34),0_0_22px_-4px_rgba(96,165,250,0.5),inset_0_1px_0_rgba(255,255,255,0.18)]"
                    : "border-white/[0.07] opacity-55 shadow-[0_6px_16px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-sky-100/30 hover:opacity-90",
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
                    "absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full transition-[background-color,box-shadow] duration-300",
                    isActive
                      ? "bg-sky-100/95 shadow-[0_0_10px_rgba(140,190,255,0.85)]"
                      : "bg-white/30",
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
