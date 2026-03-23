import Link from "next/link";
import { SpaceCard } from "@/components/space-card";
import { TopNav } from "@/components/top-nav";
import { mockSpaces } from "@/lib/mock-spaces";

export default function SpacesPage() {
  return (
    <div className="min-h-screen text-white">
      <TopNav active="spaces" />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10 sm:px-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-white">Nearby spaces</h1>
          <p className="text-purple-200/70">
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
          className="inline-flex rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_25px_rgba(236,72,153,0.35)] transition hover:shadow-[0_12px_35px_rgba(236,72,153,0.5)] hover:brightness-110"
        >
          Continue to booking
        </Link>
      </main>
    </div>
  );
}
