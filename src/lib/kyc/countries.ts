/**
 * SPACED — KYC country list
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Builds a typed `Country[]` from the `world-countries` dataset, mapping
 * every entry to the four fields the KYC phone picker actually needs:
 * iso2 code, Spanish display name, international dial code, and the
 * flag emoji.
 *
 * Dial code resolution
 * ────────────────────
 * `world-countries` exposes the IDD prefix as { root, suffixes[] }. For
 * most countries the prefix is `root + suffixes[0]` (e.g. Chile +5 + "6"
 * → "56"). When `suffixes.length > 1` (e.g. USA, Russia, Kazakhstan),
 * those suffixes are area codes inside a shared country code, so we use
 * just `root` (e.g. USA "+1"). Entries with no IDD root at all (e.g.
 * Antarctica) are dropped — they have no international dial code.
 */

import rawCountries from "world-countries";

export type Country = {
  /** ISO 3166-1 alpha-2 code, e.g. "CL". */
  iso2: string;
  /** Spanish display name (falls back to common English name). */
  name: string;
  /** Dial code without the leading "+", e.g. "56". */
  dialCode: string;
  /** Flag emoji, e.g. "🇨🇱". */
  emoji: string;
};

/** Resolve a single country's international dial code from its IDD entry. */
function resolveDialCode(country: (typeof rawCountries)[number]): string {
  const root = country.idd?.root ?? "";
  const suffixes = country.idd?.suffixes ?? [];
  if (!root) return "";
  /* Single suffix → it completes the country code. Multiple suffixes →
     they're internal area codes, the country code is just the root. */
  const raw = suffixes.length === 1 ? `${root}${suffixes[0]}` : root;
  return raw.replace(/^\+/, "");
}

/** Pick the best Spanish display name available, with safe fallbacks. */
function resolveSpanishName(country: (typeof rawCountries)[number]): string {
  /* `translations.spa.common` is the Spanish exonym (e.g. "Alemania" for
     Germany). When missing, fall back to native Spanish name (used by
     Spanish-speaking countries), then to the English common name. */
  return (
    country.translations?.spa?.common ??
    country.name.native?.spa?.common ??
    country.name.common
  );
}

/** Spanish-locale alphabetical sorter — handles accents correctly. */
const esCollator = new Intl.Collator("es", { sensitivity: "base" });

export const COUNTRIES: Country[] = rawCountries
  .map((c) => ({
    iso2: c.cca2,
    name: resolveSpanishName(c),
    dialCode: resolveDialCode(c),
    emoji: c.flag,
  }))
  .filter((c) => c.dialCode.length > 0)
  .sort((a, b) => esCollator.compare(a.name, b.name));

/** Look up a country by ISO2, with a safe fallback to Chile. */
export function findCountry(iso2: string): Country {
  return (
    COUNTRIES.find((c) => c.iso2 === iso2) ??
    COUNTRIES.find((c) => c.iso2 === "CL") ??
    COUNTRIES[0]
  );
}

/** Default country for the KYC phone step — Chile, the home market. */
export const DEFAULT_COUNTRY: Country = findCountry("CL");
