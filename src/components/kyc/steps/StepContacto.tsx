"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CTA_PRIMARY,
  DIVIDER_VERTICAL,
  FIELD_ERROR_AMBER,
  FIELD_HINT,
  FIELD_PILL,
  FIELD_PILL_ERROR,
  INPUT_INNER,
  INPUT_WRAP,
  INPUT_WRAP_ERROR,
  TEXT_LABEL,
} from "@/styles/glass";
import { COUNTRIES, type Country } from "@/lib/kyc/countries";
import {
  validateEmailDomain,
  suggestDomainLocally,
  type DomainSuggestion,
} from "@/lib/email-validation";
import { CountryPicker } from "./CountryPicker";

/**
 * SPACED — KYC Step 1: Contacto (email + phone on one screen)
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Combines the former Email and Teléfono steps into a single contact
 * screen. The email field keeps its inline ghost-completion for the most
 * common Chilean-market domains (accept via Tab / ArrowRight / Space on
 * desktop, or the floating chip on mobile). The phone field is a unified
 * glass pill: a searchable country selector on the left and a
 * country-aware formatted number on the right.
 *
 * Validation uses LIVE contextual hints (Option B) with content-aware
 * timing. Each field is freely fillable in any order — no sequential gating,
 * no disabled inputs. Once a field has been touched (focused-then-blurred,
 * or it currently holds typed content), it surfaces ONE message:
 *   • empty            → a soft "Ingresa tu …" hint (amber text, no border)
 *   • typed-but-invalid → a "… inválido" error (amber text + amber border)
 *   • valid            → nothing
 *
 * TIMING — errors are not nagged out mid-keystroke:
 *   • Email: the format error only appears after the user pauses typing for
 *     ~1s (debounce) or blurs the field. A mid-typing valid email clears any
 *     error instantly.
 *   • Phone: length-aware. Below the country's expected digit count the field
 *     stays quiet (still typing); at exactly the expected count it validates;
 *     above it, it's "too long". Blur (or switching country, which changes
 *     the expected length) forces an immediate validation.
 *
 * An untouched field stays clean and silent. CONTINUAR stays disabled until
 * BOTH the email and phone are valid.
 */

/* ─── Per-field message model ─────────────────────────────────────────────
   `tone` drives ONLY styling intensity — it's fully decoupled from the
   message text:
     • "error" → full-strength amber caption + amber border on the field
                 (an alarm: wrong content, too long/short, dead domain)
     • "hint"  → softer amber caption, NO field border
                 (a gentle reminder: empty but expected)
     • null    → silent
   Both tones share identical typography (see FIELD_HINT / FIELD_ERROR_AMBER).
   e.g. "Ingresa tu email" is a soft hint once the empty field has been
   touched. */
type FieldState = {
  tone: "error" | "hint" | null;
  message: string | null;
};

const SILENT: FieldState = { tone: null, message: null };

/**
 * Email message state — distinguishes incomplete from invalid (see
 * classifyEmail), mirroring the phone field.
 * @param showFormatError gate from the debounce/blur timing layer — true once
 *        the user has paused typing (~1s) or blurred. Keeps the incomplete/
 *        invalid message from flashing on every keystroke.
 * @param domainInvalid true when the background domain check has resolved as
 *        invalid for the CURRENT address (structurally complete, but the
 *        domain doesn't exist). Lowest-priority error — only reachable once the
 *        format is valid.
 */
function emailFieldState(
  emailClass: EmailClass,
  touched: boolean,
  showFormatError: boolean,
  domainInvalid: boolean,
): FieldState {
  if (!touched) return SILENT;
  // 1. Empty + touched → soft hint.
  if (emailClass === "empty") return { tone: "hint", message: "Ingresa tu email" };
  // 2 & 3. Structurally invalid / incomplete — gated behind the debounce/blur
  //        timing so the message never chases the cursor mid-keystroke.
  if (emailClass === "invalid" || emailClass === "incomplete") {
    if (!showFormatError) return SILENT;
    return emailClass === "incomplete"
      ? { tone: "error", message: "Email incompleto" }
      : { tone: "error", message: "Formato de email inválido" };
  }
  // emailClass === "valid" (structurally complete past this point):
  // 4. Domain check failed — silent while the check is pending (no result yet).
  if (domainInvalid) return { tone: "error", message: "Email inválido" };
  // 5. Valid + domain ok (or not yet checked) → silent.
  return SILENT;
}

