type Props = {
  amenities: string[];
};

/**
 * Display-only pills. Style lifted exactly from `offerChipClass(isActive=true)`
 * in spatial-card-field.tsx — same borders, fills, layered shadows. Because
 * these are read-only, we drop the hover treatment and the focus ring.
 */
export function AmenityPills({ amenities }: Props) {
  if (amenities.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {amenities.map((a) => (
        <span
          key={a}
          className="inline-flex items-center rounded-full border border-sky-100/30 bg-sky-100/[0.085] px-3.5 py-2 text-[10px] font-medium uppercase tracking-[0.22em] text-sky-50/90 shadow-[0_12px_28px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-12px_24px_rgba(8,18,34,0.3)] backdrop-blur-md"
        >
          {a}
        </span>
      ))}
    </div>
  );
}
