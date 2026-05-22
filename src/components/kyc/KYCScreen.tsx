"use client";

import { useEffect } from "react";
import {
  CTA_SECONDARY,
  MODAL_AMBIENT_BG,
  PROGRESS_TRACK,
  RIM_HIGHLIGHT_TOP,
  SCRIM,
  textBody,
  textLabel,
  textPrimary,
} from "@/styles/glass";

/**
 * SPACED — KYCScreen
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Full-screen identity-verification surface that sits above the rest of the
 * app. Visually mirrors OfferScreen (asymmetric outer modal panel + radial
 * mask + glass blur) and BookingModal (scrim + ambient wash) so the four
 * canonical surfaces — OfferScreen, BookingModal, PropertyDetail, and this
 * one — share the same dark-glass language.
 *
 * Layout: two side-by-side glass panels
 *   • LEFT  35% — lighter glass tone; SPACIO wordmark + contextual copy
 *   • RIGHT 65% — darker glass tone; progress bar + (future) step content
 *
 * Animation: 300 ms opacity fade-in on mount.
 */

export type KYCUserType = "guest" | "host";

type KYCScreenProps = {
  userType: KYCUserType;
  /** 1-based index of the active step (1..TOTAL_STEPS). */
  currentStep?: number;
  /** Fires when the verification flow completes successfully. */
  onComplete: () => void;
  /** Fires when the user dismisses the screen without finishing. */
  onClose: () => void;
};

/* ─── Step model ────────────────────────────────────────────────────────── */

const TOTAL_STEPS = 6;

/* Step names indexed 0..5 (currentStep is 1-based, so subtract 1). */
const STEP_NAMES = [
  "EMAIL",
  "TELÉFONO",
  "CÓDIGO",
  "CÉDULA · FRENTE",
  "CÉDULA · REVERSO",
  "VERIFICACIÓN",
] as const;

/* ─── Copy variants ─────────────────────────────────────────────────────── */

type CopyParagraph = string[];
type Copy = {
  /** Accessible dialog label (used for aria-label only). */
  ariaLabel: string;
  /** Primary headline above the body copy. */
  header: string;
  /** Body paragraphs — each entry is rendered as a separate <p>, with
   *  individual lines inside an entry separated by hard breaks so the
   *  visual line breaks exactly match the design spec. */
  body: CopyParagraph[];
};

const COPY: Record<KYCUserType, Copy> = {
  guest: {
    ariaLabel: "Verificación de huésped",
    header: "ACCESO VERIFICADO",
    body: [
      [
        "Para reservar un espacio en Spacio,",
        "verificamos tu identidad una sola vez.",
      ],
      [
        "Rápido. Seguro. Solo la primera vez.",
        "Por tu seguridad y la del anfitrión.",
      ],
    ],
  },
  host: {
    ariaLabel: "Verificación de host",
    header: "PUBLICA CON CONFIANZA",
    body: [
      [
        "Para ofrecer tu espacio en Spacio,",
        "verificamos tu identidad una sola vez.",
      ],
      [
        "Rápido. Seguro. Solo la primera vez.",
        "Para que los huéspedes confíen en ti",
        "y tú confíes en ellos.",
      ],
    ],
  },
};

/* Clamp the incoming step into [1, TOTAL_STEPS] so a bad prop value can't
   blow up the step-name lookup or push the bar past 100%. */
function clampStep(step: number): number {
  if (!Number.isFinite(step)) return 1;
  return Math.min(TOTAL_STEPS, Math.max(1, Math.round(step)));
}

