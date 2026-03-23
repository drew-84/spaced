import type { Space } from "@/lib/types";

type SpaceCardProps = {
  space: Space;
};

const typeLabel: Record<Space["type"], string> = {
  "private-room": "Private room",
  studio: "Studio",
  "apartment-1br": "1-bedroom apartment",
};

export function SpaceCard({ space }: SpaceCardProps) {
  return (
    <article className="rounded-2xl border border-purple-400/20 bg-purple-500/10 p-5 shadow-[0_16px_34px_rgba(168,85,247,0.12)] transition hover:border-fuchsia-400/35 hover:shadow-[0_18px_38px_rgba(236,72,153,0.2)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">{space.title}</h3>
          <p className="text-sm text-purple-200/70">
            {typeLabel[space.type]} - {space.area}
          </p>
        </div>
        {space.instantAccess ? (
          <span className="rounded-full border border-fuchsia-400/40 bg-fuchsia-500/20 px-2.5 py-1 text-xs font-medium text-fuchsia-200">
            Instant access
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <p className="text-purple-200/70">{space.distanceKm.toFixed(1)} km away</p>
        <p className="font-medium text-white">${space.pricePer30m} / 30 min</p>
      </div>
    </article>
  );
}
