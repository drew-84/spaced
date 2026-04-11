import Link from "next/link";
import type { CSSProperties } from "react";
import { TopNav } from "@/components/top-nav";
import { mockSpaces } from "@/lib/mock-spaces";

const steps = [
  {
    title: "Homepage (clarity + trust)",
    description: "Explain the value in seconds and build confidence immediately.",
  },
  {
    title: "Browse spaces",
    description: "User explores nearby options by area, price, and availability.",
  },
  {
    title: "Space detail (photos, rules, privacy)",
    description: "User verifies photos, rules, and privacy expectations before booking.",
  },
  {
    title: "Booking (manual for now)",
    description: "Keep booking simple while manual operations validate demand.",
  },
] as const;

const useCases = [
  {
    title: "Private encounter",
    description: "Discreet spaces designed for privacy, comfort, and zero friction.",
  },
  {
    title: "Short reset",
    description: "Recharge between meetings, travel, or long days with full privacy.",
  },
  {
    title: "Temporary escape",
    description: "Step out of noise and into a calm, ready-to-use private space.",
  },
] as const;

const orbitCards = [
  { angle: "8deg", imageIndex: 0, tilt: "-8deg" },
  { angle: "78deg", imageIndex: 1, tilt: "9deg" },
  { angle: "150deg", imageIndex: 2, tilt: "-5deg" },
  { angle: "222deg", imageIndex: 3, tilt: "8deg" },
  { angle: "296deg", imageIndex: 4, tilt: "-10deg" },
] as const;

