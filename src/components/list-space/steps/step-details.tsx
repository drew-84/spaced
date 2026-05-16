"use client";

import { GlassNumber, GlassTextarea } from "../glass-field";
import type { ListSpaceFormData, StepErrors } from "../types";

type Props = {
  data: ListSpaceFormData;
  errors: StepErrors;
  onChange: <K extends keyof ListSpaceFormData>(
    key: K,
    value: ListSpaceFormData[K],
  ) => void;
};

export function StepDetails({ data, errors, onChange }: Props) {
  function handleCapacity(v: number | "") {
    if (v === "") {
      onChange("capacidadMaxima", 1);
      return;
    }
    onChange("capacidadMaxima", Math.min(4, Math.max(1, Math.round(v))));
  }

  return (
    <div className="space-y-7">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <GlassNumber
          id="ls-capacidad"
          label="Capacidad máxima"
          suffix="personas"
          min={1}
          max={4}
          value={data.capacidadMaxima}
          onChange={handleCapacity}
          hint="1 – 4"
          error={errors.capacidadMaxima}
        />
        <div>
          <p className="mb-2.5 text-[10px] uppercase tracking-[0.32em] text-sky-100/45">
            Sugerido
          </p>
          <div className="flex items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.015] px-4 py-3 text-sm font-light tracking-[0.04em] text-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-12px_22px_rgba(3,8,18,0.18)] backdrop-blur-md">
            <span className="text-[11px] uppercase tracking-[0.28em] text-white/30">
              óptimo
            </span>
            <span className="ml-auto text-[10px] uppercase tracking-[0.28em] text-white/40">
              4 personas
            </span>
          </div>
        </div>
      </div>

      <GlassTextarea
        id="ls-reglas"
        label="Reglas de la casa"
        value={data.reglasCasa}
        onChange={(v) => onChange("reglasCasa", v)}
        maxLength={500}
        showCount
        rows={5}
        placeholder="Ej: No fumar adentro, llegar puntual, dejar el espacio como lo encontraste…"
      />
    </div>
  );
}
