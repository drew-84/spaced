import Link from "next/link";
import { DM_Serif_Display } from "next/font/google";
import { HeroLocationMap } from "@/components/hero-location-map";
import { TopNav } from "@/components/top-nav";
import { mockSpaces } from "@/lib/mock-spaces";
import {
  CTA_PRIMARY,
  CTA_SECONDARY,
  GLASS_PANEL,
  GLASS_PANEL_OUTER,
  GLASS_TILE,
  PAGE_AMBIENT_BG,
  PAGE_AMBIENT_SHIMMER,
  TEXT_BODY,
  TEXT_HINT,
  TEXT_LABEL,
} from "@/styles/glass";

const display = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
});

const flowSteps = [
  {
    title: "Propuesta clara",
    description:
      "Entiendes el valor en segundos y confías antes de reservar.",
  },
  {
    title: "Explora espacios",
    description:
      "Filtra por zona, precio y tipo: habitación, estudio, depto o casa.",
  },
  {
    title: "Detalle del lugar",
    description:
      "Fotos, reglas y privacidad antes de confirmar tu estancia.",
  },
  {
    title: "Reserva",
    description:
      "Por horas o noches cortas; operación manual mientras validamos demanda.",
  },
] as const;

const useCases = [
  {
    title: "Momento privado",
    description:
      "Espacios discretos, cómodos y sin fricción para lo que necesites.",
  },
  {
    title: "Pausa breve",
    description:
      "Recarga entre juntas, viajes o días largos con privacidad total.",
  },
  {
    title: "Escape temporal",
    description:
      "Sal del ruido a un espacio listo para usar cuando lo pidas.",
  },
] as const;

export default function HomepageV0() {
  const instantAccessCount = mockSpaces.filter((s) => s.instantAccess).length;
  const averageRating =
    mockSpaces.reduce((t, s) => t + s.rating, 0) / mockSpaces.length;
  const totalReviews = mockSpaces.reduce((t, s) => t + s.reviewCount, 0);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#02050d] font-sans text-white antialiased">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: PAGE_AMBIENT_BG }}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 ${PAGE_AMBIENT_SHIMMER}`}
      />

      <div className="relative">
        <TopNav active="home" />

        <div className="mx-auto max-w-6xl px-6 pb-16 pt-2 sm:px-8">
          <section className="grid items-center gap-12 pb-12 pt-10 lg:grid-cols-2 lg:gap-16 lg:pb-16 lg:pt-12">
            <div>
              <h1
                className={`${display.className} font-normal leading-[1.12] text-white text-[clamp(1.875rem,4vw,2.75rem)]`}
              >
                Encuentra un espacio cerca, ahora.
              </h1>
              <p className={`mt-6 max-w-md text-lg leading-relaxed ${TEXT_BODY}`}>
                Reserva un espacio privado por el tiempo que necesitas, cerca de
                ti y sin complicaciones.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/spaces" className={CTA_PRIMARY}>
                  Ver espacios
                </Link>
                <Link href="/book" className={CTA_SECONDARY}>
                  Reservar
                </Link>
              </div>
            </div>
            <div className="relative aspect-[4/3] w-full min-h-[220px]">
              <HeroLocationMap />
            </div>
          </section>

          <section className="mt-2">
            <div className="grid gap-6 md:grid-cols-3">
              <div className={`${GLASS_TILE} p-8`}>
                <p className="text-base font-medium text-white">Cerca de ti</p>
              </div>
              <div className={`${GLASS_TILE} p-8`}>
                <p className="text-base font-medium text-white">
                  Reserva rápida
                </p>
              </div>
              <div className={`${GLASS_TILE} p-8`}>
                <p className="text-base font-medium text-white">
                  Por el tiempo que necesitas
                </p>
              </div>
            </div>
          </section>

          <section className="mt-16">
            <h2
              className={`${display.className} text-2xl font-normal text-white sm:text-[1.75rem]`}
            >
              Tu recorrido en la app
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {flowSteps.map((step, index) => (
                <article key={step.title} className={`${GLASS_PANEL} p-5`}>
                  <p
                    className={`text-xs font-semibold uppercase tracking-[0.15em] ${TEXT_LABEL}`}
                  >
                    Paso {index + 1}
                  </p>
                  <h3 className="mt-2 text-base font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className={`mt-2 text-sm leading-relaxed ${TEXT_BODY}`}>
                    {step.description}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-20">
            <h2
              className={`${display.className} text-2xl font-normal text-white sm:text-[1.75rem]`}
            >
              Cómo funciona
            </h2>
            <ol className="mt-10 grid list-none gap-10 p-0 sm:grid-cols-3 sm:gap-8">
              <li className="flex flex-col gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/[0.1] text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur-md">
                  1
                </span>
                <span className={`text-base ${TEXT_BODY}`}>Encuentra</span>
              </li>
              <li className="flex flex-col gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/[0.1] text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur-md">
                  2
                </span>
                <span className={`text-base ${TEXT_BODY}`}>Reserva</span>
              </li>
              <li className="flex flex-col gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/[0.1] text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur-md">
                  3
                </span>
                <span className={`text-base ${TEXT_BODY}`}>Entra</span>
              </li>
            </ol>
          </section>

          <section className="mt-20 space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2
                className={`${display.className} text-2xl font-normal text-white sm:text-[1.75rem]`}
              >
                Para momentos reales
              </h2>
              <Link
                href="/spaces"
                className="text-sm font-semibold text-white/70 underline-offset-4 transition-colors duration-300 ease-out hover:text-white hover:underline"
              >
                Ver disponibles
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {useCases.map((item) => (
                <article key={item.title} className={`${GLASS_PANEL} p-6`}>
                  <h3 className="text-lg font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className={`mt-2 text-sm leading-relaxed ${TEXT_BODY}`}>
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className={`mt-16 grid gap-4 ${GLASS_PANEL} p-6 sm:grid-cols-3 sm:p-8`}>
            <article className="text-center">
              <p className={`${display.className} text-3xl text-white`}>
                {averageRating.toFixed(1)} / 5
              </p>
              <p className={`mt-1 text-sm ${TEXT_BODY}`}>Valoración media</p>
            </article>
            <article className="text-center">
              <p className={`${display.className} text-3xl text-white`}>
                {totalReviews}+
              </p>
              <p className={`mt-1 text-sm ${TEXT_BODY}`}>Reseñas</p>
            </article>
            <article className="text-center">
              <p className={`${display.className} text-3xl text-white`}>
                {instantAccessCount}
              </p>
              <p className={`mt-1 text-sm ${TEXT_BODY}`}>
                Con acceso inmediato
              </p>
            </article>
          </section>

          <section className={`mt-16 ${GLASS_PANEL_OUTER} px-6 py-12 text-center sm:px-10`}>
            <h2
              className={`${display.className} text-2xl font-normal text-white sm:text-3xl`}
            >
              Tu espacio puede estar a minutos
            </h2>
            <p
              className={`mx-auto mt-3 max-w-xl text-sm leading-relaxed ${TEXT_BODY} sm:text-base`}
            >
              Estamos validando comportamiento real en la ciudad. Reserva o
              explora el catálogo cuando quieras.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/book" className={CTA_PRIMARY}>
                Ir a reservar
              </Link>
              <Link href="/spaces" className={CTA_SECONDARY}>
                Explorar espacios
              </Link>
            </div>
          </section>

          <footer className={`mt-16 border-t border-white/10 pt-10 ${TEXT_HINT}`}>
            SPACED
          </footer>
        </div>
      </div>
    </div>
  );
}
