import Link from "next/link";
import { TopNav } from "@/components/top-nav";

export default function Home() {
  return (
    <div className="min-h-screen text-zinc-100">
      <TopNav active="home" />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 sm:px-8">
        <section className="space-y-6 rounded-3xl border border-white/15 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
          <p className="inline-flex rounded-full border border-fuchsia-400/40 bg-fuchsia-400/15 px-3 py-1 text-xs font-medium text-fuchsia-100">
            SPACED MVP Frontend Base
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
            Private space on demand, redesigned in a sleek silver-black style.
          </h1>
          <p className="max-w-3xl text-zinc-300">
            Airbnb-inspired structure with modern cards, clearer hierarchy, and a
            cleaner booking funnel for fast mobile and desktop navigation.
          </p>
        </section>

        <section className="grid gap-5 sm:grid-cols-2">
          <Link
            href="/spaces"
            className="group rounded-2xl border border-white/15 bg-white/[0.04] p-6 shadow-[0_14px_30px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:border-fuchsia-400/40 hover:bg-white/[0.07] hover:shadow-[0_16px_36px_rgba(236,72,153,0.25)]"
          >
            <h2 className="text-lg font-semibold text-zinc-100">Explore spaces</h2>
            <p className="mt-2 text-sm text-zinc-300">
              Nearby space list with instant-access highlights.
            </p>
            <p className="mt-5 text-sm font-medium text-zinc-200 group-hover:text-fuchsia-200">
              Open discovery →
            </p>
          </Link>

          <Link
            href="/book"
            className="group rounded-2xl border border-white/15 bg-white/[0.04] p-6 shadow-[0_14px_30px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:border-fuchsia-400/40 hover:bg-white/[0.07] hover:shadow-[0_16px_36px_rgba(236,72,153,0.25)]"
          >
            <h2 className="text-lg font-semibold text-zinc-100">Book session</h2>
            <p className="mt-2 text-sm text-zinc-300">
              MVP booking form with duration, extension, and local state draft.
            </p>
            <p className="mt-5 text-sm font-medium text-zinc-200 group-hover:text-fuchsia-200">
              Start booking →
            </p>
          </Link>
        </section>
      </main>
    </div>
  );
}
