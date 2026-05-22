"use client";

import type { ReactNode } from "react";
import {
  FIELD_ERROR,
  FIELD_LABEL,
  INPUT_INNER,
  INPUT_WRAP,
  TEXT_HINT,
} from "@/styles/glass";

/**
 * Shared glass-field primitives.
 *
 * Visual contract is owned by `src/styles/glass.ts` — this module just
 * re-exports a handful of names for backwards compatibility and composes
 * the actual <input>/<textarea>/<select> wrappers.
 */

export const GLASS_SURFACE = INPUT_WRAP;
export const GLASS_SURFACE_FOCUS = "";
export const FIELD_INNER = INPUT_INNER;

type LabelProps = {
  label: string;
  hint?: ReactNode;
  htmlFor?: string;
};

export function FieldLabel({ label, hint, htmlFor }: LabelProps) {
  return (
    <div className="mb-2.5 flex items-baseline justify-between gap-3">
      <label htmlFor={htmlFor} className={FIELD_LABEL}>
        {label}
      </label>
      {hint ? <span className={TEXT_HINT}>{hint}</span> : null}
    </div>
  );
}

export function FieldError({ error }: { error?: string | null }) {
  if (!error) return null;
  return <p className={FIELD_ERROR}>{error}</p>;
}

type TextProps = {
  label: string;
  value: string;
  onChange: (next: string) => void;
  maxLength?: number;
  error?: string | null;
  placeholder?: string;
  id?: string;
  showCount?: boolean;
  autoComplete?: string;
};

export function GlassText({
  label,
  value,
  onChange,
  maxLength,
  error,
  placeholder,
  id,
  showCount,
  autoComplete,
}: TextProps) {
  return (
    <div>
      <FieldLabel
        label={label}
        htmlFor={id}
        hint={
          maxLength && showCount ? `${value.length}/${maxLength}` : undefined
        }
      />
      <div className={`${INPUT_WRAP} px-4 py-3`}>
        <input
          id={id}
          type="text"
          value={value}
          autoComplete={autoComplete}
          onChange={(e) =>
            onChange(
              maxLength ? e.target.value.slice(0, maxLength) : e.target.value,
            )
          }
          placeholder={placeholder}
          maxLength={maxLength}
          className={INPUT_INNER}
        />
      </div>
      <FieldError error={error} />
    </div>
  );
}

export function GlassTextarea({
  label,
  value,
  onChange,
  maxLength,
  error,
  placeholder,
  id,
  rows = 5,
  showCount,
}: TextProps & { rows?: number }) {
  return (
    <div>
      <FieldLabel
        label={label}
        htmlFor={id}
        hint={
          maxLength && showCount ? `${value.length}/${maxLength}` : undefined
        }
      />
      <div className={`${INPUT_WRAP} px-4 py-3`}>
        <textarea
          id={id}
          rows={rows}
          value={value}
          onChange={(e) =>
            onChange(
              maxLength ? e.target.value.slice(0, maxLength) : e.target.value,
            )
          }
          placeholder={placeholder}
          maxLength={maxLength}
          className={`${INPUT_INNER} resize-none leading-relaxed`}
        />
      </div>
      <FieldError error={error} />
    </div>
  );
}

type NumProps = {
  label: string;
  value: number | "";
  onChange: (next: number | "") => void;
  min?: number;
  max?: number;
  step?: number;
  error?: string | null;
  placeholder?: string;
  id?: string;
  prefix?: string;
  suffix?: string;
  hint?: ReactNode;
};

export function GlassNumber({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  error,
  placeholder,
  id,
  prefix,
  suffix,
  hint,
}: NumProps) {
  return (
    <div>
      <FieldLabel label={label} htmlFor={id} hint={hint} />
      <div className={`${INPUT_WRAP} flex items-center gap-3 px-4 py-3`}>
        {prefix && (
          <span className="text-[11px] uppercase tracking-[0.28em] text-white/60">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="number"
          inputMode="numeric"
          value={value}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "") {
              onChange("");
              return;
            }
            const n = Number(raw);
            if (Number.isNaN(n)) return;
            onChange(n);
          }}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          className={`${INPUT_INNER} flex-1 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
        />
        {suffix && (
          <span className="text-[11px] uppercase tracking-[0.28em] text-white/60">
            {suffix}
          </span>
        )}
      </div>
      <FieldError error={error} />
    </div>
  );
}

type SelectProps = {
  label: string;
  value: string;
  onChange: (next: string) => void;
  options: string[];
  placeholder?: string;
  error?: string | null;
  id?: string;
};

export function GlassSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Selecciona…",
  error,
  id,
}: SelectProps) {
  return (
    <div>
      <FieldLabel label={label} htmlFor={id} />
      <div className={`${INPUT_WRAP} relative px-4 py-3`}>
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${INPUT_INNER} appearance-none pr-8`}
        >
          <option value="" className="bg-[#0a0f1c] text-white/35">
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o} value={o} className="bg-[#0a0f1c] text-white/95">
              {o}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-white/60"
        >
          ▾
        </span>
      </div>
      <FieldError error={error} />
    </div>
  );
}