export default function Home() {
  const instantAccessCount = mockSpaces.filter((space) => space.instantAccess).length;
  const averageRating =
    mockSpaces.reduce((total, space) => total + space.rating, 0) / mockSpaces.length;
  const totalReviews = mockSpaces.reduce((total, space) => total + space.reviewCount, 0);

  return (
    <div className="min-h-screen text-white">
      <TopNav active="home" />

      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(circle at 14% 10%, rgba(56,182,255,0.2) 0%, transparent 34%), radial-gradient(circle at 82% 14%, rgba(255,0,170,0.18) 0%, transparent 31%), radial-gradient(circle at 50% 68%, rgba(166,80,255,0.22) 0%, transparent 50%), linear-gradient(148deg, #040710 0%, #0d0221 36%, #15072f 62%, #050916 100%)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#090312]/35 via-[#120626]/30 to-[#090312]/55" />
        <div className="pointer-events-none absolute inset-0 opacity-50 [background:repeating-linear-gradient(118deg,rgba(210,230,255,0.045)_0px,rgba(210,230,255,0.045)_1px,transparent_1px,transparent_54px)]" />

        <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-14 px-6 pb-20 pt-16 sm:px-8 sm:pt-20">
          <header className="mx-auto w-full max-w-5xl space-y-8 text-center">
            <div className="inline-flex rounded-full border border-pink-200/40 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-pink-100 backdrop-blur-md">
              Tu refugio privado, al instante
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
              ¿Necesitas un lugar privado ahora mismo?
            </h1>

            <p className="mx-auto max-w-2xl text-lg text-purple-100/85 sm:text-xl">
              Encuentra espacios cerca, de forma discreta y segura
            </p>

            <div className="cta-hero-scene relative mx-auto mt-4 h-[400px] w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/15 bg-white/[0.03] px-4 py-8 shadow-[0_26px_70px_rgba(7,10,28,0.45)] backdrop-blur-sm sm:h-[470px] sm:px-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_52%,rgba(255,255,255,0.12),transparent_36%),radial-gradient(circle_at_22%_24%,rgba(56,182,255,0.18),transparent_28%),radial-gradient(circle_at_84%_72%,rgba(190,0,255,0.16),transparent_32%)]" />
              <div className="pointer-events-none absolute inset-0 [transform-style:preserve-3d]">
                <div className="sphere-depth absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full sm:h-64 sm:w-64" />
                <div className="sphere-ring absolute left-1/2 top-1/2 h-[20rem] w-[20rem] -translate-x-1/2 -translate-y-1/2 rounded-full sm:h-[24rem] sm:w-[24rem]" />
              </div>

              <div className="absolute inset-0 [transform-style:preserve-3d]">
                <div className="orbit-track">
                  {orbitCards.map((card) => (
                    <article
                      key={`orbit-main-${card.angle}`}
                      className="orbit-card h-28 w-44 overflow-hidden rounded-[1.3rem] border border-white/25 bg-[#0d0221]/55 shadow-[0_18px_36px_rgba(3,8,22,0.45)] sm:h-32 sm:w-48"
                      style={
                        {
                          "--angle": card.angle,
                          "--tilt": card.tilt,
                          "--image-url": `url('${mockSpaces[card.imageIndex]?.imageUrl ?? ""}')`,
                        } as CSSProperties
                      }
                    >
                      <div className="orbit-image h-full w-full bg-cover bg-center" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0221]/40 via-transparent to-transparent" />
                      <div className="absolute inset-[1px] rounded-[1.1rem] border border-white/20" />
                    </article>
                  ))}
                </div>

                <div className="orbit-track orbit-track-reverse">
                  {orbitCards.map((card, index) => (
                    <article
                      key={`orbit-alt-${card.angle}`}
                      className="orbit-card orbit-card-alt h-24 w-36 overflow-hidden rounded-[1.2rem] border border-white/20 bg-[#0d0221]/50 shadow-[0_16px_32px_rgba(3,8,22,0.42)] sm:h-28 sm:w-40"
                      style={
                        {
                          "--angle": `${Number.parseInt(card.angle, 10) + 32}deg`,
                          "--tilt": `${Number.parseInt(card.tilt, 10) * -1}deg`,
                          "--image-url":
                            `url('${mockSpaces[(card.imageIndex + index + 2) % mockSpaces.length]?.imageUrl ?? ""}')`,
                        } as CSSProperties
                      }
                    >
                      <div className="orbit-image h-full w-full bg-cover bg-center opacity-90" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0221]/35 via-transparent to-transparent" />
                    </article>
                  ))}
                </div>
              </div>

              <div className="absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
                <Link
                  href="/book"
                  className="rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 px-8 py-4 text-sm font-bold text-white shadow-[0_0_35px_rgba(255,0,128,0.6),0_0_70px_rgba(255,0,128,0.25)] transition hover:scale-105 hover:shadow-[0_0_45px_rgba(255,0,128,0.75),0_0_90px_rgba(255,0,128,0.35)]"
                >
                  Buscar lugar ahora
                </Link>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/spaces"
                className="rounded-full border border-cyan-300/40 bg-cyan-300/12 px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100 transition hover:border-cyan-300/65 hover:bg-cyan-300/18"
              >
                Ver espacios
              </Link>
            </div>

            <div className="mx-auto max-w-3xl rounded-2xl border border-white/15 bg-white/[0.04] p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-purple-100/80">
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5">
                  Sin cámaras
                </span>
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5">
                  Privacidad total
                </span>
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5">
                  Espacios verificados
                </span>
              </div>
            </div>
          </header>

          <section className="grid gap-4 rounded-3xl border border-white/15 bg-white/[0.04] p-5 shadow-[0_24px_60px_rgba(6,10,28,0.24)] backdrop-blur-sm md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <article
                key={step.title}
                className="rounded-2xl border border-purple-500/18 bg-purple-500/10 p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200/80">
                  Paso {index + 1}
                </p>
                <h2 className="mt-2 text-lg font-semibold text-white">{step.title}</h2>
                <p className="mt-2 text-sm text-purple-100/70">{step.description}</p>
              </article>
            ))}
          </section>

          <section className="space-y-5">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-2xl font-semibold">Built for real moments</h2>
              <Link
                href="/spaces"
                className="text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
              >
                See available spaces
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {useCases.map((item) => (
                <article
                  key={item.title}
                  className="rounded-2xl border border-purple-500/20 bg-purple-500/8 p-5 shadow-[0_0_22px_rgba(190,0,255,0.08)]"
                >
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-purple-100/70">{item.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-4 rounded-3xl border border-white/15 bg-white/[0.04] p-5 shadow-[0_24px_60px_rgba(6,10,28,0.24)] backdrop-blur-sm md:grid-cols-3">
            <article className="rounded-2xl border border-purple-500/18 bg-purple-500/10 p-5 text-center">
              <p className="text-3xl font-bold text-pink-200">{averageRating.toFixed(1)} / 5</p>
              <p className="mt-1 text-sm text-purple-100/70">Average rating</p>
            </article>
            <article className="rounded-2xl border border-purple-500/18 bg-purple-500/10 p-5 text-center">
              <p className="text-3xl font-bold text-cyan-200">{totalReviews}+</p>
              <p className="mt-1 text-sm text-purple-100/70">User reviews</p>
            </article>
            <article className="rounded-2xl border border-purple-500/18 bg-purple-500/10 p-5 text-center">
              <p className="text-3xl font-bold text-fuchsia-200">{instantAccessCount}</p>
              <p className="mt-1 text-sm text-purple-100/70">Instant-access spaces</p>
            </article>
          </section>

          <section className="rounded-3xl border border-white/15 bg-gradient-to-r from-pink-500/12 via-fuchsia-500/10 to-cyan-500/12 px-6 py-10 text-center shadow-[0_24px_60px_rgba(6,10,28,0.24)]">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Tu lugar privado puede estar a minutos
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-purple-100/80">
              En esta fase estamos validando comportamiento real, no solo opiniones.
            </p>
            <div className="mt-7">
              <Link
                href="/book"
                className="rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 px-8 py-3.5 text-sm font-bold text-white shadow-[0_0_30px_rgba(255,0,128,0.5),0_0_60px_rgba(255,0,128,0.2)] transition hover:scale-105 hover:shadow-[0_0_40px_rgba(255,0,128,0.7),0_0_80px_rgba(255,0,128,0.3)]"
              >
                Iniciar flujo manual
              </Link>
            </div>
          </section>
        </main>
      </section>
    </div>
  );
}
