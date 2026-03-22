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
          className="inline-flex rounded-full border border-fuchsia-400/45 bg-gradient-to-r from-fuchsia-500/35 to-pink-400/20 px-5 py-2.5 text-sm font-medium text-fuchsia-100 transition hover:border-fuchsia-300/65 hover:from-fuchsia-400/45 hover:to-pink-300/30"
        >
          Continue to booking
        </Link>
      </main>
    </div>
  );
}
