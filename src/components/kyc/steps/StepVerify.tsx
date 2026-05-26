"use client";

import { useEffect, useState } from "react";
import {
  textBody,
  textLabel,
  textPrimary,
  textSecondary,
} from "@/styles/glass";

/**
 * SPACED — KYC Step 5 of 5: Verification processing + success
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Final step in the KYC flow. Runs two phases back to back:
 *
 *   PHASE A — "VERIFICANDO" (processing)
 *     A circular glass spinner with a soft white glow chases its own tail
 *     for 2.5 s while reassuring copy sits below it. This sells the moment
 *     of identity confirmation without spamming the user with progress
 *     numbers — the bar at the top is already at 100%.
 *
 *   PHASE B — "VERIFICADO" (success)
 *     A large glowing checkmark scales in with a slight overshoot, the
 *     personalised welcome line greets the user by first name (derived
 *     from the email username when KYC data isn't available yet), and a
 *     centered CONTINUAR pill hands control back to the parent.
 *
 * No back navigation: once a user lands here, verification is done — the
 * only escape is the global CERRAR pill in the corner of KYCScreen.
 */

const PROCESSING_MS = 2500;

type StepVerifyProps = {
  /** Used to derive a first name for the welcome line. */
  email: string;
  /** Fires when the user clicks CONTINUAR on the success screen. */
  onSubmit: () => void;
};

/* Derive a presentable first name from the email username. Splits on the
   common separators (".", "_", "-", "+") so "andres.lopez@gmail.com" gives
   "Andres". Returns an empty string if nothing usable is left after
   stripping non-letters, in which case the welcome line is rendered
   without a name. */
function extractFirstName(email: string): string {
  if (!email) return "";
  const username = email.split("@")[0] ?? "";
  const firstSegment = username.split(/[._\-+]/)[0] ?? "";
  // Strip digits + symbols, keep Spanish accented letters.
  const cleaned = firstSegment.replace(/[^a-zA-ZáéíóúñüÁÉÍÓÚÑÜ]/g, "");
  if (!cleaned) return "";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
}

export function StepVerify({ email, onSubmit }: StepVerifyProps) {
  const [phase, setPhase] = useState<"processing" | "success">("processing");

  /* Auto-transition from processing to success after PROCESSING_MS. The
     2.5 s window is long enough to feel like real work is happening but
     short enough that the user never wonders if they should reload. */
  useEffect(() => {
    const t = window.setTimeout(() => {
      console.log("[KYC] verification phase → success");
      setPhase("success");
    }, PROCESSING_MS);
    return () => window.clearTimeout(t);
  }, []);

  const firstName = extractFirstName(email);

  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-col items-center text-center">
      {/* Phase crossfade — re-keying on `phase` forces React to mount a
          fresh subtree, so the kycVerifyPhaseIn keyframe replays on
          entry. The exit is absorbed by the unmount; the eye reads it
          as a clean fade-in of new content. */}
      <div
        key={phase}
        className="flex w-full flex-col items-center"
        style={{ animation: "kycVerifyPhaseIn 400ms ease-out both" }}
      >
        {phase === "processing" ? (
          <ProcessingPhase />
        ) : (
          <SuccessPhase firstName={firstName} onSubmit={onSubmit} />
        )}
      </div>
    </div>
  );
}

/* ─── Phase A ──────────────────────────────────────────────────────────── */

function ProcessingPhase() {
  return (
    <>
      <p
        className={`text-[10px] uppercase tracking-[0.32em] ${textLabel}`}
        aria-live="polite"
      >
        VERIFICANDO
      </p>

      {/* Spinner — generous vertical breathing room top + bottom. */}
      <div className="my-10">
        <Spinner />
      </div>

      <p
        className={`text-[13px] tracking-[0.02em] ${textBody}`}
        style={{ lineHeight: 1.6 }}
      >
        Estamos confirmando tu identidad...
      </p>
    </>
  );
}

