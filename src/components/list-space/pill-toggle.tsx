"use client";

import type { ReactNode } from "react";
import { pillClass } from "@/styles/glass";

export { pillClass };

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
