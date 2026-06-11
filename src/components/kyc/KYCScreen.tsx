"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import {
  CTA_SECONDARY,
  MODAL_AMBIENT_BG,
  PROGRESS_FILL,
  PROGRESS_TRACK,
  RIM_HIGHLIGHT_TOP,
  SCRIM,
  STEP_LEGEND_TYPE,
  textBody,
  textInactive,
  textMeta,
  textPrimary,
} from "@/styles/glass";
import { DEFAULT_COUNTRY, type Country } from "@/lib/kyc/countries";
import { StepContacto } from "./steps/StepContacto";
import { StepCode } from "./steps/StepCode";
import { StepId } from "./steps/StepId";
import { StepVerify } from "./steps/StepVerify";

/**
 * SPACED — KYCScreen
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Full-screen identity-verification surface that sits above the rest of the
 * app. Visually mirrors OfferScreen (asymmetric outer modal panel + radial
 * mask + glass blur) and BookingModal (scrim + ambient wash) so the four
 * canonical surfaces share the same dark-glass language.
 *
 * Layout: two side-by-side glass panels
 *   • LEFT  35% — lighter glass tone; SPACIO wordmark + contextual copy
 *   • RIGHT 65% — darker glass tone; progress bar + step content
 *
 * Flow (4 steps):
 *   1 CONTACTO     — email + phone on one screen (user-driven)
 *   2 CÓDIGO       — 6-box email verification code (user-driven)
 *   3 CÉDULA       — ID upload, front + back (user-driven)
 *   4 VERIFICACIÓN — automatic processing → success
 *
 * Animation: 300 ms opacity fade-in on mount.
 */

export type KYCUserType = "guest" | "host";

/** Full payload handed back to the parent on a successful KYC pass. */
export type KYCCompletePayload = {
  email: string;
  phone: string;
  country: Country;
  verified: boolean;
  /** Data URL for the front side of the cédula. */
  idFront: string | null;
  /** Data URL for the reverse side of the cédula. */
  idBack: string | null;
};

type KYCScreenProps = {
  userType: KYCUserType;
  /** 1-based index of the active step (1..TOTAL_STEPS). */
  currentStep?: number;
  /** Fires when the verification flow completes successfully. */
  onComplete: (payload?: KYCCompletePayload) => void;
  /** Fires when the user dismisses the screen without finishing. */
  onClose: () => void;
};

/* ─── Step model ────────────────────────────────────────────────────────
   Four steps. Steps 1–3 are user-driven; step 4 is automatic. The progress
   bar has three equal segments — one per user-driven step — and reaches
   100% during step 4's verification moment (step 4 has no segment). */
const TOTAL_STEPS = 4;

const STEP_LABELS = ["CONTACTO", "CÓDIGO", "CÉDULA", "VERIFICACIÓN"] as const;

/* ─── Progress-bar geometry ─────────────────────────────────────────────
   SEG = one segment = 33.33%. */
const SEG = 100 / 3;

/* Resting fill % for each step (index = step - 1): the clean boundary the
   bar sits at while the user is ON that step. Step 4 → 100% (reached via a
   slow creep, not an instant set). */
const REST_PCT = [0, SEG, SEG * 2, 100];

/* Phase-1 fill target for steps 1–3 (index = step - 1): 85% of the way
   into the step's own segment. Step 3 is special — it fills to ~91.6%
   (the verification "almost there" point) before the creep to 100%. */
const PHASE1_PCT = [SEG * 0.85, SEG + SEG * 0.85, 91.6];

/* ─── Fill transitions + timeline ───────────────────────────────────────
   Variable timing per beat, applied inline so it overrides PROGRESS_FILL's
   baked-in default.

   Phase-1 is deliberately slow (~1s) AND it gates the step change: the step
   does not advance until this fill has visibly finished, so the user
   actually watches the bar fill on the screen they just completed before it
   transitions away. The Phase-2 snap stays fast — a satisfying "click into
   place" beat as the next screen mounts. */
const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";
const PHASE1_MS = 1000; // Phase-1 fill duration AND the gate before advancing
const SNAP_MS = 200; // Phase-2 quick snap to the clean boundary
const CREEP_MS = 2500; // step 4's slow synchronized creep to 100%
/* Tiny pause after a new screen mounts before its bar beat plays, so the
   snap / creep reads as a distinct "after the transition" moment. */
const MOUNT_BEAT_DELAY = 80;

