"use client";

import type { ReactElement, SVGProps } from "react";
import * as Flags from "country-flag-icons/react/3x2";
import { FLAG_CHIP } from "@/styles/glass";

/**
 * SPACED — FlagIcon
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Renders a real SVG country flag from the `country-flag-icons` package
 * keyed by ISO 3166-1 alpha-2 code. We deliberately avoid OS emoji flags
 * (🇨🇱 …) because Windows renders them as the bare 2-letter code, which
 * looks broken. SVGs render identically on every platform.
 *
 * The package exposes one component per ISO code as a named export of
 * `country-flag-icons/react/3x2`; we index into the namespace so the flag
 * can be picked dynamically at runtime. Unknown / unsupported codes fall
 * back to a neutral glass chip so layout never shifts.
 */

type FlagComponent = (
  props: SVGProps<SVGSVGElement> & { title?: string },
) => ReactElement;

const FLAGS = Flags as unknown as Record<string, FlagComponent | undefined>;

type FlagIconProps = {
  /** ISO 3166-1 alpha-2 code, e.g. "CL". Case-insensitive. */
  code: string;
  /** Sizing + extra classes (width/height live here, e.g. "h-3.5 w-5"). */
  className?: string;
  /** Accessible title; omit to keep the flag purely decorative. */
  title?: string;
};

export function FlagIcon({ code, className = "", title }: FlagIconProps) {
  const Flag = FLAGS[code.toUpperCase()];
  if (!Flag) {
    return <span aria-hidden className={`${FLAG_CHIP} ${className} bg-white/15`} />;
  }
  return <Flag title={title} aria-hidden className={`${FLAG_CHIP} ${className}`} />;
}
