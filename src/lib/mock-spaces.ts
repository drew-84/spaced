import type { Space } from "@/lib/types";

export type SpaceCategory =
  | "Todos"
  | "Descanso"
  | "Cocina"
  | "Oficina"
  | "Reunión"
  | "Grabación";

export const SPACE_CATEGORIES: SpaceCategory[] = [
  "Todos",
  "Descanso",
  "Cocina",
  "Oficina",
  "Reunión",
  "Grabación",
];

export type ListingSpace = {
  id: string;
  title: string;
  category: SpaceCategory;
  categoryLabel: string;
  area: string;
  hostName: string;
  hostAvatar: string;
  pricePer30m: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  instantAccess: boolean;
  amenities: string[];
};

export const listingSpaces: ListingSpace[] = [
  {
    id: "lst-001",
    title: "Cuarto de descanso · Luz cálida",
    category: "Descanso",
    categoryLabel: "Descanso",
    area: "Roma Norte",
    hostName: "Andrea M.",
    hostAvatar: "https://i.pravatar.cc/40?img=47",
    pricePer30m: 9,
    rating: 4.9,
    reviewCount: 87,
    imageUrl:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700&q=80",
    instantAccess: true,
    amenities: ["Cama Queen", "Oscurecimiento total", "Silencio garantizado", "Toallas"],
  },
  {
    id: "lst-002",
    title: "Cocina equipada · Todo incluido",
    category: "Cocina",
    categoryLabel: "Cocina",
    area: "Condesa",
    hostName: "Luis F.",
    hostAvatar: "https://i.pravatar.cc/40?img=12",
    pricePer30m: 14,
    rating: 4.7,
    reviewCount: 53,
    imageUrl:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=700&q=80",
    instantAccess: true,
    amenities: ["Estufa de gas", "Horno", "Refrigerador", "Utensilios", "Especias básicas"],
  },
  {
    id: "lst-003",
    title: "Oficina privada · Piso 12",
    category: "Oficina",
    categoryLabel: "Oficina",
    area: "Polanco",
    hostName: "Carlos V.",
    hostAvatar: "https://i.pravatar.cc/40?img=33",
    pricePer30m: 18,
    rating: 4.8,
    reviewCount: 121,
    imageUrl:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=700&q=80",
    instantAccess: true,
    amenities: ["Wi-Fi 1Gb", "Monitor 4K", "Escritorio L", "Impresora", "Café"],
  },
  {
    id: "lst-004",
    title: "Sala de reuniones · 8 personas",
    category: "Reunión",
    categoryLabel: "Reunión",
    area: "Juárez",
    hostName: "Paola R.",
    hostAvatar: "https://i.pravatar.cc/40?img=25",
    pricePer30m: 22,
    rating: 4.6,
    reviewCount: 64,
    imageUrl:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=700&q=80",
    instantAccess: false,
    amenities: ["Proyector 4K", "Pizarrón", "A/C", "8 sillas ergonómicas", "Wi-Fi"],
  },
  {
    id: "lst-005",
    title: "Estudio de grabación · Insonorizado",
    category: "Grabación",
    categoryLabel: "Grabación",
    area: "Centro Histórico",
    hostName: "Mateo S.",
    hostAvatar: "https://i.pravatar.cc/40?img=56",
    pricePer30m: 28,
    rating: 5.0,
    reviewCount: 39,
    imageUrl:
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=700&q=80",
    instantAccess: true,
    amenities: ["Micrófonos Shure", "Interfaz de audio", "Cabina vocal", "Pro Tools", "Auriculares"],
  },
  {
    id: "lst-006",
    title: "Habitación privada · Con jardín",
    category: "Descanso",
    categoryLabel: "Descanso",
    area: "Coyoacán",
    hostName: "Sara L.",
    hostAvatar: "https://i.pravatar.cc/40?img=44",
    pricePer30m: 11,
    rating: 4.5,
    reviewCount: 72,
    imageUrl:
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=700&q=80",
    instantAccess: true,
    amenities: ["Jardín privado", "Cama King", "Silencio", "Cerradura digital"],
  },
  {
    id: "lst-007",
    title: "Cocina gourmet · Clase o producción",
    category: "Cocina",
    categoryLabel: "Cocina",
    area: "Narvarte",
    hostName: "Fernanda G.",
    hostAvatar: "https://i.pravatar.cc/40?img=9",
    pricePer30m: 20,
    rating: 4.9,
    reviewCount: 48,
    imageUrl:
      "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=700&q=80",
    instantAccess: false,
    amenities: ["Isla central", "Horno profesional", "Batidora KitchenAid", "Iluminación de rodaje"],
  },
  {
    id: "lst-008",
    title: "Espacio coworking · Abierto",
    category: "Oficina",
    categoryLabel: "Oficina",
    area: "Del Valle",
    hostName: "Diego P.",
    hostAvatar: "https://i.pravatar.cc/40?img=15",
    pricePer30m: 10,
    rating: 4.4,
    reviewCount: 93,
    imageUrl:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=700&q=80",
    instantAccess: true,
    amenities: ["Wi-Fi 500Mb", "Escritorio hot-desk", "Impresora", "Café y agua"],
  },
  {
    id: "lst-009",
    title: "Sala de juntas · Formal",
    category: "Reunión",
    categoryLabel: "Reunión",
    area: "Santa Fe",
    hostName: "Rodrigo T.",
    hostAvatar: "https://i.pravatar.cc/40?img=60",
    pricePer30m: 30,
    rating: 4.8,
    reviewCount: 31,
    imageUrl:
      "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=700&q=80",
    instantAccess: false,
    amenities: ["TV 86\"", "Videoconferencia", "10 sillas ejecutivas", "Agua y café"],
  },
  {
    id: "lst-010",
    title: "Estudio podcast · Listo para grabar",
    category: "Grabación",
    categoryLabel: "Grabación",
    area: "Escandón",
    hostName: "Camila O.",
    hostAvatar: "https://i.pravatar.cc/40?img=23",
    pricePer30m: 16,
    rating: 4.7,
    reviewCount: 58,
    imageUrl:
      "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=700&q=80",
    instantAccess: true,
    amenities: ["2 micrófonos", "Mezclador", "Sala acondicionada", "Pantallas"],
  },
];

