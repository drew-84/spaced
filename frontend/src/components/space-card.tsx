import Link from "next/link";
import type { Space } from "@/lib/types";

type SpaceCardProps = {
  space: Space;
};

const typeLabel: Record<Space["type"], string> = {
  "private-room": "Private room",
  studio: "Studio",
  "apartment-1br": "1-bedroom apartment",
};

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="flex items-center gap-0.5 text-xs">
      {Array.from({ length: full }, (_, i) => (
        <span key={i} className="text-pink-400 drop-shadow-[0_0_4px_rgba(255,0,128,0.5)]">&#9733;</span>
      ))}
      {half && <span className="text-pink-400/50">&#9733;</span>}
      <span className="ml-1 text-purple-200/60">({rating})</span>
    </span>
  );
}

export function SpaceCard({ space }: SpaceCardProps) {
  return (
    <Link href={`/spaces/${space.id}`}>
      <article className="group overflow-hidden rounded-2xl border border-purple-500/20 bg-purple-500/8 shadow-[0_0_25px_rgba(190,0,255,0.08)] transition hover:-translate-y-0.5 hover:border-pink-500/30 hover:shadow-[0_0_35px_rgba(255,0,128,0.15)]">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
            style={{ backgroundImage: `url('${space.imageUrl}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0221] via-transparent to-transparent" />
          {space.instantAccess && (
            <span className="absolute right-3 top-3 rounded-full border border-cyan-400/40 bg-cyan-500/20 px-2.5 py-1 text-xs font-medium text-cyan-300 shadow-[0_0_10px_rgba(56,182,255,0.2)] backdrop-blur-sm">
              Instant access
            </span>
          )}
          <div className="absolute bottom-3 left-3">
            <span className="rounded-full bg-pink-500/20 px-2.5 py-1 text-xs font-medium text-pink-200 backdrop-blur-sm">
              {typeLabel[space.type]}
            </span>
          </div>
          {/* Price badge on image */}
          <div className="absolute bottom-3 right-3">
            <span className="rounded-lg bg-gradient-to-r from-pink-500 to-fuchsia-600 px-3 py-1.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(255,0,128,0.5)]">
              ${space.pricePer30m}
              <span className="ml-0.5 text-[10px] font-normal text-pink-100/80">/30m</span>
            </span>
          </div>
        </div>
        {/* Info */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold text-white">{space.title}</h3>
            <Stars rating={space.rating} />
          </div>
          <p className="mt-1 text-sm text-purple-200/50">{space.area} &middot; {space.distanceKm.toFixed(1)} km</p>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-purple-200/40">{space.reviewCount} resenas</p>
            <p className="text-lg font-bold text-transparent bg-gradient-to-r from-pink-400 to-fuchsia-400 bg-clip-text drop-shadow-[0_0_8px_rgba(255,0,128,0.4)]">
              ${space.pricePer30m}
              <span className="ml-1 text-xs font-normal text-purple-200/50">/ 30 min</span>
            </p>
          </div>
        </div>
      </article>
    </Link>
  );
}
