"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AmenityPills } from "./amenity-pills";
import { BookingBar } from "./booking-bar";
import { BookingModal } from "./booking-modal";
import { HostCard } from "./host-card";
import { KeyInfoRow } from "./key-info-row";
import { PropertyMap } from "./property-map";
import { ReviewsSection } from "./reviews-section";
import { VideoGallery } from "./video-gallery";
import type { PropertyDetail } from "./types";

type Props = {
  property: PropertyDetail;
};

/* Shared eyebrow + section title used through the page so spacing/typography
   stays consistent. */
function SectionHeader({
  eyebrow,
  hint,
}: {
  eyebrow: string;
  hint?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <p className="text-[10px] uppercase tracking-[0.42em] text-sky-100/55">
        {eyebrow}
      </p>
      {hint ? (
        <p className="text-[9px] uppercase tracking-[0.26em] text-white/30">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/* Glass tile reused for description + rules — same recipe as the modal's
   inner stat tiles, just stretched. */
function GlassPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-[24px] border border-white/[0.075] bg-white/[0.026] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-22px_50px_rgba(2,6,16,0.3)] backdrop-blur-xl sm:p-6">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
      />
      {children}
    </div>
  );
}

export function PropertyDetailExperience({ property }: Props) {
  const router = useRouter();
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-[#02050d] text-white">
      {/* Ambient backdrop — identical recipe to /ofrecer */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 48% at 54% 18%, rgba(72,132,220,0.18), transparent 62%), radial-gradient(circle at 14% 84%, rgba(80,120,210,0.14), transparent 38%), radial-gradient(circle at 88% 32%, rgba(70,120,200,0.1), transparent 42%), linear-gradient(to bottom, rgba(2,5,13,0.05), rgba(2,5,13,0.55))",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.32] [background:repeating-linear-gradient(122deg,rgba(255,255,255,0.018)_0px,rgba(255,255,255,0.018)_1px,transparent_1px,transparent_64px)]"
      />

      {/* CERRAR — fixed top-right, identical to /ofrecer cerrar pill */}
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Cerrar y volver"
        className="fixed right-5 top-5 z-40 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-[10px] uppercase tracking-[0.26em] text-white/55 shadow-[0_10px_24px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md transition-[transform,border-color,color,background-color] duration-200 hover:border-sky-200/25 hover:bg-white/[0.06] hover:text-sky-100/85 sm:right-8 sm:top-8"
      >
        cerrar
      </button>

      <main
        /* pb-32: leave room above the sticky booking bar so content
           never hides under it. */
        className="relative mx-auto w-full max-w-[1080px] px-4 pb-32 pt-10 sm:px-8 sm:pb-36 sm:pt-14 lg:px-10"
      >
        {/* 1. TOP BAR — title + area */}
        <header className="mb-8 sm:mb-10">
          <p className="text-[10px] font-medium uppercase tracking-[0.62em] text-sky-200/55">
            {property.category}
          </p>
          <h1 className="mt-4 text-3xl font-medium leading-[1.15] tracking-[0.04em] text-white/90 sm:text-4xl">
            {property.title}
          </h1>
          <p className="mt-3 text-sm font-light tracking-[0.08em] text-white/45">
            {property.area} · {property.city}
          </p>
        </header>

        <div className="space-y-10 sm:space-y-12">
          {/* 2. VIDEO GALLERY */}
          <VideoGallery videos={property.videos} />

          {/* 3. KEY INFO ROW */}
          <KeyInfoRow property={property} />

          {/* 4. AMENITIES */}
          <section className="space-y-4">
            <SectionHeader
              eyebrow="Comodidades"
              hint={`${property.amenities.length} disponibles`}
            />
            <AmenityPills amenities={property.amenities} />
          </section>

          {/* 5. DESCRIPCIÓN */}
          <section className="space-y-4">
            <SectionHeader eyebrow="Descripción" />
            <GlassPanel>
              <p className="text-[15px] font-light leading-relaxed tracking-[0.02em] text-white/65">
                {property.description}
              </p>
            </GlassPanel>
          </section>

          {/* 6. REGLAS DE LA CASA */}
          <section className="space-y-4">
            <SectionHeader eyebrow="Reglas de la casa" />
            <GlassPanel>
              <ul className="space-y-2.5 text-[14px] font-light tracking-[0.02em] text-white/60">
                {property.rulesText.split("\n").map((line, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-sky-100/80 shadow-[0_0_8px_rgba(140,190,255,0.7)]"
                    />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </GlassPanel>
          </section>

          {/* 7. HOST INFO (collapsed by default) */}
          <HostCard host={property.host} />

          {/* 8. RESEÑAS */}
          <section className="space-y-4">
            <SectionHeader eyebrow="Reseñas" />
            <ReviewsSection
              rating={property.rating}
              reviewCount={property.reviewCount}
              reviews={property.reviews}
            />
          </section>

          {/* 9. TRANSLUCENT MAP */}
          <PropertyMap
            lat={property.lat}
            lng={property.lng}
            area={property.area}
            city={property.city}
          />
        </div>
      </main>

      {/* Sticky booking action */}
      <BookingBar
        property={property}
        onReserve={() => setBookingOpen(true)}
      />

      {/* Placeholder Reservar modal */}
      <BookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        property={property}
      />
    </div>
  );
}
