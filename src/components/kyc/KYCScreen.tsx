"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CTA_SECONDARY,
  MODAL_AMBIENT_BG,
  RIM_HIGHLIGHT_TOP,
  SCRIM,
  textBody,
  textLabel,
  textPrimary,
} from "@/styles/glass";
import { DEFAULT_COUNTRY, type Country } from "@/lib/kyc/countries";
import { StepEmail } from "./steps/StepEmail";
import { StepPhone } from "./steps/StepPhone";
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

/** Full payload handed back to the parent on a successful KYC pass. The
 *  parent typically ignores it for now (handlers are `() => void`), but
 *  the shape is defined so the data is available the moment a backend
 *  hook is wired in. */
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
  /** Fires when the verification flow completes successfully. Carries the
   *  full set of collected data. Callers that only care about closing
   *  the modal can declare the handler as `() => void`. */
  onComplete: (payload?: KYCCompletePayload) => void;
  /** Fires when the user dismisses the screen without finishing. */
  onClose: () => void;
};

/* ─── Step model ────────────────────────────────────────────────────────── */

/* The KYC flow has 5 logical steps. ID front + back share one screen, and
   verification processing + success share one screen, so the progress bar
   advances in five increments. */
const TOTAL_STEPS = 5;

/* Step names indexed 0..4 (currentStep is 1-based, so subtract 1). */
const STEP_NAMES = [
  "EMAIL",
  "TELÉFONO",
  "CÓDIGO",
  "CÉDULA",
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

/* ─── Step renderer ─────────────────────────────────────────────────────
   Centralises the step-number → component mapping so it can be used both
   for the active step and for the outgoing-step overlay during a
   transition. The handlers + state setters travel as a single bag to
   keep call sites readable. */
type StepHandlers = {
  email: string;
  setEmail: (next: string) => void;
  handleEmailSubmit: (value: string) => void;
  country: Country;
  setCountry: (c: Country) => void;
  phone: string;
  setPhone: (digits: string) => void;
  handlePhoneSubmit: (payload: { country: Country; phone: string }) => void;
  handleCodeSubmit: () => void;
  idFront: string | null;
  setIdFront: (next: string | null) => void;
  idBack: string | null;
  setIdBack: (next: string | null) => void;
  handleIdSubmit: () => void;
  handleVerifyComplete: () => void;
  navigateTo: (next: number) => void;
};

function renderStep(step: number, h: StepHandlers) {
  switch (step) {
    case 1:
      return (
        <StepEmail
          email={h.email}
          onEmailChange={h.setEmail}
          onSubmit={h.handleEmailSubmit}
        />
      );
    case 2:
      return (
        <StepPhone
          country={h.country}
          onCountryChange={h.setCountry}
          phone={h.phone}
          onPhoneChange={h.setPhone}
          onSubmit={h.handlePhoneSubmit}
          onBack={() => h.navigateTo(1)}
        />
      );
    case 3:
      return (
        <StepCode
          country={h.country}
          phone={h.phone}
          onSubmit={h.handleCodeSubmit}
          onBack={() => h.navigateTo(2)}
        />
      );
    case 4:
      return (
        <StepId
          idFront={h.idFront}
          idBack={h.idBack}
          onIdFrontChange={h.setIdFront}
          onIdBackChange={h.setIdBack}
          onSubmit={h.handleIdSubmit}
          onBack={() => h.navigateTo(3)}
        />
      );
    case 5:
      return (
        <StepVerify email={h.email} onSubmit={h.handleVerifyComplete} />
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

  /* ─── Step navigation ─────────────────────────────────────────────────
     activeStep is internally owned so the orchestrator can advance the
     flow itself. The `currentStep` prop seeds the initial value but
     subsequent changes happen here. */
  const [activeStep, setActiveStep] = useState<number>(() =>
    clampStep(currentStep),
  );

  /* Drives the slide-in/slide-out animation for the step content. When
     non-null, the previous step is briefly rendered over the new one
     using the "out" keyframe while the new one plays the "in" keyframe. */
  const [transition, setTransition] = useState<{
    from: number;
    direction: "forward" | "back";
  } | null>(null);

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

  /* Clear the outgoing-step overlay once the 300 ms animation is done so
     it doesn't keep eating pointer events or RAF cycles. */
  useEffect(() => {
    if (!transition) return;
    const timer = window.setTimeout(() => setTransition(null), 320);
    return () => window.clearTimeout(timer);
  }, [transition]);

  const fillPct = (activeStep / TOTAL_STEPS) * 100;
  const stepName = STEP_NAMES[activeStep - 1];

  /* ─── Per-step form state ─────────────────────────────────────────────
     Lifted to the orchestrator so going back to a previous step
     preserves what the user already entered. ID images are data URLs
     for now (no server upload yet). */
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [phone, setPhone] = useState("");
  const [idFront, setIdFront] = useState<string | null>(null);
  const [idBack, setIdBack] = useState<string | null>(null);

  function handleEmailSubmit(_value: string) {
    /* The email is already in parent state via onEmailChange — just
       advance. The console.log lives in StepEmail. */
    navigateTo(2);
  }

  function handlePhoneSubmit(_payload: { country: Country; phone: string }) {
    /* Real SMS sending will be wired when the backend exists; for now
       just advance so the progress bar + transition can be verified. */
    console.log("[KYC] phone valid, moving to step 3", _payload);
    navigateTo(3);
  }

  function handleCodeSubmit() {
    /* The 6-digit code matched the gold path inside StepCode. The
       backend hook for marking the phone "verified" lands later. */
    console.log("[KYC] code verified, moving to step 4");
    navigateTo(4);
  }

  function handleIdSubmit() {
    /* Both cédula photos captured. Step 5 owns the processing → success
       animation; once the user presses CONTINUAR there we hand off to
       the parent via handleVerifyComplete. */
    console.log("[KYC] ID images captured, moving to step 5");
    navigateTo(5);
  }

  function handleVerifyComplete() {
    /* User pressed CONTINUAR on the success screen. Bundle everything
       collected during the flow and hand it back to the parent so they
       can either open BookingModal (guest) or route to /ofrecer
       (host) — see PropertyDetailExperience.handleKycComplete and
       SpatialCardField.handleKycComplete for the consumer side. */
    console.log("[KYC] flow complete, handing off to parent");
    onComplete({
      email,
      phone,
      country,
      verified: true,
      idFront,
      idBack,
    });
  }

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
            className="relative flex flex-col gap-2.5"
            aria-label={`Paso ${activeStep} de ${TOTAL_STEPS}`}
          >
            {/* Track — 6 px tall pill, subtle inset shadow gives the
                "recessed into the panel" depth cue. */}
            <div
              className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08] shadow-[inset_0_1px_2px_rgba(0,0,0,0.45),inset_0_-1px_0_rgba(255,255,255,0.04)]"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={TOTAL_STEPS}
              aria-valuenow={activeStep}
              aria-valuetext={stepName}
            >
              {/* Fill — bright-white liquid with a brighter leading edge.
                  At 100% (final step) the glow blooms a touch wider and
                  the opacity ticks up to 1.0 so completion reads as a
                  small but satisfying moment. */}
              <span
                aria-hidden
                className={[
                  "absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-white/70 via-white/85 to-white",
                  activeStep === TOTAL_STEPS
                    ? "shadow-[0_0_10px_rgba(255,255,255,0.7),0_0_26px_rgba(255,255,255,0.5),inset_0_1px_0_rgba(255,255,255,0.78)]"
                    : "shadow-[0_0_8px_rgba(255,255,255,0.55),0_0_18px_rgba(255,255,255,0.32),inset_0_1px_0_rgba(255,255,255,0.6)]",
                ].join(" ")}
                style={{
                  width: `${fillPct}%`,
                  transition:
                    "width 450ms cubic-bezier(0.22, 1, 0.36, 1), opacity 500ms ease-out",
                  opacity: activeStep === TOTAL_STEPS ? 1 : 0.9,
                }}
              />
            </div>

            {/* Step name — right-aligned, label tier (60%). Decorative
                hierarchy only; no step number, per spec. */}
            <p
              className={`self-end text-[10px] uppercase tracking-widest ${textLabel}`}
            >
              {stepName}
            </p>
          </header>

          {/* Step content area — vertically centered in the remaining
              space. Width constraints live on each step component so
              wider steps (e.g. ID upload with two side-by-side zones)
              can opt-in independently. The relative inner box is the
              animation stage for the slide-in / slide-out crossfade. */}
          <div className="relative flex flex-1 items-center justify-center px-2 sm:px-6">
            <div className="relative w-full">
              {/* Outgoing step — overlays the new one for ~300 ms while
                  it slides out. Pointer-events-none so it doesn't block
                  the incoming step's focus / clicks. */}
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
                  {renderStep(transition.from, {
                    email,
                    setEmail,
                    handleEmailSubmit,
                    country,
                    setCountry,
                    phone,
                    setPhone,
                    handlePhoneSubmit,
                    handleCodeSubmit,
                    idFront,
                    setIdFront,
                    idBack,
                    setIdBack,
                    handleIdSubmit,
                    handleVerifyComplete,
                    navigateTo,
                  })}
                </div>
              )}

              {/* Active step — keyed by step number so React mounts a
                  fresh instance per step and the enter animation fires
                  each time. */}
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
                {renderStep(activeStep, {
                  email,
                  setEmail,
                  handleEmailSubmit,
                  country,
                  setCountry,
                  phone,
                  setPhone,
                  handlePhoneSubmit,
                  handleCodeSubmit,
                  idFront,
                  setIdFront,
                  idBack,
                  setIdBack,
                  handleIdSubmit,
                  handleVerifyComplete,
                  navigateTo,
                })}
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
        /* Step 5 — verification screen
           Phase crossfade, rotating spinner, checkmark scale-in, and
           checkmark stroke draw. Animation names are all kycVerify*
           prefixed so they never collide with other step keyframes. */
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