/**
 * Phone message state — length-aware, distinguishing incomplete from invalid.
 * @param expectedDigits exact valid national digit count for the country.
 * @param validateNow forces validation of a sub-expected number; set on blur
 *        or country change. While false, a too-short number reads as "still
 *        typing" and stays quiet.
 */
function phoneFieldState(
  phone: string,
  touched: boolean,
  expectedDigits: number,
  validateNow: boolean,
): FieldState {
  if (!touched) return SILENT;
  if (phone.length === 0) return { tone: "hint", message: "Ingresa tu número" };
  if (phone.length > expectedDigits)
    return { tone: "error", message: "Número de teléfono inválido" }; // too long
  if (phone.length === expectedDigits) return SILENT; // exact → valid
  // Some digits but fewer than expected: quiet while typing, but a blur reveals
  // it as an unfinished entry — not "wrong", just incomplete.
  if (validateNow) return { tone: "error", message: "Número incompleto" };
  return SILENT;
}

/* ─── Email: domain ghost-completion ─────────────────────────────────────
   First character after "@" maps to the most common full domain, ordered
   by Chilean-market share. */
const DOMAIN_MAP: Record<string, string> = {
  g: "gmail.com",
  h: "hotmail.com",
  o: "outlook.com",
  y: "yahoo.com",
  i: "icloud.com",
};

/** Un-typed remainder of the suggested domain, or "" when none applies. */
function computeSuggestion(email: string): string {
  const atIdx = email.indexOf("@");
  if (atIdx < 0) return "";
  if (email.indexOf("@", atIdx + 1) !== -1) return "";
  const domain = email.slice(atIdx + 1).toLowerCase();
  if (domain.length < 1) return "";
  const fullDomain = DOMAIN_MAP[domain[0]];
  if (!fullDomain) return "";
  if (!fullDomain.startsWith(domain)) return "";
  if (domain === fullDomain) return "";
  return fullDomain.slice(domain.length);
}

/** Standard email shape — single @, at least one char before, dotted TLD
 *  after. Sufficient as a UX gate; the backend validator can be stricter. */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/* ─── Email: incomplete-vs-invalid classification ────────────────────────
   Mirrors the phone field's "incompleto vs inválido" split. An address that
   is merely unfinished (still being typed) is INCOMPLETE; one whose structure
   is broken is INVALID. The common ASCII subset below is what we accept — any
   character outside it (whitespace included) is treated as structural breakage
   rather than a half-typed address. */
type EmailClass = "empty" | "incomplete" | "invalid" | "valid";

const EMAIL_ALLOWED_CHARS = /^[A-Za-z0-9._%+\-@]+$/;

function classifyEmail(raw: string): EmailClass {
  if (raw.trim().length === 0) return "empty";

  /* Structural breakage → INVALID (the content is wrong, not just unfinished). */
  if (/\s/.test(raw)) return "invalid"; // whitespace anywhere
  if (!EMAIL_ALLOWED_CHARS.test(raw)) return "invalid"; // disallowed character
  if (raw.startsWith(".")) return "invalid"; // leading dot
  if (raw.startsWith("@")) return "invalid"; // @ with no username
  if (/\.\./.test(raw)) return "invalid"; // two consecutive dots
  if ((raw.match(/@/g) ?? []).length > 1) return "invalid"; // multiple @

  /* No "@" yet, but otherwise plausible → still typing the local part. */
  const at = raw.indexOf("@");
  if (at === -1) return "incomplete"; // e.g. "delrioandres", "delrioandres.gmail"

  const domain = raw.slice(at + 1);
  if (domain.length === 0) return "incomplete"; // trailing "@"      (foo@)
  if (domain.startsWith(".")) return "invalid"; // "@.com" — broken
  if (!domain.includes(".")) return "incomplete"; // no TLD dot yet  (foo@gmail)
  if (domain.endsWith(".")) return "incomplete"; // no TLD chars yet (foo@gmail.)

  /* Local + domain + dotted, non-empty TLD all present. */
  return isValidEmail(raw) ? "valid" : "incomplete";
}

/* ─── Email: typo-correction suggestions ─────────────────────────────────
   Detects common TLD typos and returns the corrected email + display parts.
   This is a hint only — it never blocks advancement. */
