"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CTA_GHOST,
  CTA_PRIMARY,
  CTA_SECONDARY,
  FIELD_ERROR,
  FIELD_LABEL,
  GLASS_TILE,
  INPUT_INNER,
  INPUT_WRAP,
  MODAL_AMBIENT_BG,
  PROGRESS_FILL,
  PROGRESS_TRACK,
  SCRIM,
  TEXT_EYEBROW,
  TEXT_HINT,
  TEXT_LABEL,
  TEXT_META,
  pillClass,
} from "@/styles/glass";
import type { PropertyDetail } from "./types";

/* ─── Types ─────────────────────────────────────────────────────────────── */

type BookingData = {
  date: string;
  startTime: string;
  durationMin: number;
  guests: number;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  property: Pick<
    PropertyDetail,
    | "title"
    | "area"
    | "pricePer15Min"
    | "pricePer45Min"
    | "capacidadMaxima"
    | "instantBooking"
  >;
};

const TOTAL_STEPS = 3;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function fmtDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("es-CL", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ─── Modal-specific shells (compose glass.ts tokens) ───────────────────── */

const MODAL_PANEL = [
  "absolute left-1/2 top-1/2 w-[min(600px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2",
  "origin-center overflow-y-auto max-h-[min(760px,calc(100dvh-2rem))]",
  /* Asymmetric radius + outer modal recipe lifted from OfferScreen */
  "rounded-[32px_56px_48px_28px] border border-white/10 border-b-transparent border-r-transparent",
  "bg-[#07101d]/58 p-5 pt-6 text-white",
  "shadow-[34px_42px_120px_rgba(0,0,0,0.62),inset_0_1px_0_rgba(255,255,255,0.12)]",
  "backdrop-blur-2xl",
  "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
  "sm:p-7 sm:pt-8",
].join(" ");

const TILE = `${GLASS_TILE} px-4 py-3`;

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className={`mb-2 block ${FIELD_LABEL}`}>{children}</span>;
}

/* ─── Step 1 — Select time ───────────────────────────────────────────────── */

const START_TIMES = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
  "20:00", "20:30", "21:00", "21:30", "22:00",
];

type Step1Props = {
  data: BookingData;
  maxGuests: number;
  pricePer15Min: number;
  onChange: <K extends keyof BookingData>(k: K, v: BookingData[K]) => void;
  errors: Partial<Record<keyof BookingData, string>>;
};

function Step1({ data, maxGuests, pricePer15Min, onChange, errors }: Step1Props) {
  const blocks = data.durationMin / 15;
  const total = blocks * pricePer15Min;

  function adjustDuration(delta: number) {
    const next = Math.max(45, data.durationMin + delta);
    onChange("durationMin", next);
  }

  return (
    <div className="space-y-5">
      <div>
        <FieldLabel>Fecha</FieldLabel>
        <div className={`${INPUT_WRAP} px-4 py-3`}>
          <input
            type="date"
            value={data.date}
            min={todayIso()}
            onChange={(e) => onChange("date", e.target.value)}
            className={`${INPUT_INNER} [color-scheme:dark]`}
          />
        </div>
        {errors.date && <p className={FIELD_ERROR}>{errors.date}</p>}
      </div>

      <div>
        <FieldLabel>Hora de inicio</FieldLabel>
        <div className={`${INPUT_WRAP} relative px-4 py-3`}>
          <select
            value={data.startTime}
            onChange={(e) => onChange("startTime", e.target.value)}
            className={`${INPUT_INNER} appearance-none pr-7`}
          >
            {START_TIMES.map((t) => (
              <option key={t} value={t} className="bg-[#0a0f1c] text-white">
                {t}
              </option>
            ))}
          </select>
          <span aria-hidden className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-white/70">▾</span>
        </div>
      </div>

      <div>
        <FieldLabel>Duración</FieldLabel>
        <div className={`${TILE} flex items-center justify-between gap-4`}>
          <button
            type="button"
            onClick={() => adjustDuration(-15)}
            disabled={data.durationMin <= 45}
            aria-label="Reducir 15 minutos"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/[0.04] text-sm text-white/70 transition-all duration-300 ease-out hover:border-white/40 hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            −
          </button>
          <div className="text-center">
            <p className="text-xl font-medium tracking-tight text-white">
              {data.durationMin} <span className="text-[11px] font-light text-white/80">min</span>
            </p>
            <p className={`mt-0.5 ${TEXT_HINT}`}>
              {data.durationMin / 60 >= 1
                ? `${(data.durationMin / 60).toFixed(data.durationMin % 60 === 0 ? 0 : 1)} hora${data.durationMin >= 120 ? "s" : ""}`
                : "45 min mínimo"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => adjustDuration(15)}
            aria-label="Aumentar 15 minutos"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/[0.04] text-sm text-white/70 transition-all duration-300 ease-out hover:border-white/40 hover:bg-white/[0.08] hover:text-white"
          >
            +
          </button>
        </div>
      </div>

      <div>
        <FieldLabel>Número de personas</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => {
            const active = data.guests === n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => onChange("guests", n)}
                aria-pressed={active}
                className={pillClass(active)}
              >
                {n}
              </button>
            );
          })}
        </div>
      </div>

      <div className={`${TILE} flex items-center justify-between gap-4`}>
        <div>
          <p className={TEXT_LABEL}>Total estimado</p>
          <p className={`mt-1 ${TEXT_HINT}`}>
            {data.durationMin / 15} bloques × ${pricePer15Min}
          </p>
        </div>
        <p
          className="text-2xl font-medium tracking-tight text-white"
          style={{ textShadow: "0 0 18px rgba(255,255,255,0.45)" }}
        >
          ${total.toLocaleString("es-CL")}
        </p>
      </div>
    </div>
  );
}

