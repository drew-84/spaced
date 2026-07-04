import type { Space, Review, SpaceType } from "@/lib/types";
import type { ListingSpace, SpaceCategory } from "@/lib/mock-spaces";

export type PropertyVideo = {
  id: string;
  url: string;
  poster: string;
};

export type PropertyHost = {
  name: string;
  avatar: string;
  rating: number;
  bio: string;
  memberSince: string;
  responseHours: number;
};

export type PropertyDetail = {
  id: string;
  title: string;
  area: string;
  city: string;
  category: string;
  description: string;
  rulesText: string;
  amenities: string[];
  videos: PropertyVideo[];
  pricePer15Min: number;
  pricePer45Min: number;
  reservaMinimaMin: 45;
  capacidadMaxima: number;
  rating: number;
  reviewCount: number;
  reviews: Review[];
  host: PropertyHost;
  lat: number;
  lng: number;
  instantBooking: boolean;
  /** Used only when instantBooking is false */
  hostConfirmationHours: number;
};

const SAMPLE_VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
];

const SAMPLE_POSTERS = [
  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=900&q=80",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=900&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900&q=80",
];

const SAMPLE_BIOS = [
  "Anfitrión local. Cuido cada nodo como si fuera mío.",
  "Tres años hospedando. Me gusta cuando los huéspedes encuentran calma.",
  "Diseñador de interiores. Cada espacio está pensado en la luz y el silencio.",
];

const typeLabel: Record<Space["type"], string> = {
  "private-room": "Habitación privada",
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

/* House-rules placeholder, deterministic per space so the page is stable */
const SAMPLE_RULES = [
  "No fumar adentro · Sí en terraza/balcón.",
  "Mascotas aceptadas con aviso previo (máx. 1).",
  "Música a volumen moderado después de las 22:00.",
  "Llegada y salida puntuales — la limpieza es entre nodos.",
  "Deja el espacio como lo encontraste.",
].join("\n");

function pickStable<T>(arr: T[], seed: string, offset = 0): T {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash + offset) % arr.length;
  return arr[idx];
}

/**
 * Augment a Space (mock data with $/30m pricing) into a full PropertyDetail
 * with placeholder videos, host bio, and 15/45-minute pricing derived from
 * the existing pricePer30m field.
 */