type TypoFix = {
  correctedEmail: string;
  /** Everything up to and including the last dot in the corrected address. */
  beforeTld: string;
  /** The corrected TLD (e.g. "com", "net") — rendered slightly brighter. */
  tld: string;
} | null;

const TYPO_FIXES: Array<{ test: (d: string) => boolean; fix: (email: string) => string }> = [
  {
    test: (d) => d.endsWith(".co") && !d.endsWith(".com"),
    fix: (email) => email.slice(0, -2) + "com",
  },
  {
    test: (d) => d.endsWith(".con"),
    fix: (email) => email.slice(0, -1) + "m",
  },
  {
    test: (d) => d.endsWith(".ney"),
    fix: (email) => email.slice(0, -1) + "t",
  },
];

function detectTypoFix(email: string): TypoFix {
  const atIdx = email.indexOf("@");
  if (atIdx < 0) return null;
  const domain = email.slice(atIdx + 1).toLowerCase();
  const entry = TYPO_FIXES.find((e) => e.test(domain));
  if (!entry) return null;
  const correctedEmail = entry.fix(email);
  const lastDot = correctedEmail.lastIndexOf(".");
  return {
    correctedEmail,
    beforeTld: correctedEmail.slice(0, lastDot + 1),
    tld: correctedEmail.slice(lastDot + 1),
  };
}

/* ─── Phone: country-aware formatting + validation ───────────────────────
   Validation is LENGTH-AWARE: every country has an expected national mobile
   digit count, and a number is valid only when it hits that count exactly.
   Fewer = still typing (no error yet); more = too long (error).

   Expected lengths: the installed `country-flag-icons` / `world-countries`
   datasets carry flags and dial codes but NO national-number lengths, and
   `libphonenumber-js` is not installed — so the common markets are hand-
   authored below from their national mobile-number formats. Anything not
   listed falls back to FALLBACK_EXPECTED_DIGITS (8), the cross-country
   floor. (If we later add libphonenumber-js, this map can be replaced by
   `getExampleNumber(...).nationalNumber.length`.) */
const FALLBACK_EXPECTED_DIGITS = 8;

const PHONE_EXPECTED_DIGITS: Record<string, number> = {
  CL: 9, // Chile      +56  9 XXXX XXXX
  MX: 10, // Mexico     +52  XX XXXX XXXX
  US: 10, // USA        +1   XXX XXX XXXX
  CA: 10, // Canada     +1
  AR: 10, // Argentina  +54
  CO: 10, // Colombia   +57
  PE: 9, // Peru       +51
  BR: 11, // Brazil     +55  (2-digit DDD + 9-digit mobile)
  UY: 8, // Uruguay    +598
  PY: 9, // Paraguay   +595
  BO: 8, // Bolivia    +591
  EC: 9, // Ecuador    +593
  VE: 10, // Venezuela  +58
  ES: 9, // Spain      +34
  GB: 10, // UK         +44
  FR: 9, // France     +33  (national number sans leading 0)
  DE: 11, // Germany    +49  (variable; 11 is the common mobile length)
  IT: 10, // Italy      +39
  PT: 9, // Portugal   +351
};

function getExpectedDigits(iso2: string): number {
  return PHONE_EXPECTED_DIGITS[iso2] ?? FALLBACK_EXPECTED_DIGITS;
}

type PhoneConfig = {
  format: (digits: string) => string;
  /** Exact national digit count for a valid number in this country. */
  expectedDigits: number;
  /** Hard cap on raw input — expected + slack so "too long" is reachable. */
  maxDigits: number;
  placeholder: string;
};

const PHONE_FORMAT: Record<string, (digits: string) => string> = {
  CL(d) {
    if (d.length <= 1) return d;
    if (d.length <= 5) return `${d.slice(0, 1)} ${d.slice(1)}`;
    if (d.length <= 9) return `${d.slice(0, 1)} ${d.slice(1, 5)} ${d.slice(5, 9)}`;
    /* Overflow past the 9-digit mask stays visible so a "too long" entry
       reads back exactly what the user typed. */
    return `${d.slice(0, 1)} ${d.slice(1, 5)} ${d.slice(5, 9)} ${d.slice(9)}`;
  },
};

/** Generic three-digit grouping for countries without a bespoke mask. */
function defaultPhoneFormat(d: string): string {
  return d.match(/.{1,3}/g)?.join(" ") ?? d;
}

