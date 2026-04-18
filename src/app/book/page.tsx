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
    <div className="min-h-screen bg-[#F4F1EA] text-stone-800">
      <TopNav active="book" />
      <main className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-10 sm:px-8 lg:grid-cols-[1.3fr_1fr]">
        <section className="space-y-5">
          <h1 className="text-3xl font-semibold text-stone-900">
            Reserva tu sesión
          </h1>
          <p className="text-stone-600">
            Empieza con 30 o 60 minutos y amplía de 15 en 15 minutos.
          </p>
          <BookingForm />
        </section>

        <aside className="h-fit space-y-3 rounded-2xl border border-stone-200/90 bg-white p-5 shadow-[0_2px_24px_rgba(28,25,23,0.06)]">
          <h2 className="text-lg font-semibold text-stone-900">
            Resumen del borrador
          </h2>
          <p className="text-sm text-stone-600">
            Estado local de MVP hasta conectar backend y pagos.
          </p>
          <ul className="space-y-2 text-sm text-stone-600">
            <li>
              <span className="font-medium text-stone-900">Espacio: </span>
              {selectedSpace?.title ?? "No seleccionado"}
            </li>
            <li>
              <span className="font-medium text-stone-900">Duración: </span>
              {draft.durationMinutes} min
            </li>
            <li>
              <span className="font-medium text-stone-900">Ampliación: </span>+
              {draft.extensionMinutes} min
            </li>
          </ul>
          <Link
            href="/spaces"
            className="inline-flex text-sm font-medium text-stone-800 underline underline-offset-4 hover:text-stone-600"
          >
            Volver a espacios
          </Link>
        </aside>
      </main>
    </div>
  );
}
