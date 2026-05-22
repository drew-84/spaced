"use client";

import { useState } from "react";
import {
  CTA_SECONDARY,
  GLASS_PANEL_SOFT,
  TEXT_BODY,
  TEXT_HINT,
  TEXT_LABEL,
} from "@/styles/glass";
import type { PropertyHost } from "./types";
import { StarRating } from "./star-rating";

type Props = {
  host: PropertyHost;
};

/**
 * Discreet host card. Collapsed by default; trigger uses the CTA_SECONDARY
 * pill, expanded body uses the soft glass panel.
 */
export function HostCard({ host }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <section aria-label="Anfitrión">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`inline-flex items-center gap-2 ${CTA_SECONDARY}`}
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
          <div className={`relative ${GLASS_PANEL_SOFT} p-5 sm:p-6`}>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 60% 38% at 18% 0%, rgba(255,255,255,0.08), transparent 60%)",
              }}
            />
            <div className="relative flex items-start gap-4">
              <span
                className="block h-14 w-14 shrink-0 rounded-full border border-white/30 bg-cover bg-center shadow-[0_8px_24px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.22)]"
                style={{ backgroundImage: `url(${host.avatar})` }}
                role="img"
                aria-label={`Foto de ${host.name}`}
              />
              <div className="min-w-0 flex-1">
                <p className={TEXT_LABEL}>Anfitrión</p>
                <p className="mt-1 text-base font-medium tracking-[0.04em] text-white">
                  {host.name}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <StarRating value={host.rating} size="sm" />
                  <span className="text-[10px] tracking-[0.18em] text-white/80">
                    {host.rating.toFixed(2)}
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.22em] text-white/80">
                    · {host.memberSince}
                  </span>
                </div>
                <p className={`mt-3 text-sm leading-relaxed ${TEXT_BODY}`}>
                  {host.bio}
                </p>
                <p className={`mt-3 ${TEXT_HINT}`}>
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
