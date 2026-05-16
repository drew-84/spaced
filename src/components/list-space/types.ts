export type PropertyType = "studio" | "1-dormitorio";

export type DayKey = "lun" | "mar" | "mie" | "jue" | "vie" | "sab" | "dom";
export type SlotKey = "madrugada" | "manana" | "tarde" | "noche";

export type AvailabilitySlot = `${DayKey}:${SlotKey}`;

export type VideoSlot = {
  id: string;
  file: File | null;
  previewUrl: string | null;
  name: string | null;
};

export type ListSpaceFormData = {
  // Step 1 — Lo Básico
  titulo: string;
  descripcion: string;
  tipoPropiedad: PropertyType | null;

  // Step 2 — Ubicación
  direccion: string;
  comuna: string;
  ciudad: string;
  region: string;

  // Step 3 — Precio y Disponibilidad
  precioPor15Min: number | "";
  reservaMinimaMin: 45;
  disponibilidad: AvailabilitySlot[];

  // Step 4 — Videos
  videos: VideoSlot[];

  // Step 5 — Comodidades
  comodidades: string[];

  // Step 6 — Detalles
  capacidadMaxima: number;
  reglasCasa: string;

  // Step 7 — Datos de Pago
  titularCuenta: string;
  banco: string;
  numeroCuenta: string;
};

export const STEPS = [
  {
    id: 1,
    key: "basics",
    titulo: "Lo Básico",
    subtitulo: "Cuéntanos lo esencial sobre tu espacio.",
  },
  {
    id: 2,
    key: "location",
    titulo: "Ubicación",
    subtitulo: "Dónde se encuentra tu espacio.",
  },
  {
    id: 3,
    key: "pricing",
    titulo: "Precio y Disponibilidad",
    subtitulo: "Cómo y cuándo se puede reservar.",
  },
  {
    id: 4,
    key: "videos",
    titulo: "Videos",
    subtitulo: "Hasta tres clips cortos que revelen el espacio.",
  },
  {
    id: 5,
    key: "amenities",
    titulo: "Comodidades",
    subtitulo: "Lo que tu espacio ofrece.",
  },
  {
    id: 6,
    key: "details",
    titulo: "Detalles",
    subtitulo: "Capacidad y reglas del lugar.",
  },
  {
    id: 7,
    key: "payment",
    titulo: "Datos de Pago",
    subtitulo: "Dónde recibir los pagos por tus reservas.",
  },
] as const;

export const TOTAL_STEPS = STEPS.length;

export const COMODIDADES = [
  "WiFi",
  "AC",
  "Calefacción",
  "Cocina",
  "Escritorio",
  "Baño privado",
  "Baño compartido",
  "Estacionamiento",
  "Ascensor",
  "Pet-friendly",
  "Fumar permitido",
  "Sistema de audio",
  "Proyector/TV",
  "Luz natural",
  "Cortinas blackout",
] as const;

export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "studio", label: "Studio" },
  { value: "1-dormitorio", label: "1 Dormitorio" },
];

export const BANCOS = [
  "Banco de Chile",
  "BancoEstado",
  "Santander",
  "BCI",
  "Itaú",
  "Scotiabank",
  "Banco Falabella",
  "Banco Security",
  "Banco Ripley",
  "Otro",
];

export const DAYS: { key: DayKey; label: string }[] = [
  { key: "lun", label: "Lun" },
  { key: "mar", label: "Mar" },
  { key: "mie", label: "Mié" },
  { key: "jue", label: "Jue" },
  { key: "vie", label: "Vie" },
  { key: "sab", label: "Sáb" },
  { key: "dom", label: "Dom" },
];

export const SLOTS: { key: SlotKey; label: string; range: string }[] = [
  { key: "madrugada", label: "Madrugada", range: "00–06" },
  { key: "manana", label: "Mañana", range: "06–12" },
  { key: "tarde", label: "Tarde", range: "12–18" },
  { key: "noche", label: "Noche", range: "18–24" },
];

export const INITIAL_DATA: ListSpaceFormData = {
  titulo: "",
  descripcion: "",
  tipoPropiedad: null,
  direccion: "",
  comuna: "",
  ciudad: "Santiago",
  region: "Región Metropolitana",
  precioPor15Min: "",
  reservaMinimaMin: 45,
  disponibilidad: [],
  videos: [
    { id: "v1", file: null, previewUrl: null, name: null },
    { id: "v2", file: null, previewUrl: null, name: null },
    { id: "v3", file: null, previewUrl: null, name: null },
  ],
  comodidades: [],
  capacidadMaxima: 4,
  reglasCasa: "",
  titularCuenta: "",
  banco: "",
  numeroCuenta: "",
};

export type StepErrors = Partial<Record<keyof ListSpaceFormData, string>>;
