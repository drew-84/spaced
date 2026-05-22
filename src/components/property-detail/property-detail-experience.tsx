"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CTA_SECONDARY,
  GLASS_PANEL_SOFT,
  PAGE_AMBIENT_BG,
  PAGE_AMBIENT_SHIMMER,
  RIM_HIGHLIGHT_TOP,
  TEXT_BODY,
  TEXT_BODY_DIM,
  TEXT_EYEBROW,
  TEXT_HINT,
} from "@/styles/glass";
import { KYCScreen } from "@/components/kyc/KYCScreen";
import { AmenityPills } from "./amenity-pills";
import { BookingBar } from "./booking-bar";
import { BookingModal } from "./booking-modal";
import { HostCard } from "./host-card";
import { KeyInfoRow } from "./key-info-row";
import { PropertyMap } from "./property-map";
import { ReviewsSection } from "./reviews-section";
import { VideoGallery } from "./video-gallery";
import type { PropertyDetail } from "./types";

/* Temporary flag — flips the RESERVAR flow between KYC-first (new user)
   and direct BookingModal (returning user). Replace with real auth state
   once we have a session backend. */
const isNewUser = true;

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
      <p className={`${TEXT_EYEBROW} tracking-[0.42em]`}>{eyebrow}</p>
      {hint ? <p className={TEXT_HINT}>{hint}</p> : null}
    </div>
  );
}

/* Glass panel reused for description + rules. */
function GlassPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className={`relative ${GLASS_PANEL_SOFT} p-5 sm:p-6`}>
      <span aria-hidden className={RIM_HIGHLIGHT_TOP} />
      {children}
    </div>
  );
}

export function PropertyDetailExperience({ property }: Props) {
  const router = useRouter();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [kycOpen, setKycOpen] = useState(false);

  function handleReserve() {
    if (isNewUser) {
      setKycOpen(true);
      return;
    }
    setBookingOpen(true);
  }

  function handleKycComplete() {
    setKycOpen(false);
    setBookingOpen(true);
  }

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-[#02050d] text-white">
      {/* Ambient backdrop — shared page ambient recipe */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{ background: PAGE_AMBIENT_BG }}
      />
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-0 ${PAGE_AMBIENT_SHIMMER}`}
      />

      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Cerrar y volver"
        className={`fixed right-5 top-5 z-40 ${CTA_SECONDARY} sm:right-8 sm:top-8`}
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
          <p className={`${TEXT_EYEBROW} tracking-[0.62em]`}>
            {property.category}
          </p>
          <h1 className="mt-4 text-3xl font-medium leading-[1.15] tracking-[0.04em] text-white/95 sm:text-4xl">
            {property.title}
          </h1>
          <p className={`mt-3 text-sm tracking-[0.08em] ${TEXT_BODY}`}>
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
              <p className={`text-[15px] leading-relaxed ${TEXT_BODY}`}>
                {property.description}
              </p>
            </GlassPanel>
          </section>

          {/* 6. REGLAS DE LA CASA */}
          <section className="space-y-4">
            <SectionHeader eyebrow="Reglas de la casa" />
            <GlassPanel>
              <ul className={`space-y-2.5 text-[14px] ${TEXT_BODY_DIM}`}>
                {property.rulesText.split("\n").map((line, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.75)]"
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
      <BookingBar property={property} onReserve={handleReserve} />

      {/* Placeholder Reservar modal */}
      <BookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        property={property}
      />

      {/* Guest KYC — shown before BookingModal for new users */}
      {kycOpen && (
        <KYCScreen
          userType="guest"
          onComplete={handleKycComplete}
          onClose={() => setKycOpen(false)}
        />
      )}
    </div>
  );
}
