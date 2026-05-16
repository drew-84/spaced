"use client";

import { PillMultiGroup } from "../pill-toggle";
import {
  COMODIDADES,
  type ListSpaceFormData,
} from "../types";

type Props = {
  data: ListSpaceFormData;
  onChange: <K extends keyof ListSpaceFormData>(
    key: K,
    value: ListSpaceFormData[K],
  ) => void;
};

export function StepAmenities({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-light leading-relaxed tracking-[0.04em] text-white/45">
          Marca lo que tu espacio ofrece. Mientras más completes, mejor
          descubrirán tu nodo.
        </p>
        <span className="shrink-0 text-[9px] uppercase tracking-[0.28em] text-white/30">
          {data.comodidades.length} activas
        </span>
      </div>

      <PillMultiGroup<string>
        value={data.comodidades}
        onChange={(v) => onChange("comodidades", v)}
        options={COMODIDADES.map((c) => ({ value: c, label: c }))}
      />
    </div>
  );
}
