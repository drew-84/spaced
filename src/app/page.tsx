// this seems to be the main page structure
import Link from "next/link";
import { TopNav } from "@/components/top-nav";

export default function Home() {
  return (
    <div className="min-h-screen text-white">
      <TopNav active="home" />

      {/* Hero full-width con imagen de fondo */}
      <section
        className="relative flex min-h-[85vh] items-center justify-center overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(circle at 14% 10%, rgba(56,182,255,0.22) 0%, transparent 34%), radial-gradient(circle at 82% 14%, rgba(255,0,170,0.2) 0%, transparent 31%), radial-gradient(circle at 50% 68%, rgba(166,80,255,0.26) 0%, transparent 50%), linear-gradient(148deg, #040710 0%, #0d0221 36%, #15072f 62%, #050916 100%)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#090312]/38 via-[#120626]/28 to-[#090312]/52" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(118deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.03)_16%,rgba(255,255,255,0)_42%),radial-gradient(circle_at_28%_82%,rgba(56,182,255,0.12),transparent_36%),radial-gradient(circle_at_74%_74%,rgba(255,0,170,0.1),transparent_35%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-55 [background:repeating-linear-gradient(118deg,rgba(210,230,255,0.045)_0px,rgba(210,230,255,0.045)_1px,transparent_1px,transparent_54px)]" />
        <div className="relative mx-auto w-full max-w-5xl px-6 [perspective:1700px]">
          <div className="pointer-events-none absolute inset-x-14 top-1/2 hidden h-[320px] -translate-y-1/2 rounded-[3rem] border border-white/10 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.14),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(56,182,255,0.16),transparent_48%)] shadow-[0_35px_110px_rgba(6,10,30,0.5)] backdrop-blur-sm md:block" />
          <div className="pointer-events-none absolute left-1/2 top-[54%] hidden h-56 w-[76%] -translate-x-1/2 rounded-[2.4rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.02)_36%,rgba(56,182,255,0.12)_100%)] shadow-[0_25px_80px_rgba(6,10,30,0.4)] backdrop-blur-md [transform:translateZ(-30px)_rotateX(56deg)_rotateZ(-9deg)] md:block" />

          <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center gap-4 [transform-style:preserve-3d] [transform:rotateX(8deg)_rotateY(-9deg)]">
            <div className="absolute -left-4 top-10 z-30 hidden rounded-2xl border border-cyan-100/40 bg-gradient-to-br from-cyan-100/20 via-cyan-100/7 to-transparent px-4 py-3 text-left shadow-[0_16px_36px_rgba(7,16,35,0.34)] backdrop-blur-xl [transform:translate3d(-10px,-8px,55px)_rotateY(-15deg)_rotateX(4deg)] md:block">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-100/85">
                Access Layer
              </p>
              <p className="mt-1 text-sm font-medium text-cyan-50/90">
                Privacidad verificada
              </p>
              <div className="pointer-events-none absolute inset-[1px] rounded-[14px] border border-white/30" />
            </div>

            <div className="absolute -right-5 bottom-14 z-30 hidden rounded-2xl border border-fuchsia-100/35 bg-gradient-to-br from-fuchsia-100/18 via-purple-100/7 to-transparent px-4 py-3 text-right shadow-[0_16px_36px_rgba(18,10,34,0.36)] backdrop-blur-xl [transform:translate3d(12px,8px,62px)_rotateY(16deg)_rotateX(4deg)] lg:block">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-fuchsia-100/82">
                Atmosphere
              </p>
              <p className="mt-1 text-sm font-medium text-purple-50/90">
                Ready in minutes
              </p>
              <div className="pointer-events-none absolute inset-[1px] rounded-[14px] border border-white/30" />
            </div>

            <div className="relative z-20 self-center rounded-full border border-pink-100/45 bg-gradient-to-r from-pink-200/14 via-fuchsia-200/8 to-cyan-200/10 px-5 py-2 backdrop-blur-lg [transform:translate3d(0,-6px,70px)_rotateX(7deg)_rotateY(-8deg)]">
              <div className="pointer-events-none absolute inset-[1px] rounded-full border border-white/25" />
              <p className="relative text-xs font-semibold uppercase tracking-widest text-pink-100">
                Tu espacio privado, ahora
              </p>
            </div>

            <div className="relative z-10 w-full overflow-hidden rounded-[1.9rem] border border-white/34 bg-gradient-to-br from-white/8 via-white/[0.02] to-transparent px-6 py-8 text-center shadow-[0_26px_70px_rgba(7,10,28,0.5)] backdrop-blur-xl [transform:translate3d(0,0,38px)_rotateY(-3deg)_rotateX(1deg)] sm:px-10 sm:py-10">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(116deg,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.08)_12%,rgba(255,255,255,0)_37%),linear-gradient(274deg,rgba(56,182,255,0.12)_0%,rgba(56,182,255,0)_44%),radial-gradient(circle_at_88%_18%,rgba(255,255,255,0.16),transparent_38%)]" />
              <div className="pointer-events-none absolute inset-[1px] rounded-[1.78rem] border border-white/30" />
              <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />

              <h1 className="relative text-5xl font-bold leading-tight tracking-tight [text-shadow:0_12px_35px_rgba(4,8,20,0.42)] sm:text-6xl lg:text-7xl">
                Un lugar solo para{" "}
                <span className="bg-gradient-to-r from-pink-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,0,128,0.35)]">
                  ustedes dos
                </span>
              </h1>
              <p className="relative mx-auto mt-6 max-w-2xl text-lg text-purple-50/92 sm:text-xl">
                Espacios privados cerca de ti, listos en minutos. Sin compromisos,
                sin esperas, total discrecion.
              </p>
            </div>

            <div className="relative z-20 w-full max-w-3xl overflow-hidden rounded-[1.6rem] border border-white/30 bg-gradient-to-br from-white/12 via-white/[0.03] to-transparent px-5 py-5 shadow-[0_24px_60px_rgba(7,10,28,0.44)] backdrop-blur-xl [transform:translate3d(0,4px,52px)_rotateY(4deg)_rotateX(2deg)] sm:px-7">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0)_40%),radial-gradient(circle_at_12%_90%,rgba(190,0,255,0.12),transparent_45%)]" />
              <div className="pointer-events-none absolute inset-[1px] rounded-[1.48rem] border border-white/26" />
              <div className="relative flex flex-wrap justify-center gap-4">
                <Link
                  href="/spaces"
                  className="rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 px-8 py-3.5 text-sm font-bold text-white shadow-[0_0_30px_rgba(255,0,128,0.5),0_0_60px_rgba(255,0,128,0.2)] transition hover:scale-105 hover:shadow-[0_0_40px_rgba(255,0,128,0.7),0_0_80px_rgba(255,0,128,0.3)]"
                >
                  Explorar espacios
                </Link>
                <Link
                  href="/book"
                  className="rounded-full border border-cyan-300/45 bg-cyan-300/12 px-8 py-3.5 text-sm font-bold text-cyan-100 shadow-[0_0_15px_rgba(56,182,255,0.15)] backdrop-blur-lg transition hover:border-cyan-300/65 hover:bg-cyan-300/18 hover:shadow-[0_0_25px_rgba(56,182,255,0.3)]"
                >
                  Reservar ahora
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-20 sm:px-8">
        {/* Features con imagenes de fondo */}
        <section className="relative grid gap-6 rounded-3xl border border-white/12 bg-gradient-to-br from-white/[0.04] via-white/[0.015] to-transparent p-4 shadow-[0_24px_60px_rgba(6,10,28,0.26)] backdrop-blur-sm sm:grid-cols-3 sm:p-5">
          <div
            className="group relative overflow-hidden rounded-2xl border border-pink-500/20 shadow-[0_0_30px_rgba(255,0,128,0.12)]"
            style={{ minHeight: "320px" }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?w=600&q=80')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0221] via-[#0d0221]/50 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent" />
            <div className="relative flex h-full flex-col justify-end p-6">
              <h3 className="text-xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,0,128,0.3)]">Citas privadas</h3>
              <p className="mt-2 text-sm text-purple-100/80">
                Espacios intimos y discretos para parejas. Sin miradas, sin interrupciones.
              //There needs to be an option to change the language of the website
              //Arturo needs to start coding and propmting in English              
              </p>
            </div>
          </div>

          <div
            className="group relative overflow-hidden rounded-2xl border border-cyan-500/20 shadow-[0_0_30px_rgba(56,182,255,0.12)]"
            style={{ minHeight: "320px" }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&q=80')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0221] via-[#0d0221]/50 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
            <div className="relative flex h-full flex-col justify-end p-6">
              <h3 className="text-xl font-bold text-white drop-shadow-[0_0_10px_rgba(56,182,255,0.3)]">Descanso express</h3>
              <p className="mt-2 text-sm text-purple-100/80">
                Necesitas un respiro? Reserva 30 minutos de privacidad y confort total.
              </p>
            </div>
          </div>

          <div
            className="group relative overflow-hidden rounded-2xl border border-fuchsia-500/20 shadow-[0_0_30px_rgba(190,0,255,0.12)]"
            style={{ minHeight: "320px" }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0221] via-[#0d0221]/50 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent" />
            <div className="relative flex h-full flex-col justify-end p-6">
              <h3 className="text-xl font-bold text-white drop-shadow-[0_0_10px_rgba(190,0,255,0.3)]">Acceso inmediato</h3>
              <p className="mt-2 text-sm text-purple-100/80">
                Reserva y accede en minutos. Codigo digital, sin papeleo.
              </p>
            </div>
          </div>
        </section>

        {/* Banner con imagen */}
        <section
          className="relative overflow-hidden rounded-3xl border border-white/18 bg-cover bg-center shadow-[0_0_50px_rgba(255,0,128,0.1),0_24px_60px_rgba(6,10,28,0.26)]"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&q=80')",
            minHeight: "350px",
          }}
        >
          <div className="pointer-events-none absolute inset-[1px] rounded-[1.45rem] border border-white/20" />
          <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/55 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d0221]/95 via-[#1a0533]/80 to-transparent" />
          <div className="relative flex h-full min-h-[350px] flex-col justify-center px-10 py-12 sm:px-16">
            <h2 className="max-w-lg text-3xl font-bold sm:text-4xl">
              Privacidad y confort cuando{" "}
              <span className="bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
                mas lo necesitas
              </span>
            </h2>
            <p className="mt-4 max-w-md text-purple-100/80">
              Habitaciones, estudios y apartamentos listos para ti. Desde 30
              minutos, extiende cuando quieras.
            </p>
            <div className="mt-8">
              <Link
                href="/spaces"
                className="rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 px-8 py-3.5 text-sm font-bold text-white shadow-[0_0_30px_rgba(255,0,128,0.5),0_0_60px_rgba(255,0,128,0.2)] transition hover:scale-105 hover:shadow-[0_0_40px_rgba(255,0,128,0.7),0_0_80px_rgba(255,0,128,0.3)]"
              >
                Ver espacios disponibles
              </Link>
            </div>
          </div>
        </section>

        {/* CTA cards con imagenes */}
        <section className="relative grid gap-6 rounded-3xl border border-white/12 bg-gradient-to-br from-white/[0.04] via-white/[0.012] to-transparent p-4 shadow-[0_24px_60px_rgba(6,10,28,0.24)] backdrop-blur-sm sm:grid-cols-2 sm:p-5">
          <Link
            href="/spaces"
            className="group relative overflow-hidden rounded-2xl border border-pink-500/15 shadow-[0_0_25px_rgba(255,0,128,0.1)] transition hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(255,0,128,0.25)]"
            style={{ minHeight: "240px" }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0221] via-[#0d0221]/60 to-[#0d0221]/20" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-pink-500/40 to-transparent" />
            <div className="relative flex h-full min-h-[240px] flex-col justify-end p-7">
              <h2 className="text-xl font-bold text-white">Descubre espacios</h2>
              <p className="mt-2 text-sm text-purple-100/75">
                Habitaciones privadas, estudios y mas cerca de ti.
              </p>
              <p className="mt-4 text-sm font-semibold text-pink-400 drop-shadow-[0_0_8px_rgba(255,0,128,0.4)] group-hover:text-pink-300">
                Ver disponibles &rarr;
              </p>
            </div>
          </Link>

          <Link
            href="/book"
            className="group relative overflow-hidden rounded-2xl border border-cyan-500/15 shadow-[0_0_25px_rgba(56,182,255,0.1)] transition hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(56,182,255,0.25)]"
            style={{ minHeight: "240px" }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0221] via-[#0d0221]/60 to-[#0d0221]/20" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
            <div className="relative flex h-full min-h-[240px] flex-col justify-end p-7">
              <h2 className="text-xl font-bold text-white">Reserva al instante</h2>
              <p className="mt-2 text-sm text-purple-100/75">
                Elige tu tiempo, paga y accede. Asi de simple.
              </p>
              <p className="mt-4 text-sm font-semibold text-cyan-400 drop-shadow-[0_0_8px_rgba(56,182,255,0.4)] group-hover:text-cyan-300">
                Reservar ahora &rarr;
              </p>
            </div>
          </Link>
        </section>
      </main>
    </div>
  );
}
