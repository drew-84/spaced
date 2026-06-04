"use client";

import { useEffect } from "react";
import {
  CTA_SECONDARY,
  MODAL_AMBIENT_BG,
  RIM_HIGHLIGHT_TOP,
  SCRIM,
  textBody,
  textPrimary,
} from "@/styles/glass";

/**
 * SPACED — LoginModal (placeholder shell)
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Centered glass panel invoked from the TopNav "Login" link. The full
 * sign-in form (email + password, OTP, Google OAuth) lands in a
 * follow-up prompt — this shell already has the right structure +
 * proportions so the form can drop in without redoing the chrome.
 *
 * Visual language matches the canonical modal-class surfaces:
 *   • KYCScreen          (src/components/kyc/KYCScreen.tsx)
 *   • BookingModal       (src/components/property-detail/booking-modal.tsx)
 *   • OfferScreen        (src/components/list-space/list-space-experience.tsx)
 *
 * Specifically the panel reuses the "darker glass" recipe from
 * KYCScreen's right form panel (#050b15/68, border-white/10, asymmetric
 * radius, deep shadow, backdrop-blur-2xl) so the two surfaces feel
 * like siblings.
 */

type LoginModalProps = {
  open: boolean;
  onClose: () => void;
};

export function LoginModal({ open, onClose }: LoginModalProps) {
  // Esc dismisses the modal, mirroring KYCScreen + BookingModal.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock body scroll while open so the page behind can't scroll through
  // the blurred scrim.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Iniciar sesión"
      /* z-[110] stacks above KYCScreen's z-[100] so an overlap (rare but
         possible during a deep-link race) leaves the login surface on
         top and dismissable. */
      className="fixed inset-0 z-[110] h-[100dvh] w-screen"
      style={{ animation: "loginModalFadeIn 300ms ease-out both" }}
    >
      {/* Scrim — dims + blurs the page below; click closes the modal.
          Same SCRIM token as KYCScreen + BookingModal. */}
      <button
        type="button"
        aria-label="Cerrar inicio de sesión"
        onClick={onClose}
        className={`absolute inset-0 cursor-default ${SCRIM}`}
      />

      {/* Ambient wash — matches MODAL_AMBIENT_BG used by KYCScreen so
          the modal tier feels like one consistent product surface. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{ background: MODAL_AMBIENT_BG }}
      />

      {/* Outer centering frame. The panel is a contained card (not a
          full-bleed surface), so we center it both axes with flexbox.
          py-6 ensures the panel never butts up against the viewport
          edge on short screens. */}
      <div className="relative z-[1] flex h-full w-full items-center justify-center px-4 py-6 sm:px-8">
        <section
          aria-label="Iniciar sesión"
          /* Same recipe as KYCScreen's right form panel:
             • asymmetric outer radius for the signature modal shape
             • bg-[#050b15]/68 — the darker glass tone
             • border-white/10 with transparent bottom-right edges
             • deep two-layer shadow + inset highlight
             • backdrop-blur-2xl
             Dimensions: max 480 × 560 with min-height to guarantee
             premium proportions even when the body is sparse. */
          className="relative flex w-full max-w-[480px] flex-col overflow-hidden rounded-[32px_56px_48px_28px] border border-white/10 border-b-transparent border-r-transparent bg-[#050b15]/68 shadow-[34px_42px_120px_rgba(0,0,0,0.62),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl"
          style={{
            minHeight: "min(560px, calc(100dvh - 48px))",
            maxHeight: "calc(100dvh - 48px)",
          }}
        >
          {/* Decorative inner wash — mirrors KYCScreen's right panel
              radial accent. aria-hidden, pointer-events-none. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 38% at 50% 0%, rgba(147,197,253,0.10), transparent 62%), linear-gradient(150deg, transparent 0%, transparent 50%, rgba(96,165,250,0.04) 100%)",
            }}
          />
          <span aria-hidden className={RIM_HIGHLIGHT_TOP} />

          {/* CERRAR pill — INSIDE the panel at the top-right corner.
              Same CTA_SECONDARY recipe + positioning as the global
              close pill on KYCScreen / OfferScreen / BookingModal so
              the gesture is identical across the four surfaces. */}
          <button
            type="button"
            onClick={onClose}
            className={`absolute right-5 top-5 z-10 ${CTA_SECONDARY}`}
          >
            cerrar
          </button>

          {/* Title — wide letter-spacing, textPrimary opacity (95%),
              centered with comfortable top padding. The pt-12/14 lands
              the headline below the cerrar pill's vertical centerline
              so the two never feel cramped. */}
          <header className="relative px-6 pt-12 sm:px-10 sm:pt-14">
            <h2
              className={`text-center text-base font-medium uppercase tracking-widest sm:text-lg ${textPrimary}`}
              style={{ textShadow: "0 0 28px rgba(255,255,255,0.36)" }}
            >
              Iniciar sesión
            </h2>
          </header>

          {/* Content area — flex-1 grows into the panel so the
              placeholder lands at the optical center. When the real
              form arrives, drop it in here without restructuring. */}
          <div className="relative flex flex-1 items-center justify-center px-8 pb-12 sm:px-12 sm:pb-14">
            <p
              className={`max-w-[32ch] text-center text-sm tracking-[0.02em] ${textBody}`}
              style={{ lineHeight: 1.65 }}
            >
              Próximamente: ingreso con email, contraseña y Google.
            </p>
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
