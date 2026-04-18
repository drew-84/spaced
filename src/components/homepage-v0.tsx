import Link from "next/link";
import { DM_Serif_Display } from "next/font/google";
import { HeroLocationMap } from "@/components/hero-location-map";
import { TopNav } from "@/components/top-nav";
import { mockSpaces } from "@/lib/mock-spaces";

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
    <div className="min-h-screen w-full bg-[#F4F1EA] font-sans text-stone-800 antialiased">
      <TopNav active="home" />

      <div className="mx-auto max-w-6xl px-6 pb-16 pt-2 sm:px-8">
        <section className="grid items-center gap-12 pb-12 pt-10 lg:grid-cols-2 lg:gap-16 lg:pb-16 lg:pt-12">
          <div>
            <h1
              className={`${display.className} font-normal leading-[1.12] text-stone-900 text-[clamp(1.875rem,4vw,2.75rem)]`}
            >
              Encuentra un espacio cerca, ahora.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-stone-600">
              Reserva un espacio privado por el tiempo que necesitas, cerca de
              ti y sin complicaciones.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/spaces"
                className="inline-flex rounded-full bg-stone-900 px-8 py-3.5 text-sm font-medium tracking-wide text-white transition hover:bg-stone-800"
              >
                Ver espacios
              </Link>
              <Link
                href="/book"
                className="inline-flex rounded-full border border-stone-300 bg-white px-8 py-3.5 text-sm font-medium tracking-wide text-stone-800 shadow-sm transition hover:border-stone-400 hover:bg-stone-50"
              >
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
            <div className="rounded-2xl bg-white p-8 shadow-[0_2px_24px_rgba(28,25,23,0.06)] ring-1 ring-stone-200/80">
              <p className="text-base font-medium text-stone-800">Cerca de ti</p>
            </div>
            <div className="rounded-2xl bg-white p-8 shadow-[0_2px_24px_rgba(28,25,23,0.06)] ring-1 ring-stone-200/80">
              <p className="text-base font-medium text-stone-800">
                Reserva rápida
              </p>
            </div>
            <div className="rounded-2xl bg-white p-8 shadow-[0_2px_24px_rgba(28,25,23,0.06)] ring-1 ring-stone-200/80">
              <p className="text-base font-medium text-stone-800">
                Por el tiempo que necesitas
              </p>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <h2
            className={`${display.className} text-2xl font-normal text-stone-900 sm:text-[1.75rem]`}
          >
            Tu recorrido en la app
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {flowSteps.map((step, index) => (
              <article
                key={step.title}
                className="rounded-2xl bg-white p-5 shadow-[0_2px_20px_rgba(28,25,23,0.05)] ring-1 ring-stone-200/80"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-500">
                  Paso {index + 1}
                </p>
                <h3 className="mt-2 text-base font-semibold text-stone-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <h2
            className={`${display.className} text-2xl font-normal text-stone-900 sm:text-[1.75rem]`}
          >
            Cómo funciona
          </h2>
          <ol className="mt-10 grid list-none gap-10 p-0 sm:grid-cols-3 sm:gap-8">
            <li className="flex flex-col gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-900 text-sm font-semibold text-white">
                1
              </span>
              <span className="text-base text-stone-700">Encuentra</span>
            </li>
            <li className="flex flex-col gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-900 text-sm font-semibold text-white">
                2
              </span>
              <span className="text-base text-stone-700">Reserva</span>
            </li>
            <li className="flex flex-col gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-900 text-sm font-semibold text-white">
                3
              </span>
              <span className="text-base text-stone-700">Entra</span>
            </li>
          </ol>
        </section>

        <section className="mt-20 space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2
              className={`${display.className} text-2xl font-normal text-stone-900 sm:text-[1.75rem]`}
            >
              Para momentos reales
            </h2>
            <Link
              href="/spaces"
              className="text-sm font-semibold text-stone-700 underline-offset-4 transition hover:text-stone-900 hover:underline"
            >
              Ver disponibles
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {useCases.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl bg-white p-6 shadow-[0_2px_24px_rgba(28,25,23,0.06)] ring-1 ring-stone-200/80"
              >
                <h3 className="text-lg font-semibold text-stone-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 grid gap-4 rounded-2xl bg-white p-6 shadow-[0_2px_24px_rgba(28,25,23,0.06)] ring-1 ring-stone-200/80 sm:grid-cols-3 sm:p-8">
          <article className="text-center">
            <p className={`${display.className} text-3xl text-stone-900`}>
              {averageRating.toFixed(1)} / 5
            </p>
            <p className="mt-1 text-sm text-stone-600">Valoración media</p>
          </article>
          <article className="text-center">
            <p className={`${display.className} text-3xl text-stone-900`}>
              {totalReviews}+
            </p>
            <p className="mt-1 text-sm text-stone-600">Reseñas</p>
          </article>
          <article className="text-center">
            <p className={`${display.className} text-3xl text-stone-900`}>
              {instantAccessCount}
            </p>
            <p className="mt-1 text-sm text-stone-600">
              Con acceso inmediato
            </p>
          </article>
        </section>

        <section className="mt-16 rounded-2xl bg-stone-900 px-6 py-12 text-center text-white sm:px-10">
          <h2
            className={`${display.className} text-2xl font-normal sm:text-3xl`}
          >
            Tu espacio puede estar a minutos
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-stone-300 sm:text-base">
            Estamos validando comportamiento real en la ciudad. Reserva o
            explora el catálogo cuando quieras.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/book"
              className="inline-flex rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-stone-900 transition hover:bg-stone-100"
            >
              Ir a reservar
            </Link>
            <Link
              href="/spaces"
              className="inline-flex rounded-full border border-stone-500 bg-transparent px-8 py-3.5 text-sm font-medium text-white transition hover:border-stone-400 hover:bg-white/10"
            >
              Explorar espacios
            </Link>
          </div>
        </section>

        <footer className="mt-16 border-t border-stone-200/90 pt-10 text-sm text-stone-500">
          SPACED
        </footer>
      </div>
    </div>
  );
}
