import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PropertyDetailExperience } from "@/components/property-detail/property-detail-experience";
import { buildPropertyDetail, buildPropertyDetailFromListing } from "@/components/property-detail/types";
import { listingSpaces } from "@/lib/mock-spaces";
import { fetchSpaceById } from "@/lib/spaces";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const space = await fetchSpaceById(id);
  if (space) return { title: `${space.title} · Spaced`, description: space.description };
  const listing = listingSpaces.find((l) => l.id === id);
  if (listing) return { title: `${listing.title} · Spaced` };
  return { title: "Espacio · Spaced" };
}

export default async function SpaceDetailPage({ params }: { params: Params }) {
  const { id } = await params;

  // Try DB first
  const space = await fetchSpaceById(id);
  if (space) return <PropertyDetailExperience property={buildPropertyDetail(space)} />;

  // Fall back to homepage listing cards (lst-xxx ids)
  const listing = listingSpaces.find((l) => l.id === id);
  if (listing) return <PropertyDetailExperience property={buildPropertyDetailFromListing(listing)} />;

  return notFound();
}
