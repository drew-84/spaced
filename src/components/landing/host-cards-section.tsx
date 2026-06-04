"use client";

import Link from "next/link";
import { useState } from "react";
import {
  SPACE_CATEGORIES,
  listingSpaces,
  type SpaceCategory,
  type ListingSpace,
} from "@/lib/mock-spaces";
import {
  CTA_PRIMARY,
  CTA_SECONDARY,
  TEXT_BODY,
  TEXT_EYEBROW,
  TEXT_HINT,
  TRANSITION_FLUID,
} from "@/styles/glass";

const CATEGORY_ICONS: Record<SpaceCategory, string> = {
  Todos: "◈",
  Descanso: "🛏",
  Cocina: "🍳",
  Oficina: "💻",
  Reunión: "🤝",
  Grabación: "🎙",
};

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden
    >
      <polygon points="5,1 6.2,3.8 9.5,4.1 7.2,6.2 7.9,9.5 5,7.9 2.1,9.5 2.8,6.2 0.5,4.1 3.8,3.8" />
    </svg>
  );
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5 text-white/80 drop-shadow-[0_0_6px_rgba(255,255,255,0.45)]">
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} filled={n <= Math.round(rating)} />
      ))}
    </span>
  );
}

function ListingCard({ card }: { card: ListingSpace }) {
  return (
    <Link
      href={`/spaces/${card.id}`}
      aria-label={`Ver ${card.title}`}
      className="group/card block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06070a] rounded-2xl"
    >
      <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0e1016] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-white/30 hover:shadow-[0_22px_50px_rgba(0,0,0,0.36),0_0_30px_-10px_rgba(255,255,255,0.25)]">
        {/* image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.04]"
            style={{ backgroundImage: `url(${card.imageUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* category pill — same glass language as PILL_DISPLAY but compact */}
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-white/25 bg-black/50 px-2.5 py-1 backdrop-blur-md">
            <span className="text-[11px] leading-none">
              {CATEGORY_ICONS[card.category]}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/60">
              {card.categoryLabel}
            </span>
          </div>

          {/* instant access badge */}
          {card.instantAccess && (
            <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-white/30 bg-black/55 px-2 py-1 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.95)]" />
              <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/60">
                Acceso inmediato
              </span>
            </div>
          )}
        </div>

        {/* body */}
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div>
            <h3 className="text-[13px] font-semibold leading-snug text-white/80 line-clamp-2">
              {card.title}
            </h3>
            <p className="mt-0.5 text-[11px] text-white/50">{card.area}</p>
          </div>

          {/* amenities preview */}
          <div className="flex flex-wrap gap-1">
            {card.amenities.slice(0, 3).map((a) => (
              <span
                key={a}
                className="rounded-md border border-white/15 bg-white/[0.04] px-2 py-0.5 text-[9px] font-medium text-white/50"
              >
                {a}
              </span>
            ))}
            {card.amenities.length > 3 && (
              <span className="rounded-md border border-white/15 bg-white/[0.04] px-2 py-0.5 text-[9px] font-medium text-white/50">
                +{card.amenities.length - 3}
              </span>
            )}
          </div>

          {/* footer row */}
          <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-3">
            {/* host */}
            <div className="flex items-center gap-2">
              <img
                src={card.hostAvatar}
                alt={card.hostName}
                width={24}
                height={24}
                className="h-6 w-6 rounded-full object-cover ring-1 ring-white/15"
              />
              <span className="text-[10px] text-white/50">{card.hostName}</span>
            </div>

            {/* rating + price */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <RatingStars rating={card.rating} />
                <span className="text-[10px] text-white/50">
                  ({card.reviewCount})
                </span>
              </div>
              <div className="rounded-lg border border-white/30 bg-white/[0.1] px-2 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
                <span className="text-[11px] font-bold text-white/80">
                  ${card.pricePer30m}
                </span>
                <span className="text-[9px] text-white/50"> /30m</span>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function HostCardsSection() {
  const [active, setActive] = useState<SpaceCategory>("Todos");
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const filtered = listingSpaces.filter((s) => {
    const matchesCategory = active === "Todos" || s.category === active;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      q === "" ||
      s.title.toLowerCase().includes(q) ||
      s.area.toLowerCase().includes(q) ||
      s.categoryLabel.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  return (
    <section
      id="spaces"
      /* `scroll-mt-16` clears the sticky TopNav (~3.5rem tall) so the
         anchor target lands just above the heading + search bar + pill
         filters instead of behind the nav bar. */
      className="relative scroll-mt-16 overflow-hidden bg-[#06070a] py-24 sm:py-32"
    >
      {/* top line — neutral white wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent 0%, rgba(255,255,255,0.12) 30%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.12) 70%, transparent 100%)",
        }}
      />
      {/* ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[360px] w-[800px] -translate-x-1/2 opacity-[0.18]"
        style={{
          background:
            "radial-gradient(ellipse at center top, rgba(255,255,255,0.35), transparent 65%)",
        }}
      />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 sm:px-8">
        {/* heading + CTA */}
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <p className={`${TEXT_EYEBROW} tracking-[0.55em]`}>Publicaciones</p>
            <h2 className="text-3xl font-semibold leading-tight text-white/95 sm:text-4xl">
              Espacios disponibles
              <br />
              <span className="text-white/95">registrados por hosts</span>
            </h2>
            <p className={`max-w-sm text-sm leading-relaxed ${TEXT_BODY}`}>
              Cada publicación fue creada por un host real. Elige el tipo de
              espacio que necesitas y reserva en segundos.
            </p>
          </div>

          <Link href="/ofrecer" className={`shrink-0 ${CTA_PRIMARY}`}>
            Publicar mi espacio →
          </Link>
        </div>

        {/* search bar */}
        <div
          className={[
            "flex items-center gap-3 rounded-2xl border px-5 py-3.5",
            "transition-all duration-300 ease-out motion-reduce:transition-none",
            focused
              ? "border-white/40 bg-white/[0.06] shadow-[0_0_24px_-6px_rgba(255,255,255,0.4),inset_0_1px_0_rgba(255,255,255,0.18)]"
              : "border-white/10 bg-white/[0.03]",
          ].join(" ")}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden
            className="shrink-0 text-white/70"
          >
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M11 11L14.5 14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Busca por nombre, colonia o tipo de espacio…"
            className="flex-1 bg-transparent text-sm text-white/95 placeholder:text-white/35 outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Limpiar búsqueda"
              className="shrink-0 rounded-lg p-1 text-white/60 transition-colors duration-300 ease-out hover:text-white"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        {/* filter tab bar — floating frosted-glass surface */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            role="tablist"
            aria-label="Filtrar por categoría"
            className="relative inline-flex flex-wrap items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.7),0_8px_24px_-12px_rgba(0,0,0,0.45),0_2px_6px_-2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/22 to-transparent"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-black/40 to-transparent"
            />
            {SPACE_CATEGORIES.map((cat) => {
              const isActive = active === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(cat)}
                  className={[
                    "group relative flex items-center gap-1.5 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] outline-none",
                    TRANSITION_FLUID,
                    "focus-visible:ring-1 focus-visible:ring-white/40",
                    isActive
                      ? "border border-white/40 bg-gradient-to-b from-white/[0.18] via-white/[0.08] to-white/[0.04] text-white/95 shadow-[0_2px_10px_-2px_rgba(255,255,255,0.35),0_0_24px_-6px_rgba(255,255,255,0.5),0_0_56px_-12px_rgba(255,255,255,0.32),inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl"
                      : "border border-transparent text-white/60 hover:text-white hover:bg-white/[0.05] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]",
                  ].join(" ")}
                >
                  {isActive && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.22),transparent_70%)]"
                    />
                  )}
                  <span className="relative opacity-90">{CATEGORY_ICONS[cat]}</span>
                  <span className="relative">{cat}</span>
                </button>
              );
            })}
          </div>
          <span className={TEXT_HINT}>
            {filtered.length} espacio{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* cards grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 [&>*:nth-child(n+5)]:hidden [&>*:nth-child(n+5)]:xl:block sm:[&>*:nth-child(n+5)]:block">
          {filtered.map((card) => (
            <ListingCard key={card.id} card={card} />
          ))}
        </div>

        {/* bottom CTA */}
        <div className="flex justify-center">
          <button type="button" className={CTA_SECONDARY}>
            Ver todos los espacios
          </button>
        </div>
      </div>
    </section>
  );
}
