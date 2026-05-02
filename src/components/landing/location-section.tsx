"use client";

import { HeroLocationMap } from "@/components/hero-location-map";

const SUGGESTED_AREAS = [
  "Roma Norte",
  "Condesa",
  "Polanco",
  "Juárez",
  "Centro",
];

export function LocationSection() {
  return (
    <section className="relative overflow-hidden bg-[#07080c] py-20 sm:py-28">
      {/* subtle top separator */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent 0%, rgba(120,165,235,0.18) 30%, rgba(140,185,255,0.28) 50%, rgba(120,165,235,0.18) 70%, transparent 100%)",
        }}
      />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-5 sm:px-8">
        {/* heading */}
        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.55em] text-sky-300/60">
            Cerca de ti
          </p>
          <h2 className="text-3xl font-semibold leading-tight text-white/90 sm:text-4xl">
            Encuentra el espacio perfecto
            <br />
            <span className="text-sky-200/70">en minutos</span>
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-white/42">
            Reserva por horas o fracciones de 30 min. Sin trámites, sin
            depósitos. Solo entra, usa y sal.
          </p>
        </div>

        {/* split layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
          {/* left — city scene */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#111318] to-[#0d0f14]">
            {/* city photo */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40"
              style={{
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=80)",
              }}
            />
            {/* gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#07080c]/95 via-[#07080c]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#07080c]/60 via-transparent to-transparent" />

            {/* person silhouette overlay */}
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-0 left-1/2 h-[62%] w-[38%] -translate-x-1/2 opacity-90"
              style={{
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&fit=crop&crop=faces)",
                backgroundSize: "cover",
                backgroundPosition: "center top",
                WebkitMaskImage:
                  "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 55%, transparent 100%)",
                maskImage:
                  "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 55%, transparent 100%)",
              }}
            />

            {/* location pin pulse */}
            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-300/70 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-sky-300" />
              </span>
            </div>

            {/* bottom info card */}
            <div className="relative mt-auto p-6">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.05] px-4 py-4 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-sky-200/60">
                      Tu zona
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-white/85">
                      Roma Norte, CDMX
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    <span className="text-[11px] font-medium text-emerald-300/80">
                      8 espacios listos
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {SUGGESTED_AREAS.map((area) => (
                    <button
                      key={area}
                      type="button"
                      className="shrink-0 rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1 text-[10px] font-medium text-white/55 transition hover:border-sky-300/30 hover:bg-sky-900/20 hover:text-sky-200/80"
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* right — map */}
          <div className="relative min-h-[380px] overflow-hidden rounded-[2rem] lg:min-h-[480px]">
            <HeroLocationMap />
          </div>
        </div>
      </div>

      {/* subtle bottom separator */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent 0%, rgba(120,165,235,0.12) 30%, rgba(140,185,255,0.2) 50%, rgba(120,165,235,0.12) 70%, transparent 100%)",
        }}
      />
    </section>
  );
}
