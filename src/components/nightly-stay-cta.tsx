"use client";

import { CTA_PRIMARY } from "@/styles/glass";

export function NightlyStayCta() {
  return (
    <button
      type="button"
      className={`w-full text-center ${CTA_PRIMARY}`}
      onClick={() =>
        alert(
          "Próximamente: enviaremos tu solicitud al anfitrión para confirmar fechas y pago.",
        )
      }
    >
      Solicitar estancia
    </button>
  );
}
