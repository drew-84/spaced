import type { Metadata } from "next";
import { ListSpaceExperience } from "@/components/list-space/list-space-experience";

export const metadata: Metadata = {
  title: "Ofrecer espacio · Spaced",
  description: "Activa tu espacio en la red Spaced.",
};

export default function OfrecerPage() {
  return <ListSpaceExperience />;
}
