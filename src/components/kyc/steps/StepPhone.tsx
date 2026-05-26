"use client";

import { useMemo, useState } from "react";
import { textBody, textLabel } from "@/styles/glass";
import { COUNTRIES, type Country } from "@/lib/kyc/countries";
import { CountryPicker } from "./CountryPicker";

/**
 * SPACED — KYC Step 2: Phone number
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Phone capture step. One unified glass pill houses two visually distinct
 * regions: a country picker on the left (flag + dial code, opens a
 * searchable dropdown) and the actual number input on the right.
 *
 * The phone value is stored as RAW DIGITS in parent state; the input
 * displays a country-aware formatted view (e.g. "9 1234 5678" for Chile).
 * Non-digit characters are stripped on every keystroke so the user never
 * has to fight the formatter.
 */

/* ─── Country-aware formatting + validation ──────────────────────────────
   Most countries only need a sensible default (groups of three digits).
   Chile gets a tailored "9 XXXX XXXX" mask because it's the home market
   and the local convention is well-known. Adding new countries is a
   one-entry change. */
type PhoneConfig = {
  format: (digits: string) => string;
  /** Minimum digit count before "ENVIAR CÓDIGO" treats the number as valid. */
  minDigits: number;
  /** Hard cap on input length — prevents long-press paste of garbage. */
  maxDigits: number;
  /** Faded hint shown when the input is empty. */
  placeholder: string;
};

const PHONE_CONFIG: Record<string, PhoneConfig> = {
  CL: {
    format(d) {
      if (d.length <= 1) return d;
      if (d.length <= 5) return `${d.slice(0, 1)} ${d.slice(1)}`;
      return `${d.slice(0, 1)} ${d.slice(1, 5)} ${d.slice(5, 9)}`;
    },
    minDigits: 9,
    maxDigits: 9,
    placeholder: "9 XXXX XXXX",
  },
};

const DEFAULT_PHONE_CONFIG: PhoneConfig = {
  format(d) {
    return d.match(/.{1,3}/g)?.join(" ") ?? d;
  },
  minDigits: 6,
  maxDigits: 15,
  placeholder: "XXX XXX XXXX",
};

function getPhoneConfig(iso2: string): PhoneConfig {
  return PHONE_CONFIG[iso2] ?? DEFAULT_PHONE_CONFIG;
}

type StepPhoneProps = {
  country: Country;
  onCountryChange: (c: Country) => void;
  /** Raw digit string, no formatting, no country code prefix. */
  phone: string;
  onPhoneChange: (digits: string) => void;
  /** Fires only when the number is valid for the active country. */
  onSubmit: (payload: { country: Country; phone: string }) => void;
  onBack: () => void;
};

export function StepPhone({
  country,
  onCountryChange,
  phone,
  onPhoneChange,
  onSubmit,
  onBack,
}: StepPhoneProps) {
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [focused, setFocused] = useState(false);

  const config = getPhoneConfig(country.iso2);
  const formatted = config.format(phone);

  const error = useMemo(() => {
    if (!validationAttempted) return null;
    if (!phone) return "Ingresa tu número de teléfono";
    if (phone.length < config.minDigits) return "Número de teléfono inválido";
    return null;
  }, [validationAttempted, phone, config.minDigits]);

  function handleNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    /* Strip everything except digits and clip to the country's max so we
       never store malformed data. */
    const digits = e.target.value.replace(/\D/g, "").slice(0, config.maxDigits);
    onPhoneChange(digits);
  }

  function handleContinue() {
    setValidationAttempted(true);
    if (!phone || phone.length < config.minDigits) return;
    onSubmit({ country, phone });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleContinue();
    }
  }

  const wrapClass = [
    "relative flex items-stretch rounded-full border bg-white/[0.04] backdrop-blur-md",
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_18px_-6px_rgba(0,0,0,0.5)]",
    "transition-all duration-300 ease-out motion-reduce:transition-none",
    error
      ? "border-amber-200/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_18px_-6px_rgba(0,0,0,0.5),0_0_22px_-4px_rgba(252,211,77,0.4)]"
      : focused
        ? "border-white/40 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_18px_-6px_rgba(0,0,0,0.5),0_0_24px_-6px_rgba(255,255,255,0.4)]"
        : "border-white/15",
  ].join(" ");

  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-col">
      {/* ATRÁS — sits at the top-left of the content area, above the
          step label, per spec. */}
      <button
        type="button"
        onClick={onBack}
        className="-ml-1 mb-6 inline-flex w-fit items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-[0.32em] text-white/60 transition-colors duration-200 ease-out hover:text-white/95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 motion-reduce:transition-none"
      >
        <span aria-hidden>←</span> ATRÁS
      </button>

      {/* Step label */}
      <p className={`${textLabel} text-[10px] uppercase tracking-[0.32em]`}>
        TU NÚMERO
      </p>

      {/* Phone input row — single pill, country picker + divider + input. */}
      <div className={`mt-3 ${wrapClass}`}>
        <CountryPicker
          selected={country}
          onSelect={onCountryChange}
          options={COUNTRIES}
        />

        {/* Subtle vertical divider between the two regions. */}
        <span
          aria-hidden
          className="my-3 w-px self-stretch bg-white/10"
        />

        <input
          type="tel"
          inputMode="tel"
          pattern="[0-9]*"
          autoComplete="tel-national"
          value={formatted}
          placeholder={config.placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "kyc-phone-error" : undefined}
          aria-label="Número de teléfono"
          onChange={handleNumberChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          className="block h-14 min-w-0 flex-1 rounded-r-full bg-transparent px-4 text-base font-normal tracking-[0.02em] text-white/95 placeholder:text-white/35 outline-none sm:px-5"
        />
      </div>

      {error && (
        <p
          id="kyc-phone-error"
          role="alert"
          className="mt-2.5 px-2 text-[11px] font-medium uppercase tracking-[0.22em] text-amber-200/85"
        >
          {error}
        </p>
      )}

      {/* Reassuring subtext */}
      <p
        className={`mt-4 text-center text-[13px] font-normal tracking-[0.02em] ${textBody}`}
      >
        Te enviaremos un código de verificación por SMS.
      </p>

      {/* ENVIAR CÓDIGO — right-aligned, same shape as Step 1's CONTINUAR. */}
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={handleContinue}
          className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.04] px-6 py-3 text-[11px] font-medium uppercase tracking-[0.32em] text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_18px_-6px_rgba(0,0,0,0.42)] backdrop-blur-md transition-all duration-300 ease-out motion-reduce:transition-none hover:border-white/40 hover:bg-white/[0.08] hover:text-white/95 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_0_26px_-6px_rgba(255,255,255,0.45),0_10px_22px_-6px_rgba(0,0,0,0.42)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
        >
          ENVIAR CÓDIGO
          <span
            aria-hidden
            className="transition-transform duration-300 ease-out motion-reduce:transition-none group-hover:translate-x-0.5"
          >
            →
          </span>
        </button>
      </div>
    </div>
  );
}
