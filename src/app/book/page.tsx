"use client";

import Link from "next/link";
import { BookingForm } from "@/components/booking-form";
import { TopNav } from "@/components/top-nav";
import { mockSpaces } from "@/lib/mock-spaces";
import { useBookingStore } from "@/store/booking-store";
import {
  GLASS_PANEL,
  PAGE_AMBIENT_BG,
  PAGE_AMBIENT_SHIMMER,
  TEXT_BODY,
} from "@/styles/glass";

export default function BookPage() {
  const draft = useBookingStore((state) => state.draft);
  const selectedSpace = mockSpaces.find((space) => space.id === draft.spaceId);

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
        <main className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-10 sm:px-8 lg:grid-cols-[1.3fr_1fr]">
          <section className="space-y-5">
            <h1 className="text-3xl font-semibold text-white/95">
              Reserva tu sesión
            </h1>
            <p className={`text-sm ${TEXT_BODY}`}>
              Empieza con 30 o 60 minutos y amplía de 15 en 15 minutos.
            </p>
            <BookingForm />
          </section>

          <aside className={`h-fit space-y-3 ${GLASS_PANEL} p-5`}>
            <h2 className="text-lg font-semibold text-white/80">
              Resumen del borrador
            </h2>
            <p className={`text-sm ${TEXT_BODY}`}>
              Estado local de MVP hasta conectar backend y pagos.
            </p>
            <ul className={`space-y-2 text-sm ${TEXT_BODY}`}>
              <li>
                <span className="font-medium text-white/60">Espacio: </span>
                {selectedSpace?.title ?? "No seleccionado"}
              </li>
              <li>
                <span className="font-medium text-white/60">Duración: </span>
                {draft.durationMinutes} min
              </li>
              <li>
                <span className="font-medium text-white/60">Ampliación: </span>+
                {draft.extensionMinutes} min
              </li>
            </ul>
            <Link
              href="/spaces"
              className="inline-flex text-sm font-medium text-white/70 underline underline-offset-4 transition-colors duration-300 ease-out hover:text-white"
            >
              Volver a espacios
            </Link>
          </aside>
        </main>
      </div>
    </div>
  );
}
