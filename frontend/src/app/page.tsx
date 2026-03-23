import Link from "next/link";
import { TopNav } from "@/components/top-nav";

export default function Home() {
  return (
    <div className="min-h-screen text-white">
      <TopNav active="home" />

      {/* Hero full-width con imagen de fondo */}
      <section
        className="relative flex min-h-[85vh] items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=1600&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/70 via-fuchsia-950/60 to-[#1a0a2e]" />
        <div className="relative mx-auto max-w-4xl space-y-8 px-6 text-center">
          <p className="inline-flex rounded-full border border-fuchsia-400/50 bg-fuchsia-500/25 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-fuchsia-200 backdrop-blur-sm">
            Tu espacio privado, ahora
          </p>
          <h1 className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            Un lugar solo para{" "}
            <span className="bg-gradient-to-r from-fuchsia-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
              ustedes dos
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-purple-100/85 sm:text-xl">
            Espacios privados cerca de ti, listos en minutos. Sin compromisos,
            sin esperas, total discrecion.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              href="/spaces"
              className="rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 px-8 py-3.5 text-sm font-bold text-white shadow-[0_8px_30px_rgba(236,72,153,0.5)] transition hover:scale-105 hover:shadow-[0_14px_45px_rgba(236,72,153,0.6)]"
            >
              Explorar espacios
            </Link>
            <Link
              href="/book"
              className="rounded-full border border-white/25 bg-white/10 px-8 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              Reservar ahora
            </Link>
          </div>
        </div>
      </section>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-20 sm:px-8">
        {/* Features con imagenes de fondo */}
        <section className="grid gap-6 sm:grid-cols-3">
          <div
            className="group relative overflow-hidden rounded-2xl shadow-[0_14px_30px_rgba(168,85,247,0.2)]"
            style={{ minHeight: "320px" }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?w=600&q=80')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-purple-950/90 via-purple-950/40 to-transparent" />
            <div className="relative flex h-full flex-col justify-end p-6">
              <h3 className="text-xl font-bold text-white">Citas privadas</h3>
              <p className="mt-2 text-sm text-purple-100/80">
                Espacios intimos y discretos para parejas. Sin miradas, sin interrupciones.
              </p>
            </div>
          </div>

          <div
            className="group relative overflow-hidden rounded-2xl shadow-[0_14px_30px_rgba(168,85,247,0.2)]"
            style={{ minHeight: "320px" }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&q=80')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-purple-950/90 via-purple-950/40 to-transparent" />
            <div className="relative flex h-full flex-col justify-end p-6">
              <h3 className="text-xl font-bold text-white">Descanso express</h3>
              <p className="mt-2 text-sm text-purple-100/80">
                Necesitas un respiro? Reserva 30 minutos de privacidad y confort total.
              </p>
            </div>
          </div>

          <div
            className="group relative overflow-hidden rounded-2xl shadow-[0_14px_30px_rgba(168,85,247,0.2)]"
            style={{ minHeight: "320px" }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-purple-950/90 via-purple-950/40 to-transparent" />
            <div className="relative flex h-full flex-col justify-end p-6">
              <h3 className="text-xl font-bold text-white">Acceso inmediato</h3>
              <p className="mt-2 text-sm text-purple-100/80">
                Reserva y accede en minutos. Codigo digital, sin papeleo.
              </p>
            </div>
          </div>
        </section>

        {/* Banner con imagen */}
        <section
          className="relative overflow-hidden rounded-3xl bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&q=80')",
            minHeight: "350px",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-950/90 via-fuchsia-950/70 to-transparent" />
          <div className="relative flex h-full min-h-[350px] flex-col justify-center px-10 py-12 sm:px-16">
            <h2 className="max-w-lg text-3xl font-bold sm:text-4xl">
              Privacidad y confort cuando{" "}
              <span className="text-fuchsia-300">mas lo necesitas</span>
            </h2>
            <p className="mt-4 max-w-md text-purple-100/80">
              Habitaciones, estudios y apartamentos listos para ti. Desde 30
              minutos, extiende cuando quieras.
            </p>
            <div className="mt-8">
              <Link
                href="/spaces"
                className="rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 px-8 py-3.5 text-sm font-bold text-white shadow-[0_8px_30px_rgba(236,72,153,0.5)] transition hover:scale-105 hover:shadow-[0_14px_45px_rgba(236,72,153,0.6)]"
              >
                Ver espacios disponibles
              </Link>
            </div>
          </div>
        </section>

        {/* CTA cards con imagenes */}
        <section className="grid gap-6 sm:grid-cols-2">
          <Link
            href="/spaces"
            className="group relative overflow-hidden rounded-2xl shadow-[0_14px_30px_rgba(236,72,153,0.15)] transition hover:-translate-y-1"
            style={{ minHeight: "240px" }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-purple-950/90 via-purple-950/50 to-purple-950/20" />
            <div className="relative flex h-full min-h-[240px] flex-col justify-end p-7">
              <h2 className="text-xl font-bold text-white">Descubre espacios</h2>
              <p className="mt-2 text-sm text-purple-100/75">
                Habitaciones privadas, estudios y mas cerca de ti.
              </p>
              <p className="mt-4 text-sm font-semibold text-fuchsia-300 group-hover:text-fuchsia-200">
                Ver disponibles &rarr;
              </p>
            </div>
          </Link>

          <Link
            href="/book"
            className="group relative overflow-hidden rounded-2xl shadow-[0_14px_30px_rgba(236,72,153,0.15)] transition hover:-translate-y-1"
            style={{ minHeight: "240px" }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-purple-950/90 via-purple-950/50 to-purple-950/20" />
            <div className="relative flex h-full min-h-[240px] flex-col justify-end p-7">
              <h2 className="text-xl font-bold text-white">Reserva al instante</h2>
              <p className="mt-2 text-sm text-purple-100/75">
                Elige tu tiempo, paga y accede. Asi de simple.
              </p>
              <p className="mt-4 text-sm font-semibold text-pink-300 group-hover:text-pink-200">
                Reservar ahora &rarr;
              </p>
            </div>
          </Link>
        </section>
      </main>
    </div>
  );
}
