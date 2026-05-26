"use client";

import { useEffect, useRef, useState } from "react";
import { textBody, textLabel } from "@/styles/glass";
import type { Country } from "@/lib/kyc/countries";

/**
 * SPACED — KYC Step 3: SMS verification code
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Six-box numeric code input with auto-advance, paste support, an
 * auto-verify trigger once all six boxes are filled, a 30 s resend
 * countdown, and a three-strike lockout that re-opens only after the
 * user requests a fresh code.
 *
 * Until the backend lands, the gold-path code is the literal "123456" —
 * any other six-digit string is treated as an incorrect code.
 */

/* ─── Tuning ────────────────────────────────────────────────────────────
   All magic numbers in one place so the lockout/resend behaviour is
   easy to tweak without spelunking through JSX. */
const CODE_LENGTH = 6;
const MAX_ATTEMPTS = 3;
const RESEND_SECONDS = 30;
const RESEND_CONFIRM_MS = 2500;
/** How long the amber-border + error message stays visible on a wrong
 *  code before the boxes auto-clear and refocus on the first one. */
const ERROR_FLASH_MS = 600;
/** Test-mode gold path — replace with the backend's expected value. */
const VALID_CODE = "123456";

/* Mask the phone number so the SMS confirmation feels personal but
   doesn't leak the full number. Format: "+{dial} {first} •••• {last4}".
   Example: phone "912340253" + Chile → "+56 9 •••• 0253". */
function maskPhone(country: Country, digits: string): string {
  if (!digits) return `+${country.dialCode}`;
  const first = digits[0] ?? "";
  const last4 = digits.length >= 5 ? digits.slice(-4) : digits.slice(1);
  return `+${country.dialCode} ${first} •••• ${last4}`;
}

type StepCodeProps = {
  country: Country;
  /** Raw digits collected in Step 2 (no formatting, no country code). */
  phone: string;
  /** Fires when the user enters the correct verification code. */
  onSubmit: () => void;
  /** Back to Step 2. */
  onBack: () => void;
};