export function buildPropertyDetail(
  space: Space,
  opts?: { hostName?: string; hostAvatar?: string },
): PropertyDetail {
  const isHourly = space.stayType === "hourly";
  const pricePer30m = isHourly ? space.pricePer30m : Math.round(space.pricePerNight / 45);
  const pricePer15Min = Math.max(1, Math.round(pricePer30m / 2));
  const pricePer45Min = Math.max(1, Math.round(pricePer30m * 1.5));

  /* Videos: prefer the host's real uploaded clips (poster = cover photo). If
     none were uploaded, emit a single poster-only entry so the gallery shows
     the cover image instead of a video. Falls back to sample media only for
     legacy mock spaces that carry neither real videos nor a cover image. */
  const coverImage = space.imageUrl || SAMPLE_POSTERS[0];
  const realVideos = space.videoUrls ?? [];
  let videos: PropertyVideo[];
  if (realVideos.length > 0) {
    videos = realVideos.map((url, i) => ({
      id: `${space.id}-v${i + 1}`,
      url,
      poster: coverImage,
    }));
  } else if (space.imageUrl) {
    videos = [{ id: `${space.id}-cover`, url: "", poster: coverImage }];
  } else {
    // Legacy mock listing with no image — keep the old sample behavior.
    const videoCount = (Math.abs(hashCode(space.id)) % 3) + 1;
    videos = Array.from({ length: videoCount }, (_, i) => ({
      id: `${space.id}-v${i + 1}`,
      url: SAMPLE_VIDEOS[(i + Math.abs(hashCode(space.id))) % SAMPLE_VIDEOS.length],
      poster:
        SAMPLE_POSTERS[(i + Math.abs(hashCode(space.id))) % SAMPLE_POSTERS.length],
    }));
  }

  return {
    id: space.id,
    title: space.title,
    area: space.area,
    city: space.city || "Ciudad de México",
    category: typeLabel[space.type],
    description: space.description,
    rulesText: space.houseRules?.trim() || SAMPLE_RULES,
    amenities: space.amenities,
    videos,
    pricePer15Min,
    pricePer45Min,
    reservaMinimaMin: 45,
    capacidadMaxima: space.maxCapacity ?? 4,
    rating: space.rating,
    reviewCount: space.reviewCount,
    reviews: space.reviews,
    host: {
      name: opts?.hostName ?? pickHostName(space.id),
      avatar:
        opts?.hostAvatar ??
        `https://i.pravatar.cc/120?img=${(Math.abs(hashCode(space.id)) % 70) + 1}`,
      rating: Math.min(5, space.rating + 0.05),
      bio: pickStable(SAMPLE_BIOS, space.id),
      memberSince: pickMemberSince(space.id),
      responseHours: 2,
    },
    lat: space.lat,
    lng: space.lng,
    instantBooking: space.instantAccess,
    hostConfirmationHours: 6,
  };
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

const HOST_NAMES = [
  "Andrea M.",
  "Luis F.",
  "Carlos V.",
  "Paola R.",
  "Mateo S.",
  "Sara L.",
  "Fernanda G.",
  "Diego P.",
  "Rodrigo T.",
  "Camila O.",
];

function pickHostName(seed: string): string {
  return pickStable(HOST_NAMES, seed);
}

const MEMBER_SINCE_YEARS = ["2022", "2023", "2024", "2025"];

function pickMemberSince(seed: string): string {
  return `Miembro desde ${pickStable(MEMBER_SINCE_YEARS, seed, 7)}`;
}

/* ---- Listing → PropertyDetail bridge -------------------------------------
 * The homepage grid uses `listingSpaces` (lst-001 … lst-010), which carries
 * less data than the canonical `mockSpaces`. We synthesize a Space so we can
 * reuse buildPropertyDetail() for everything below the bridge — videos,
 * pricing tiers, host card, etc. — and keep one PropertyDetail recipe.
 */

const CATEGORY_TO_TYPE: Record<SpaceCategory, SpaceType> = {
  Todos: "studio",
  Descanso: "rest-room",
  Cocina: "kitchen",
  Oficina: "office",
  Reunión: "meeting-room",
  Grabación: "recording-studio",
};

/* Approximate CDMX neighborhood coordinates so the translucent map renders
 * over the right area when a listing is opened. */
const AREA_COORDS: Record<string, { lat: number; lng: number }> = {
  "Roma Norte": { lat: 19.4194, lng: -99.1619 },
  "Roma Sur": { lat: 19.409, lng: -99.1565 },
  Condesa: { lat: 19.4111, lng: -99.1722 },
  Polanco: { lat: 19.4344, lng: -99.1976 },
  Juárez: { lat: 19.426, lng: -99.1677 },
  Juarez: { lat: 19.426, lng: -99.1677 },
  "Centro Histórico": { lat: 19.4326, lng: -99.1332 },
  Coyoacán: { lat: 19.3467, lng: -99.162 },
  "Santa Fe": { lat: 19.3666, lng: -99.2603 },
  Escandón: { lat: 19.4106, lng: -99.1814 },
  Narvarte: { lat: 19.3952, lng: -99.1597 },
  "Del Valle": { lat: 19.3867, lng: -99.1625 },
};

const SAMPLE_DESCRIPTIONS_BY_CATEGORY: Record<SpaceCategory, string> = {
  Todos:
    "Un espacio versátil con la atmósfera justa para enfocarse o desconectar. Iluminación cuidada, mobiliario suave y acceso simple.",
  Descanso:
    "Un nodo silencioso para reponer energía. Cama vestida, oscurecimiento total, temperatura controlada y la mínima intrusión visual posible.",
  Cocina:
    "Cocina equipada para cocinar sin fricción: estufa, horno, refrigerador y utensilios básicos listos. Espacio para que la comida sea el evento.",
  Oficina:
    "Una oficina pensada para concentración profunda — wifi rápido, monitor externo, silla ergonómica y silencio acústico para llamadas y enfoque.",
  Reunión:
    "Sala diseñada para conversaciones de alto valor. Acústica tratada, pantalla grande, sillas cómodas y zonas pensadas para colaborar sin distracciones.",
  Grabación:
    "Estudio aislado acústicamente con la cadena de audio profesional lista para usar. Llegas, conectas y grabas — sin tiempo perdido en montaje.",
};

const SAMPLE_REVIEW_TEMPLATES: Array<{ alias: string; comment: string }> = [
  {
    alias: "Usuario M.",
    comment: "Llegué, hice mi cosa y me fui. Todo perfecto, exactamente como en la descripción.",
  },
  {
    alias: "Pareja R.",
    comment: "El espacio se siente cuidado. Limpieza impecable y la atmósfera es exactamente la que muestran.",
  },
  {
    alias: "Usuario K.",
    comment: "Volvería sin dudar. El anfitrión responde al instante y todo funciona.",
  },
  {
    alias: "Usuario A.",
    comment: "Justo lo que necesitaba para un par de horas. Acceso fácil, sin sorpresas.",
  },
];

function synthesizeReviews(seed: string, rating: number): Review[] {
  const baseDate = new Date();
  return SAMPLE_REVIEW_TEMPLATES.slice(0, 3).map((tpl, i) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - (i + 1) * 11);
    /* Vary review rating slightly around the overall, clamped to [3.5, 5]. */
    const r = Math.max(3.5, Math.min(5, rating + (i === 1 ? -0.5 : 0)));
    return {
      id: `${seed}-rv-${i + 1}`,
      alias: tpl.alias,
      rating: Math.round(r * 2) / 2,
      comment: tpl.comment,
      date: d.toISOString().slice(0, 10),
    };
  });
}

/** Build a Space-shaped object from a ListingSpace so buildPropertyDetail
 *  works uniformly. Fields not present on ListingSpace are synthesized. */
export function spaceFromListing(listing: ListingSpace): Space {
  const coords =
    AREA_COORDS[listing.area] ?? { lat: 19.4326, lng: -99.1332 };
  return {
    id: listing.id,
    title: listing.title,
    type: CATEGORY_TO_TYPE[listing.category],
    area: listing.area,
    lat: coords.lat,
    lng: coords.lng,
    instantAccess: listing.instantAccess,
    imageUrl: listing.imageUrl,
    rating: listing.rating,
    reviewCount: listing.reviewCount,
    description:
      SAMPLE_DESCRIPTIONS_BY_CATEGORY[listing.category] ??
      SAMPLE_DESCRIPTIONS_BY_CATEGORY.Todos,
    amenities: listing.amenities,
    reviews: synthesizeReviews(listing.id, listing.rating),
    stayType: "hourly",
    pricePer30m: listing.pricePer30m,
  };
}

/** Convenience: turn a ListingSpace directly into a PropertyDetail using its
 *  real host name + avatar so the host card matches the homepage card. */
export function buildPropertyDetailFromListing(
  listing: ListingSpace,
): PropertyDetail {
  return buildPropertyDetail(spaceFromListing(listing), {
    hostName: listing.hostName,
    hostAvatar: listing.hostAvatar,
  });
}
