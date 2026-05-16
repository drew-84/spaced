"use client";

import { GlassText } from "../glass-field";
import type { ListSpaceFormData, StepErrors } from "../types";

type Props = {
  data: ListSpaceFormData;
  errors: StepErrors;
  onChange: <K extends keyof ListSpaceFormData>(
    key: K,
    value: ListSpaceFormData[K],
  ) => void;
};

export function StepLocation({ data, errors, onChange }: Props) {
  return (
    <div className="space-y-6">
      <GlassText
        id="ls-direccion"
        label="Dirección"
        value={data.direccion}
        onChange={(v) => onChange("direccion", v)}
        placeholder="Calle y número"
        autoComplete="address-line1"
        error={errors.direccion}
      />
      <GlassText
        id="ls-comuna"
        label="Comuna"
        value={data.comuna}
        onChange={(v) => onChange("comuna", v)}
        placeholder="Ej: Providencia"
        autoComplete="address-level3"
        error={errors.comuna}
      />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <GlassText
          id="ls-ciudad"
          label="Ciudad"
          value={data.ciudad}
          onChange={(v) => onChange("ciudad", v)}
          autoComplete="address-level2"
          error={errors.ciudad}
        />
        <GlassText
          id="ls-region"
          label="Región"
          value={data.region}
          onChange={(v) => onChange("region", v)}
          autoComplete="address-level1"
          error={errors.region}
        />
      </div>
    </div>
  );
}
