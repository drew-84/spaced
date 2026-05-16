"use client";

import type { ReactNode } from "react";

/**
 * Shared glass-field styling, lifted exactly from the OFRECER modal in
 * src/components/spatial-home/spatial-card-field.tsx (the inner stat tiles
 * and chip surfaces). Same border opacity, same layered shadow recipe,
 * same backdrop-blur language.
 */

export const GLASS_SURFACE = [
  "rounded-2xl border border-white/[0.075] bg-white/[0.028]",
  "shadow-[0_16px_34px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-14px_26px_rgba(3,8,18,0.28)]",
  "backdrop-blur-md",
  "transition-[border-color,background-color,box-shadow] duration-300 ease-out",
].join(" ");

export const GLASS_SURFACE_FOCUS = [
  "focus-within:border-sky-200/35 focus-within:bg-white/[0.05]",
  "focus-within:shadow-[0_18px_38px_rgba(0,0,0,0.34),0_0_24px_-8px_rgba(96,165,250,0.4),inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-16px_30px_rgba(3,8,18,0.32)]",
].join(" ");

export const FIELD_INNER = [
  "block w-full bg-transparent text-sm font-light tracking-[0.04em] text-white/85",
  "placeholder:text-white/22 outline-none",
].join(" ");

type LabelProps = {
  label: string;
  hint?: ReactNode;
  htmlFor?: string;
};

export function FieldLabel({ label, hint, htmlFor }: LabelProps) {
  return (
    <div className="mb-2.5 flex items-baseline justify-between gap-3">
      <label
        htmlFor={htmlFor}
        className="text-[10px] uppercase tracking-[0.32em] text-sky-100/45"
      >
        {label}
      </label>
      {hint ? (
        <span className="text-[9px] uppercase tracking-[0.28em] text-white/30">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

export function FieldError({ error }: { error?: string | null }) {
  if (!error) return null;
  return (
    <p className="mt-1.5 text-[10px] uppercase tracking-[0.22em] text-rose-200/70">
      {error}
    </p>
  );
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
      <div className={`${GLASS_SURFACE} ${GLASS_SURFACE_FOCUS} px-4 py-3`}>
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
          className={FIELD_INNER}
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
      <div className={`${GLASS_SURFACE} ${GLASS_SURFACE_FOCUS} px-4 py-3`}>
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
          className={`${FIELD_INNER} resize-none leading-relaxed`}
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
      <div
        className={`${GLASS_SURFACE} ${GLASS_SURFACE_FOCUS} flex items-center gap-3 px-4 py-3`}
      >
        {prefix && (
          <span className="text-[11px] uppercase tracking-[0.28em] text-white/35">
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
          className={`${FIELD_INNER} flex-1 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
        />
        {suffix && (
          <span className="text-[11px] uppercase tracking-[0.28em] text-white/35">
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
      <div
        className={`${GLASS_SURFACE} ${GLASS_SURFACE_FOCUS} relative px-4 py-3`}
      >
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${FIELD_INNER} appearance-none pr-8`}
        >
          <option value="" className="bg-[#0a0f1c] text-white/55">
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o} value={o} className="bg-[#0a0f1c] text-white">
              {o}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-white/40"
        >
          ▾
        </span>
      </div>
      <FieldError error={error} />
    </div>
  );
}
