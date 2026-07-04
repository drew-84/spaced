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
import { supabase } from "@/lib/supabase";
import { submitKyc } from "@/lib/kyc/supabase-kyc";
import { useAuthStore } from "@/lib/auth-store";
import { DEFAULT_COUNTRY, type Country } from "@/lib/kyc/countries";
import { StepContacto } from "./steps/StepContacto";
import { StepCode } from "./steps/StepCode";
import { StepId } from "./steps/StepId";
import { StepVerify } from "./steps/StepVerify";

/**
 * SPACED — KYCScreen
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Full-screen identity-verification surface. Auth is wired into the flow:
 *
 *   Step 1 CONTACTO  — collects email + phone, then calls
 *                      supabase.auth.signInWithOtp() to send a 6-digit code.
 *                      The user's email is saved to localStorage as a hint
 *                      for future Login modal recoveries.
 *
 *   Step 2 CÓDIGO    — StepCode calls supabase.auth.verifyOtp() internally.
 *                      On success a live Supabase session exists.
 *
 *   Step 3 CÉDULA    — ID photo upload (front + back).
 *
 *   Step 4 VERIFICACIÓN — calls submitKyc() concurrently with the progress
 *                         bar animation, saves profile (phone, country,
 *                         ID photo URLs, kyc_status="verified"), then
 *                         flips to the success screen.
 *
 * onComplete fires after the user clicks CONTINUAR on the success screen.
 * At that point the session is live and the profile is saved.
 */

export type KYCUserType = "guest" | "host";

/** Shape passed to submitKyc — exported so supabase-kyc.ts can import it. */
export type KYCCompletePayload = {
  email: string;
  phone: string;
  country: import("@/lib/kyc/countries").Country;
  verified: boolean;
  idFront: string | null;
  idBack: string | null;
};

type KYCScreenProps = {
  userType: KYCUserType;
  currentStep?: number;
  onComplete: () => void;
  onClose: () => void;
};

const TOTAL_STEPS = 4;
const STEP_LABELS = ["CONTACTO", "CÓDIGO", "CÉDULA", "VERIFICACIÓN"] as const;

/* ─── Progress-bar geometry ─────────────────────────────────────────────── */
const SEG = 100 / 3;
const REST_PCT  = [0, SEG, SEG * 2, 100];
const PHASE1_PCT = [SEG * 0.85, SEG + SEG * 0.85, 91.6];

const EASE_OUT  = "cubic-bezier(0.22, 1, 0.36, 1)";
const PHASE1_MS = 1000;
const SNAP_MS   = 200;
const CREEP_MS  = 2500;
const MOUNT_BEAT_DELAY = 80;

const FILL_PHASE1 = `width ${PHASE1_MS}ms ${EASE_OUT}`;
const FILL_SNAP   = `width ${SNAP_MS}ms ${EASE_OUT}`;
const FILL_CREEP  = `width ${CREEP_MS}ms linear`;
const FILL_BACK   = `width 450ms ${EASE_OUT}`;

/* ─── Copy variants ─────────────────────────────────────────────────────── */
type Copy = { ariaLabel: string; header: string; body: string[][] };

const COPY: Record<KYCUserType, Copy> = {
  guest: {
    ariaLabel: "Verificación de huésped",
    header: "ACCESO VERIFICADO",
    body: [
      ["Para reservar un espacio en Spacio,", "verificamos tu identidad una sola vez."],
      ["Rápido. Seguro. Solo la primera vez.", "Por tu seguridad y la del anfitrión."],
    ],
  },
  host: {
    ariaLabel: "Verificación de host",
    header: "PUBLICA CON CONFIANZA",
    body: [
      ["Para ofrecer tu espacio en Spacio,", "verificamos tu identidad una sola vez."],
      ["Rápido. Seguro. Solo la primera vez.", "Para que los huéspedes confíen en ti", "y tú confíes en ellos."],
    ],
  },
};

function clampStep(step: number): number {
  if (!Number.isFinite(step)) return 1;
  return Math.min(TOTAL_STEPS, Math.max(1, Math.round(step)));
}

