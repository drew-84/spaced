import { PILL_DISPLAY } from "@/styles/glass";

type Props = {
  amenities: string[];
};

/**
 * Display-only amenity pills. Uses the shared PILL_DISPLAY token so the
 * read-only chrome matches the white text contract.
 */
export function AmenityPills({ amenities }: Props) {
  if (amenities.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {amenities.map((a) => (
        <span key={a} className={PILL_DISPLAY}>
          {a}
        </span>
      ))}
    </div>
  );
}
