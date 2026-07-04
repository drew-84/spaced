"use client";

import { useEffect, useRef, useState } from "react";
import { textBody, textLabel } from "@/styles/glass";
import { supabase } from "@/lib/supabase";

/**
 * SPACED — KYC Step 2: email OTP verification
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Six-box numeric code input. When all six digits are filled the component
 * calls supabase.auth.verifyOtp() automatically. On success it fires
 * onSubmit() — by this point Supabase has created (or re-authenticated)
 * the user and a live session exists. On failure the boxes clear and the
 * user can retry up to MAX_ATTEMPTS times before needing to resend.
 *
 * "Reenviar" calls supabase.auth.signInWithOtp() for the same email so
 * the server issues a fresh code.
 */

const CODE_LENGTH = 6;
const MAX_ATTEMPTS = 3;
const RESEND_SECONDS = 30;
const RESEND_CONFIRM_MS = 2500;
const ERROR_FLASH_MS = 600;

function maskEmail(email: string): string {
  const [username, domain] = email.split("@");
  if (!domain) return email;
  const visible = username.slice(0, 2);
  return `${visible}***@${domain}`;
}

type StepCodeProps = {
  email: string;
  onSubmit: () => void;
  onBack: () => void;
};

export function StepCode({ email, onSubmit, onBack }: StepCodeProps) {
  const [digits, setDigits] = useState<string[]>(() =>
    Array(CODE_LENGTH).fill(""),
  );
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [resendConfirm, setResendConfirm] = useState(false);

  const locked = attempts >= MAX_ATTEMPTS;
  const code = digits.join("");
  const codeComplete = code.length === CODE_LENGTH;
  const inputsDisabled = locked || error || verifying;

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const lastVerifiedRef = useRef<string>("");

  /* Focus first empty box on mount. */
  useEffect(() => {
    const firstEmpty = inputRefs.current.findIndex(
      (el, i) => el && !digits[i],
    );
    const target = firstEmpty >= 0 ? firstEmpty : CODE_LENGTH - 1;
    inputRefs.current[target]?.focus();
    inputRefs.current[target]?.select();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Resend countdown — recursive setTimeout, stops at zero. */
  useEffect(() => {
    if (countdown <= 0) return;
    const t = window.setTimeout(
      () => setCountdown((c) => Math.max(0, c - 1)),
      1000,
    );
    return () => window.clearTimeout(t);
  }, [countdown]);

  /* Resend-confirmation toast — shown for ~2.5 s. */
  useEffect(() => {
    if (!resendConfirm) return;
    const t = window.setTimeout(() => setResendConfirm(false), RESEND_CONFIRM_MS);
    return () => window.clearTimeout(t);
  }, [resendConfirm]);

  /* Auto-verify: fires when all six digits are present. Calls Supabase
     verifyOtp — if the code is correct the user gets a live session and
     we advance; if not, the error flash + attempt counter kicks in. */
  useEffect(() => {
    if (!codeComplete) {
      lastVerifiedRef.current = "";
      return;
    }
    if (locked || verifying) return;
    if (code === lastVerifiedRef.current) return;

    lastVerifiedRef.current = code;
    setVerifying(true);

    supabase.auth
      .verifyOtp({ email, token: code, type: "email" })
      .then(({ error: otpError }) => {
        setVerifying(false);
        if (!otpError) {
          onSubmit();
        } else {
          setError(true);
          setAttempts((prev) => prev + 1);
        }
      });
  }, [code, codeComplete, locked, verifying, onSubmit, email]);

  /* Error flash → clear boxes → refocus. */
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
    const digit = e.target.value.replace(/\D/g, "").slice(-1);
    if (!digit) { setDigit(idx, ""); return; }
    setDigit(idx, digit);
    if (idx < CODE_LENGTH - 1) focusBox(idx + 1);
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (digits[idx]) { e.preventDefault(); setDigit(idx, ""); return; }
      if (idx > 0) { e.preventDefault(); setDigit(idx - 1, ""); focusBox(idx - 1); }
      return;
    }
    if (e.key === "ArrowLeft" && idx > 0) { e.preventDefault(); focusBox(idx - 1); return; }
    if (e.key === "ArrowRight" && idx < CODE_LENGTH - 1) { e.preventDefault(); focusBox(idx + 1); return; }
    if (e.key.length === 1 && !/^\d$/.test(e.key)) e.preventDefault();
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    if (inputsDisabled) return;
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH);
    if (!pasted) return;
    setDigits(() => {
      const next = Array<string>(CODE_LENGTH).fill("");
      for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
      return next;
    });
    const nextFocus = pasted.length >= CODE_LENGTH ? CODE_LENGTH - 1 : pasted.length;
    requestAnimationFrame(() => focusBox(nextFocus));
  }

  /* Resend: calls signInWithOtp for the same email, resets all local state. */
  function handleResend() {
    if (countdown > 0) return;
    void supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    setDigits(Array(CODE_LENGTH).fill(""));
    setAttempts(0);
    setError(false);
    lastVerifiedRef.current = "";
    setCountdown(RESEND_SECONDS);
    setResendConfirm(true);
    requestAnimationFrame(() => focusBox(0));
  }

  const boxClass = (idx: number) => {
    const filled = Boolean(digits[idx]);
    return [
      "block h-12 w-12 sm:h-14 sm:w-14 rounded-2xl border bg-white/[0.04] text-center text-2xl font-medium tracking-[0.04em] text-white/95 outline-none backdrop-blur-md tabular-nums",
      "shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_18px_-6px_rgba(0,0,0,0.45)]",
      "transition-all duration-200 ease-out motion-reduce:transition-none",
      "disabled:cursor-not-allowed disabled:opacity-50",
      error
        ? "border-amber-200/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_18px_-6px_rgba(0,0,0,0.45),0_0_22px_-4px_rgba(252,211,77,0.4)]"
        : verifying
          ? "border-white/25"
          : filled
            ? "border-white/35 bg-white/[0.06]"
            : "border-white/15",
      "focus:border-white/45 focus:bg-white/[0.06] focus:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_18px_-6px_rgba(0,0,0,0.45),0_0_24px_-6px_rgba(255,255,255,0.4)]",
    ].join(" ");
  };

  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-col">
      <button
        type="button"
        onClick={onBack}
        className="-ml-1 mb-6 inline-flex w-fit items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-[0.32em] text-white/60 transition-colors duration-200 ease-out hover:text-white/95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 motion-reduce:transition-none"
      >
        <span aria-hidden>←</span> ATRÁS
      </button>

      <p className={`${textLabel} text-[10px] uppercase tracking-[0.32em]`}>
        CÓDIGO DE VERIFICACIÓN
      </p>

      <p className={`mt-4 text-[13px] font-normal tracking-[0.02em] ${textBody}`}>
        Enviamos un código a{" "}
        <span className="text-white/90">{maskEmail(email)}</span>
      </p>

      <p className={`mt-2 text-[12px] font-normal tracking-[0.02em] ${textLabel}`}>
        {verifying ? "Verificando..." : "Revisa tu correo e ingresa el código."}
      </p>

      <div
        role="group"
        aria-label="Código de verificación de 6 dígitos"
        className="mt-7 flex justify-center gap-2 sm:gap-3"
      >
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
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
