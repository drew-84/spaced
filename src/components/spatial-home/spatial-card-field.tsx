"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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

const OFFER_TIMINGS = ["Ahora", "Esta noche", "Manana AM", "Flexible"];
const OFFER_AREAS = ["Roma / Condesa", "Polanco", "Juarez", "Santa Maria"];
const OFFER_VIBES = ["Silencio", "Creativo", "Calma", "Enfoque"];
const OFFER_REVEALS = ["Bruma gradual", "Silueta inicial", "Pulso discreto"];

function offerChipClass(isActive: boolean) {
  /* Compose the shared pill recipe with the 3D translateZ used inside the
     activation pop-up so chips float forward in the modal's perspective. */
  return [
    "rounded-full border px-3.5 py-2 text-[10px] font-medium uppercase tracking-[0.22em] backdrop-blur-md outline-none",
    "transition-all duration-300 ease-out motion-reduce:transition-none",
    "focus-visible:ring-1 focus-visible:ring-white/40",
    "[transform:translateZ(34px)] hover:[transform:translateZ(44px)]",
    isActive
      ? "border-white/40 bg-white/[0.14] text-white shadow-[0_14px_34px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-14px_28px_rgba(8,18,34,0.34),0_0_22px_rgba(255,255,255,0.2)]"
      : "border-white/20 bg-white/[0.04] text-white/70 shadow-[0_10px_24px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-12px_22px_rgba(5,12,24,0.22)] hover:border-white/40 hover:bg-white/[0.07] hover:text-white",
  ].join(" ");
}