/* ─── Step 2 — Review & payment ──────────────────────────────────────────── */

type Step2Props = {
  data: BookingData;
  title: string;
  area: string;
  pricePer15Min: number;
  onChange: <K extends keyof BookingData>(k: K, v: BookingData[K]) => void;
  errors: Partial<Record<keyof BookingData, string>>;
};

function formatCardNumber(raw: string): string {
  return raw
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 4);
  if (d.length > 2) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return d;
}

function Step2({ data, title, area, pricePer15Min, onChange, errors }: Step2Props) {
  const blocks = data.durationMin / 15;
  const subtotal = blocks * pricePer15Min;
  const deposit = Math.round(subtotal * 0.5);
  const total = subtotal + deposit;

  return (
    <div className="space-y-5">
      <div className={`${TILE} space-y-2`}>
        <p className={TEXT_LABEL}>Resumen</p>
        <p className="text-sm font-medium tracking-[0.04em] text-white">{title}</p>
        <p className="text-[11px] tracking-[0.04em] text-white/80">{area}</p>
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
          <span className="text-white uppercase tracking-[0.22em]">Fecha</span>
          <span className="text-white">{fmtDate(data.date)}</span>
          <span className="text-white uppercase tracking-[0.22em]">Inicio</span>
          <span className="text-white">{data.startTime}</span>
          <span className="text-white uppercase tracking-[0.22em]">Duración</span>
          <span className="text-white">{data.durationMin} min</span>
          <span className="text-white uppercase tracking-[0.22em]">Personas</span>
          <span className="text-white">{data.guests}</span>
        </div>
      </div>

      <div className={`${TILE} space-y-2`}>
        <p className={TEXT_LABEL}>Desglose</p>
        <div className="space-y-1.5 text-[12px]">
          <div className="flex justify-between">
            <span className="text-white/80">{data.durationMin} min × ${pricePer15Min}/15 min</span>
            <span className="text-white">${subtotal.toLocaleString("es-CL")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/80">Depósito de daños (50%)</span>
            <span className="text-white">${deposit.toLocaleString("es-CL")}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-white/10 pt-2">
            <span className="text-[10px] uppercase tracking-[0.28em] text-white">Total</span>
            <span
              className="text-base font-medium text-white"
              style={{ textShadow: "0 0 14px rgba(255,255,255,0.5)" }}
            >
              ${total.toLocaleString("es-CL")}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <p className={TEXT_LABEL}>Método de pago</p>

        <div>
          <FieldLabel>Número de tarjeta</FieldLabel>
          <div className={`${INPUT_WRAP} flex items-center gap-3 px-4 py-3`}>
            <span className="shrink-0 text-[11px] text-white/70">💳</span>
            <input
              type="text"
              inputMode="numeric"
              value={data.cardNumber}
              onChange={(e) =>
                onChange("cardNumber", formatCardNumber(e.target.value))
              }
              placeholder="0000 0000 0000 0000"
              maxLength={19}
              className={INPUT_INNER}
            />
          </div>
          {errors.cardNumber && <p className={FIELD_ERROR}>{errors.cardNumber}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>Vencimiento</FieldLabel>
            <div className={`${INPUT_WRAP} px-4 py-3`}>
              <input
                type="text"
                inputMode="numeric"
                value={data.cardExpiry}
                onChange={(e) =>
                  onChange("cardExpiry", formatExpiry(e.target.value))
                }
                placeholder="MM/AA"
                maxLength={5}
                className={INPUT_INNER}
              />
            </div>
            {errors.cardExpiry && <p className={FIELD_ERROR}>{errors.cardExpiry}</p>}
          </div>
          <div>
            <FieldLabel>CVC</FieldLabel>
            <div className={`${INPUT_WRAP} px-4 py-3`}>
              <input
                type="text"
                inputMode="numeric"
                value={data.cardCvc}
                onChange={(e) =>
                  onChange("cardCvc", e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                placeholder="•••"
                maxLength={4}
                className={INPUT_INNER}
              />
            </div>
            {errors.cardCvc && <p className={FIELD_ERROR}>{errors.cardCvc}</p>}
          </div>
        </div>
      </div>

      <p className="text-[10px] leading-relaxed tracking-[0.18em] text-white/80">
        Reembolso completo si cancelas hasta 10 minutos después del inicio de la reserva.
      </p>
    </div>
  );
}

/* ─── Step 3 — Confirmation ──────────────────────────────────────────────── */

type Step3Props = {
  data: BookingData;
  title: string;
  area: string;
  pricePer15Min: number;
  onClose: () => void;
};

function Step3({ data, title, area, pricePer15Min, onClose }: Step3Props) {
  const subtotal = (data.durationMin / 15) * pricePer15Min;
  const deposit = Math.round(subtotal * 0.5);
  const total = subtotal + deposit;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3 py-2">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-white/[0.12] text-lg text-white shadow-[0_0_32px_rgba(255,255,255,0.5),inset_0_1px_0_rgba(255,255,255,0.22)]"
          aria-hidden
        >
          ✓
        </span>
        <p className={TEXT_EYEBROW}>Reserva confirmada</p>
        <h3 className="text-center text-xl font-medium uppercase tracking-[0.28em] text-white">
          ¡Todo listo!
        </h3>
        <p className="text-center text-sm font-light leading-relaxed tracking-[0.04em] text-white/80">
          Tu espacio en <span className="text-white">{area}</span> está confirmado.
        </p>
      </div>

      <div className={`${TILE} space-y-2`}>
        <p className={TEXT_LABEL}>Detalle de reserva</p>
        <p className="text-sm font-medium tracking-[0.04em] text-white">{title}</p>
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
          <span className="text-white uppercase tracking-[0.22em]">Fecha</span>
          <span className="text-white">{fmtDate(data.date)}</span>
          <span className="text-white uppercase tracking-[0.22em]">Inicio</span>
          <span className="text-white">{data.startTime}</span>
          <span className="text-white uppercase tracking-[0.22em]">Duración</span>
          <span className="text-white">{data.durationMin} min</span>
          <span className="text-white uppercase tracking-[0.22em]">Personas</span>
          <span className="text-white">{data.guests}</span>
          <span className="text-white uppercase tracking-[0.22em]">Total cobrado</span>
          <span className="text-white">${total.toLocaleString("es-CL")}</span>
        </div>
      </div>

      <p className="text-[10px] leading-relaxed tracking-[0.18em] text-white/80">
        Recibirás la confirmación por correo. Recuerda: reembolso completo si cancelas hasta 10 minutos después del inicio.
      </p>

      <div className="flex justify-end">
        <button type="button" onClick={onClose} className={CTA_PRIMARY}>
          Cerrar
        </button>
      </div>
    </div>
  );
}

/* ─── Progress bar ───────────────────────────────────────────────────────── */

function StepProgress({ current, total }: { current: number; total: number }) {
  const pct = (current / total) * 100;
  const labels = ["Horario", "Pago", "Confirmación"];
  return (
    <div className="mb-6 space-y-2">
      <div className="flex items-center justify-between">
        <p className={TEXT_EYEBROW}>
          Paso {current} / {total}
        </p>
        <p className={TEXT_LABEL}>{labels[current - 1]}</p>
      </div>
      <div className={PROGRESS_TRACK}>
        <span
          className={PROGRESS_FILL}
          style={{ width: `${pct}%` }}
          aria-hidden
        />
      </div>
    </div>
  );
}

/* ─── Validation ─────────────────────────────────────────────────────────── */

function validateStep(step: number, data: BookingData) {
  const e: Partial<Record<keyof BookingData, string>> = {};
  if (step === 1) {
    if (!data.date) e.date = "Elige una fecha";
    if (!data.startTime) e.startTime = "Elige un horario";
  }
  if (step === 2) {
    const digits = data.cardNumber.replace(/\D/g, "");
    if (digits.length < 16) e.cardNumber = "Número de tarjeta inválido";
    if (!/^\d{2}\/\d{2}$/.test(data.cardExpiry)) e.cardExpiry = "Formato MM/AA";
    if (data.cardCvc.length < 3) e.cardCvc = "CVC inválido";
  }
  return e;
}

/* ─── Main modal ─────────────────────────────────────────────────────────── */

const INITIAL: BookingData = {
  date: todayIso(),
  startTime: "10:00",
  durationMin: 45,
  guests: 1,
  cardNumber: "",
  cardExpiry: "",
  cardCvc: "",
};

export function BookingModal({ open, onClose, property }: Props) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<BookingData>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof BookingData, string>>>({});

  useEffect(() => {
    if (open) {
      setStep(1);
      setData(INITIAL);
      setErrors({});
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const update = useCallback(
    <K extends keyof BookingData>(key: K, value: BookingData[K]) => {
      setData((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    [],
  );

  function goNext() {
    if (step === TOTAL_STEPS) return;
    const e = validateStep(step, data);
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    if (step === 2) {
      const subtotal = (data.durationMin / 15) * property.pricePer15Min;
      console.log("[Spaced] booking confirmed", {
        property: property.title,
        area: property.area,
        ...data,
        subtotal,
        deposit: Math.round(subtotal * 0.5),
        total: subtotal + Math.round(subtotal * 0.5),
        confirmedAt: new Date().toISOString(),
      });
    }
    setErrors({});
    setStep((s) => s + 1);
  }

  function goBack() {
    setErrors({});
    setStep((s) => Math.max(1, s - 1));
  }

  const eyebrow = useMemo(() => {
    if (step === 1) return "Selecciona horario";
    if (step === 2) return "Revisión y pago";
    return "Reserva confirmada";
  }, [step]);

  return (
    <div
      role="presentation"
      className={[
        "fixed inset-0 z-50 transition-[opacity,backdrop-filter] duration-500 ease-out",
        open
          ? "pointer-events-auto opacity-100 backdrop-blur-[6px]"
          : "pointer-events-none opacity-0 backdrop-blur-0",
      ].join(" ")}
    >
      <button
        type="button"
        aria-label="Cerrar modal"
        onClick={onClose}
        className={`absolute inset-0 cursor-default ${SCRIM}`}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{ background: MODAL_AMBIENT_BG }}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
        className={[
          MODAL_PANEL,
          open ? "scale-100 opacity-100" : "scale-[0.96] opacity-0",
        ].join(" ")}
        style={{
          maskImage:
            "radial-gradient(ellipse 112% 92% at 24% 42%, black 0%, black 60%, rgba(0,0,0,0.86) 78%, rgba(0,0,0,0.38) 92%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 112% 92% at 24% 42%, black 0%, black 60%, rgba(0,0,0,0.86) 78%, rgba(0,0,0,0.38) 92%, transparent 100%)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 52% 42% at 18% 0%, rgba(255,255,255,0.1), transparent 68%), linear-gradient(120deg, rgba(255,255,255,0.075), transparent 30%, transparent 62%, rgba(255,255,255,0.045))",
          }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />

        {step < 3 && (
          <button
            type="button"
            onClick={onClose}
            className={`absolute right-5 top-5 ${CTA_SECONDARY}`}
          >
            cerrar
          </button>
        )}

        <div className="relative">
          <p className={`${TEXT_EYEBROW} tracking-[0.62em]`}>{eyebrow}</p>

          <h2
            id="booking-modal-title"
            className="mt-3 text-xl font-medium uppercase tracking-[0.34em] text-white sm:text-2xl"
          >
            {property.title}
          </h2>
          <p className={`mt-1 ${TEXT_META}`}>{property.area}</p>

          <div className="mt-5">
            <StepProgress current={step} total={TOTAL_STEPS} />

            <div
              key={step}
              style={{ animation: "bmFadeIn 400ms cubic-bezier(0.16,1,0.3,1) both" }}
            >
              {step === 1 && (
                <Step1
                  data={data}
                  maxGuests={property.capacidadMaxima}
                  pricePer15Min={property.pricePer15Min}
                  onChange={update}
                  errors={errors}
                />
              )}
              {step === 2 && (
                <Step2
                  data={data}
                  title={property.title}
                  area={property.area}
                  pricePer15Min={property.pricePer15Min}
                  onChange={update}
                  errors={errors}
                />
              )}
              {step === 3 && (
                <Step3
                  data={data}
                  title={property.title}
                  area={property.area}
                  pricePer15Min={property.pricePer15Min}
                  onClose={onClose}
                />
              )}
            </div>

            {step < 3 && (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
                <div>
                  {step > 1 && (
                    <button type="button" onClick={goBack} className={CTA_GHOST}>
                      ← Atrás
                    </button>
                  )}
                </div>
                <button type="button" onClick={goNext} className={CTA_PRIMARY}>
                  {step === 2 ? "Confirmar reserva" : "Siguiente →"}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes bmFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