const PHONE_PLACEHOLDER: Record<string, string> = {
  CL: "9 XXXX XXXX",
};

function getPhoneConfig(iso2: string): PhoneConfig {
  const expectedDigits = getExpectedDigits(iso2);
  return {
    format: PHONE_FORMAT[iso2] ?? defaultPhoneFormat,
    expectedDigits,
    // Allow a few digits past expected so the user can overshoot and see the
    // "too long" error, but keep a sane upper bound.
    maxDigits: expectedDigits + 4,
    placeholder: PHONE_PLACEHOLDER[iso2] ?? "XXX XXX XXXX",
  };
}

/* Shared text styling for the email input + its ghost overlay — they MUST
   match exactly so the suggestion sits flush with the user's cursor. */
const EMAIL_FIELD_TEXT = "text-sm font-normal tracking-[0.04em]";
const EMAIL_FIELD_PAD_X = "px-5";

type StepContactoProps = {
  email: string;
  onEmailChange: (next: string) => void;
  country: Country;
  onCountryChange: (c: Country) => void;
  /** Raw digit string, no formatting, no country code prefix. */
  phone: string;
  onPhoneChange: (digits: string) => void;
  /** Fires only when BOTH email and phone are valid. */
  onSubmit: () => void;
  /** True while the OTP is being sent — disables the button. */
  pending?: boolean;
  /** Error message from the OTP send attempt, shown below the button. */
  submitError?: string | null;
};