export function SpatialCardField({ spaces, readyCount }: SpatialCardFieldProps) {
  const N = spaces.length;
  const router = useRouter();
  const offerButtonRef = useRef<HTMLButtonElement | null>(null);
  const offerOpenTimerRef = useRef<number | null>(null);
  const signalInputRef = useRef<HTMLInputElement | null>(null);
  const [hoveredSpaceId, setHoveredSpaceId] = useState<string | null>(null);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [hoveredLabel, setHoveredLabel] = useState<FooterLabel | null>(null);
  const [offerOpen, setOfferOpen] = useState(false);
  const [offerTiming, setOfferTiming] = useState(OFFER_TIMINGS[0]);
  const [offerArea, setOfferArea] = useState(OFFER_AREAS[0]);
  const [offerVibe, setOfferVibe] = useState(OFFER_VIBES[0]);
  const [offerReveal, setOfferReveal] = useState(OFFER_REVEALS[0]);
  const [phase, setPhase] = useState(0);
  const [signalClipCount, setSignalClipCount] = useState(0);

  function handleSignalChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) {
      event.target.value = "";
      return;
    }
    const next = Array.from(files)
      .filter((f) => f.type.startsWith("video/"))
      .slice(0, 3);
    setSignalClipCount(next.length);
    event.target.value = "";
  }

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

  useEffect(() => {
    return () => {
      if (offerOpenTimerRef.current !== null) {
        window.clearTimeout(offerOpenTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!offerOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOfferOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [offerOpen]);

  function labelClass(label: FooterLabel) {
    const isHovered = hoveredLabel === label;
    const isOtherHovered = hoveredLabel !== null && hoveredLabel !== label;
    if (isHovered) {
      return "text-white [text-shadow:0_0_22px_rgba(255,255,255,0.85),0_0_44px_rgba(255,255,255,0.5),0_0_70px_rgba(255,255,255,0.3)]";
    }
    if (isOtherHovered) {
      return "text-white/40 [text-shadow:0_0_10px_rgba(255,255,255,0.2)]";
    }
    return "text-white/80 [text-shadow:0_0_18px_rgba(255,255,255,0.45)]";
  }

  function handleOfferClick() {
    /* OFRECER now opens the full-screen list-space flow at /ofrecer.
       Prefetch on hover happens automatically once we call router.prefetch. */
    router.push("/ofrecer");
  }

  /* Carousel cards open the property detail page. We set the local "selected"
     state first so the click feels instantaneous (sky ring lights up) before
     the navigation kicks in. */
  function openSpace(id: string) {
    setSelectedSpaceId(id);
    router.push(`/spaces/${id}`);
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
        className="pointer-events-none absolute left-1/2 top-[9%] z-10 -translate-x-1/2 whitespace-nowrap text-[13px] font-light uppercase tracking-[0.6em] text-white/80 [text-shadow:0_0_18px_rgba(255,255,255,0.45)]"
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
            aria-label="Abrir espacio destacado"
            onClick={() => {
              if (centerCard) openSpace(centerCard.space.id);
            }}
            onMouseEnter={() => {
              if (centerCard) router.prefetch(`/spaces/${centerCard.space.id}`);
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
                  onMouseEnter={() => {
                    setHoveredSpaceId(card.space.id);
                    router.prefetch(`/spaces/${card.space.id}`);
                  }}
                  onMouseLeave={() => setHoveredSpaceId(null)}
                  onClick={() => openSpace(card.space.id)}
                  aria-label={`Abrir ${card.space.title}`}
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
                          "font-medium uppercase text-white/80",
                          isCenter
                            ? "text-[10px] tracking-[0.28em]"
                            : isSide
                              ? "text-[8px] tracking-[0.24em]"
                              : "text-[7px] tracking-[0.22em] text-white/70",
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
                              : "text-[8.5px] text-white",
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
            "transition-colors duration-300 ease-out motion-reduce:transition-none",
            hoveredLabel === null
              ? "text-white/80"
              : hoveredLabel === "explorar"
                ? "text-white"
                : "text-white/40",
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
          ref={offerButtonRef}
          type="button"
          onMouseEnter={() => {
            setHoveredLabel("ofrecer");
            router.prefetch("/ofrecer");
          }}
          onMouseLeave={() => setHoveredLabel(null)}
          onFocus={() => {
            setHoveredLabel("ofrecer");
            router.prefetch("/ofrecer");
          }}
          onBlur={() => setHoveredLabel(null)}
          onClick={handleOfferClick}
          className={[
            "text-[11px] font-medium uppercase tracking-[0.5em] outline-none transition-[color,text-shadow,opacity] duration-200",
            labelClass("ofrecer"),
          ].join(" ")}
        >
          Ofrecer
        </button>
      </div>

      <div
        className={[
          "fixed inset-0 z-40 transition-[opacity,backdrop-filter] duration-500 ease-out",
          offerOpen
            ? "pointer-events-auto opacity-100 backdrop-blur-[6px]"
            : "pointer-events-none opacity-0 backdrop-blur-0",
        ].join(" ")}
        aria-hidden={!offerOpen}
      >
        <button
          type="button"
          aria-label="Cerrar activacion de espacio"
          onClick={() => setOfferOpen(false)}
          className="absolute inset-0 cursor-default bg-[#02050d]/62"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(ellipse 70% 48% at 54% 28%, rgba(72,132,220,0.18), transparent 62%), radial-gradient(circle at 18% 76%, rgba(80,120,210,0.12), transparent 36%), linear-gradient(to bottom, rgba(2,5,13,0.05), rgba(2,5,13,0.46))",
          }}
        />

        <section
          aria-label="Activar espacio en la red"
          className={[
            "absolute left-[clamp(2.5rem,7vw,5.5rem)] top-[22px] min-h-[min(600px,calc(100dvh-22px))] w-[min(780px,calc(100vw-clamp(2.5rem,7vw,5.5rem)-1rem))] max-[700px]:left-0 max-[700px]:w-[calc(100vw-1rem)]",
            "origin-left overflow-hidden rounded-[38px_72px_64px_32px] border border-white/10 border-b-transparent border-r-transparent",
            "bg-[#07101d]/42 p-5 pt-8 text-white shadow-[34px_42px_120px_rgba(0,0,0,0.62),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl sm:p-6 sm:pt-9",
            "transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
            offerOpen
              ? "translate-x-0 scale-x-100 opacity-100"
              : "-translate-x-8 scale-x-[0.08] opacity-0",
          ].join(" ")}
          style={{
            transformStyle: "preserve-3d",
            perspective: "1180px",
            maskImage:
              "radial-gradient(ellipse 112% 92% at 24% 42%, black 0%, black 58%, rgba(0,0,0,0.86) 73%, rgba(0,0,0,0.38) 90%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 112% 92% at 24% 42%, black 0%, black 58%, rgba(0,0,0,0.86) 73%, rgba(0,0,0,0.38) 90%, transparent 100%)",
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 52% 42% at 18% 0%, rgba(150,205,255,0.12), transparent 68%), linear-gradient(120deg, rgba(255,255,255,0.075), transparent 30%, transparent 62%, rgba(96,165,250,0.045))",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-28 -top-20 h-72 w-72 rounded-full bg-[#07101d]/35 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-12 h-px w-1/2 bg-gradient-to-r from-transparent via-sky-100/18 to-transparent"
          />

          <div
            className="relative grid gap-5 lg:grid-cols-[0.98fr_0.82fr]"
            style={{
              transform: "rotateY(-1.6deg) rotateX(0.7deg)",
              transformStyle: "preserve-3d",
            }}
          >
            <div
              className="spatial-projection-zone relative flex min-h-[390px] flex-col justify-between gap-8 overflow-hidden rounded-[32px] border border-white/[0.055] bg-white/[0.028] p-5 shadow-[0_26px_80px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-24px_60px_rgba(2,6,16,0.28)] backdrop-blur-xl sm:p-7"
              style={{
                transform: "translateZ(10px)",
                transformStyle: "preserve-3d",
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_58%_42%_at_24%_24%,rgba(147,197,253,0.16),transparent_66%),linear-gradient(140deg,rgba(255,255,255,0.08),transparent_34%,rgba(56,189,248,0.08)_100%)]"
              />
              <div
                aria-hidden
                className="spatial-reveal-plane pointer-events-none absolute left-8 right-8 top-28 h-36 rounded-full opacity-70"
              />
              <div
                aria-hidden
                className="spatial-signal-line pointer-events-none absolute inset-x-7 bottom-24 h-px"
              />

              <button
                type="button"
                onClick={() => signalInputRef.current?.click()}
                aria-label={
                  signalClipCount === 0
                    ? "Sube una señal en video, 1 a 3 mini clips"
                    : `Señales activas: ${signalClipCount}`
                }
                className="signal-zone group absolute outline-none"
                style={{
                  bottom: 118,
                  left: "50%",
                  width: 224,
                  height: 96,
                  transform: "translateX(-50%) translateZ(26px)",
                }}
              >
                <span aria-hidden className="signal-zone-diffusion" />
                <span aria-hidden className="signal-zone-core" />
                <span aria-hidden className="signal-zone-aura" />
                <span aria-hidden className="signal-zone-content">
                  {signalClipCount === 0 ? (
                    <>
                      <span className="signal-zone-pulse-dot" />
                      <span className="signal-zone-label">
                        SUBE UNA SEÑAL
                      </span>
                      <span className="signal-zone-sublabel">
                        1–3 mini clips
                      </span>
                    </>
                  ) : (
                    <span className="signal-zone-traces">
                      {Array.from({ length: signalClipCount }).map((_, i) => (
                        <span
                          key={i}
                          className="signal-zone-trace"
                          style={{ animationDelay: `${i * 0.45}s` }}
                        />
                      ))}
                    </span>
                  )}
                </span>
              </button>
              <input
                ref={signalInputRef}
                type="file"
                accept="video/*"
                multiple
                className="sr-only"
                onChange={handleSignalChange}
                tabIndex={-1}
              />

              <div className="relative" style={{ transform: "translateZ(30px)" }}>
                <p className="text-[10px] font-medium uppercase tracking-[0.62em] text-white">
                  NODO TEMPORAL
                </p>
                <h2 className="mt-12 text-xl font-medium uppercase tracking-[0.42em] text-white sm:text-2xl">
                  ESPACIO ACTIVO
                </h2>
                <p className="mt-5 text-sm font-light tracking-[0.08em] text-white/80">
                  Tiempo, zona y{" "}
                  <span className="atmosfera-word">
                    atmósfera
                    <span aria-hidden className="atmosfera-energy">
                      <span className="atmosfera-energy-core" />
                      <span className="atmosfera-energy-beam" />
                    </span>
                  </span>
                  .
                </p>
              </div>

              <div
                className="relative grid grid-cols-3 gap-3 text-center"
                style={{ transform: "translateZ(42px)" }}
              >
                {[
                  ["temporal", "ventana"],
                  ["cercano", "radio"],
                  ["vivo", "revelado"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-[26px] border border-white/[0.075] bg-white/[0.035] px-3 py-4 shadow-[0_16px_34px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-14px_26px_rgba(3,8,18,0.28)] backdrop-blur-md"
                  >
                    <p className="text-lg font-medium text-white">{value}</p>
                    <p className="mt-1 text-[9px] uppercase tracking-[0.28em] text-white">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="flex flex-col gap-5 rounded-[34px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_28px_80px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-28px_70px_rgba(2,6,16,0.32)] backdrop-blur-xl"
              style={{
                transform: "translateZ(28px) rotateY(1.2deg)",
                transformStyle: "preserve-3d",
              }}
            >
              <div
                className="flex items-start justify-between gap-4"
                style={{ transform: "translateZ(28px)" }}
              >
                <div>
                  <p className="text-[10px] uppercase tracking-[0.46em] text-white">
                    senales de activacion
                  </p>
                  <p className="mt-2 text-sm text-white/80">
                    Solo lo necesario para que el nodo empiece a aparecer.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOfferOpen(false)}
                  className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-2 text-[10px] uppercase tracking-[0.26em] text-white/80 shadow-[0_10px_24px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md transition-all duration-300 ease-out motion-reduce:transition-none hover:border-white/40 hover:bg-white/[0.08] hover:text-white hover:[transform:translateZ(8px)]"
                >
                  cerrar
                </button>
              </div>

              <div
                className="space-y-5"
                style={{
                  transform: "translateZ(38px)",
                  transformStyle: "preserve-3d",
                }}
              >
                <div>
                  <p className="mb-2.5 text-[10px] uppercase tracking-[0.32em] text-white">
                    disponibilidad temporal
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {OFFER_TIMINGS.map((timing) => (
                      <button
                        key={timing}
                        type="button"
                        onClick={() => setOfferTiming(timing)}
                        className={offerChipClass(offerTiming === timing)}
                      >
                        {timing}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2.5 text-[10px] uppercase tracking-[0.32em] text-white">
                    ubicacion aproximada
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {OFFER_AREAS.map((area) => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => setOfferArea(area)}
                        className={offerChipClass(offerArea === area)}
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2.5 text-[10px] uppercase tracking-[0.32em] text-white">
                    atmosfera
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {OFFER_VIBES.map((vibe) => (
                      <button
                        key={vibe}
                        type="button"
                        onClick={() => setOfferVibe(vibe)}
                        className={offerChipClass(offerVibe === vibe)}
                      >
                        {vibe}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2.5 text-[10px] uppercase tracking-[0.32em] text-white">
                    revelado espacial
                  </p>
                  <div className="flex flex-col gap-2">
                    {OFFER_REVEALS.map((reveal) => (
                      <button
                        key={reveal}
                        type="button"
                        onClick={() => setOfferReveal(reveal)}
                        className={[
                          offerChipClass(offerReveal === reveal),
                          "text-left",
                        ].join(" ")}
                      >
                        {reveal}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="mt-auto rounded-full border border-white/30 bg-white/[0.14] px-5 py-3.5 text-[11px] font-medium uppercase tracking-[0.34em] text-white shadow-[0_18px_38px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-16px_32px_rgba(8,18,34,0.32),0_0_30px_-6px_rgba(255,255,255,0.4)] backdrop-blur-md transition-all duration-300 ease-out motion-reduce:transition-none hover:border-white/50 hover:bg-white/[0.2] hover:shadow-[0_22px_42px_rgba(0,0,0,0.36),inset_0_1px_0_rgba(255,255,255,0.3),0_0_42px_-4px_rgba(255,255,255,0.55)] hover:[transform:translateZ(52px)]"
                style={{ transform: "translateZ(44px)" }}
              >
                emitir senal
              </button>
            </div>
          </div>
        </section>
      </div>

      <p className="sr-only" aria-live="polite">
        {selectedSpaceId ? `Espacio ${selectedSpaceId} seleccionado.` : ""}
      </p>
    </div>
  );
}
