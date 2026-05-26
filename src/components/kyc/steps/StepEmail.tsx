"use client";

import { useMemo, useRef, useState } from "react";
import { textLabel } from "@/styles/glass";

/**
 * SPACED — KYC Step 1: Email
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Holds the email input with an inline ghost-completion for the most common
 * Chilean-market domains. The ghost text is rendered in an absolutely
 * positioned overlay so the real <input> value never carries the
 * suggestion's characters until the user explicitly accepts it (Tab,
 * ArrowRight, Space on desktop; tap on the floating chip or the ghost
 * itself on mobile).
 *
 * The overlay mirrors the input's font, size, padding and tracking so the
 * ghost sits pixel-aligned with the user's typing.
 */

/* ─── Domain map ─────────────────────────────────────────────────────────
   First character after "@" maps to the most common full domain. Ordered
   by Chilean-market share. */
const DOMAIN_MAP: Record<string, string> = {
  g: "gmail.com",
  h: "hotmail.com",
  o: "outlook.com",
  y: "yahoo.com",
  i: "icloud.com",
};

/** Compute the un-typed remainder of the suggested domain, or "" if no
 *  active suggestion. Returns the *suffix* the user still needs to accept,
 *  not the full domain. */
function computeSuggestion(email: string): string {
  const atIdx = email.indexOf("@");
  if (atIdx < 0) return "";
  /* Bail out if there's a second @ — the email is malformed and any
     suggestion would be misleading. */
  if (email.indexOf("@", atIdx + 1) !== -1) return "";
  const domain = email.slice(atIdx + 1).toLowerCase();
  if (domain.length < 1) return "";
  const fullDomain = DOMAIN_MAP[domain[0]];
  if (!fullDomain) return "";
  if (!fullDomain.startsWith(domain)) return "";
  /* If user has already typed the whole domain, there is nothing left to
     suggest. */
  if (domain === fullDomain) return "";
  return fullDomain.slice(domain.length);
}

/** Standard email shape — single @, at least one char before, and one
 *  dot-separated TLD after. Sufficient as a UX gate; the real backend
 *  validator can be stricter. */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function getEmailError(email: string): string | null {
  if (!email.trim()) return "Ingresa un email válido";
  if (!isValidEmail(email)) return "Formato de email inválido";
  return null;
}

/* Shared text styling for the input and its ghost overlay — they MUST
   match exactly so the ghost lines up flush with the user's cursor. */
const FIELD_TEXT = "text-base font-normal tracking-[0.02em] leading-none";
const FIELD_PAD_X = "px-6";

type StepEmailProps = {
  email: string;
  onEmailChange: (next: string) => void;
  /** Fires only when the email is valid and the user clicks CONTINUAR. */
  onSubmit: (email: string) => void;
};