const FILL_PHASE1 = `width ${PHASE1_MS}ms ${EASE_OUT}`; // smooth fill to 85% of segment
const FILL_SNAP = `width ${SNAP_MS}ms ${EASE_OUT}`; // quick snap to the clean boundary
const FILL_CREEP = `width ${CREEP_MS}ms linear`; // slow synchronized creep to 100%
const FILL_BACK = `width 450ms ${EASE_OUT}`; // reverse on back navigation

/* ─── Copy variants ─────────────────────────────────────────────────────── */

type CopyParagraph = string[];
type Copy = {
  ariaLabel: string;
  header: string;
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

/* Clamp the incoming step into [1, TOTAL_STEPS]. */
function clampStep(step: number): number {
  if (!Number.isFinite(step)) return 1;
  return Math.min(TOTAL_STEPS, Math.max(1, Math.round(step)));
}

/* ─── Step renderer ─────────────────────────────────────────────────────
   Centralises the step-number → component mapping so it can be used both
   for the active step and for the outgoing-step overlay during a
   transition. */
type StepHandlers = {
  email: string;
  setEmail: (next: string) => void;
  country: Country;
  setCountry: (c: Country) => void;
  phone: string;
  setPhone: (digits: string) => void;
  handleContactoSubmit: () => void;
  handleCodeSubmit: () => void;
  idFront: string | null;
  setIdFront: (next: string | null) => void;
  idBack: string | null;
  setIdBack: (next: string | null) => void;
  handleIdSubmit: () => void;
  verifyPhase: "processing" | "success";
  handleVerifyComplete: () => void;
  goBack: (to: number) => void;
};

/* Rendered as a JSX element (not a plain function call) so the handler bag
   — which closes over timer refs — is passed as props rather than read
   during the parent's render. */
function StepFrame({ step, h }: { step: number; h: StepHandlers }) {
  switch (step) {
    case 1:
      return (
        <StepContacto
          email={h.email}
          onEmailChange={h.setEmail}
          country={h.country}
          onCountryChange={h.setCountry}
          phone={h.phone}
          onPhoneChange={h.setPhone}
          onSubmit={h.handleContactoSubmit}
        />
      );
    case 2:
      return (
        <StepCode
          email={h.email}
          onSubmit={h.handleCodeSubmit}
          onBack={() => h.goBack(1)}
        />
      );
    case 3:
      return (
        <StepId
          idFront={h.idFront}
          idBack={h.idBack}
          onIdFrontChange={h.setIdFront}
          onIdBackChange={h.setIdBack}
          onSubmit={h.handleIdSubmit}
          onBack={() => h.goBack(2)}
        />
      );
    case 4:
      return (
        <StepVerify
          email={h.email}
          phase={h.verifyPhase}
          onSubmit={h.handleVerifyComplete}
        />
      );
    default:
      return null;
  }
}

export function KYCScreen({
  userType,
  currentStep = 1,
  onComplete,
  onClose,
}: KYCScreenProps) {
  const copy = COPY[userType];

  const [activeStep, setActiveStep] = useState<number>(() =>
    clampStep(currentStep),
  );

  /* Drives the slide-in/slide-out animation for the step content. */
  const [transition, setTransition] = useState<{
    from: number;
    direction: "forward" | "back";
  } | null>(null);

  /* ─── Progress-bar fill ───────────────────────────────────────────────
     `pct` is the target width; `cssTransition` is applied inline so each
     beat (phase-1, snap, creep, back) animates at its own pace. Initialised
     to the resting position for the starting step — step 1 → 0%, no
     pre-fill on mount. */
  const [fill, setFill] = useState<{ pct: number; cssTransition: string }>(
    () => ({
      pct: REST_PCT[clampStep(currentStep) - 1],
      cssTransition: FILL_SNAP,
    }),
  );

  /* Step 4's processing → success flip is owned here so the bar creep and
     the success "beat" stay perfectly in sync. */
  const [verifyPhase, setVerifyPhase] = useState<"processing" | "success">(
    "processing",
  );

  /* Pending fill / verification timers, cleared whenever navigation changes
     so a fast click can't leave a stale snap/creep queued. */
  const timersRef = useRef<number[]>([]);
  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const navigateTo = useCallback(
    (next: number) => {
      const target = clampStep(next);
      if (target === activeStep) return;
      setTransition({
        from: activeStep,
        direction: target > activeStep ? "forward" : "back",
      });
      setActiveStep(target);
    },
    [activeStep],
  );

  /* Clear the outgoing-step overlay once the 300 ms animation is done. */
  useEffect(() => {
    if (!transition) return;
    const timer = window.setTimeout(() => setTransition(null), 320);
    return () => window.clearTimeout(timer);
  }, [transition]);

  /* Clear any queued fill/verification timers on unmount. */
  useEffect(() => clearTimers, [clearTimers]);

  /* ─── Per-step form state ─────────────────────────────────────────────
     Lifted here so navigating back preserves what the user entered. */
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [phone, setPhone] = useState("");
  const [idFront, setIdFront] = useState<string | null>(null);
  const [idBack, setIdBack] = useState<string | null>(null);

  /* ─── Forward: two-phase fill (steps 1 → 2 and 2 → 3) ─────────────────
     Phase 1 keeps the CURRENT screen visible while the bar fills to 85% of
     the segment over ~1s. ONLY THEN does the step change; as the new screen
     mounts the bar snaps the remaining 15% to the clean boundary. */
  const advanceTwoPhase = useCallback(
    (from: number) => {
      clearTimers();
      // Phase 1 — bar fills on the screen the user just completed.
      setFill({ pct: PHASE1_PCT[from - 1], cssTransition: FILL_PHASE1 });
      // After the fill has visibly played, transition to the next step…
      const advance = window.setTimeout(() => {
        navigateTo(from + 1);
        // …then snap the remaining 15% into place as the new screen mounts.
        const snap = window.setTimeout(() => {
          setFill({ pct: REST_PCT[from], cssTransition: FILL_SNAP });
        }, MOUNT_BEAT_DELAY);
        timersRef.current.push(snap);
      }, PHASE1_MS);
      timersRef.current.push(advance);
    },
    [clearTimers, navigateTo],
  );

  /* ─── Forward: step 3 → 4 (verification creep, no snap) ───────────────
     Phase 1 keeps Step 3 visible while the bar fills to ~91.6% over ~1s.
     Only then does Step 4 mount, where a slow synchronized creep takes the
     bar to exactly 100% over 2.5 s. The success flip is scheduled for the
     frame the creep completes so the bar, the spinner stop and
     "✓ VERIFICADO" land as one beat. */
  const advanceToVerify = useCallback(() => {
    clearTimers();
    // Phase 1 — bar fills to ~91.6% while Step 3 is still on screen.
    setFill({ pct: PHASE1_PCT[2], cssTransition: FILL_PHASE1 });
    const advance = window.setTimeout(() => {
      setVerifyPhase("processing");
      navigateTo(4);
      const creep = window.setTimeout(() => {
        setFill({ pct: 100, cssTransition: FILL_CREEP });
      }, MOUNT_BEAT_DELAY);
      const finish = window.setTimeout(() => {
        setVerifyPhase("success");
      }, MOUNT_BEAT_DELAY + CREEP_MS);
      timersRef.current.push(creep, finish);
    }, PHASE1_MS);
    timersRef.current.push(advance);
  }, [clearTimers, navigateTo]);

  /* ─── Back: reverse the bar to the previous boundary ──────────────────── */
  const goBack = useCallback(
    (to: number) => {
      clearTimers();
      setFill({ pct: REST_PCT[to - 1], cssTransition: FILL_BACK });
      navigateTo(to);
    },
    [clearTimers, navigateTo],
  );

  const handleContactoSubmit = useCallback(
    () => advanceTwoPhase(1),
    [advanceTwoPhase],
  );
  const handleCodeSubmit = useCallback(
    () => advanceTwoPhase(2),
    [advanceTwoPhase],
  );
  const handleIdSubmit = useCallback(
    () => advanceToVerify(),
    [advanceToVerify],
  );

  const handleVerifyComplete = useCallback(() => {
    console.log("[KYC] flow complete, handing off to parent");
    onComplete({
      email,
      phone,
      country,
      verified: true,
      idFront,
      idBack,
    });
  }, [onComplete, email, phone, country, idFront, idBack]);

  // Esc dismisses the screen, mirroring BookingModal behaviour.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // Lock body scroll while the screen is mounted.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const stepHandlers: StepHandlers = {
    email,
    setEmail,
    country,
    setCountry,
    phone,
    setPhone,
    handleContactoSubmit,
    handleCodeSubmit,
    idFront,
    setIdFront,
    idBack,
    setIdBack,
    handleIdSubmit,
    verifyPhase,
    handleVerifyComplete,
    goBack,
  };

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

      {/* Ambient wash — matches BookingModal's MODAL_AMBIENT_BG. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{ background: MODAL_AMBIENT_BG }}
      />

      {/* Close button — shared CTA_SECONDARY pill. */}
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
          className="relative flex w-full shrink-0 flex-col items-center justify-center rounded-[28px_56px_28px_48px] border border-white/15 border-b-transparent border-r-transparent bg-[#0a1626]/55 p-7 shadow-[34px_42px_120px_rgba(0,0,0,0.62),inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-2xl sm:p-9 lg:w-[35%] lg:max-w-[35%]"
        >
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

          <div className="relative flex w-full max-w-[42ch] flex-col items-center gap-[72px] px-2">
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

          {/* Progress bar + step legend. */}
          <header
            className="relative flex flex-col gap-2.5"
            aria-label={`Paso ${activeStep} de ${TOTAL_STEPS}`}
          >
            <div
              className={PROGRESS_TRACK}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(fill.pct)}
              aria-valuetext={STEP_LABELS[activeStep - 1]}
            >
              {/* Liquid-glow fill — width + timing driven inline so each beat
                  animates at its own pace; the glow comes from PROGRESS_FILL. */}
              <span
                aria-hidden
                className={PROGRESS_FILL}
                style={{
                  width: `${fill.pct}%`,
                  transition: fill.cssTransition,
                }}
              />
            </div>

            {/* Step legend — all four steps; the active one sits brightest,
                completed steps mid, upcoming steps faint. */}
            <div className="flex flex-wrap items-center justify-end gap-x-1.5 gap-y-1">
              {STEP_LABELS.map((label, i) => {
                const n = i + 1;
                const tone =
                  n === activeStep
                    ? textPrimary
                    : n < activeStep
                      ? textMeta
                      : textInactive;
                return (
                  <Fragment key={label}>
                    {i > 0 && (
                      <span
                        aria-hidden
                        className={`${STEP_LEGEND_TYPE} ${textInactive}`}
                      >
                        ·
                      </span>
                    )}
                    <span
                      aria-current={n === activeStep ? "step" : undefined}
                      className={`${STEP_LEGEND_TYPE} ${tone}`}
                    >
                      {n} {label}
                    </span>
                  </Fragment>
                );
              })}
            </div>
          </header>

          {/* Step content area — vertically centered. The relative inner box
              is the animation stage for the slide-in / slide-out crossfade. */}
          <div className="relative flex flex-1 items-center justify-center px-2 sm:px-6">
            <div className="relative w-full">
              {/* Outgoing step — overlays the new one while it slides out. */}
              {transition && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    animation: `kycStepOut${
                      transition.direction === "forward" ? "Fwd" : "Back"
                    } 300ms ease both`,
                  }}
                >
                  <StepFrame step={transition.from} h={stepHandlers} />
                </div>
              )}

              {/* Active step — keyed by step number so React mounts a fresh
                  instance per step and the enter animation fires each time. */}
              <div
                key={activeStep}
                style={
                  transition
                    ? {
                        animation: `kycStepIn${
                          transition.direction === "forward" ? "Fwd" : "Back"
                        } 300ms ease both`,
                      }
                    : undefined
                }
              >
                <StepFrame step={activeStep} h={stepHandlers} />
              </div>
            </div>
          </div>
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
        @keyframes kycChipFadeIn {
          from { opacity: 0; transform: translate(-50%, 4px); }
          to   { opacity: 1; transform: translate(-50%, 0);   }
        }
        /* Step crossfade — forward = next step slides in from the right,
           current step slides out to the left. Back = mirror image. */
        @keyframes kycStepInFwd {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0);    }
        }
        @keyframes kycStepOutFwd {
          from { opacity: 1; transform: translateX(0);     }
          to   { opacity: 0; transform: translateX(-40px); }
        }
        @keyframes kycStepInBack {
          from { opacity: 0; transform: translateX(-40px); }
          to   { opacity: 1; transform: translateX(0);     }
        }
        @keyframes kycStepOutBack {
          from { opacity: 1; transform: translateX(0);    }
          to   { opacity: 0; transform: translateX(40px); }
        }
        /* Step 4 — verification screen keyframes. */
        @keyframes kycVerifyPhaseIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes kycVerifySpin {
          to { transform: rotate(360deg); }
        }
        @keyframes kycVerifyCheckIn {
          0%   { opacity: 0; transform: scale(0.7); }
          60%  { opacity: 1; transform: scale(1.06); }
          100% { opacity: 1; transform: scale(1);    }
        }
        @keyframes kycVerifyCheckDraw {
          from { stroke-dashoffset: 60; }
          to   { stroke-dashoffset: 0;  }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-kyc-spacio] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
