/**
 * Star rating for the dark-glass aesthetic.
 * Filled = bright white, empty = white at very low opacity, soft white glow.
 */
type Props = {
  value: number;
  /** Display size; "sm" matches inline review item, "lg" matches overall rating */
  size?: "xs" | "sm" | "lg";
  withCount?: number;
};

const SIZE_MAP = {
  xs: { wh: 10, gap: "gap-0.5" },
  sm: { wh: 12, gap: "gap-0.5" },
  lg: { wh: 18, gap: "gap-1" },
} as const;

export function StarRating({ value, size = "sm" }: Props) {
  const { wh, gap } = SIZE_MAP[size];
  return (
    <span
      className={`inline-flex items-center ${gap}`}
      role="img"
      aria-label={`${value.toFixed(2)} de 5 estrellas`}
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const fillPct = Math.max(0, Math.min(1, value - i));
        return <Star key={i} wh={wh} fill={fillPct} />;
      })}
    </span>
  );
}

function Star({ wh, fill }: { wh: number; fill: number }) {
  const id = `star-${wh}-${Math.round(fill * 100)}`;
  return (
    <svg
      width={wh}
      height={wh}
      viewBox="0 0 24 24"
      aria-hidden
      className="drop-shadow-[0_0_8px_rgba(255,255,255,0.35)]"
    >
      <defs>
        <linearGradient id={id} x1="0" x2="1" y1="0" y2="0">
          <stop offset={`${fill * 100}%`} stopColor="rgba(255,255,255,1)" />
          <stop offset={`${fill * 100}%`} stopColor="rgba(255,255,255,0.15)" />
        </linearGradient>
      </defs>
      <polygon
        points="12,2.2 14.59,8.86 21.6,9.4 16.2,14.06 17.86,21 12,17.28 6.14,21 7.8,14.06 2.4,9.4 9.41,8.86"
        fill={`url(#${id})`}
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="0.6"
      />
    </svg>
  );
}