export function StepEmail({ email, onEmailChange, onSubmit }: StepEmailProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [focused, setFocused] = useState(false);

  const suggestion = useMemo(() => computeSuggestion(email), [email]);
  const error = validationAttempted ? getEmailError(email) : null;

  function acceptSuggestion() {
    if (!suggestion) return;
    onEmailChange(email + suggestion);
    /* Refocus the input so the user can keep typing immediately after a
       tap or click on the ghost / chip. */
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      /* Enter submits the step, matching the natural form affordance. */
      e.preventDefault();
      handleContinue();
      return;
    }
    if (!suggestion) return;
    /* Tab, ArrowRight and Space all accept the suggestion. Space is
       intercepted so the literal " " character never lands in the input
       (emails can't contain spaces anyway). */
    if (e.key === "Tab" || e.key === "ArrowRight" || e.key === " ") {
      e.preventDefault();
      acceptSuggestion();
    }
  }

  function handleContinue() {
    setValidationAttempted(true);
    if (!getEmailError(email)) {
      console.log("[KYC] email valid, moving to step 2", email);
      onSubmit(email);
    }
  }

  /* Border + glow recipe. Error state overrides the focus state with a
     warm amber tone. */
  const wrapClass = [
    "relative rounded-full border bg-white/[0.04] backdrop-blur-md",
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_18px_-6px_rgba(0,0,0,0.5)]",
    "transition-all duration-300 ease-out motion-reduce:transition-none",
    error
      ? "border-amber-200/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_18px_-6px_rgba(0,0,0,0.5),0_0_22px_-4px_rgba(252,211,77,0.4)]"
      : focused
        ? "border-white/40 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_18px_-6px_rgba(0,0,0,0.5),0_0_24px_-6px_rgba(255,255,255,0.4)]"
        : "border-white/15",
  ].join(" ");

  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-col gap-3">
      {/* Step label */}
      <p
        className={`${textLabel} text-[10px] uppercase tracking-[0.32em]`}
      >
        TU EMAIL
      </p>

      {/* Email input — relative for the absolute overlay + mobile chip. */}
      <div className="relative">
        {/* Mobile-only suggestion chip — appears above the input. Hidden on
            ≥sm because the inline ghost + Tab/Space/ArrowRight already
            cover desktop. */}
        {suggestion && (
          <button
            type="button"
            onClick={acceptSuggestion}
            aria-label={`Aceptar sugerencia: ${email}${suggestion}`}
            className="absolute bottom-full left-1/2 z-20 mb-3 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/20 bg-[#0a1626]/85 px-4 py-2 text-xs font-normal text-white/85 shadow-[0_10px_28px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md sm:hidden"
            style={{ animation: "kycChipFadeIn 200ms ease-out both" }}
          >
            {email + suggestion}
          </button>
        )}

        <div className={wrapClass}>
          <input
            ref={inputRef}
            type="email"
            inputMode="email"
            autoComplete="email"
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            value={email}
            placeholder="@"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "kyc-email-error" : undefined}
            onChange={(e) => onEmailChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKeyDown}
            className={`relative z-10 block h-14 w-full rounded-full bg-transparent ${FIELD_PAD_X} ${FIELD_TEXT} text-white/95 placeholder:text-white/35 outline-none`}
          />

          {/* Ghost overlay — same font/padding so the suggestion sits flush
              with the user's cursor. pointer-events-none on the container
              so clicks pass through to the input, but the ghost <span>
              re-enables pointer events so mobile users can tap it. */}
          {suggestion && (
            <div
              aria-hidden
              className={`pointer-events-none absolute inset-0 z-0 flex items-center overflow-hidden whitespace-pre ${FIELD_PAD_X} ${FIELD_TEXT}`}
            >
              <span className="invisible">{email}</span>
              <span
                role="button"
                tabIndex={-1}
                onClick={acceptSuggestion}
                className="pointer-events-auto cursor-pointer text-white/35 transition-colors duration-200 hover:text-white/55"
              >
                {suggestion}
              </span>
            </div>
          )}
        </div>

        {/* Error caption — warm amber, label-tier opacity, sized like an
            eyebrow so it slots under the input without crowding. */}
        {error && (
          <p
            id="kyc-email-error"
            role="alert"
            className="mt-2.5 px-2 text-[11px] font-medium uppercase tracking-[0.22em] text-amber-200/85"
          >
            {error}
          </p>
        )}
      </div>

      {/* CONTINUAR — right-aligned within the content area, comfortable
          32px gap above the input field per spec. */}
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={handleContinue}
          className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.04] px-6 py-3 text-[11px] font-medium uppercase tracking-[0.32em] text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_18px_-6px_rgba(0,0,0,0.42)] backdrop-blur-md transition-all duration-300 ease-out motion-reduce:transition-none hover:border-white/40 hover:bg-white/[0.08] hover:text-white/95 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_0_26px_-6px_rgba(255,255,255,0.45),0_10px_22px_-6px_rgba(0,0,0,0.42)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
        >
          CONTINUAR
          <span
            aria-hidden
            className="transition-transform duration-300 ease-out motion-reduce:transition-none group-hover:translate-x-0.5"
          >
            →
          </span>
        </button>
      </div>
    </div>
  );
}
