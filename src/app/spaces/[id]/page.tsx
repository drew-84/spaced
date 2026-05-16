import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PropertyDetailExperience } from "@/components/property-detail/property-detail-experience";
import {
  buildPropertyDetail,
  buildPropertyDetailFromListing,
} from "@/components/property-detail/types";
import { listingSpaces, mockSpaces } from "@/lib/mock-spaces";

type Params = Promise<{ id: string }>;

/* /spaces/[id] resolves against two sources:
 *   - mockSpaces      (space-001 … space-N — full Space shape)
 *   - listingSpaces   (lst-001  … lst-N    — homepage grid data)
 * Either way it produces a PropertyDetail and renders the dark-glass page. */
function findPropertyById(id: string) {
  const space = mockSpaces.find((s) => s.id === id);
  if (space) return buildPropertyDetail(space);
  const listing = listingSpaces.find((l) => l.id === id);
  if (listing) return buildPropertyDetailFromListing(listing);
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const property = findPropertyById(id);
  if (!property) return { title: "Espacio · Spaced" };
  return {
    title: `${property.title} · Spaced`,
    description: property.description,
  };
}

export default async function SpaceDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const property = findPropertyById(id);
  if (!property) return notFound();
  return <PropertyDetailExperience property={property} />;
}
