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
    <div className="min-h-screen text-white">
      <TopNav active="book" />
      <main className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-10 sm:px-8 lg:grid-cols-[1.3fr_1fr]">
        <section className="space-y-5">
          <h1 className="text-3xl font-semibold text-white">Book your session</h1>
          <p className="text-purple-200/70">
            Start with 30 or 60 minutes and extend in 15-minute increments.
          </p>
          <BookingForm />
        </section>

        <aside className="h-fit space-y-3 rounded-2xl border border-purple-400/20 bg-purple-500/10 p-5 shadow-[0_14px_30px_rgba(168,85,247,0.12)]">
          <h2 className="text-lg font-semibold text-white">Draft summary</h2>
          <p className="text-sm text-purple-200/70">
            This is local state for MVP wiring before backend integration.
          </p>
          <ul className="space-y-2 text-sm text-purple-200/70">
            <li>
              <span className="font-medium text-white">Space: </span>
              {selectedSpace?.title ?? "Not selected"}
            </li>
            <li>
              <span className="font-medium text-white">Duration: </span>
              {draft.durationMinutes} min
            </li>
            <li>
              <span className="font-medium text-white">Extension: </span>
              +{draft.extensionMinutes} min
            </li>
          </ul>
          <Link
            href="/spaces"
            className="inline-flex text-sm font-medium text-fuchsia-300 underline hover:text-fuchsia-200"
          >
            Back to spaces
          </Link>
        </aside>
      </main>
    </div>
  );
}
