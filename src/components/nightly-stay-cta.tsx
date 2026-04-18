"use client";

export function NightlyStayCta() {
  return (
    <button
      type="button"
      className="w-full cursor-pointer rounded-full border border-stone-300 bg-white px-4 py-3 text-center text-sm font-semibold text-stone-900 shadow-sm transition hover:border-stone-400 hover:bg-stone-50"
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
