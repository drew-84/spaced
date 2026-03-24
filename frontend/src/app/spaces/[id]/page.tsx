import Link from "next/link";
import { notFound } from "next/navigation";
import { TopNav } from "@/components/top-nav";
import { mockSpaces } from "@/lib/mock-spaces";

const typeLabel = {
  "private-room": "Private room",
  studio: "Studio",
  "apartment-1br": "1-bedroom apartment",
} as const;

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const textSize = size === "lg" ? "text-lg" : "text-sm";
  return (
    <span className={`flex items-center gap-0.5 ${textSize}`}>
      {Array.from({ length: full }, (_, i) => (
        <span key={i} className="text-pink-400 drop-shadow-[0_0_4px_rgba(255,0,128,0.5)]">&#9733;</span>
      ))}
      {half && <span className="text-pink-400/50">&#9733;</span>}
      <span className="ml-1.5 text-purple-200/60">{rating}</span>
    </span>
  );
}

export default async function SpaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const space = mockSpaces.find((s) => s.id === id);

  if (!space) return notFound();

  return (
    <div className="min-h-screen text-white">
      <TopNav active="spaces" />

      {/* Hero image */}
      <div
        className="relative h-[45vh] bg-cover bg-center sm:h-[50vh]"
        style={{ backgroundImage: `url('${space.imageUrl}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0221]/60 via-transparent to-[#0d0221]" />
        <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10">
          <span className="rounded-full bg-pink-500/20 px-3 py-1 text-xs font-medium text-pink-200 backdrop-blur-sm">
            {typeLabel[space.type]}
          </span>
          {space.instantAccess && (
            <span className="ml-2 rounded-full border border-cyan-400/40 bg-cyan-500/20 px-3 py-1 text-xs font-medium text-cyan-300 shadow-[0_0_10px_rgba(56,182,255,0.2)] backdrop-blur-sm">
              Instant access
            </span>
          )}
        </div>
      </div>

      <main className="mx-auto w-full max-w-5xl px-6 py-10 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          {/* Left: Details */}
          <div className="space-y-8">
            {/* Title & rating */}
            <div>
              <h1 className="text-3xl font-bold sm:text-4xl">{space.title}</h1>
              <p className="mt-2 text-purple-200/60">
                {space.area} &middot; {space.distanceKm.toFixed(1)} km de ti
              </p>
              <div className="mt-3 flex items-center gap-3">
                <Stars rating={space.rating} size="lg" />
                <span className="text-sm text-purple-200/50">
                  {space.reviewCount} resenas
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Acerca del espacio</h2>
              <p className="text-sm leading-relaxed text-purple-200/70">{space.description}</p>
            </div>

            {/* Amenities */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Amenidades</h2>
              <div className="flex flex-wrap gap-2">
                {space.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="rounded-full border border-purple-500/25 bg-purple-500/10 px-3 py-1.5 text-xs text-purple-200/70"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                Resenas recientes{" "}
                <span className="text-sm font-normal text-purple-200/50">
                  ({space.reviewCount})
                </span>
              </h2>
              <div className="space-y-3">
                {space.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-xl border border-purple-500/15 bg-purple-500/8 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-pink-500/30 to-purple-500/30 text-xs font-bold text-pink-200">
                          {review.alias.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-white">{review.alias}</span>
                      </div>
                      <Stars rating={review.rating} />
                    </div>
                    <p className="mt-2 text-sm text-purple-200/65">{review.comment}</p>
                    <p className="mt-2 text-xs text-purple-200/30">{review.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Booking card */}
          <div className="h-fit space-y-5 rounded-2xl border border-purple-500/20 bg-purple-500/8 p-6 shadow-[0_0_30px_rgba(190,0,255,0.08)] lg:sticky lg:top-24">
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-bold text-pink-300 drop-shadow-[0_0_8px_rgba(255,0,128,0.3)]">
                ${space.pricePer30m}
                <span className="ml-1 text-sm font-normal text-purple-200/50">/ 30 min</span>
              </p>
              <Stars rating={space.rating} />
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

            <div className="space-y-2 text-sm text-purple-200/60">
              <div className="flex justify-between">
                <span>30 minutos</span>
                <span className="text-white">${space.pricePer30m}</span>
              </div>
              <div className="flex justify-between">
                <span>60 minutos</span>
                <span className="text-white">${space.pricePer30m * 2}</span>
              </div>
            </div>

            <Link
              href="/book"
              className="block w-full rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 px-4 py-3 text-center text-sm font-bold text-white shadow-[0_0_25px_rgba(255,0,128,0.4),0_0_50px_rgba(255,0,128,0.15)] transition hover:shadow-[0_0_35px_rgba(255,0,128,0.6),0_0_70px_rgba(255,0,128,0.25)] hover:brightness-110"
            >
              Reservar este espacio
            </Link>

            <p className="text-center text-xs text-purple-200/30">
              Sin cargos hasta confirmar
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
