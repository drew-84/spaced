"use client";

import { useEffect, useRef, useState } from "react";
import {
  CTA_PRIMARY,
  CTA_SECONDARY,
  INPUT_INNER,
  INPUT_WRAP,
  MODAL_AMBIENT_BG,
  RIM_HIGHLIGHT_TOP,
  SCRIM,
  textBody,
  textLabel,
  textPrimary,
} from "@/styles/glass";
import { supabase } from "@/lib/supabase";
import { StepCode } from "@/components/kyc/steps/StepCode";

/**
 * SPACED — Login modal (OTP path)
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Passwordless-only. Mode state machine:
 *
 *   "hint"  — localStorage has a spacio_email_hint from a prior KYC.
 *             Shows the masked address and a single "ENVIAR CÓDIGO" CTA.
 *             A "Usar otro correo" link drops to "input" mode.
 *
 *   "input" — No hint found (or user cleared it).
 *             Shows an email field + "ENVIAR CÓDIGO".
 *
 *   "code"  — OTP was sent. Shows the 6-box code entry (StepCode).
 *             On success Supabase sets the session; modal closes.
 */

const EMAIL_HINT_KEY = "spacio_email_hint";

type Mode = "hint" | "input" | "code";

function maskEmail(email: string): string {
  const [username, domain] = email.split("@");
  if (!domain) return email;
  return `${username.slice(0, 2)}***@${domain}`;
}

type LoginModalProps = {
  open: boolean;
  onClose: () => void;
};