function Spinner() {
  /* Track + rotating arc + soft outer glow. The track is faint enough that
     it reads as a hint of structure rather than a competing circle; the
     arc inherits the glow via the SVG drop-shadow filter so it feels lit
     from within. */
  return (
    <div
      role="status"
      aria-label="Verificando"
      className="relative h-[72px] w-[72px]"
      style={{
        animation: "kycVerifySpin 1.4s linear infinite",
        filter: "drop-shadow(0 0 14px rgba(255,255,255,0.4))",
      }}
    >
      <svg
        viewBox="0 0 80 80"
        className="h-full w-full"
        aria-hidden
      >
        <defs>
          {/* Vertical gradient — leading edge of the arc is opaque,
              trailing edge fades to transparent, producing a comet tail
              once the SVG starts rotating. */}
          <linearGradient
            id="kycVerifySpinGrad"
            x1="50%"
            y1="0%"
            x2="50%"
            y2="100%"
          >
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="100%" stopColor="white" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {/* Track — full circle, very low opacity. */}
        <circle
          cx="40"
          cy="40"
          r="32"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="3"
        />

        {/* Moving arc — dasharray ≈ half the circumference (2π·32 ≈ 201),
            so a 110-unit dash with a 201-unit gap traces roughly half
            the ring as a luminous comet. */}
        <circle
          cx="40"
          cy="40"
          r="32"
          fill="none"
          stroke="url(#kycVerifySpinGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="110 201"
          transform="rotate(-90 40 40)"
        />
      </svg>
    </div>
  );
}

/* ─── Phase B ──────────────────────────────────────────────────────────── */

type SuccessPhaseProps = {
  firstName: string;
  onSubmit: () => void;
};

function SuccessPhase({ firstName, onSubmit }: SuccessPhaseProps) {
  return (
    <>
      <CheckmarkIcon />

      <p
        className={`mt-4 text-[14px] font-medium uppercase tracking-[0.34em] ${textPrimary}`}
      >
        VERIFICADO
      </p>

      <p
        className={`mt-6 text-base tracking-[0.02em] ${textSecondary}`}
        style={{ lineHeight: 1.5 }}
      >
        Bienvenido/a{firstName ? `, ${firstName}` : ""}.
      </p>

      <p
        className={`mt-4 text-[13px] tracking-[0.02em] ${textBody}`}
        style={{ lineHeight: 1.65 }}
      >
        Tu identidad ha sido confirmada.
        <br />
        Spacio es más seguro gracias a ti.
      </p>

      {/* CONTINUAR — centered horizontally per spec; this is the moment
          that matters. Same pill shape and hover behaviour as the other
          step CTAs, so the language is consistent across the flow. */}
      <button
        type="button"
        onClick={onSubmit}
        className="group mt-10 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.04] px-7 py-3 text-[11px] font-medium uppercase tracking-[0.32em] text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_18px_-6px_rgba(0,0,0,0.42)] backdrop-blur-md transition-all duration-300 ease-out motion-reduce:transition-none hover:border-white/45 hover:bg-white/[0.09] hover:text-white/95 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_0_28px_-6px_rgba(255,255,255,0.5),0_10px_22px_-6px_rgba(0,0,0,0.42)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
      >
        CONTINUAR
        <span
          aria-hidden
          className="transition-transform duration-300 ease-out motion-reduce:transition-none group-hover:translate-x-0.5"
        >
          →
        </span>
      </button>
    </>
  );
}

function CheckmarkIcon() {
  /* Two coordinated animations: the whole SVG scales in with a slight
     overshoot (kycVerifyCheckIn), then the check path itself draws
     itself in with the stroke-dasharray trick (kycVerifyCheckDraw). The
     draw is delayed by 120 ms so the circle ring lands first and the
     check feels like a confident, deliberate gesture. */
  return (
    <svg
      viewBox="0 0 80 80"
      className="h-[72px] w-[72px] text-white"
      stroke="currentColor"
      fill="none"
      aria-hidden
      style={{
        animation: "kycVerifyCheckIn 500ms cubic-bezier(0.34, 1.56, 0.64, 1) both",
        filter: "drop-shadow(0 0 22px rgba(255,255,255,0.5))",
      }}
    >
      <circle
        cx="40"
        cy="40"
        r="36"
        strokeWidth="1.5"
        strokeOpacity="0.35"
      />
      <path
        d="M24 41 L35 52 L57 30"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: 60,
          strokeDashoffset: 60,
          animation:
            "kycVerifyCheckDraw 520ms cubic-bezier(0.22, 1, 0.36, 1) 120ms both",
        }}
      />
    </svg>
  );
}
