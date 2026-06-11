"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { textLabel } from "@/styles/glass";
import type { Country } from "@/lib/kyc/countries";
import { FlagIcon } from "./FlagIcon";

/**
 * SPACED — KYC CountryPicker
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Compact glass dropdown that lives on the left edge of the phone input
 * pill. Renders the active country's flag + dial code as a trigger; opens
 * a searchable list of every country with a phone code.
 *
 * Constraints
 * ───────────
 * • Lives inside a panel with `overflow-hidden`, so the dropdown panel is
 *   sized + positioned to stay within the right-panel bounds (max-height
 *   on the list, panel hangs below the trigger).
 * • Search filters by Spanish name OR dial code so users can type either
 *   "chile" or "56".
 * • Selected country is visually highlighted; the active item is also
 *   scrolled into view on open.
 */

type CountryPickerProps = {
  selected: Country;
  onSelect: (c: Country) => void;
  options: Country[];
};

export function CountryPicker({
  selected,
  onSelect,
  options,
}: CountryPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const rootRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!normalizedQuery) return options;
    return options.filter(
      (c) =>
        c.name.toLowerCase().includes(normalizedQuery) ||
        c.dialCode.includes(normalizedQuery) ||
        c.iso2.toLowerCase().includes(normalizedQuery),
    );
  }, [normalizedQuery, options]);

  /* Close on Escape or outside click. */
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  /* Focus the search field when the dropdown opens, and scroll the
     selected row into view so the user has context. */
  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      searchRef.current?.focus();
      const selectedRow = listRef.current?.querySelector<HTMLElement>(
        `[data-iso2="${selected.iso2}"]`,
      );
      selectedRow?.scrollIntoView({ block: "center" });
    });
  }, [open, selected.iso2]);

  function handleSelect(c: Country) {
    onSelect(c);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={rootRef} className="relative">
      {/* Trigger — flag + dial code, no border (lives inside the parent
          input pill's border). */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`País: ${selected.name}, +${selected.dialCode}`}
        className="flex h-14 items-center gap-2 rounded-l-full px-4 text-sm font-normal tracking-[0.02em] text-white/95 transition-colors duration-200 ease-out motion-reduce:transition-none hover:bg-white/[0.04] focus-visible:bg-white/[0.04] focus-visible:outline-none sm:px-5"
      >
        <FlagIcon code={selected.iso2} className="h-3.5 w-5" />
        <span className="tabular-nums">+{selected.dialCode}</span>
        <ChevronDown open={open} />
      </button>

      {/* Dropdown panel. Positioned below the trigger; constrained max
          height keeps it inside the right panel's overflow. */}
      {open && (
        <div
          role="dialog"
          aria-label="Seleccionar país"
          className="absolute left-0 top-[calc(100%+8px)] z-30 w-[320px] max-w-[90vw] overflow-hidden rounded-2xl border border-white/15 bg-[#0a1626]/95 shadow-[0_20px_48px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl"
          style={{ animation: "kycChipFadeIn 180ms ease-out both" }}
        >
          {/* Search input */}
          <div className="border-b border-white/10 px-3 pt-3 pb-2">
            <label className="sr-only" htmlFor="kyc-country-search">
              Buscar país
            </label>
            <input
              id="kyc-country-search"
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar país..."
              autoComplete="off"
              spellCheck={false}
              className="block h-9 w-full rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm font-normal text-white/95 placeholder:text-white/35 outline-none transition-colors duration-200 ease-out focus:border-white/30 focus:bg-white/[0.06] motion-reduce:transition-none"
            />
          </div>

          {/* Result list */}
          <ul
            ref={listRef}
            role="listbox"
            aria-label="Países"
            className="max-h-[280px] overflow-y-auto py-1"
          >
            {filtered.length === 0 ? (
              <li
                className={`px-4 py-3 text-center text-xs ${textLabel}`}
              >
                Sin resultados
              </li>
            ) : (
              filtered.map((c) => {
                const isSelected = c.iso2 === selected.iso2;
                return (
                  <li key={c.iso2} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      data-iso2={c.iso2}
                      onClick={() => handleSelect(c)}
                      className={[
                        "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors duration-150 ease-out motion-reduce:transition-none",
                        isSelected
                          ? "bg-white/[0.08] text-white/95"
                          : "text-white/80 hover:bg-white/[0.05] hover:text-white/95",
                      ].join(" ")}
                    >
                      <FlagIcon code={c.iso2} className="h-3.5 w-5" />
                      <span className="flex-1 truncate">{c.name}</span>
                      <span
                        className={`tabular-nums text-xs ${
                          isSelected ? "text-white/90" : "text-white/55"
                        }`}
                      >
                        +{c.dialCode}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 10 6"
      className={`ml-0.5 h-1.5 w-2.5 text-white/60 transition-transform duration-200 ease-out motion-reduce:transition-none ${
        open ? "rotate-180" : ""
      }`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 1l4 4 4-4" />
    </svg>
  );
}
