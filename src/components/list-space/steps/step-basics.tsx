"use client";

import { TEXT_LABEL } from "@/styles/glass";
import { GlassText, GlassTextarea, FieldError } from "../glass-field";
import { PillRadioGroup } from "../pill-toggle";
import {
  PROPERTY_TYPES,
  type ListSpaceFormData,
  type PropertyType,
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

export function StepBasics({ data, errors, onChange }: Props) {
  return (
    <div className="space-y-7">
      <GlassText
        id="ls-titulo"
        label="Título"
        value={data.titulo}
        onChange={(v) => onChange("titulo", v)}
        maxLength={100}
        showCount
        placeholder="Ej: Estudio luminoso en Providencia"
        error={errors.titulo}
      />

      <GlassTextarea
        id="ls-descripcion"
        label="Descripción"
        value={data.descripcion}
        onChange={(v) => onChange("descripcion", v)}
        maxLength={1000}
        showCount
        rows={6}
        placeholder="Describe la atmósfera, qué hace único a tu espacio…"
        error={errors.descripcion}
      />

      <div>
        <p className={`mb-2.5 ${TEXT_LABEL}`}>Tipo de propiedad</p>
        <PillRadioGroup<PropertyType>
          value={data.tipoPropiedad}
          onChange={(v) => onChange("tipoPropiedad", v)}
          options={PROPERTY_TYPES}
        />
        <FieldError error={errors.tipoPropiedad} />
      </div>
    </div>
  );
}
