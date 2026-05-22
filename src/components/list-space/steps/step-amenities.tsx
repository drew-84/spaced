"use client";

import { TEXT_BODY, TEXT_HINT } from "@/styles/glass";
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
        <p className={`text-sm leading-relaxed ${TEXT_BODY}`}>
          Marca lo que tu espacio ofrece. Mientras más completes, mejor
          descubrirán tu nodo.
        </p>
        <span className={`shrink-0 ${TEXT_HINT}`}>
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
