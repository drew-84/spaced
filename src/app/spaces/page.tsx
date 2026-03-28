"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { SpaceCard } from "@/components/space-card";
import { TopNav } from "@/components/top-nav";
import { mockSpaces } from "@/lib/mock-spaces";

const PRICE_RANGES = [
  { label: "Todos", min: 0, max: Infinity },
  { label: "$10 - $15", min: 10, max: 15 },
  { label: "$16 - $20", min: 16, max: 20 },
  { label: "$21+", min: 21, max: Infinity },
] as const;

const SORT_OPTIONS = [
  { label: "Cercanos", value: "distance" },
  { label: "Precio menor", value: "price-asc" },
  { label: "Precio mayor", value: "price-desc" },
  { label: "Mejor rating", value: "rating" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export default function SpacesPage() {
  const [priceFilter, setPriceFilter] = useState(0);
  const [sort, setSort] = useState<SortValue>("distance");

  const filtered = useMemo(() => {
    const range = PRICE_RANGES[priceFilter];
    let result = mockSpaces.filter(
      (s) => s.pricePer30m >= range.min && s.pricePer30m <= range.max
    );
    switch (sort) {
      case "distance":
        result = [...result].sort((a, b) => a.distanceKm - b.distanceKm);
        break;
      case "price-asc":
        result = [...result].sort((a, b) => a.pricePer30m - b.pricePer30m);
        break;
      case "price-desc":
        result = [...result].sort((a, b) => b.pricePer30m - a.pricePer30m);
        break;
      case "rating":
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
    }
    return result;
  }, [priceFilter, sort]);

  return (
    <div className="min-h-screen text-white">
      <TopNav active="spaces" />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10 sm:px-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-white">Nearby spaces</h1>
          <p className="text-purple-200/60">
            {filtered.length} espacios disponibles cerca de ti
          </p>
        </header>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-purple-500/15 bg-purple-500/8 px-5 py-4">
          {/* Price filter */}
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-purple-200/40">Precio</p>
            <div className="flex flex-wrap gap-2">
              {PRICE_RANGES.map((range, i) => (
                <button
                  key={range.label}
                  onClick={() => setPriceFilter(i)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                    priceFilter === i
                      ? "border border-pink-500/50 bg-pink-500/20 text-pink-200 shadow-[0_0_12px_rgba(255,0,128,0.2)]"
                      : "border border-purple-500/20 text-purple-200/50 hover:border-purple-400/30 hover:text-purple-200/70"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-purple-200/40">Ordenar</p>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSort(opt.value)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                    sort === opt.value
                      ? "border border-cyan-400/50 bg-cyan-500/15 text-cyan-300 shadow-[0_0_12px_rgba(56,182,255,0.15)]"
                      : "border border-purple-500/20 text-purple-200/50 hover:border-purple-400/30 hover:text-purple-200/70"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((space) => (
            <SpaceCard key={space.id} space={space} />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full py-12 text-center text-purple-200/40">
              No se encontraron espacios en este rango de precio.
            </p>
          )}
        </section>

        <Link
          href="/book"
          className="inline-flex rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 px-6 py-2.5 text-sm font-bold text-white shadow-[0_0_25px_rgba(255,0,128,0.4),0_0_50px_rgba(255,0,128,0.15)] transition hover:shadow-[0_0_35px_rgba(255,0,128,0.6),0_0_70px_rgba(255,0,128,0.25)] hover:brightness-110"
        >
          Continue to booking
        </Link>
      </main>
    </div>
  );
}
