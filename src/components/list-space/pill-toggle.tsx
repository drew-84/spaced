"use client";

import type { ReactNode } from "react";

/**
 * Pill toggle exactly matching the modal's `offerChipClass` recipe in
 * src/components/spatial-home/spatial-card-field.tsx. Same border opacity,
 * same inset shadow stack, same colors for active / idle / hover.
 */
export function pillClass(isActive: boolean) {
  return [
    "inline-flex items-center justify-center rounded-full border",
    "px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.22em]",
    "backdrop-blur-md outline-none",
    "transition-[transform,background-color,border-color,color,box-shadow] duration-200",
    "focus-visible:ring-1 focus-visible:ring-sky-200/40",
    isActive
      ? "border-sky-100/35 bg-sky-100/[0.12] text-sky-50 shadow-[0_14px_34px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-14px_28px_rgba(8,18,34,0.34)]"
      : "border-white/[0.075] bg-white/[0.04] text-white/44 shadow-[0_10px_24px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-12px_22px_rgba(5,12,24,0.22)] hover:border-sky-100/22 hover:bg-white/[0.065] hover:text-sky-100/76",
  ].join(" ");
}

export type PillOption<T extends string> = {
  value: T;
  label: ReactNode;
};

type SingleProps<T extends string> = {
  options: PillOption<T>[];
  value: T | null;
  onChange: (next: T) => void;
};

export function PillRadioGroup<T extends string>({
  options,
  value,
  onChange,
}: SingleProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={pillClass(active)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

type MultiProps<T extends string> = {
  options: PillOption<T>[];
  value: T[];
  onChange: (next: T[]) => void;
};

export function PillMultiGroup<T extends string>({
  options,
  value,
  onChange,
}: MultiProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => {
              if (active) onChange(value.filter((v) => v !== o.value));
              else onChange([...value, o.value]);
            }}
            aria-pressed={active}
            className={pillClass(active)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
