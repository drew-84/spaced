import Link from "next/link";
import { TopNav } from "@/components/top-nav";

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-[#08080a] text-stone-200">
      <TopNav />
      <main className="mx-auto max-w-2xl px-6 py-24 sm:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500">Explorar</p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-stone-100">Fase 1</h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-400">
          Vista de exploración ampliada. El recorrido completo llegará en una fase posterior; por ahora
          este espacio solo confirma la navegación desde el campo central.
        </p>
        <Link
          href="/"
          className="mt-10 inline-block text-sm text-stone-500 underline decoration-stone-600 underline-offset-4 transition hover:text-stone-300"
        >
          Volver al campo
        </Link>
      </main>
    </div>
  );
}
