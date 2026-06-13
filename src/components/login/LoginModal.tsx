"use client";

import { useEffect, useState } from "react";
import {
  CTA_PRIMARY,
  CTA_SECONDARY,
  INPUT_INNER,
  INPUT_WRAP,
  MODAL_AMBIENT_BG,
  RIM_HIGHLIGHT_TOP,
  SCRIM,
  TEXT_LABEL,
  textBody,
  textPrimary,
} from "@/styles/glass";
import { supabase } from "@/lib/supabase";

type Mode = "login" | "register" | "success";

type LoginModalProps = {
  open: boolean;
  onClose: () => void;
};

export function LoginModal({ open, onClose }: LoginModalProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setMode("login");
      setError(null);
      setPending(false);
    }
  }, [open]);

  function switchMode(next: Mode) {
    setError(null);
    setPending(false);
    setMode(next);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    if (mode === "login") {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) { setError(authError.message); setPending(false); return; }
      onClose();
    } else {
      const { error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) { setError(authError.message); setPending(false); return; }
      setMode("success");
      setPending(false);
    }
  }

  // Esc dismisses
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  const title = mode === "login" ? "Iniciar sesión" : mode === "register" ? "Crear cuenta" : "¡Listo!";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
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
          aria-label={title}
          className="relative flex w-full max-w-[480px] flex-col overflow-hidden rounded-[32px_56px_48px_28px] border border-white/10 border-b-transparent border-r-transparent bg-[#050b15]/68 shadow-[34px_42px_120px_rgba(0,0,0,0.62),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl"
          style={{
            minHeight: "min(560px, calc(100dvh - 48px))",
            maxHeight: "calc(100dvh - 48px)",
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 38% at 50% 0%, rgba(147,197,253,0.10), transparent 62%), linear-gradient(150deg, transparent 0%, transparent 50%, rgba(96,165,250,0.04) 100%)",
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

          <header className="relative px-6 pt-12 sm:px-10 sm:pt-14">
            <h2
              className={`text-center text-base font-medium uppercase tracking-widest sm:text-lg ${textPrimary}`}
              style={{ textShadow: "0 0 28px rgba(255,255,255,0.36)" }}
            >
              {title}
            </h2>
            {mode !== "success" && (
              <p className={`mt-1.5 text-center text-xs tracking-[0.03em] ${textBody}`}>
                {mode === "login" ? "Activa espacio ahora" : "Únete a SPACED"}
              </p>
            )}
          </header>

          <div className="relative flex flex-1 flex-col justify-center px-8 pb-10 sm:px-12 sm:pb-12">
            {mode === "success" ? (
              <div className="space-y-4 text-center">
                <p className={`text-sm leading-relaxed ${textBody}`}>
                  Te enviamos un enlace de confirmación. Confírmalo y luego inicia sesión.
                </p>
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className={`mt-2 text-sm font-medium text-white/70 underline underline-offset-2 transition-colors hover:text-white`}
                >
                  Iniciar sesión
                </button>
              </div>
            ) : (
              <form key={mode} className="space-y-5" onSubmit={onSubmit}>
                <div className="space-y-1.5">
                  <label htmlFor="modal-email" className={TEXT_LABEL}>
                    Correo
                  </label>
                  <div className={`${INPUT_WRAP} px-4 py-3`}>
                    <input
                      id="modal-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="tu@correo.com"
                      className={INPUT_INNER}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="modal-password" className={TEXT_LABEL}>
                    Contraseña
                  </label>
                  <div className={`${INPUT_WRAP} px-4 py-3`}>
                    <input
                      id="modal-password"
                      name="password"
                      type="password"
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
                      required
                      minLength={mode === "register" ? 8 : undefined}
                      placeholder={mode === "register" ? "Mínimo 8 caracteres" : "Tu contraseña"}
                      className={INPUT_INNER}
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-400/90">{error}</p>
                )}

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={pending}
                    className={`w-full ${CTA_PRIMARY}`}
                  >
                    {pending
                      ? mode === "login" ? "Entrando…" : "Creando…"
                      : mode === "login" ? "Entrar" : "Crear cuenta"}
                  </button>
                </div>

                <p className={`text-center text-sm ${textBody}`}>
                  {mode === "login" ? (
                    <>
                      ¿No tienes cuenta?{" "}
                      <button
                        type="button"
                        onClick={() => switchMode("register")}
                        className="font-medium text-white/70 underline underline-offset-2 transition-colors hover:text-white"
                      >
                        Registrarse
                      </button>
                    </>
                  ) : (
                    <>
                      ¿Ya tienes cuenta?{" "}
                      <button
                        type="button"
                        onClick={() => switchMode("login")}
                        className="font-medium text-white/70 underline underline-offset-2 transition-colors hover:text-white"
                      >
                        Iniciar sesión
                      </button>
                    </>
                  )}
                </p>
              </form>
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