export function KYCScreen({
  userType,
  currentStep = 1,
  onClose,
}: KYCScreenProps) {
  const step = clampStep(currentStep);
  const fillPct = (step / TOTAL_STEPS) * 100;
  const stepName = STEP_NAMES[step - 1];
  const copy = COPY[userType];

  // Esc dismisses the screen, mirroring BookingModal behaviour.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // Lock body scroll while the screen is mounted so the page behind can't
  // be scrolled through the blurred scrim.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={copy.ariaLabel}
      className="fixed inset-0 z-[100] h-[100dvh] w-screen"
      style={{ animation: "kycFadeIn 300ms ease-out both" }}
    >
      {/* Scrim — dims + blurs the page below, click closes the screen. */}
      <button
        type="button"
        aria-label="Cerrar verificación"
        onClick={onClose}
        className={`absolute inset-0 cursor-default ${SCRIM}`}
      />

      {/* Ambient wash — matches BookingModal's MODAL_AMBIENT_BG so the two
          modal-class surfaces feel like the same product. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{ background: MODAL_AMBIENT_BG }}
      />

      {/* Close button — same shared CTA_SECONDARY pill used by OfferScreen
          and BookingModal so the close affordance is unmistakable. */}
      <button
        type="button"
        onClick={onClose}
        className={`absolute right-5 top-5 z-10 ${CTA_SECONDARY} sm:right-8 sm:top-8`}
      >
        cerrar
      </button>

      <main
        className="relative z-[1] mx-auto flex h-full w-full max-w-[1440px] flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8 lg:flex-row lg:gap-8 lg:p-10"
        style={{ perspective: "1180px" }}
      >
        {/* ───────────── LEFT — 35%, lighter glass ───────────── */}
        <aside
          aria-label="Contexto"
          /* Asymmetric outer modal panel — same recipe as OfferScreen's left
             aside. Slightly more luminous bg + brighter border give this
             panel the "lighter glass tone" called for in the spec. */
          className="relative flex w-full shrink-0 flex-col items-center justify-center rounded-[28px_56px_28px_48px] border border-white/15 border-b-transparent border-r-transparent bg-[#0a1626]/55 p-7 shadow-[34px_42px_120px_rgba(0,0,0,0.62),inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-2xl sm:p-9 lg:w-[35%] lg:max-w-[35%]"
        >
          {/* Decorative bg layers — radial mask scoped here so the wordmark
              + body copy are never clipped at the panel edges. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px_56px_28px_48px]"
            style={{
              maskImage:
                "radial-gradient(ellipse 112% 96% at 22% 42%, black 0%, black 60%, rgba(0,0,0,0.88) 80%, rgba(0,0,0,0.5) 94%, transparent 100%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 112% 96% at 22% 42%, black 0%, black 60%, rgba(0,0,0,0.88) 80%, rgba(0,0,0,0.5) 94%, transparent 100%)",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 52% 42% at 18% 0%, rgba(150,205,255,0.14), transparent 68%), linear-gradient(120deg, rgba(255,255,255,0.085), transparent 30%, transparent 62%, rgba(96,165,250,0.05))",
              }}
            />
          </div>

          {/* Vertical light accent — lives OUTSIDE the masked bg layer so
              it reads reliably end-to-end. Decorative; aria-hidden. */}
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-14 left-6 top-14 hidden w-px sm:block"
            style={{
              background:
                "linear-gradient(180deg, transparent, rgba(255,255,255,0.42) 22%, rgba(255,255,255,0.42) 78%, transparent)",
              filter: "blur(0.5px)",
              boxShadow: "0 0 12px rgba(255,255,255,0.32)",
            }}
          />

          <span aria-hidden className={RIM_HIGHLIGHT_TOP} />

          {/* SPACIO + contextual copy — grouped in a single column that the
              parent flex centers vertically. Because SPACIO sits above ~80px
              of gap and a multi-line copy block, its baseline naturally
              lands in the upper-middle of the panel. */}
          <div className="relative flex w-full max-w-[42ch] flex-col items-center gap-[72px] px-2">
            {/* SPACIO wordmark — breathing glow ties the panel to the
                ambient feel of the app. */}
            <p
              data-kyc-spacio=""
              className={`text-center text-4xl font-medium uppercase tracking-[0.6em] sm:text-5xl ${textPrimary}`}
              style={{
                textShadow: "0 0 32px rgba(255,255,255,0.4)",
                animation: "kycSpacioBreath 3s ease-in-out infinite",
                transformOrigin: "center",
                willChange: "transform, opacity",
              }}
            >
              SPACIO
            </p>

            {/* Contextual copy block — calm, centered, comfortable rhythm. */}
            <div className="flex flex-col items-center gap-7 text-center">
              <h2
                className={`text-[15px] font-medium uppercase tracking-[0.42em] sm:text-base ${textPrimary}`}
              >
                {copy.header}
              </h2>

              <div className="flex flex-col gap-5">
                {copy.body.map((paragraph, idx) => (
                  <p
                    key={idx}
                    className={`text-[13px] font-normal tracking-[0.04em] sm:text-sm ${textBody}`}
                    style={{ lineHeight: 1.6 }}
                  >
                    {paragraph.map((line, lineIdx) => (
                      <span key={lineIdx}>
                        {line}
                        {lineIdx < paragraph.length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ───────────── RIGHT — 65%, darker glass ───────────── */}
        <section
          aria-label="Verificación"
          /* Same structural radius/shadows as OfferScreen's right form
             panel, but the bg tone is dropped a notch (#050b15 vs the
             left panel's #0a1626) for the "darker glass tone" spec. */
          className="relative flex flex-1 flex-col overflow-hidden rounded-[32px_56px_48px_28px] border border-white/10 border-b-transparent border-r-transparent bg-[#050b15]/68 p-5 shadow-[34px_42px_120px_rgba(0,0,0,0.62),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl sm:p-7 lg:w-[65%]"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 38% at 78% 0%, rgba(147,197,253,0.08), transparent 60%), linear-gradient(150deg, transparent 0%, transparent 50%, rgba(96,165,250,0.04) 100%)",
            }}
          />
          <span aria-hidden className={RIM_HIGHLIGHT_TOP} />

          {/* Progress bar + step-name row. Sits at the top of the right
              panel and spans 100% of its content area. */}
          <header
            className="relative flex flex-col gap-2"
            aria-label={`Paso ${step} de ${TOTAL_STEPS}`}
          >
            {/* Track — uses the shared PROGRESS_TRACK token (h-px,
                bg-white/10) so unfilled state matches the rest of the app. */}
            <div
              className={PROGRESS_TRACK}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={TOTAL_STEPS}
              aria-valuenow={step}
              aria-valuetext={stepName}
            >
              {/* Fill — bright white with a soft outer glow. Width is
                  inline so the bar reacts instantly to currentStep, and the
                  300 ms ease transition is set explicitly per spec. */}
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-white/55 via-white to-white shadow-[0_0_18px_rgba(255,255,255,0.6)]"
                style={{
                  width: `${fillPct}%`,
                  transition: "width 300ms ease-out",
                }}
              />
            </div>

            {/* Step name — right-aligned, label tier (60%). Decorative
                hierarchy only; no step number, per spec. */}
            <p
              className={`self-end text-[10px] uppercase tracking-[0.32em] ${textLabel}`}
            >
              {stepName}
            </p>
          </header>

          {/* Step content lives below the progress bar — added in a
              follow-up prompt. */}
        </section>
      </main>

      <style>{`
        @keyframes kycFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes kycSpacioBreath {
          0%, 100% { transform: scale(1);    opacity: 0.85; }
          50%      { transform: scale(1.02); opacity: 1;    }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-kyc-spacio] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
