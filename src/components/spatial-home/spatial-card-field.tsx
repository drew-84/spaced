"use client";

import { useEffect, useState } from "react";
import type { FloatingCardSpace } from "./floating-space-card";

type SpatialCardFieldProps = {
  spaces: FloatingCardSpace[];
  readyCount: number;
};

type FooterLabel = "explorar" | "ofrecer";

const CARD_BASE_W = 190;
const CARD_BASE_H = 252;

const ORBIT_RADIUS = 700;
const ORBIT_CARD_COUNT = 24;
const ORBIT_SPACING = 360 / ORBIT_CARD_COUNT;
const VISIBLE_RANGE = 70;
const FADE_RANGE = 5;
const ROTATION_PERIOD_SEC = 45;
const SPEED_DEG_PER_SEC = 360 / ROTATION_PERIOD_SEC;

function normalizeAngle(a: number) {
  return (((a + 180) % 360) + 360) % 360 - 180;
}

function poseFromAngle(a: number) {
  const rad = (a * Math.PI) / 180;
  const x = -ORBIT_RADIUS * Math.sin(rad);
  const tz = ORBIT_RADIUS * (Math.cos(rad) - 1);
  const y = -10 + a * a * 0.0152;
  const rotateY = a;
  const rotateZ = -a * 0.14;
  const scale = Math.max(0.6, 1 - 0.006 * Math.abs(a));
  return { x, y, tz, rotateY, rotateZ, scale };
}

function opacityFromAngle(a: number) {
  const abs = Math.abs(a);
  if (abs <= VISIBLE_RANGE - FADE_RANGE) return 1;
  if (abs >= VISIBLE_RANGE) return 0;
  return 1 - (abs - (VISIBLE_RANGE - FADE_RANGE)) / FADE_RANGE;
}

type VisibleCard = {
  slotIdx: number;
  space: FloatingCardSpace;
  angle: number;
  opacity: number;
};

