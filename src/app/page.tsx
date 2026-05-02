import { TopNav } from "@/components/top-nav";
import { SpatialCardField } from "@/components/spatial-home/spatial-card-field";
import { LocationSection } from "@/components/landing/location-section";
import { HostCardsSection } from "@/components/landing/host-cards-section";
import { mockSpaces } from "@/lib/mock-spaces";

export default function Home() {
  const cardSpaces = mockSpaces.map((s) => ({
    id: s.id,
    title: s.title,
    imageUrl: s.imageUrl,
    area: s.area,
  }));
  const readyCount = mockSpaces.filter((s) => s.instantAccess).length;

  return (
    <div className="min-h-screen text-white">
      <TopNav active="home" />

      <section
        className="relative min-h-[calc(100dvh-3.5rem)] overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 90% 55% at 50% -8%, rgba(95,120,160,0.14), transparent 52%), radial-gradient(circle at 12% 88%, rgba(45,55,75,0.35), transparent 42%), radial-gradient(circle at 88% 78%, rgba(35,40,55,0.3), transparent 45%), linear-gradient(168deg, #050506 0%, #0a0b0f 42%, #060607 100%)",
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/55" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.35] [background:repeating-linear-gradient(122deg,rgba(255,255,255,0.02)_0px,rgba(255,255,255,0.02)_1px,transparent_1px,transparent_64px)]" />

        <main className="relative mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-[1280px] items-center justify-center px-4 sm:px-8">
          <SpatialCardField spaces={cardSpaces} readyCount={readyCount} />
        </main>
      </section>

      <LocationSection />
      <HostCardsSection />
    </div>
  );
}