export const mockSpaces: Space[] = [
  {
    id: "space-001",
    title: "Quiet Loft - Roma Norte",
    type: "studio",
    area: "Roma Norte",
    distanceKm: 0.8,
    pricePer30m: 14,
    instantAccess: true,
    imageUrl: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&q=80",
    rating: 4.8,
    reviewCount: 124,
    description: "Loft moderno y discreto en el corazon de Roma Norte. Ambiente intimo con iluminacion ambiental, cama king size y bano privado. Acceso con codigo digital.",
    amenities: ["Wi-Fi", "Aire acondicionado", "Cama King", "Bano privado", "Cerradura digital", "Toallas"],
    reviews: [
      { id: "r1", alias: "Usuario A.", rating: 5, comment: "Increible lugar, muy limpio y discreto. Acceso super rapido.", date: "2026-03-15" },
      { id: "r2", alias: "Pareja M.", rating: 5, comment: "Perfecto para una escapada rapida. La ubicacion es ideal.", date: "2026-03-10" },
      { id: "r3", alias: "Usuario K.", rating: 4, comment: "Muy bueno, el aire acondicionado funciona perfecto. Solo faltaron amenidades extra.", date: "2026-03-05" },
    ],
  },
  {
    id: "space-002",
    title: "Private Room - Condesa",
    type: "private-room",
    area: "Condesa",
    distanceKm: 1.4,
    pricePer30m: 12,
    instantAccess: true,
    imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80",
    rating: 4.6,
    reviewCount: 89,
    description: "Habitacion privada en zona tranquila de la Condesa. Decoracion minimalista, muy limpia y con todo lo necesario para un momento de privacidad.",
    amenities: ["Wi-Fi", "Aire acondicionado", "Cama Queen", "Bano privado", "Cerradura digital"],
    reviews: [
      { id: "r4", alias: "Usuario R.", rating: 5, comment: "La mejor relacion precio-calidad. Muy comodo y privado.", date: "2026-03-18" },
      { id: "r5", alias: "Pareja J.", rating: 4, comment: "Buen lugar, tranquilo. El acceso fue inmediato.", date: "2026-03-12" },
      { id: "r6", alias: "Usuario F.", rating: 5, comment: "Repeat visitor. Siempre limpio y disponible. 10/10.", date: "2026-03-01" },
    ],
  },
  {
    id: "space-003",
    title: "1BR Apartment - Juarez",
    type: "apartment-1br",
    area: "Juarez",
    distanceKm: 2.2,
    pricePer30m: 18,
    instantAccess: true,
    imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80",
    rating: 4.9,
    reviewCount: 203,
    description: "Apartamento completo de 1 recamara con sala, cocina y bano. Ideal para quienes buscan mas espacio y comodidad. Terraza privada con vista.",
    amenities: ["Wi-Fi", "Aire acondicionado", "Cama King", "Cocina", "Terraza", "Smart TV", "Cerradura digital", "Toallas"],
    reviews: [
      { id: "r7", alias: "Pareja L.", rating: 5, comment: "El mejor espacio que hemos reservado. La terraza es un plus increible.", date: "2026-03-20" },
      { id: "r8", alias: "Usuario D.", rating: 5, comment: "Wow. Parece un Airbnb premium pero por 30 minutos. Genial concepto.", date: "2026-03-16" },
      { id: "r9", alias: "Usuario S.", rating: 4, comment: "Excelente departamento, muy amplio. Un poco lejos pero vale la pena.", date: "2026-03-08" },
    ],
  },
  {
    id: "space-004",
    title: "Suite Romantica - Polanco",
    type: "private-room",
    area: "Polanco",
    distanceKm: 3.1,
    pricePer30m: 22,
    instantAccess: true,
    imageUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80",
    rating: 4.9,
    reviewCount: 156,
    description: "Suite de lujo con jacuzzi privado e iluminacion ambiental. Decoracion romantica, sabanas de algodon egipcio y amenidades premium.",
    amenities: ["Jacuzzi", "Iluminacion ambiental", "Cama King", "Sabanas premium", "Bano de lujo", "Cerradura digital", "Champagne disponible"],
    reviews: [
      { id: "r10", alias: "Pareja V.", rating: 5, comment: "El jacuzzi lo cambia todo. Experiencia de lujo total.", date: "2026-03-19" },
      { id: "r11", alias: "Usuario G.", rating: 5, comment: "Perfecto para un aniversario express. Mi pareja quedo encantada.", date: "2026-03-14" },
      { id: "r12", alias: "Pareja B.", rating: 5, comment: "Vale cada peso. El detalle del champagne es un toque increible.", date: "2026-03-07" },
    ],
  },
  {
    id: "space-005",
    title: "Cozy Studio - Coyoacan",
    type: "studio",
    area: "Coyoacan",
    distanceKm: 4.5,
    pricePer30m: 10,
    instantAccess: false,
    imageUrl: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&q=80",
    rating: 4.3,
    reviewCount: 67,
    description: "Estudio acogedor en zona residencial de Coyoacan. Ambiente tranquilo y privado, ideal para quienes buscan algo mas relajado y economico.",
    amenities: ["Wi-Fi", "Ventilador", "Cama Double", "Bano privado", "Lockbox"],
    reviews: [
      { id: "r13", alias: "Usuario P.", rating: 4, comment: "Buena opcion economica. Limpio y funcional.", date: "2026-03-17" },
      { id: "r14", alias: "Pareja N.", rating: 5, comment: "Nos encanto la tranquilidad de la zona. Muy privado.", date: "2026-03-11" },
      { id: "r15", alias: "Usuario T.", rating: 4, comment: "Simple pero cumple. Buen precio para la zona.", date: "2026-03-03" },
    ],
  },
  {
    id: "space-006",
    title: "Penthouse View - Santa Fe",
    type: "apartment-1br",
    area: "Santa Fe",
    distanceKm: 8.2,
    pricePer30m: 28,
    instantAccess: true,
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
    rating: 5.0,
    reviewCount: 42,
    description: "Penthouse exclusivo con vista panoramica a la ciudad. Decoracion de disenador, cama premium y amenidades de hotel 5 estrellas. La experiencia mas premium de SPACED.",
    amenities: ["Vista panoramica", "Jacuzzi", "Cama King", "Smart TV 65\"", "Mini bar", "Bano doble", "Cerradura digital", "Room service disponible"],
    reviews: [
      { id: "r16", alias: "Pareja E.", rating: 5, comment: "Sin palabras. La vista de noche es espectacular. Top experience.", date: "2026-03-21" },
      { id: "r17", alias: "Usuario W.", rating: 5, comment: "Esto es otro nivel. Si pueden pagarlo, haganlo.", date: "2026-03-13" },
      { id: "r18", alias: "Pareja C.", rating: 5, comment: "Celebramos nuestro aniversario aqui. Mejor que cualquier hotel.", date: "2026-03-06" },
    ],
  },
  {
    id: "space-007",
    title: "Neon Room - Centro",
    type: "private-room",
    area: "Centro Historico",
    distanceKm: 1.8,
    pricePer30m: 15,
    instantAccess: true,
    imageUrl: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=600&q=80",
    rating: 4.7,
    reviewCount: 198,
    description: "Habitacion tematica con iluminacion neon y decoracion moderna. Muy popular entre parejas jovenes. Musica ambiental y luces RGB controlables.",
    amenities: ["Luces RGB", "Bluetooth speaker", "Cama King", "Bano privado", "Cerradura digital", "Espejo de cuerpo completo"],
    reviews: [
      { id: "r19", alias: "Pareja Z.", rating: 5, comment: "Las luces neon le dan un vibe increible. Super cool.", date: "2026-03-22" },
      { id: "r20", alias: "Usuario H.", rating: 4, comment: "Muy instagrameable y comodo. El speaker bluetooth es un gran plus.", date: "2026-03-15" },
      { id: "r21", alias: "Pareja Y.", rating: 5, comment: "Nuestro lugar favorito. Ya hemos ido 3 veces.", date: "2026-03-09" },
    ],
  },
  {
    id: "space-008",
    title: "Garden Suite - Del Valle",
    type: "studio",
    area: "Del Valle",
    distanceKm: 2.8,
    pricePer30m: 16,
    instantAccess: true,
    imageUrl: "https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?w=600&q=80",
    rating: 4.5,
    reviewCount: 93,
    description: "Estudio con jardin privado interior. Ambiente natural y relajante con plantas, fuente de agua y luz natural. Perfecto para desconectar.",
    amenities: ["Jardin privado", "Fuente de agua", "Cama Queen", "Bano privado", "Cerradura digital", "Te y cafe incluido"],
    reviews: [
      { id: "r22", alias: "Usuario Q.", rating: 5, comment: "El jardin es hermoso. Se siente como un oasis en la ciudad.", date: "2026-03-20" },
      { id: "r23", alias: "Pareja I.", rating: 4, comment: "Muy relajante. Ideal para desestresarse. El te incluido es un lindo detalle.", date: "2026-03-14" },
      { id: "r24", alias: "Usuario O.", rating: 5, comment: "Perfecto para una siesta o descanso express. Super tranquilo.", date: "2026-03-04" },
    ],
  },
];