export function SpatialCardField({ spaces, readyCount }: SpatialCardFieldProps) {
  const N = spaces.length;
  const [hoveredSpaceId, setHoveredSpaceId] = useState<string | null>(null);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [hoveredLabel, setHoveredLabel] = useState<FooterLabel | null>(null);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    function tick(now: number) {
      const dt = now - last;
      last = now;
      setPhase((prev) => (prev + (SPEED_DEG_PER_SEC * dt) / 1000) % 360);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  function labelClass(label: FooterLabel) {
    const isHovered = hoveredLabel === label;
    const isOtherHovered = hoveredLabel !== null && hoveredLabel !== label;
    if (isHovered) {
      return "text-sky-50 [text-shadow:0_0_22px_rgba(140,190,255,0.9),0_0_44px_rgba(140,190,255,0.55),0_0_70px_rgba(110,160,255,0.35)]";
    }
    if (isOtherHovered) {
      return "text-sky-100/35 [text-shadow:0_0_10px_rgba(110,160,255,0.18)]";
    }
    return "text-sky-100/80 [text-shadow:0_0_18px_rgba(110,160,255,0.45)]";
  }

  const visibleCards: VisibleCard[] = [];
  let centerCard: VisibleCard | null = null;

  if (N > 0) {
    for (let i = 0; i < ORBIT_CARD_COUNT; i++) {
      const baseAngle = i * ORBIT_SPACING;
      const angle = normalizeAngle(baseAngle + phase);
      const op = opacityFromAngle(angle);
      if (op <= 0) continue;
      const card: VisibleCard = {
        slotIdx: i,
        space: spaces[i % N],
        angle,
        opacity: op,
      };
      visibleCards.push(card);
      if (centerCard === null || Math.abs(angle) < Math.abs(centerCard.angle)) {
        centerCard = card;
      }
    }
  }

  return (
    <div className="relative mx-auto h-[min(82vh,640px)] w-full max-w-[1180px] overflow-hidden">
      <p
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[9%] z-10 -translate-x-1/2 whitespace-nowrap text-[13px] font-light uppercase tracking-[0.6em] text-sky-100/80 [text-shadow:0_0_18px_rgba(110,160,255,0.45)]"
      >
        ACTIVA ESPACIO AHORA
      </p>

      <p
        aria-hidden
        className="pointer-events-none absolute right-[6%] top-[16%] z-10 text-[10px] font-medium uppercase tracking-[0.34em] text-white/[0.32]"
      >
        {readyCount} Listos
      </p>

      <div
        className="absolute inset-x-0 top-[28%] h-[60%]"
        style={{ perspective: "1400px", transformStyle: "preserve-3d" }}
      >
        <div
          className="absolute left-1/2 top-[44%]"
          style={{
            width: 0,
            height: 0,
            transformStyle: "preserve-3d",
            transform: "translateX(-50%) rotateX(-2deg)",
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute"
            style={{
              left: "50%",
              top: "50%",
              width: 1080,
              height: 260,
              transform: "translate(-50%, -50%) rotateX(72deg)",
              borderRadius: "9999px",
              border: "1px solid rgba(120,165,235,0.32)",
              boxShadow:
                "0 0 18px rgba(95,150,235,0.22), inset 0 0 24px rgba(95,150,235,0.16)",
              zIndex: 1,
            }}
          />

          {[
            { x: -260, y: 100 },
            { x: 260, y: 100 },
          ].map((node, idx) => (
            <span
              key={`node-${idx}`}
              aria-hidden
              className="pointer-events-none absolute block h-[6px] w-[6px] rounded-full bg-[rgba(170,205,255,0.95)]"
              style={{
                left: "50%",
                top: "50%",
                transform: `translate(-50%, -50%) translate3d(${node.x}px, ${node.y}px, 0)`,
                boxShadow:
                  "0 0 12px rgba(150,195,255,0.85), 0 0 22px rgba(120,170,255,0.55)",
                zIndex: 2,
              }}
            />
          ))}

          <button
            type="button"
            aria-label="Activar espacio destacado"
            onClick={() => {
              if (centerCard) setSelectedSpaceId(centerCard.space.id);
            }}
            className="group absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full outline-none focus-visible:ring-1 focus-visible:ring-sky-200/60"
            style={{
              width: 540,
              height: 170,
              transform: "translate(-50%, -50%) translateY(72px) rotateX(72deg)",
              zIndex: 2,
            }}
          >
            <span
              aria-hidden
              className="absolute inset-0 rounded-full transition group-hover:scale-[1.04]"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(86,148,255,0.42) 0%, rgba(86,148,255,0.18) 38%, rgba(86,148,255,0.06) 64%, transparent 80%)",
                filter: "blur(14px)",
              }}
            />
            <span
              aria-hidden
              className="absolute inset-x-12 top-1/2 h-[6px] -translate-y-1/2 rounded-full opacity-80 transition group-hover:opacity-100"
              style={{
                background:
                  "linear-gradient(to right, transparent 0%, rgba(140,190,255,0.55) 30%, rgba(180,215,255,0.85) 50%, rgba(140,190,255,0.55) 70%, transparent 100%)",
                filter: "blur(2px)",
              }}
            />
          </button>

          {visibleCards.map((card) => {
            const pose = poseFromAngle(card.angle);
            const absA = Math.abs(card.angle);
            const isCenter = absA < 8;
            const isSide = absA >= 8 && absA < 23;
            const isMidOuter = absA >= 23 && absA < 40;
            const isOuter = absA >= 40;
            const isDimmed =
              hoveredSpaceId !== null && card.space.id !== hoveredSpaceId;
            const dim = isDimmed ? 0.72 : 1;
            const isSelected = selectedSpaceId === card.space.id;

            return (
              <div
                key={`slot-${card.slotIdx}`}
                className="absolute left-1/2 top-1/2"
                style={{
                  width: CARD_BASE_W,
                  height: CARD_BASE_H,
                  transformOrigin: "center center",
                  transformStyle: "preserve-3d",
                  transform: `translate(-50%, -50%) translate3d(${pose.x}px, ${pose.y}px, ${pose.tz}px) rotateY(${pose.rotateY}deg) rotateZ(${pose.rotateZ}deg) scale(${pose.scale})`,
                  opacity: card.opacity * dim,
                  zIndex: Math.max(1, Math.round(60 - absA / 1.2)),
                  willChange: "transform, opacity",
                }}
              >
                <button
                  type="button"
                  onMouseEnter={() => setHoveredSpaceId(card.space.id)}
                  onMouseLeave={() => setHoveredSpaceId(null)}
                  onClick={() => setSelectedSpaceId(card.space.id)}
                  aria-pressed={isSelected}
                  className={[
                    "group relative block h-full w-full overflow-hidden text-left",
                    "rounded-[28px] border transition-[transform,filter,box-shadow] duration-200 ease-out",
                    "hover:scale-[1.025] hover:brightness-110",
                    isSelected ? "ring-1 ring-sky-200/60" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{
                    borderColor: "rgba(150,185,240,0.42)",
                    background: "rgba(255,255,255,0.04)",
                    boxShadow: isCenter
                      ? "0 28px 70px rgba(0,0,0,0.7), 0 0 42px rgba(95,155,255,0.42), inset 0 1px 0 rgba(255,255,255,0.18)"
                      : "0 18px 46px rgba(0,0,0,0.6), 0 0 18px rgba(80,135,245,0.18), inset 0 1px 0 rgba(255,255,255,0.1)",
                  }}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${card.space.imageUrl})` }}
                  />

                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background: `linear-gradient(to right, rgba(0,0,0,${Math.min(0.78, 0.32 + pose.rotateY * 0.011).toFixed(3)}) 0%, rgba(0,0,0,${Math.max(0, 0.16 + pose.rotateY * 0.005).toFixed(3)}) 18%, rgba(0,0,0,0) 38%, rgba(0,0,0,0) 62%, rgba(0,0,0,${Math.max(0, 0.16 - pose.rotateY * 0.005).toFixed(3)}) 82%, rgba(0,0,0,${Math.min(0.78, 0.32 - pose.rotateY * 0.011).toFixed(3)}) 100%)`,
                    }}
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background: `radial-gradient(ellipse 48% 150% at ${50 - pose.rotateY * 0.7}% 36%, rgba(255,255,255,0.36) 0%, rgba(255,255,255,0.14) 22%, rgba(255,255,255,0.04) 45%, transparent 65%)`,
                    }}
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 mix-blend-overlay"
                    style={{
                      background: `linear-gradient(to right, rgba(255,255,255,${Math.max(0, -pose.rotateY * 0.004).toFixed(3)}) 0%, transparent 25%, transparent 75%, rgba(255,255,255,${Math.max(0, pose.rotateY * 0.004).toFixed(3)}) 100%)`,
                    }}
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-3 top-[3px] h-px opacity-90"
                    style={{
                      background:
                        "linear-gradient(to right, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)",
                      filter: "blur(0.4px)",
                    }}
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to bottom, rgba(255,255,255,0.04) 0%, transparent 18%, transparent 70%, rgba(0,0,0,0.18) 100%)",
                    }}
                  />

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.14)_0%,transparent_38%,transparent_70%,rgba(155,190,255,0.14)_100%)]" />

                  {!isOuter && (
                    <div
                      className={[
                        "absolute inset-x-0 bottom-0 [text-shadow:0_1px_8px_rgba(0,0,0,0.9)]",
                        isMidOuter ? "p-2.5" : "p-3.5",
                      ].join(" ")}
                    >
                      <p
                        className={[
                          "font-medium uppercase text-white/65",
                          isCenter
                            ? "text-[10px] tracking-[0.28em]"
                            : isSide
                              ? "text-[8px] tracking-[0.24em]"
                              : "text-[7px] tracking-[0.22em] text-white/55",
                        ].join(" ")}
                      >
                        {card.space.area}
                      </p>
                      <p
                        className={[
                          "mt-1 line-clamp-2 font-medium leading-snug",
                          isCenter
                            ? "text-[14px] text-white"
                            : isSide
                              ? "text-[10px] text-white"
                              : "text-[8.5px] text-white/85",
                        ].join(" ")}
                      >
                        {card.space.title}
                      </p>
                    </div>
                  )}

                  {isMidOuter && (
                    <div className="pointer-events-none absolute inset-0 bg-black/15" />
                  )}

                  {isOuter && (
                    <div className="pointer-events-none absolute inset-0 bg-black/30" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-[8px] left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5">
        <button
          type="button"
          onMouseEnter={() => setHoveredLabel("explorar")}
          onMouseLeave={() => setHoveredLabel(null)}
          onFocus={() => setHoveredLabel("explorar")}
          onBlur={() => setHoveredLabel(null)}
          className={[
            "text-[11px] font-medium uppercase tracking-[0.5em] outline-none transition-[color,text-shadow,opacity] duration-200",
            labelClass("explorar"),
          ].join(" ")}
        >
          Explorar
        </button>
        <svg
          width="14"
          height="9"
          viewBox="0 0 14 9"
          fill="none"
          aria-hidden
          className={[
            "transition-[color,opacity] duration-200",
            hoveredLabel === null
              ? "text-sky-100/70"
              : hoveredLabel === "explorar"
                ? "text-sky-50/95"
                : "text-sky-100/30",
          ].join(" ")}
        >
          <path
            d="M1 1.5L7 7.5L13 1.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <button
          type="button"
          onMouseEnter={() => setHoveredLabel("ofrecer")}
          onMouseLeave={() => setHoveredLabel(null)}
          onFocus={() => setHoveredLabel("ofrecer")}
          onBlur={() => setHoveredLabel(null)}
          className={[
            "text-[11px] font-medium uppercase tracking-[0.5em] outline-none transition-[color,text-shadow,opacity] duration-200",
            labelClass("ofrecer"),
          ].join(" ")}
        >
          Ofrecer
        </button>
      </div>

      <p className="sr-only" aria-live="polite">
        {selectedSpaceId ? `Espacio ${selectedSpaceId} seleccionado.` : ""}
      </p>
    </div>
  );
}
