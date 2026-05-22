import { GLASS_TILE, TEXT_BODY, TEXT_HINT, TEXT_LABEL } from "@/styles/glass";
import type { Review } from "@/lib/types";
import { StarRating } from "./star-rating";

type Props = {
  rating: number;
  reviewCount: number;
  reviews: Review[];
};

export function ReviewsSection({ rating, reviewCount, reviews }: Props) {
  return (
    <section aria-label="Reseñas" className="space-y-5">
      <div
        className={`${GLASS_TILE} flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4 sm:px-6`}
      >
        <div className="flex items-baseline gap-3">
          <p
            className="text-3xl font-medium tracking-tight text-white/80"
            style={{ textShadow: "0 0 18px rgba(255,255,255,0.5)" }}
          >
            {rating.toFixed(2)}
          </p>
          <p className="text-[10px] uppercase tracking-[0.32em] text-white/60">
            / 5
          </p>
        </div>
        <StarRating value={rating} size="lg" />
        <p className={TEXT_LABEL}>{reviewCount} reseñas</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {reviews.map((r) => (
          <article key={r.id} className={`relative ${GLASS_TILE} p-4 sm:p-5`}>
            <header className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/[0.06] text-[10px] font-medium uppercase tracking-[0.18em] text-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
                  {r.alias.charAt(0)}
                </span>
                <span className="text-[11px] font-medium tracking-[0.06em] text-white/80">
                  {r.alias}
                </span>
              </div>
              <StarRating value={r.rating} size="xs" />
            </header>
            <p className={`mt-3 text-sm leading-relaxed ${TEXT_BODY}`}>
              {r.comment}
            </p>
            <p className={`mt-3 ${TEXT_HINT}`}>{r.date}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
