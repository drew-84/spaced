import type { PropertyDetail } from "./types";

type Props = {
  property: Pick<
    PropertyDetail,
    "pricePer15Min" | "pricePer45Min" | "reservaMinimaMin" | "capacidadMaxima"
  >;
};

/**
 * Four stat tiles in a single row.
 * Tile style copied exactly from the OFRECER modal "stat tile":
 *   rounded-[26px] border border-white/[0.075] bg-white/[0.035]
 *   shadow-[0_16px_34px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-14px_26px_rgba(3,8,18,0.28)]
 *   backdrop-blur-md
 */
export function KeyInfoRow({ property }: Props) {
  const tiles: { label: string; value: string; note?: string }[] = [
    {
      label: "Precio · 45 min",
      value: `$${property.pricePer45Min}`,
      note: "bloque completo",
    },
    {
      label: "Precio · 15 min",
      value: `$${property.pricePer15Min}`,
      note: "tarifa base",
    },
    {
      label: "Reserva mínima",
      value: `${property.reservaMinimaMin}`,
      note: "minutos · fijo",
    },
    {
      label: "Capacidad máx.",
      value: `${property.capacidadMaxima}`,
      note: "personas",
    },
  ];

  return (
    <section aria-label="Información clave" className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {tiles.map((t) => (
        <div
          key={t.label}
          className="rounded-[22px] border border-white/[0.075] bg-white/[0.035] px-4 py-4 shadow-[0_16px_34px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-14px_26px_rgba(3,8,18,0.28)] backdrop-blur-md"
        >
          <p className="text-[9px] uppercase tracking-[0.28em] text-sky-100/45">
            {t.label}
          </p>
          <p className="mt-2 text-2xl font-medium tracking-tight text-sky-100/90">
            {t.value}
          </p>
          {t.note && (
            <p className="mt-1 text-[9px] uppercase tracking-[0.22em] text-white/35">
              {t.note}
            </p>
          )}
        </div>
      ))}
    </section>
  );
}
