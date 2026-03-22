import Link from "next/link";
import { SpaceCard } from "@/components/space-card";
import { TopNav } from "@/components/top-nav";
import { mockSpaces } from "@/lib/mock-spaces";

export default function SpacesPage() {
  return (
    <div className="min-h-screen text-zinc-100">
      <TopNav active="spaces" />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10 sm:px-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-zinc-100">Nearby spaces</h1>
          <p className="text-zinc-300">
            MVP discovery view for short-duration, instant-access spaces.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {mockSpaces.map((space) => (
            <SpaceCard key={space.id} space={space} />
          ))}
        </section>

        <Link
          href="/book"
          className="inline-flex rounded-full border border-amber-300/40 bg-gradient-to-r from-amber-400/30 to-orange-300/20 px-5 py-2.5 text-sm font-medium text-amber-100 transition hover:border-amber-200/60 hover:from-amber-300/40 hover:to-orange-200/25"
        >
          Continue to booking
        </Link>
      </main>
    </div>
  );
}
