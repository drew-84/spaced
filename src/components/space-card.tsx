import Link from "next/link";
import type { Space } from "@/lib/types";

type SpaceCardProps = {
  space: Space;
  distanceKm: number;
};

const typeLabel: Record<Space["type"], string> = {
  "private-room": "Habitación",
  studio: "Estudio",
  "apartment-1br": "Depto 1 rec.",
  house: "Casa",
};

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="flex items-center gap-0.5 text-xs">
      {Array.from({ length: full }, (_, i) => (
        <span key={i} className="text-amber-500">
          &#9733;
        </span>
      ))}
      {half && <span className="text-amber-500/50">&#9733;</span>}
      <span className="ml-1 text-stone-500">({rating})</span>
    </span>
  );
}

export function SpaceCard({ space, distanceKm }: SpaceCardProps) {
  const isHourly = space.stayType === "hourly";

  return (
    <Link href={`/spaces/${space.id}`}>
      <article className="group overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-[0_2px_24px_rgba(28,25,23,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(28,25,23,0.1)]">
        <div className="relative h-48 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
            style={{ backgroundImage: `url('${space.imageUrl}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/85 via-stone-900/20 to-transparent" />
          {space.instantAccess && (
            <span className="absolute right-3 top-3 rounded-full border border-white/30 bg-white/90 px-2.5 py-1 text-xs font-medium text-stone-800 shadow-sm backdrop-blur-sm">
              Acceso inmediato
            </span>
          )}
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-stone-800 backdrop-blur-sm">
              {typeLabel[space.type]}
            </span>
            <span className="rounded-full bg-stone-900/80 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {isHourly ? "Por hora" : "Por noche"}
            </span>
          </div>
          <div className="absolute bottom-3 right-3">
            {isHourly ? (
              <span className="rounded-lg bg-stone-900 px-3 py-1.5 text-sm font-bold text-white shadow-sm">
                ${space.pricePer30m}
                <span className="ml-0.5 text-[10px] font-normal text-stone-300">
                  /30m
                </span>
              </span>
            ) : (
              <span className="rounded-lg bg-stone-800 px-3 py-1.5 text-sm font-bold text-white shadow-sm">
                ${space.pricePerNight.toLocaleString("es-MX")}
                <span className="ml-0.5 text-[10px] font-normal text-stone-300">
                  /noche
                </span>
              </span>
            )}
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold text-stone-900">{space.title}</h3>
            <Stars rating={space.rating} />
          </div>
          <p className="mt-1 text-sm text-stone-600">
            {space.area} &middot; {distanceKm.toFixed(1)} km
          </p>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-stone-500">{space.reviewCount} resenas</p>
            {isHourly ? (
              <p className="text-lg font-bold text-stone-900">
                ${space.pricePer30m}
                <span className="ml-1 text-xs font-normal text-stone-500">
                  / 30 min
                </span>
              </p>
            ) : (
              <p className="text-lg font-bold text-stone-900">
                ${space.pricePerNight.toLocaleString("es-MX")}
                <span className="ml-1 text-xs font-normal text-stone-500">
                  / noche
                </span>
              </p>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
