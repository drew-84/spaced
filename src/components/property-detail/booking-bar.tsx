"use client";

import { CTA_PRIMARY, TEXT_HINT, TEXT_LABEL } from "@/styles/glass";
import type { PropertyDetail } from "./types";

type Props = {
  property: Pick<
    PropertyDetail,
    "pricePer15Min" | "pricePer45Min" | "instantBooking" | "hostConfirmationHours"
  >;
  onReserve: () => void;
};

/**
 * Sticky floating glass booking bar. Uses the shared CTA_PRIMARY for the
 * "Reservar" button and the white text contract throughout.
 */
export function BookingBar({ property, onReserve }: Props) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 pb-4 sm:pb-6"
      role="region"
      aria-label="Reservar"
    >
      <div className="pointer-events-auto mx-auto w-full max-w-[920px] px-4 sm:px-6">
        <div className="relative flex items-center justify-between gap-3 rounded-[26px] border border-white/15 bg-[#07101d]/55 p-3 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.7),0_8px_24px_-10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-22px_50px_rgba(2,6,16,0.45)] backdrop-blur-2xl sm:p-4">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />

          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="hidden flex-col sm:flex">
              <span className={TEXT_LABEL}>Desde</span>
              <span className="text-lg font-medium tracking-tight text-white">
                ${property.pricePer45Min}
                <span className="ml-1 text-[10px] uppercase tracking-[0.24em] text-white/80">
                  / 45 min
                </span>
              </span>
            </div>
            <span aria-hidden className="hidden h-8 w-px bg-white/15 sm:block" />
            {/* Booking-mode indicator */}
            {property.instantBooking ? (
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inset-0 animate-ping rounded-full bg-white/70" />
                  <span className="relative h-2 w-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.85)]" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-white [text-shadow:0_0_14px_rgba(255,255,255,0.4)]">
                    Reserva instantánea
                  </p>
                  <p className={`hidden sm:block ${TEXT_HINT}`}>
                    Acceso inmediato
                  </p>
                </div>
              </div>
            ) : (
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-white">
                  Aprobación del anfitrión
                </p>
                <p className={`truncate ${TEXT_HINT}`}>
                  Confirmación en aprox. {property.hostConfirmationHours}h
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onReserve}
            className={`${CTA_PRIMARY} shrink-0 sm:px-7`}
          >
            Reservar
          </button>
        </div>
      </div>
    </div>
  );
}
