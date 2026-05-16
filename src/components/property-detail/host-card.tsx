"use client";

import { useState } from "react";
import type { PropertyHost } from "./types";
import { StarRating } from "./star-rating";

type Props = {
  host: PropertyHost;
};

/**
 * Discreet, collapsed by default. The trigger is a thin pill that matches
 * the modal "cerrar" affordance. When expanded, host details emerge inside
 * a glass tile using the same recipe as the modal's inner cards.
 */
export function HostCard({ host }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <section aria-label="Anfitrión">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-[10px] uppercase tracking-[0.26em] text-white/50 shadow-[0_10px_24px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md transition-[border-color,color,background-color] duration-200 hover:border-sky-200/25 hover:bg-white/[0.06] hover:text-sky-100/85"
      >
        {open ? "Ocultar anfitrión" : "Ver anfitrión"}
        <span
          aria-hidden
          className={[
            "text-[9px] transition-transform duration-300 ease-out",
            open ? "rotate-180" : "rotate-0",
          ].join(" ")}
        >
          ▾
        </span>
      </button>

      {/* Smooth height + fade reveal using grid-rows trick (no JS measurement). */}
      <div
        aria-hidden={!open}
        className={[
          "grid transition-[grid-template-rows,opacity,margin-top] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          open
            ? "mt-4 grid-rows-[1fr] opacity-100"
            : "mt-0 grid-rows-[0fr] opacity-0",
        ].join(" ")}
      >
        <div className="overflow-hidden">
          <div className="relative rounded-[24px] border border-sky-100/[0.075] bg-white/[0.026] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-22px_50px_rgba(2,6,16,0.3)] backdrop-blur-xl sm:p-6">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 60% 38% at 18% 0%, rgba(147,197,253,0.1), transparent 60%)",
              }}
            />
            <div className="relative flex items-start gap-4">
              <span
                className="block h-14 w-14 shrink-0 rounded-full border border-sky-100/30 bg-cover bg-center shadow-[0_8px_24px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.18)]"
                style={{ backgroundImage: `url(${host.avatar})` }}
                role="img"
                aria-label={`Foto de ${host.name}`}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[9px] uppercase tracking-[0.28em] text-sky-100/45">
                  Anfitrión
                </p>
                <p className="mt-1 text-base font-medium tracking-[0.04em] text-white/85">
                  {host.name}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <StarRating value={host.rating} size="sm" />
                  <span className="text-[10px] tracking-[0.18em] text-white/45">
                    {host.rating.toFixed(2)}
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.22em] text-white/30">
                    · {host.memberSince}
                  </span>
                </div>
                <p className="mt-3 text-sm font-light leading-relaxed tracking-[0.03em] text-white/55">
                  {host.bio}
                </p>
                <p className="mt-3 text-[9px] uppercase tracking-[0.26em] text-white/30">
                  Responde en aprox. {host.responseHours}h
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