export function StepCode({ country, phone, onSubmit, onBack }: StepCodeProps) {
  /* ─── Local form state ────────────────────────────────────────────────
     Per the spec, all of this is internal to Step 3. Going back to
     Step 2 unmounts this component — when the user returns, they get
     a fresh lockout-free, countdown-fresh slate. */
  const [digits, setDigits] = useState<string[]>(() =>
    Array(CODE_LENGTH).fill(""),
  );
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [resendConfirm, setResendConfirm] = useState(false);

  const locked = attempts >= MAX_ATTEMPTS;
  const code = digits.join("");
  const codeComplete = code.length === CODE_LENGTH;
  /* While the amber flash is showing OR the user has hit the strike
     cap, no typing is accepted. The flash duration is short enough that
     this feels like immediate feedback rather than a frozen input. */
  const inputsDisabled = locked || error;

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  /* Guard against the verify effect re-firing for the same code on an
     unrelated re-render (e.g. parent passing a fresh onSubmit prop
     reference while the digits are unchanged). */
  const lastVerifiedRef = useRef<string>("");

  /* ─── Focus management ────────────────────────────────────────────────
     Drop the caret on the first empty box when the step mounts so the
     user can start typing immediately. */
  useEffect(() => {
    const firstEmpty = inputRefs.current.findIndex(
      (el, i) => el && !digits[i],
    );
    const target = firstEmpty >= 0 ? firstEmpty : CODE_LENGTH - 1;
    inputRefs.current[target]?.focus();
    inputRefs.current[target]?.select();
    /* Intentional: only run on mount. The user drives focus afterward. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─── Resend countdown ────────────────────────────────────────────────
     Recursive setTimeout — one timer at a time, auto-stops at zero. */
  useEffect(() => {
    if (countdown <= 0) return;
    const t = window.setTimeout(
      () => setCountdown((c) => Math.max(0, c - 1)),
      1000,
    );
    return () => window.clearTimeout(t);
  }, [countdown]);

  /* ─── Resend-confirmation toast ───────────────────────────────────────
     Show "Código reenviado" for ~2.5 s, then fall back to the countdown. */
  useEffect(() => {
    if (!resendConfirm) return;
    const t = window.setTimeout(
      () => setResendConfirm(false),
      RESEND_CONFIRM_MS,
    );
    return () => window.clearTimeout(t);
  }, [resendConfirm]);

  /* ─── Auto-verify ─────────────────────────────────────────────────────
     Watches the joined code string. As soon as it reaches CODE_LENGTH
     digits we run the (simulated) verification synchronously — no
     setTimeout, so there's nothing for a parent re-render to cancel.
     The `lastVerifiedRef` guard stops the same code from being
     re-verified if the effect re-runs because of an unrelated prop
     change (e.g. a fresh `onSubmit` reference from the parent). */
  useEffect(() => {
    /* Code is still being typed — reset the dedupe ref so the user can
       retry the SAME wrong code after the boxes auto-clear. */
    if (!codeComplete) {
      lastVerifiedRef.current = "";
      return;
    }
    if (locked) return;
    if (code === lastVerifiedRef.current) return;

    lastVerifiedRef.current = code;
    console.log("[KYC StepCode] code length reached 6:", code);
    console.log("[KYC StepCode] running verification check");

    if (code === VALID_CODE) {
      console.log("[KYC StepCode] verification SUCCESS — advancing to step 4");
      onSubmit();
      return;
    }

    console.log("[KYC StepCode] verification FAILED for code:", code);
    setError(true);
    setAttempts((prev) => {
      const next = prev + 1;
      console.log(
        "[KYC StepCode] failed attempts:",
        next,
        "of",
        MAX_ATTEMPTS,
      );
      return next;
    });
  }, [code, codeComplete, locked, onSubmit]);

  /* ─── Error flash → clear → refocus ───────────────────────────────────
     Whenever `error` flips to true we hold the amber border + message
     for ERROR_FLASH_MS, then wipe the boxes and refocus the first one
     so the user can re-attempt without manually deleting. If the user
     just hit the strike cap we skip the refocus — the lockout copy
     takes over and the input is disabled until they tap "Reenviar". */
  useEffect(() => {
    if (!error) return;
    const t = window.setTimeout(() => {
      setDigits(Array(CODE_LENGTH).fill(""));
      setError(false);
      if (attempts < MAX_ATTEMPTS) {
        requestAnimationFrame(() => inputRefs.current[0]?.focus());
      }
    }, ERROR_FLASH_MS);
    return () => window.clearTimeout(t);
  }, [error, attempts]);

  /* ─── Per-box input handlers ──────────────────────────────────────────
     Each handler mutates a single index in the digits array and
     advances focus when appropriate. The amber error state is owned by
     the auto-clear effect above so we don't need to clear it here. */
  function setDigit(idx: number, value: string) {
    setDigits((prev) => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
  }

  function focusBox(idx: number) {
    const target = inputRefs.current[idx];
    target?.focus();
    target?.select();
  }

  function handleChange(idx: number, e: React.ChangeEvent<HTMLInputElement>) {
    /* Only keep the last typed digit — guards against IME/autofill
       dumping multi-character strings into a maxLength=1 input. */
    const digit = e.target.value.replace(/\D/g, "").slice(-1);
    if (!digit) {
      setDigit(idx, "");
      return;
    }
    setDigit(idx, digit);
    if (idx < CODE_LENGTH - 1) focusBox(idx + 1);
  }

  function handleKeyDown(
    idx: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (e.key === "Backspace") {
      if (digits[idx]) {
        /* Box has content — let the default behaviour clear it; we
           also push the cleared state immediately so the user can
           keep deleting backward without a stutter. */
        e.preventDefault();
        setDigit(idx, "");
        return;
      }
      if (idx > 0) {
        e.preventDefault();
        setDigit(idx - 1, "");
        focusBox(idx - 1);
      }
      return;
    }
    if (e.key === "ArrowLeft" && idx > 0) {
      e.preventDefault();
      focusBox(idx - 1);
      return;
    }
    if (e.key === "ArrowRight" && idx < CODE_LENGTH - 1) {
      e.preventDefault();
      focusBox(idx + 1);
      return;
    }
    /* Block anything that isn't a digit (control keys still pass). */
    if (e.key.length === 1 && !/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    if (inputsDisabled) return;
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH);
    if (!pasted) return;
    /* Always distribute from box 0 regardless of which box received
       the paste — matches the spec's "distribute … across all 6". */
    setDigits(() => {
      const next = Array<string>(CODE_LENGTH).fill("");
      for (let i = 0; i < pasted.length; i += 1) next[i] = pasted[i];
      return next;
    });
    const nextFocus =
      pasted.length >= CODE_LENGTH ? CODE_LENGTH - 1 : pasted.length;
    requestAnimationFrame(() => focusBox(nextFocus));
  }

  /* ─── Resend handler ──────────────────────────────────────────────────
     Clears the lockout, wipes the boxes, restarts the timer, resets the
     dedupe ref (so the user can re-enter the same wrong code if they
     want), and shows the 2.5 s inline confirmation. */
  function handleResend() {
    if (countdown > 0) return;
    console.log("[KYC StepCode] resend triggered — resetting attempts");
    setDigits(Array(CODE_LENGTH).fill(""));
    setAttempts(0);
    setError(false);
    lastVerifiedRef.current = "";
    setCountdown(RESEND_SECONDS);
    setResendConfirm(true);
    requestAnimationFrame(() => focusBox(0));
  }

  /* ─── Derived styling ─────────────────────────────────────────────────
     A single string of class names per box keeps the JSX legible. */
  const boxClass = (idx: number) => {
    const filled = Boolean(digits[idx]);
    return [
      "block h-12 w-12 sm:h-14 sm:w-14 rounded-2xl border bg-white/[0.04] text-center text-2xl font-medium tracking-[0.04em] text-white/95 outline-none backdrop-blur-md tabular-nums",
      "shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_18px_-6px_rgba(0,0,0,0.45)]",
      "transition-all duration-200 ease-out motion-reduce:transition-none",
      "disabled:cursor-not-allowed disabled:opacity-50",
      error
        ? "border-amber-200/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_18px_-6px_rgba(0,0,0,0.45),0_0_22px_-4px_rgba(252,211,77,0.4)]"
        : filled
          ? "border-white/35 bg-white/[0.06]"
          : "border-white/15",
      "focus:border-white/45 focus:bg-white/[0.06] focus:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_18px_-6px_rgba(0,0,0,0.45),0_0_24px_-6px_rgba(255,255,255,0.4)]",
    ].join(" ");
  };

  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-col">
      {/* ATRÁS — same shape and behaviour as Step 2's back link. */}
      <button
        type="button"
        onClick={onBack}
        className="-ml-1 mb-6 inline-flex w-fit items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-[0.32em] text-white/60 transition-colors duration-200 ease-out hover:text-white/95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 motion-reduce:transition-none"
      >
        <span aria-hidden>←</span> ATRÁS
      </button>

      {/* Step label */}
      <p className={`${textLabel} text-[10px] uppercase tracking-[0.32em]`}>
        CÓDIGO DE VERIFICACIÓN
      </p>

      {/* Confirmation message — masked phone */}
      <p
        className={`mt-4 text-[13px] font-normal tracking-[0.02em] ${textBody}`}
      >
        Enviamos un código a{" "}
        <span className="text-white/90 tabular-nums">
          {maskPhone(country, phone)}
        </span>
      </p>

      {/* Six-box input row */}
      <div
        role="group"
        aria-label="Código de verificación de 6 dígitos"
        className="mt-7 flex justify-center gap-2 sm:gap-3"
      >
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={d}
            disabled={inputsDisabled}
            aria-label={`Dígito ${i + 1} de ${CODE_LENGTH}`}
            aria-invalid={error}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            className={boxClass(i)}
          />
        ))}
      </div>

      {/* Error / lock message — single source of truth, prefers the
          lockout copy once attempts reach the cap. */}
      {(error || locked) && (
        <p
          role="alert"
          className="mt-4 text-center text-[11px] font-medium uppercase tracking-[0.22em] text-amber-200/85"
        >
          {locked
            ? "Demasiados intentos. Reenvía el código."
            : "Código incorrecto. Inténtalo de nuevo."}
        </p>
      )}

      {/* Resend line — flips between countdown, confirmation, and the
          clickable "Reenviar" link based on local state. */}
      <div className="mt-8 flex justify-center">
        {resendConfirm ? (
          <p
            className={`text-[12px] font-normal tracking-[0.02em] ${textBody}`}
            style={{ animation: "kycChipFadeIn 200ms ease-out both" }}
          >
            Código reenviado
          </p>
        ) : countdown > 0 ? (
          <p className={`text-[12px] tabular-nums ${textLabel}`}>
            Reenviar disponible en {countdown}s
          </p>
        ) : (
          <p className={`text-[12px] ${textLabel}`}>
            ¿No recibiste el código?{" "}
            <button
              type="button"
              onClick={handleResend}
              className="font-medium text-white/80 underline-offset-4 transition-colors duration-200 ease-out hover:text-white/95 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 motion-reduce:transition-none"
            >
              Reenviar
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
