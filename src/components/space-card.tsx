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
  "rest-room": "Descanso",
  kitchen: "Cocina",
  office: "Oficina",
  "meeting-room": "Sala de reuniones",
  "recording-studio": "Estudio de grabación",
  "podcast-studio": "Estudio de podcast",
  coworking: "Coworking",
};

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="flex items-center gap-0.5 text-xs">
      {Array.from({ length: full }, (_, i) => (
        <span
          key={i}
          className="text-white/80 drop-shadow-[0_0_6px_rgba(255,255,255,0.45)]"
        >
          &#9733;
        </span>
      ))}
      {half && (
        <span className="text-white/60 drop-shadow-[0_0_6px_rgba(255,255,255,0.35)]">
          &#9733;
        </span>
      )}
      <span className="ml-1 text-white/50">({rating})</span>
    </span>
  );
}

export function SpaceCard({ space, distanceKm }: SpaceCardProps) {
  const isHourly = space.stayType === "hourly";

  return (
    <Link href={`/spaces/${space.id}`}>
      <article className="group overflow-hidden rounded-2xl border border-white/10 bg-[#0e1016] shadow-[0_18px_38px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-white/30 hover:shadow-[0_22px_50px_rgba(0,0,0,0.36),0_0_30px_-10px_rgba(255,255,255,0.25),inset_0_1px_0_rgba(255,255,255,0.14)]">
        <div className="relative h-48 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
            style={{ backgroundImage: `url('${space.imageUrl}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
          {space.instantAccess && (
            <span className="absolute right-3 top-3 rounded-full border border-white/30 bg-black/55 px-2.5 py-1 text-xs font-medium text-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-md">
              Acceso inmediato
            </span>
          )}
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
            <span className="rounded-full border border-white/25 bg-black/55 px-2.5 py-1 text-xs font-medium text-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-md">
              {typeLabel[space.type]}
            </span>
            <span className="rounded-full border border-white/20 bg-white/[0.08] px-2.5 py-1 text-xs font-medium text-white/60 backdrop-blur-md">
              {isHourly ? "Por hora" : "Por noche"}
            </span>
          </div>
          <div className="absolute bottom-3 right-3">
            {isHourly ? (
              <span className="rounded-lg border border-white/30 bg-white/[0.1] px-3 py-1.5 text-sm font-bold text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-md">
                ${Math.round(space.pricePer30m * 1.5)}
                <span className="ml-0.5 text-[10px] font-normal text-white/50">
                  /45m
                </span>
              </span>
            ) : (
              <span className="rounded-lg border border-white/30 bg-white/[0.1] px-3 py-1.5 text-sm font-bold text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-md">
                ${space.pricePerNight.toLocaleString("es-MX")}
                <span className="ml-0.5 text-[10px] font-normal text-white/50">
                  /noche
                </span>
              </span>
            )}
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold text-white/80">{space.title}</h3>
            <Stars rating={space.rating} />
          </div>
          <p className="mt-1 text-sm text-white/50">
            {space.area} &middot; {distanceKm.toFixed(1)} km
          </p>
          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
            <p className="text-xs text-white/50">
              {space.reviewCount} resenas
            </p>
            {isHourly ? (
              <p className="text-lg font-bold text-white/80">
                ${Math.round(space.pricePer30m * 1.5)}
                <span className="ml-1 text-xs font-normal text-white/50">
                  / 45 min
                </span>
              </p>
            ) : (
              <p className="text-lg font-bold text-white/80">
                ${space.pricePerNight.toLocaleString("es-MX")}
                <span className="ml-1 text-xs font-normal text-white/50">
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
