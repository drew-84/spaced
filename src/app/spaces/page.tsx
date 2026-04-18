"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SpaceCard } from "@/components/space-card";
import { TopNav } from "@/components/top-nav";
import { useViewerLocation } from "@/hooks/use-viewer-location";
import { distanceKm } from "@/lib/geo";
import { mockSpaces } from "@/lib/mock-spaces";
import type { Space } from "@/lib/types";

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

const TYPE_FILTERS = [
  { label: "Todos", value: "all" as const },
  { label: "Habitación", value: "private-room" as const },
  { label: "Estudio", value: "studio" as const },
  { label: "Depto 1 rec.", value: "apartment-1br" as const },
  { label: "Casa", value: "house" as const },
];

type TypeFilterValue = (typeof TYPE_FILTERS)[number]["value"];

function sortPriceValue(space: Space): number {
  if (space.stayType === "hourly") return space.pricePer30m;
  return space.pricePerNight / 45;
}

const filterActive =
  "border-stone-800 bg-stone-900 text-white shadow-sm";
const filterIdle =
  "border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50";

export default function SpacesPage() {
  const { origin, source } = useViewerLocation();
  const [priceFilter, setPriceFilter] = useState(0);
  const [sort, setSort] = useState<SortValue>("distance");
  const [typeFilter, setTypeFilter] = useState<TypeFilterValue>("all");

  const filtered = useMemo(() => {
    const range = PRICE_RANGES[priceFilter];

    let rows = mockSpaces.map((space) => ({
      space,
      distanceKm: distanceKm(origin, { lat: space.lat, lng: space.lng }),
    }));

    rows = rows.filter(({ space }) => {
      if (typeFilter !== "all" && space.type !== typeFilter) return false;
      if (space.stayType === "hourly") {
        return space.pricePer30m >= range.min && space.pricePer30m <= range.max;
      }
      return true;
    });

    rows.sort((a, b) => {
      switch (sort) {
        case "distance":
          return a.distanceKm - b.distanceKm;
        case "price-asc":
          return sortPriceValue(a.space) - sortPriceValue(b.space);
        case "price-desc":
          return sortPriceValue(b.space) - sortPriceValue(a.space);
        case "rating":
          return b.space.rating - a.space.rating;
        default:
          return 0;
      }
    });

    return rows;
  }, [origin, priceFilter, sort, typeFilter]);

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-stone-800">
      <TopNav active="spaces" />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10 sm:px-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-stone-900">
            Espacios y alojamientos cerca de ti
          </h1>
          <p className="text-stone-600">
            {filtered.length} anuncios · renta por horas o estancias cortas por
            noche
          </p>
          <p className="text-xs text-stone-500">
            {source === "gps"
              ? "Distancias calculadas desde tu ubicación."
              : "Distancias aproximadas desde el centro de CDMX. Permite ubicación en el navegador para mayor precisión."}
          </p>
        </header>

        <div className="flex flex-wrap items-start gap-6 rounded-2xl border border-stone-200/90 bg-white px-5 py-4 shadow-[0_2px_24px_rgba(28,25,23,0.06)]">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
              Tipo
            </p>
            <div className="flex flex-wrap gap-2">
              {TYPE_FILTERS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTypeFilter(opt.value)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                    typeFilter === opt.value ? filterActive : filterIdle
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
              Precio (por hora)
            </p>
            <div className="flex flex-wrap gap-2">
              {PRICE_RANGES.map((range, i) => (
                <button
                  key={range.label}
                  type="button"
                  onClick={() => setPriceFilter(i)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                    priceFilter === i ? filterActive : filterIdle
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-stone-500">
              El rango aplica a espacios por hora. Las estancias por noche se
              muestran siempre que coincidan el tipo.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
              Ordenar
            </p>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSort(opt.value)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                    sort === opt.value ? filterActive : filterIdle
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(({ space, distanceKm: d }) => (
            <SpaceCard key={space.id} space={space} distanceKm={d} />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full py-12 text-center text-stone-500">
              No se encontraron resultados con estos filtros.
            </p>
          )}
        </section>

        <Link
          href="/book"
          className="inline-flex rounded-full bg-stone-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800"
        >
          Continuar a reserva
        </Link>
      </main>
    </div>
  );
}
