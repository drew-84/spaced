"use client";

import type { PropertyDetail } from "./types";

type Props = {
  property: Pick<
    PropertyDetail,
    "pricePer15Min" | "pricePer45Min" | "instantBooking" | "hostConfirmationHours"
  >;
  onReserve: () => void;
};

/**
 * Sticky floating glass action bar. Pinned to the bottom of the viewport with
 * a subtle backdrop blur. The RESERVAR button mirrors the modal "emitir senal"
 * CTA recipe exactly (border-sky-100/35, bg-sky-100/[0.14], stacked shadow +
 * inset highlight + outer cyan glow).
 */
export function BookingBar({ property, onReserve }: Props) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 pb-4 sm:pb-6"
      role="region"
      aria-label="Reservar"
    >
      <div className="pointer-events-auto mx-auto w-full max-w-[920px] px-4 sm:px-6">
        <div
          className="relative flex items-center justify-between gap-3 rounded-[26px] border border-sky-100/[0.1] bg-[#07101d]/55 p-3 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.7),0_8px_24px_-10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-22px_50px_rgba(2,6,16,0.45)] backdrop-blur-2xl sm:p-4"
        >
          {/* Top rim highlight */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent"
          />

          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="hidden flex-col sm:flex">
              <span className="text-[9px] uppercase tracking-[0.28em] text-sky-100/45">
                Desde
              </span>
              <span className="text-lg font-medium tracking-tight text-sky-100/90">
                ${property.pricePer45Min}
                <span className="ml-1 text-[10px] uppercase tracking-[0.24em] text-white/35">
                  / 45 min
                </span>
              </span>
            </div>
            <span
              aria-hidden
              className="hidden h-8 w-px bg-white/10 sm:block"
            />
            {/* Booking-mode indicator */}
            {property.instantBooking ? (
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inset-0 animate-ping rounded-full bg-sky-200/70" />
                  <span className="relative h-2 w-2 rounded-full bg-sky-100 shadow-[0_0_10px_rgba(140,190,255,0.85)]" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-sky-100/80 [text-shadow:0_0_14px_rgba(140,185,255,0.42)]">
                    Reserva instantánea
                  </p>
                  <p className="hidden text-[9px] uppercase tracking-[0.22em] text-white/35 sm:block">
                    Acceso inmediato
                  </p>
                </div>
              </div>
            ) : (
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-white/55">
                  Aprobación del anfitrión
                </p>
                <p className="truncate text-[9px] uppercase tracking-[0.22em] text-white/35">
                  Confirmación en aprox. {property.hostConfirmationHours}h
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onReserve}
            className="shrink-0 rounded-full border border-sky-100/35 bg-sky-100/[0.14] px-5 py-3 text-[11px] font-medium uppercase tracking-[0.34em] text-sky-50 shadow-[0_18px_38px_rgba(0,0,0,0.34),0_0_30px_-6px_rgba(96,165,250,0.55),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-16px_32px_rgba(8,18,34,0.32)] backdrop-blur-md transition-[transform,border-color,background-color,box-shadow] duration-200 hover:border-sky-100/55 hover:bg-sky-100/[0.18] hover:shadow-[0_22px_42px_rgba(0,0,0,0.36),0_0_38px_-4px_rgba(96,165,250,0.6),inset_0_1px_0_rgba(255,255,255,0.24),inset_0_-16px_32px_rgba(8,18,34,0.32)] sm:px-7"
          >
            Reservar
          </button>
        </div>
      </div>
    </div>
  );
}
