"use client";

import { useMemo } from "react";
import { GlassSelect, GlassText } from "../glass-field";
import { BANCOS, type ListSpaceFormData, type StepErrors } from "../types";

function formatAccount(digits: string): string {
  const cleaned = digits.replace(/\D/g, "").slice(0, 20);
  return cleaned.match(/.{1,4}/g)?.join("-") ?? "";
}

type Props = {
  data: ListSpaceFormData;
  errors: StepErrors;
  onChange: <K extends keyof ListSpaceFormData>(
    key: K,
    value: ListSpaceFormData[K],
  ) => void;
};

export function StepPayment({ data, errors, onChange }: Props) {
  const displayAccount = useMemo(
    () => formatAccount(data.numeroCuenta),
    [data.numeroCuenta],
  );

  return (
    <div className="space-y-6">
      <GlassText
        id="ls-titular"
        label="Titular de la cuenta"
        value={data.titularCuenta}
        onChange={(v) => onChange("titularCuenta", v)}
        placeholder="Nombre completo del titular"
        autoComplete="cc-name"
        error={errors.titularCuenta}
      />
      <GlassSelect
        id="ls-banco"
        label="Banco"
        value={data.banco}
        onChange={(v) => onChange("banco", v)}
        options={BANCOS}
        placeholder="Selecciona un banco…"
        error={errors.banco}
      />
      <GlassText
        id="ls-cuenta"
        label="Número de cuenta"
        value={displayAccount}
        /* Strip non-digits, keep only digits in state, redisplay with dashes */
        onChange={(v) => onChange("numeroCuenta", v.replace(/\D/g, "").slice(0, 20))}
        placeholder="0000-0000-0000"
        autoComplete="off"
        error={errors.numeroCuenta}
      />
      <p className="text-[10px] leading-relaxed tracking-[0.18em] text-white/80">
        Tus datos bancarios se guardan cifrados y solo se usan para
        transferirte los pagos por tus reservas.
      </p>
    </div>
  );
}