/* ─── Step renderer ─────────────────────────────────────────────────────── */
type StepHandlers = {
  email: string;
  setEmail: (next: string) => void;
  country: Country;
  setCountry: (c: Country) => void;
  phone: string;
  setPhone: (digits: string) => void;
  otpPending: boolean;
  otpError: string | null;
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
          pending={h.otpPending}
          submitError={h.otpError}
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
  const setKycStatus = useAuthStore((s) => s.setKycStatus);

  const [activeStep, setActiveStep] = useState<number>(() => clampStep(currentStep));
  const [transition, setTransition] = useState<{ from: number; direction: "forward" | "back" } | null>(null);
  const [fill, setFill] = useState<{ pct: number; cssTransition: string }>(() => ({
    pct: REST_PCT[clampStep(currentStep) - 1],
    cssTransition: FILL_SNAP,
  }));
  const [verifyPhase, setVerifyPhase] = useState<"processing" | "success">("processing");

  /* OTP send state — drives StepContacto's pending/error display. */
  const [otpPending, setOtpPending] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  const timersRef = useRef<number[]>([]);
  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  /* Per-step form state */
  const [email, setEmail]     = useState("");
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [phone, setPhone]     = useState("");
  const [idFront, setIdFront] = useState<string | null>(null);
  const [idBack, setIdBack]   = useState<string | null>(null);

  const navigateTo = useCallback(
    (next: number) => {
      const target = clampStep(next);
      if (target === activeStep) return;
      setTransition({ from: activeStep, direction: target > activeStep ? "forward" : "back" });
      setActiveStep(target);
    },
    [activeStep],
  );

  useEffect(() => {
    if (!transition) return;
    const timer = window.setTimeout(() => setTransition(null), 320);
    return () => window.clearTimeout(timer);
  }, [transition]);

  useEffect(() => clearTimers, [clearTimers]);

  /* ─── Two-phase fill (steps 1→2 and 2→3) ─────────────────────────────── */
  const advanceTwoPhase = useCallback(
    (from: number) => {
      clearTimers();
      setFill({ pct: PHASE1_PCT[from - 1], cssTransition: FILL_PHASE1 });
      const advance = window.setTimeout(() => {
        navigateTo(from + 1);
        const snap = window.setTimeout(() => {
          setFill({ pct: REST_PCT[from], cssTransition: FILL_SNAP });
        }, MOUNT_BEAT_DELAY);
        timersRef.current.push(snap);
      }, PHASE1_MS);
      timersRef.current.push(advance);
    },
    [clearTimers, navigateTo],
  );

  /* ─── Step 3→4: creep + concurrent submitKyc ────────────────────────── */
  const advanceToVerify = useCallback(() => {
    clearTimers();
    setFill({ pct: PHASE1_PCT[2], cssTransition: FILL_PHASE1 });

    const advance = window.setTimeout(() => {
      setVerifyPhase("processing");
      navigateTo(4);

      const creep = window.setTimeout(() => {
        setFill({ pct: 100, cssTransition: FILL_CREEP });
      }, MOUNT_BEAT_DELAY);
      timersRef.current.push(creep);

      /* Run submitKyc and the creep animation concurrently; only flip to
         success once BOTH have completed. */
      let kycDone = false;
      let creepDone = false;

      function maybeFlipSuccess() {
        if (kycDone && creepDone) {
          setKycStatus("verified");
          setVerifyPhase("success");
        }
      }

      void submitKyc(
        { email, phone, country, verified: true, idFront, idBack },
        userType,
      ).then(() => {
        kycDone = true;
        maybeFlipSuccess();
      });

      const finish = window.setTimeout(() => {
        creepDone = true;
        maybeFlipSuccess();
      }, MOUNT_BEAT_DELAY + CREEP_MS);
      timersRef.current.push(finish);

    }, PHASE1_MS);
    timersRef.current.push(advance);
  }, [clearTimers, navigateTo, email, phone, country, idFront, idBack, userType, setKycStatus]);

  /* ─── Back navigation ─────────────────────────────────────────────────── */
  const goBack = useCallback(
    (to: number) => {
      clearTimers();
      setFill({ pct: REST_PCT[to - 1], cssTransition: FILL_BACK });
      navigateTo(to);
    },
    [clearTimers, navigateTo],
  );

  /* ─── Step 1 submit: send OTP ─────────────────────────────────────────── */
  const handleContactoSubmit = useCallback(async () => {
    setOtpError(null);
    setOtpPending(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    setOtpPending(false);

    if (error) {
      setOtpError("No pudimos enviar el código. Intenta de nuevo.");
      return;
    }

    /* Save email hint for the Login modal's recovery path. */
    try { localStorage.setItem("spacio_email_hint", email); } catch { /* ignore */ }

    advanceTwoPhase(1);
  }, [email, advanceTwoPhase]);

  /* Step 2 submit: OTP verified inside StepCode — just advance. */
  const handleCodeSubmit   = useCallback(() => advanceTwoPhase(2),  [advanceTwoPhase]);
  const handleIdSubmit     = useCallback(() => advanceToVerify(),    [advanceToVerify]);
  const handleVerifyComplete = useCallback(() => onComplete(),        [onComplete]);

  /* Esc closes the screen. */
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  /* Lock body scroll. */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const stepHandlers: StepHandlers = {
    email, setEmail,
    country, setCountry,
    phone, setPhone,
    otpPending, otpError,
    handleContactoSubmit,
    handleCodeSubmit,
    idFront, setIdFront,
    idBack, setIdBack,
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
      <button
        type="button"
        aria-label="Cerrar verificación"
        onClick={onClose}
        className={`absolute inset-0 cursor-default ${SCRIM}`}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{ background: MODAL_AMBIENT_BG }}
      />

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
        {/* LEFT — 35%, lighter glass */}
        <aside
          aria-label="Contexto"
          className="relative flex w-full shrink-0 flex-col items-center justify-center rounded-[28px_56px_28px_48px] border border-white/15 border-b-transparent border-r-transparent bg-[#0a1626]/55 p-7 shadow-[34px_42px_120px_rgba(0,0,0,0.62),inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-2xl sm:p-9 lg:w-[35%] lg:max-w-[35%]"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px_56px_28px_48px]"
            style={{
              maskImage: "radial-gradient(ellipse 112% 96% at 22% 42%, black 0%, black 60%, rgba(0,0,0,0.88) 80%, rgba(0,0,0,0.5) 94%, transparent 100%)",
              WebkitMaskImage: "radial-gradient(ellipse 112% 96% at 22% 42%, black 0%, black 60%, rgba(0,0,0,0.88) 80%, rgba(0,0,0,0.5) 94%, transparent 100%)",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: "radial-gradient(ellipse 52% 42% at 18% 0%, rgba(150,205,255,0.14), transparent 68%), linear-gradient(120deg, rgba(255,255,255,0.085), transparent 30%, transparent 62%, rgba(96,165,250,0.05))",
              }}
            />
          </div>

          <span
            aria-hidden
            className="pointer-events-none absolute bottom-14 left-6 top-14 hidden w-px sm:block"
            style={{
              background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.42) 22%, rgba(255,255,255,0.42) 78%, transparent)",
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
              <h2 className={`text-[15px] font-medium uppercase tracking-[0.42em] sm:text-base ${textPrimary}`}>
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

        {/* RIGHT — 65%, darker glass */}
        <section
          aria-label="Verificación"
          className="relative flex flex-1 flex-col overflow-hidden rounded-[32px_56px_48px_28px] border border-white/10 border-b-transparent border-r-transparent bg-[#050b15]/68 p-5 shadow-[34px_42px_120px_rgba(0,0,0,0.62),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl sm:p-7 lg:w-[65%]"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: "radial-gradient(ellipse 60% 38% at 78% 0%, rgba(147,197,253,0.08), transparent 60%), linear-gradient(150deg, transparent 0%, transparent 50%, rgba(96,165,250,0.04) 100%)",
            }}
          />
          <span aria-hidden className={RIM_HIGHLIGHT_TOP} />

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
              <span
                aria-hidden
                className={PROGRESS_FILL}
                style={{ width: `${fill.pct}%`, transition: fill.cssTransition }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-x-1.5 gap-y-1">
              {STEP_LABELS.map((label, i) => {
                const n = i + 1;
                const tone =
                  n === activeStep ? textPrimary
                  : n < activeStep  ? textMeta
                  : textInactive;
                return (
                  <Fragment key={label}>
                    {i > 0 && (
                      <span aria-hidden className={`${STEP_LEGEND_TYPE} ${textInactive}`}>·</span>
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

          <div className="relative flex flex-1 items-center justify-center px-2 sm:px-6">
            <div className="relative w-full">
              {transition && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    animation: `kycStepOut${transition.direction === "forward" ? "Fwd" : "Back"} 300ms ease both`,
                  }}
                >
                  <StepFrame step={transition.from} h={stepHandlers} />
                </div>
              )}

              <div
                key={activeStep}
                style={
                  transition
                    ? { animation: `kycStepIn${transition.direction === "forward" ? "Fwd" : "Back"} 300ms ease both` }
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