export function LoginModal({ open, onClose }: LoginModalProps) {
  const [mode, setMode]           = useState<Mode>("input");
  const [preCodeMode, setPreCodeMode] = useState<"hint" | "input">("input");
  const [email, setEmail]         = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [pending, setPending]     = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  /* On open: read localStorage hint and set initial mode. */
  useEffect(() => {
    if (!open) return;
    setSendError(null);
    setPending(false);

    try {
      const hint = localStorage.getItem(EMAIL_HINT_KEY);
      if (hint) {
        setEmail(hint);
        setMode("hint");
      } else {
        setEmailInput("");
        setMode("input");
      }
    } catch {
      setEmailInput("");
      setMode("input");
    }
  }, [open]);

  /* Focus the email input when in "input" mode. */
  useEffect(() => {
    if (open && mode === "input") {
      const t = window.setTimeout(() => inputRef.current?.focus(), 60);
      return () => window.clearTimeout(t);
    }
  }, [open, mode]);

  /* Esc closes. */
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  /* Lock body scroll while open. */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  async function sendOtp(target: string) {
    setSendError(null);
    setPending(true);

    const { error } = await supabase.auth.signInWithOtp({
      email: target,
      options: { shouldCreateUser: false },
    });

    setPending(false);

    if (error) {
      setSendError("No pudimos enviar el código. Intenta de nuevo.");
      return;
    }

    /* Save the email hint for this device. */
    try { localStorage.setItem(EMAIL_HINT_KEY, target); } catch { /* ignore */ }
    setEmail(target);
    setMode("code");
  }

  function handleHintSend() {
    setPreCodeMode("hint");
    void sendOtp(email);
  }

  function handleInputSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = emailInput.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setSendError("Ingresa un correo válido.");
      return;
    }
    setPreCodeMode("input");
    void sendOtp(trimmed);
  }

  function switchToInput() {
    setSendError(null);
    setEmailInput("");
    setMode("input");
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Iniciar sesión"
      className="fixed inset-0 z-[110] h-[100dvh] w-screen"
      style={{ animation: "loginModalFadeIn 300ms ease-out both" }}
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className={`absolute inset-0 cursor-default ${SCRIM}`}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{ background: MODAL_AMBIENT_BG }}
      />

      <div className="relative z-[1] flex h-full w-full items-center justify-center px-4 py-6 sm:px-8">
        <section
          aria-label="Iniciar sesión"
          className="relative flex w-full max-w-[440px] flex-col overflow-hidden rounded-[32px_56px_48px_28px] border border-white/10 border-b-transparent border-r-transparent bg-[#050b15]/68 shadow-[34px_42px_120px_rgba(0,0,0,0.62),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl"
          style={{ minHeight: "min(480px, calc(100dvh - 48px))", maxHeight: "calc(100dvh - 48px)" }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: "radial-gradient(ellipse 60% 38% at 50% 0%, rgba(147,197,253,0.10), transparent 62%), linear-gradient(150deg, transparent 0%, transparent 50%, rgba(96,165,250,0.04) 100%)",
            }}
          />
          <span aria-hidden className={RIM_HIGHLIGHT_TOP} />

          <button
            type="button"
            onClick={onClose}
            className={`absolute right-5 top-5 z-10 ${CTA_SECONDARY}`}
          >
            cerrar
          </button>

          {/* ─── Header ─────────────────────────────────────────────────── */}
          <header className="relative px-8 pt-12 sm:px-10 sm:pt-14">
            <h2
              className={`text-center text-base font-medium uppercase tracking-[0.42em] sm:text-lg ${textPrimary}`}
              style={{ textShadow: "0 0 28px rgba(255,255,255,0.36)" }}
            >
              {mode === "code" ? "VERIFICA TU CORREO" : "TU ESPACIO TE ESPERA"}
            </h2>
          </header>

          {/* ─── Body ───────────────────────────────────────────────────── */}
          <div className="relative flex flex-1 flex-col justify-center px-8 pb-10 sm:px-10 sm:pb-12">

            {/* HINT MODE ─────────────────────────────────────────────────── */}
            {mode === "hint" && (
              <div className="flex flex-col gap-6">
                <p className={`text-center text-[13px] tracking-[0.02em] ${textBody}`} style={{ lineHeight: 1.6 }}>
                  Te enviaremos un código a
                </p>
                <p
                  className={`text-center text-base font-medium tracking-[0.04em] ${textPrimary}`}
                  style={{ textShadow: "0 0 20px rgba(255,255,255,0.3)" }}
                >
                  {maskEmail(email)}
                </p>

                {sendError && (
                  <p role="alert" className="text-center text-[11px] font-medium uppercase tracking-[0.22em] text-amber-200/85">
                    {sendError}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleHintSend}
                  disabled={pending}
                  className={`w-full ${CTA_PRIMARY}`}
                >
                  {pending ? "ENVIANDO..." : "ENVIAR CÓDIGO"}
                </button>

                <button
                  type="button"
                  onClick={switchToInput}
                  className={`text-center text-[12px] tracking-[0.04em] ${textLabel} hover:text-white/80 transition-colors`}
                >
                  Usar otro correo
                </button>
              </div>
            )}

            {/* INPUT MODE ─────────────────────────────────────────────────── */}
            {mode === "input" && (
              <form className="flex flex-col gap-5" onSubmit={handleInputSend}>
                <p className={`text-center text-[13px] tracking-[0.02em] ${textBody}`} style={{ lineHeight: 1.6 }}>
                  Ingresa tu correo y te enviamos
                  <br />
                  un código de acceso.
                </p>

                <div className={`${INPUT_WRAP} px-5 py-3`}>
                  <input
                    ref={inputRef}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    spellCheck={false}
                    autoCorrect="off"
                    autoCapitalize="off"
                    value={emailInput}
                    onChange={(e) => { setSendError(null); setEmailInput(e.target.value); }}
                    placeholder="tu@correo.com"
                    required
                    className={INPUT_INNER}
                  />
                </div>

                {sendError && (
                  <p role="alert" className="text-center text-[11px] font-medium uppercase tracking-[0.22em] text-amber-200/85">
                    {sendError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={pending}
                  className={`w-full ${CTA_PRIMARY}`}
                >
                  {pending ? "ENVIANDO..." : "ENVIAR CÓDIGO"}
                </button>
              </form>
            )}

            {/* CODE MODE ──────────────────────────────────────────────────── */}
            {mode === "code" && (
              <StepCode
                email={email}
                onSubmit={onClose}
                onBack={() => setMode(preCodeMode)}
              />
            )}

          </div>
        </section>
      </div>

      <style>{`
        @keyframes loginModalFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
