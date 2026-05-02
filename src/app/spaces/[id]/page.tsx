import Link from "next/link";
import { notFound } from "next/navigation";
import { NightlyStayCta } from "@/components/nightly-stay-cta";
import { SpaceDistance } from "@/components/space-distance";
import { TopNav } from "@/components/top-nav";
import { mockSpaces } from "@/lib/mock-spaces";

const typeLabel: Record<string, string> = {
  "private-room": "Habitación",
  studio: "Estudio",
  "apartment-1br": "Depto 1 recámara",
  house: "Casa",
  "rest-room": "Descanso",
  kitchen: "Cocina",
  office: "Oficina",
  "meeting-room": "Sala de reuniones",
  "recording-studio": "Estudio de grabación",
  "podcast-studio": "Estudio de podcast",
  coworking: "Coworking",
};

function Stars({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "lg";
}) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const textSize = size === "lg" ? "text-lg" : "text-sm";
  return (
    <span className={`flex items-center gap-0.5 ${textSize}`}>
      {Array.from({ length: full }, (_, i) => (
        <span key={i} className="text-amber-500">
          &#9733;
        </span>
      ))}
      {half && <span className="text-amber-500/50">&#9733;</span>}
      <span className="ml-1.5 text-stone-600">{rating}</span>
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

  const isHourly = space.stayType === "hourly";

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-stone-800">
      <TopNav active="spaces" />

      <div
        className="relative h-[45vh] bg-cover bg-center sm:h-[50vh]"
        style={{ backgroundImage: `url('${space.imageUrl}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/55 via-stone-900/15 to-stone-900/90" />
        <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10">
          <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-stone-800 shadow-sm backdrop-blur-sm">
            {typeLabel[space.type]}
          </span>
          <span className="ml-2 rounded-full bg-stone-900/85 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {isHourly ? "Por hora" : "Estancia corta · por noche"}
          </span>
          {space.instantAccess && (
            <span className="ml-2 rounded-full border border-white/40 bg-white/90 px-3 py-1 text-xs font-medium text-stone-800 shadow-sm backdrop-blur-sm">
              Acceso inmediato
            </span>
          )}
        </div>
      </div>

      <main className="mx-auto w-full max-w-5xl px-6 py-10 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-stone-900 sm:text-4xl">
                {space.title}
              </h1>
              <p className="mt-2 text-stone-600">
                {space.area} &middot;{" "}
                <SpaceDistance lat={space.lat} lng={space.lng} />
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Stars rating={space.rating} size="lg" />
                <span className="text-sm text-stone-500">
                  {space.reviewCount} resenas
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-stone-900">
                Acerca del espacio
              </h2>
              <p className="text-sm leading-relaxed text-stone-600">
                {space.description}
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-stone-900">Amenidades</h2>
              <div className="flex flex-wrap gap-2">
                {space.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-700 shadow-sm"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-stone-900">
                Resenas recientes{" "}
                <span className="text-sm font-normal text-stone-500">
                  ({space.reviewCount})
                </span>
              </h2>
              <div className="space-y-3">
                {space.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-xl border border-stone-200/90 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-200 text-xs font-bold text-stone-800">
                          {review.alias.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-stone-900">
                          {review.alias}
                        </span>
                      </div>
                      <Stars rating={review.rating} />
                    </div>
                    <p className="mt-2 text-sm text-stone-600">
                      {review.comment}
                    </p>
                    <p className="mt-2 text-xs text-stone-400">{review.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="h-fit space-y-5 rounded-2xl border border-stone-200/90 bg-white p-6 shadow-[0_2px_24px_rgba(28,25,23,0.06)] lg:sticky lg:top-24">
            {isHourly ? (
              <>
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl font-bold text-stone-900">
                    ${space.pricePer30m}
                    <span className="ml-1 text-sm font-normal text-stone-500">
                      / 30 min
                    </span>
                  </p>
                  <Stars rating={space.rating} />
                </div>

                <div className="h-px bg-stone-200" />

                <div className="space-y-2 text-sm text-stone-600">
                  <div className="flex justify-between">
                    <span>30 minutos</span>
                    <span className="font-medium text-stone-900">
                      ${space.pricePer30m}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>60 minutos</span>
                    <span className="font-medium text-stone-900">
                      ${space.pricePer30m * 2}
                    </span>
                  </div>
                </div>

                <Link
                  href="/book"
                  className="block w-full rounded-full bg-stone-900 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800"
                >
                  Reservar por horas
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl font-bold text-stone-900">
                    ${space.pricePerNight.toLocaleString("es-MX")}
                    <span className="ml-1 text-sm font-normal text-stone-500">
                      / noche
                    </span>
                  </p>
                  <Stars rating={space.rating} />
                </div>

                <p className="text-sm text-stone-600">
                  Estancia corta: minimo {space.minNights}{" "}
                  {space.minNights === 1 ? "noche" : "noches"}.
                </p>

                <div className="h-px bg-stone-200" />

                <p className="text-sm text-stone-600">
                  Las reservas por noche se confirman con el anfitrión (flujo
                  manual en esta versión).
                </p>

                <NightlyStayCta />
              </>
            )}

            <p className="text-center text-xs text-stone-400">
              Sin cargos hasta confirmar
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
