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
      {/* Overall — sits on the same stat-tile glass as KeyInfoRow */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-[24px] border border-white/[0.075] bg-white/[0.032] px-5 py-4 shadow-[0_16px_34px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-14px_26px_rgba(3,8,18,0.28)] backdrop-blur-md sm:px-6">
        <div className="flex items-baseline gap-3">
          <p
            className="text-3xl font-medium tracking-tight text-sky-50"
            style={{ textShadow: "0 0 18px rgba(140,190,255,0.45)" }}
          >
            {rating.toFixed(2)}
          </p>
          <p className="text-[10px] uppercase tracking-[0.32em] text-white/35">
            / 5
          </p>
        </div>
        <StarRating value={rating} size="lg" />
        <p className="text-[10px] uppercase tracking-[0.28em] text-sky-100/55">
          {reviewCount} reseñas
        </p>
      </div>

      {/* Individual reviews */}
      <div className="grid gap-3 sm:grid-cols-2">
        {reviews.map((r) => (
          <article
            key={r.id}
            className="relative rounded-[22px] border border-white/[0.06] bg-white/[0.022] p-4 shadow-[0_14px_30px_rgba(0,0,0,0.26),inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-14px_28px_rgba(3,8,18,0.28)] backdrop-blur-md sm:p-5"
          >
            <header className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.06] text-[10px] font-medium uppercase tracking-[0.18em] text-sky-100/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
                  {r.alias.charAt(0)}
                </span>
                <span className="text-[11px] font-medium tracking-[0.06em] text-white/75">
                  {r.alias}
                </span>
              </div>
              <StarRating value={r.rating} size="xs" />
            </header>
            <p className="mt-3 text-sm font-light leading-relaxed tracking-[0.02em] text-white/55">
              {r.comment}
            </p>
            <p className="mt-3 text-[9px] uppercase tracking-[0.26em] text-white/25">
              {r.date}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