export function StepContacto({
  email,
  onEmailChange,
  country,
  onCountryChange,
  phone,
  onPhoneChange,
  onSubmit,
  pending = false,
  submitError = null,
}: StepContactoProps) {
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const phoneInputRef = useRef<HTMLInputElement | null>(null);

  /* Deferred Enter-to-advance: when the user hits Enter on a structurally
     valid email whose silent domain check hasn't resolved yet, we stash that
     address here and advance to the phone input the moment the check confirms
     it (see the effect below). null = no pending advance. */
  const advanceOnValidRef = useRef<string | null>(null);

  /* Per-field "blurred at least once" flags. A field also counts as touched
     the moment it holds typed content (see emailTouched / phoneTouched), so
     hints surface live without waiting for a blur. Each flag is set ONLY by
     direct interaction with its own field (that field's blur) or by CONTINUAR
     — never by interaction with the other field. */
  const [emailBlurred, setEmailBlurred] = useState(false);
  const [phoneBlurred, setPhoneBlurred] = useState(false);

  /* Timing gates that keep format errors from flashing on every keystroke.
     emailShowError flips true ~1s after the user stops typing, or on blur.
     phoneValidateNow flips true on blur / country change, forcing a too-short
     number to surface its error; any keystroke resets it (back to "typing"). */
  const [emailShowError, setEmailShowError] = useState(false);
  const [phoneValidateNow, setPhoneValidateNow] = useState(false);

  /* Background domain check result, keyed to the EXACT address it was run for.
     Keying by email is the race guard: a result only counts when its `email`
     still equals the current field value, so stale in-flight responses for a
     since-edited address are simply ignored. null = never resolved yet. */
  const [domainResult, setDomainResult] = useState<{
    email: string;
    valid: boolean;
  } | null>(null);

  /* Domain-typo suggestion, keyed to the exact address it was computed for
     (same staleness guard as domainResult). Populated only when the domain
     check failed and the local heuristic found a plausible correction. */
  const [domainSuggestion, setDomainSuggestion] = useState<{
    email: string;
    fix: DomainSuggestion;
  } | null>(null);

  /* Mirrors the latest email value for the async staleness check (read inside
     a resolved promise, where the `email` closure would be stale). */
  const emailRef = useRef(email);
  useEffect(() => {
    emailRef.current = email;
  }, [email]);

  const config = getPhoneConfig(country.iso2);
  const formattedPhone = config.format(phone);

  const suggestion = useMemo(() => computeSuggestion(email), [email]);
  const typoFix = useMemo(() => detectTypoFix(email), [email]);
  /* Domain typo suggestion for the CURRENT address only (staleness guard).
     Suppressed when the TLD-level typoFix is already offering a correction, so
     the user never sees two competing "¿Quisiste decir?" prompts. */
  const domainFix: DomainSuggestion =
    !typoFix && domainSuggestion?.email === email ? domainSuggestion.fix : null;

  const emailClass = classifyEmail(email);
  const phoneValid = phone.length === config.expectedDigits;

  /* Domain check verdicts for the CURRENT address only — a result for a since-
     edited email no longer matches and is treated as "not yet known". */
  const domainValidForCurrent =
    domainResult?.email === email && domainResult.valid;
  const domainInvalidForCurrent =
    domainResult?.email === email && !domainResult.valid;

  /* Email is fully valid only once the format passes AND the domain check has
     come back clean. While the check is pending (structurally complete but no
     matching result yet) the email is NOT yet valid, so CONTINUAR stays off —
     silently, with no message. */
  const emailValid = emailClass === "valid" && domainValidForCurrent;
  const bothValid = emailValid && phoneValid;

  const emailTouched = emailBlurred || email.length > 0;
  const phoneTouched = phoneBlurred || phone.length > 0;

  const emailState = emailFieldState(
    emailClass,
    emailTouched,
    emailShowError,
    domainInvalidForCurrent,
  );
  const phoneState = phoneFieldState(
    phone,
    phoneTouched,
    config.expectedDigits,
    phoneValidateNow,
  );

  /* Email debounce: each edit (via handleEmailChange) hides the format error
     and the effect below restarts a 1s timer; when it elapses we allow the
     error to show again. So the error never chases the cursor — it only
     surfaces after the user pauses. Blur shows it instantly (see onBlur). The
     timer is skipped while the field is empty — the empty-but-touched hint is
     handled separately. */
  useEffect(() => {
    if (email.trim().length === 0) return;
    const t = setTimeout(() => setEmailShowError(true), 1000);
    return () => clearTimeout(t);
  }, [email]);

  /* Background domain check — completely silent. Runs validateEmailDomain for
     a target address and only commits the verdict if the field still holds
     that exact value when the promise resolves (the staleness guard). */
  const checkDomain = useCallback((target: string) => {
    void validateEmailDomain(target).then((valid) => {
      if (emailRef.current !== target) return; // user moved on → discard
      setDomainResult({ email: target, valid });

      if (valid) {
        setDomainSuggestion(null);
        return;
      }

      /* Domain is dead → run the local typo-suggestion heuristic. Re-guarded
         against staleness so a since-edited address never shows a suggestion
         for an old value. */
      const local = suggestDomainLocally(target);
      if (emailRef.current === target) {
        setDomainSuggestion(local ? { email: target, fix: local } : null);
      }
    });
  }, []);

  /* Fire the domain check 4500ms after the user pauses on a structurally
     complete address (the long debounce gives slower / older typists ample
     room to finish). The format check is the gate: if the email isn't
     structurally "valid", no domain check runs. Editing restarts the timer, so
     a value the user types through is never checked. Blur and Enter trigger it
     immediately (see surfaceEmailValidation and handleEmailKeyDown). */
  useEffect(() => {
    if (emailClass !== "valid") return;
    const target = email;
    const t = setTimeout(() => checkDomain(target), 4500);
    return () => clearTimeout(t);
  }, [email, emailClass, checkDomain]);

  /* Deferred Enter-to-advance: if Enter was pressed on a valid-format email
     whose domain check was still pending, advance to the phone input as soon
     as that exact address resolves valid — but only if the user is still in
     the email field (don't yank focus if they've moved on or edited). */
  useEffect(() => {
    if (
      advanceOnValidRef.current === email &&
      emailValid &&
      document.activeElement === emailInputRef.current
    ) {
      advanceOnValidRef.current = null;
      phoneInputRef.current?.focus();
    }
  }, [emailValid, email]);

  /* Single funnel for every email mutation — resets the debounce gate so the
     format error hides while the value is changing, then the effect's timer
     decides when (if ever) to show it again. */
  function handleEmailChange(next: string) {
    setEmailShowError(false);
    onEmailChange(next);
  }

  function acceptSuggestion() {
    if (!suggestion) return;
    handleEmailChange(email + suggestion);
    requestAnimationFrame(() => emailInputRef.current?.focus());
  }

  /* Advance to Step 2. Only ever reached when the whole form is valid — the
     button is truly `disabled` otherwise, and the Enter handlers guard on
     bothValid. No force-validation here: the live per-field hints/errors have
     already told the user what's wrong. */
  function submitContacto() {
    if (!bothValid) return;
    console.log("[KYC] contacto valid, moving to step 2", { email, phone });
    onSubmit();
  }

  /* Surface the email field's validation immediately (the same effect a blur
     has): reveal any format error and kick the silent domain check if the
     address is structurally complete. Reused by onBlur and by Enter on an
     not-yet-valid address. Touches ONLY the email field — never the phone. */
  function surfaceEmailValidation() {
    setEmailBlurred(true);
    setEmailShowError(true);
    if (emailClass === "valid") checkDomain(email);
  }

  function handleEmailKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    /* Ghost suggestion: Tab / ArrowRight / Space accept it (Space is swallowed
       so the literal " " never lands in the input). Takes priority. */
    if (suggestion && (e.key === "Tab" || e.key === "ArrowRight" || e.key === " ")) {
      e.preventDefault();
      acceptSuggestion();
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (emailValid) {
        /* Format + domain both confirmed → jump to the phone NUMBER input. */
        phoneInputRef.current?.focus();
      } else if (emailClass === "valid") {
        /* Structurally complete but the silent domain check hasn't resolved
           yet. Kick it now and auto-advance the instant it confirms valid
           (deferred-advance effect). No error is surfaced — the format is
           fine; we're only waiting on the domain. */
        checkDomain(email);
        advanceOnValidRef.current = email;
      }
      /* Empty / incomplete / invalid → Enter does nothing. The live hints and
         errors already tell the user what's wrong. */
      return;
    }

    /* Tab with no pending suggestion: skip the country selector and land
       straight on the phone NUMBER input. The selector stays reachable via
       Shift+Tab from the phone input (natural order) or by clicking. */
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      phoneInputRef.current?.focus();
    }
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, config.maxDigits);
    /* Any keystroke means the user is actively typing again — drop back to
       the quiet "still typing" state for sub-expected lengths. (Too-long and
       exact-length validation are length-driven and unaffected by this.) */
    setPhoneValidateNow(false);
    onPhoneChange(digits);
  }

  function handlePhoneKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      /* Enter submits only when the whole form is valid (same as clicking the
         now-enabled CONTINUAR). Otherwise it does nothing — the live errors
         already say what's wrong. */
      submitContacto();
    }
  }

  function handleCountryChange(c: Country) {
    /* Switching country changes the expected digit count, so re-validate the
       number already in the field against the new country immediately. */
    setPhoneValidateNow(true);
    onCountryChange(c);
  }

  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-col">
      {/* Step label */}
      <p className={TEXT_LABEL}>TU CONTACTO</p>

      {/* ───────────── Email ───────────── */}
      <div className="relative mt-3">
        {/* Mobile-only suggestion chip — appears above the input. Hidden on
            ≥sm because the inline ghost + Tab/Space/ArrowRight cover desktop. */}
        {suggestion && (
          <button
            type="button"
            onClick={acceptSuggestion}
            aria-label={`Aceptar sugerencia: ${email}${suggestion}`}
            className="absolute bottom-full left-1/2 z-20 mb-3 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/20 bg-[#0a1626]/85 px-4 py-2 text-xs font-normal text-white/85 shadow-[0_10px_28px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md sm:hidden"
            style={{ animation: "kycChipFadeIn 200ms ease-out both" }}
          >
            {email + suggestion}
          </button>
        )}

        <div className={emailState.tone === "error" ? INPUT_WRAP_ERROR : INPUT_WRAP}>
          <div className="relative">
            <input
              ref={emailInputRef}
              type="email"
              inputMode="email"
              autoComplete="email"
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              value={email}
              placeholder="@"
              aria-invalid={emailState.tone === "error"}
              aria-describedby={emailState.message ? "kyc-email-msg" : undefined}
              aria-label="Correo electrónico"
              onChange={(e) => handleEmailChange(e.target.value)}
              onKeyDown={handleEmailKeyDown}
              onBlur={surfaceEmailValidation}
              className={`relative z-10 h-14 ${EMAIL_FIELD_PAD_X} ${EMAIL_FIELD_TEXT} ${INPUT_INNER}`}
            />

            {/* Ghost overlay — same font/padding so the suggestion lines up
                flush with the user's cursor. The container is pointer-
                events-none so clicks reach the input, but the ghost <span>
                re-enables them so mobile users can tap it. */}
            {suggestion && (
              <div
                aria-hidden
                className={`pointer-events-none absolute inset-0 z-0 flex items-center overflow-hidden whitespace-pre ${EMAIL_FIELD_PAD_X} ${EMAIL_FIELD_TEXT}`}
              >
                <span className="invisible">{email}</span>
                <span
                  role="button"
                  tabIndex={-1}
                  onClick={acceptSuggestion}
                  className="pointer-events-auto cursor-pointer text-white/35 transition-colors duration-200 hover:text-white/55"
                >
                  {suggestion}
                </span>
              </div>
            )}
          </div>
        </div>

        {emailState.message && (
          <p
            id="kyc-email-msg"
            role={emailState.tone === "error" ? "alert" : "status"}
            className={emailState.tone === "error" ? FIELD_ERROR_AMBER : FIELD_HINT}
          >
            {emailState.message}
          </p>
        )}

        {/* Typo-correction suggestion — shown whenever email matches a known
            TLD typo; tappable to auto-correct; never blocks advancement.
            Suppressed while a format error is showing to avoid two captions. */}
        {emailState.tone !== "error" && typoFix && (
          <button
            type="button"
            onClick={() => {
              handleEmailChange(typoFix.correctedEmail);
              requestAnimationFrame(() => emailInputRef.current?.focus());
            }}
            className="mt-1.5 text-left text-xs leading-none"
          >
            <span className="text-white/50">¿Quisiste decir {typoFix.beforeTld}</span>
            <span className="text-white/75">{typoFix.tld}</span>
            <span className="text-white/50">?</span>
          </button>
        )}

        {/* Domain typo suggestion — surfaces when the
            domain check failed and a plausible correction was found. Shown
            alongside the "Email inválido" message: the error says the domain
            is wrong, this offers the likely fix. Tappable; never blocks. */}
        {domainFix && (
          <button
            type="button"
            onClick={() => {
              handleEmailChange(domainFix.correctedEmail);
              requestAnimationFrame(() => emailInputRef.current?.focus());
            }}
            className="mt-1.5 text-left text-xs leading-none"
          >
            <span className="text-white/50">¿Quisiste decir {domainFix.beforeTld}</span>
            <span className="text-white/75">{domainFix.tld}</span>
            <span className="text-white/50">?</span>
          </button>
        )}
      </div>

      {/* ───────────── Phone (~16px gap) ───────────── */}
      <div className="mt-4">
        <div className={phoneState.tone === "error" ? FIELD_PILL_ERROR : FIELD_PILL}>
          <CountryPicker
            selected={country}
            onSelect={handleCountryChange}
            options={COUNTRIES}
          />

          <span aria-hidden className={`my-3 ${DIVIDER_VERTICAL}`} />

          <input
            ref={phoneInputRef}
            type="tel"
            inputMode="tel"
            pattern="[0-9]*"
            autoComplete="tel-national"
            value={formattedPhone}
            placeholder={config.placeholder}
            aria-invalid={phoneState.tone === "error"}
            aria-describedby={phoneState.message ? "kyc-phone-msg" : undefined}
            aria-label="Número de teléfono"
            onChange={handlePhoneChange}
            onKeyDown={handlePhoneKeyDown}
            onBlur={() => {
              setPhoneBlurred(true);
              setPhoneValidateNow(true); // blur validates immediately, even if too short
            }}
            className={`${INPUT_INNER} h-14 min-w-0 flex-1 rounded-r-full px-4 sm:px-5`}
          />
        </div>

        {phoneState.message && (
          <p
            id="kyc-phone-msg"
            role={phoneState.tone === "error" ? "alert" : "status"}
            className={phoneState.tone === "error" ? FIELD_ERROR_AMBER : FIELD_HINT}
          >
            {phoneState.message}
          </p>
        )}
      </div>

      {/* CONTINUAR — right-aligned, disabled until valid OR while OTP is sending. */}
      <div className="mt-8 flex flex-col items-end gap-2">
        {submitError && (
          <p role="alert" className="text-[11px] font-medium uppercase tracking-[0.22em] text-amber-200/85">
            {submitError}
          </p>
        )}
        <button
          type="button"
          onClick={submitContacto}
          disabled={!bothValid || pending}
          className={`group inline-flex items-center gap-2 ${CTA_PRIMARY}`}
        >
          {pending ? "ENVIANDO..." : "CONTINUAR"}
          {!pending && (
            <span
              aria-hidden
              className="transition-transform duration-300 ease-out motion-reduce:transition-none group-hover:translate-x-0.5"
            >
              →
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
