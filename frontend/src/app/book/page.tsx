"use client";

import Link from "next/link";
import { BookingForm } from "@/components/booking-form";
import { TopNav } from "@/components/top-nav";
import { mockSpaces } from "@/lib/mock-spaces";
import { useBookingStore } from "@/store/booking-store";

export default function BookPage() {
  const draft = useBookingStore((state) => state.draft);
  const selectedSpace = mockSpaces.find((space) => space.id === draft.spaceId);

  return (
    <div className="min-h-screen text-zinc-100">
      <TopNav active="book" />
      <main className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-10 sm:px-8 lg:grid-cols-[1.3fr_1fr]">
        <section className="space-y-5">
          <h1 className="text-3xl font-semibold text-zinc-100">Book your session</h1>
          <p className="text-zinc-300">
            Start with 30 or 60 minutes and extend in 15-minute increments.
          </p>
          <BookingForm />
        </section>

        <aside className="h-fit space-y-3 rounded-2xl border border-white/15 bg-white/[0.06] p-5 shadow-[0_14px_30px_rgba(0,0,0,0.35)]">
          <h2 className="text-lg font-semibold text-zinc-100">Draft summary</h2>
          <p className="text-sm text-zinc-300">
            This is local state for MVP wiring before backend integration.
          </p>
          <ul className="space-y-2 text-sm text-zinc-300">
            <li>
              <span className="font-medium text-zinc-100">Space: </span>
              {selectedSpace?.title ?? "Not selected"}
            </li>
            <li>
              <span className="font-medium text-zinc-100">Duration: </span>
              {draft.durationMinutes} min
            </li>
            <li>
              <span className="font-medium text-zinc-100">Extension: </span>
              +{draft.extensionMinutes} min
            </li>
          </ul>
          <Link
            href="/spaces"
            className="inline-flex text-sm font-medium text-zinc-200 underline hover:text-fuchsia-200"
          >
            Back to spaces
          </Link>
        </aside>
      </main>
    </div>
  );
}
