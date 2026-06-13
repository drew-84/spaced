"use client";

import { useRef, useState } from "react";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(
    data.coverPhoto ? URL.createObjectURL(data.coverPhoto) : null
  );

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onChange("coverPhoto", file);
  }

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

      {/* Cover photo */}
      <div>
        <p className={`mb-2.5 ${TEXT_LABEL}`}>Foto principal</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFileChange}
        />
        {preview ? (
          <div className="relative overflow-hidden rounded-2xl border border-white/10">
            <img
              src={preview}
              alt="Vista previa"
              className="h-48 w-full object-cover"
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="absolute bottom-3 right-3 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-xs text-white/80 backdrop-blur-sm transition hover:bg-black/80"
            >
              Cambiar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-36 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-white/[0.03] text-white/50 transition hover:border-white/30 hover:bg-white/[0.05]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
            <span className="text-sm">Subir foto</span>
          </button>
        )}
        <FieldError error={errors.coverPhoto} />
      </div>
    </div>
  );
}
