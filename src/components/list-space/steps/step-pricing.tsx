"use client";

import { Fragment } from "react";
import { TEXT_HINT, TEXT_LABEL } from "@/styles/glass";
import { GlassNumber } from "../glass-field";
import {
  DAYS,
  SLOTS,
  type AvailabilitySlot,
  type ListSpaceFormData,
  type StepErrors,
} from "../types";

type Props = {
  data: ListSpaceFormData;
  errors: StepErrors;
  onChange: <K extends keyof ListSpaceFormData>(
    key: K,
    value: ListSpaceFormData[K],
  ) => void;
};

function makeKey(day: string, slot: string): AvailabilitySlot {
  return `${day}:${slot}` as AvailabilitySlot;
}

export function StepPricing({ data, errors, onChange }: Props) {
  function toggleSlot(key: AvailabilitySlot) {
    const set = new Set(data.disponibilidad);
    if (set.has(key)) set.delete(key);
    else set.add(key);
    onChange("disponibilidad", Array.from(set));
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <GlassNumber
          id="ls-precio"
          label="Precio por 15 min"
          prefix="CLP $"
          suffix="/ 15 min"
          value={data.precioPor15Min}
          onChange={(v) => onChange("precioPor15Min", v)}
          min={0}
          step={500}
          placeholder="2000"
          error={errors.precioPor15Min}
        />
        <div>
          <p className={`mb-2.5 ${TEXT_LABEL}`}>Reserva mínima</p>
          {/* Read-only display tile — quieter than the active inputs */}
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-3 text-sm font-normal tracking-[0.04em] text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-12px_22px_rgba(3,8,18,0.18)] backdrop-blur-md">
            <span className="text-[11px] uppercase tracking-[0.28em] text-white/60">
              ≥
            </span>
            <span className="text-white/80">45</span>
            <span className="ml-auto text-[10px] uppercase tracking-[0.28em] text-white/50">
              minutos · fijo
            </span>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-baseline justify-between">
          <p className={TEXT_LABEL}>Calendario de disponibilidad</p>
          <p className={TEXT_HINT}>
            {data.disponibilidad.length} bloques activos
          </p>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03] p-3 shadow-[0_20px_42px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-18px_36px_rgba(3,8,18,0.28)] backdrop-blur-md sm:p-4">
          <div className="grid grid-cols-[78px_repeat(7,minmax(0,1fr))] gap-1.5 sm:gap-2">
            <div />
            {DAYS.map((d) => (
              <p
                key={d.key}
                className="py-1 text-center text-[9px] uppercase tracking-[0.28em] text-white/60"
              >
                {d.label}
              </p>
            ))}
            {SLOTS.map((s) => (
              <Fragment key={s.key}>
                <div className="flex flex-col justify-center py-1">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/60">
                    {s.label}
                  </p>
                  <p className="text-[9px] tracking-[0.16em] text-white/50">
                    {s.range}
                  </p>
                </div>
                {DAYS.map((d) => {
                  const k = makeKey(d.key, s.key);
                  const active = data.disponibilidad.includes(k);
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => toggleSlot(k)}
                      aria-pressed={active}
                      aria-label={`${d.label} ${s.label}`}
                      className={[
                        "h-8 rounded-lg border text-[10px] uppercase tracking-[0.18em] backdrop-blur-md",
                        "transition-all duration-300 ease-out motion-reduce:transition-none",
                        active
                          ? "border-white/40 bg-white/[0.14] text-white/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-8px_18px_rgba(8,18,34,0.34),0_0_18px_rgba(255,255,255,0.18)]"
                          : "border-white/15 bg-white/[0.03] text-white/60 hover:border-white/40 hover:bg-white/[0.06] hover:text-white",
                      ].join(" ")}
                    >
                      {active ? "✓" : ""}
                    </button>
                  );
                })}
              </Fragment>
            ))}
          </div>
          <p className={`mt-3 ${TEXT_HINT}`}>Click en cada bloque para activar.</p>
        </div>
      </div>
    </div>
  );
}
