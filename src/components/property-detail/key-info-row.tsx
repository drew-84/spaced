import { GLASS_TILE, TEXT_HINT, TEXT_LABEL } from "@/styles/glass";
import type { PropertyDetail } from "./types";

type Props = {
  property: Pick<
    PropertyDetail,
    "pricePer15Min" | "pricePer45Min" | "reservaMinimaMin" | "capacidadMaxima"
  >;
};

/**
 * Four stat tiles. Tiles use the shared GLASS_TILE recipe and the white-only
 * text contract: bright value, dim label/note via opacity.
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
    <section
      aria-label="Información clave"
      className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
    >
      {tiles.map((t) => (
        <div key={t.label} className={`${GLASS_TILE} px-4 py-4`}>
          <p className={TEXT_LABEL}>{t.label}</p>
          <p className="mt-2 text-2xl font-medium tracking-tight text-white/80">
            {t.value}
          </p>
          {t.note && <p className={`mt-1 ${TEXT_HINT}`}>{t.note}</p>}
        </div>
      ))}
    </section>
  );
}
