import Link from "next/link";
import { TopNav } from "@/components/top-nav";
import {
  PAGE_AMBIENT_BG,
  PAGE_AMBIENT_SHIMMER,
  TEXT_BODY,
  TEXT_EYEBROW,
} from "@/styles/glass";

export default function ExplorePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#02050d] text-white">
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
        <TopNav />
        <main className="mx-auto max-w-2xl px-6 py-24 sm:px-8">
          <p className={`${TEXT_EYEBROW} tracking-[0.28em]`}>Explorar</p>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white/95">
            Fase 1
          </h1>
          <p className={`mt-3 text-sm leading-relaxed ${TEXT_BODY}`}>
            Vista de exploración ampliada. El recorrido completo llegará en una
            fase posterior; por ahora este espacio solo confirma la navegación
            desde el campo central.
          </p>
          <Link
            href="/"
            className="mt-10 inline-block text-sm text-white/70 underline decoration-white/30 underline-offset-4 transition-colors duration-300 ease-out hover:text-white hover:decoration-white/60"
          >
            Volver al campo
          </Link>
        </main>
      </div>
    </div>
  );
}
