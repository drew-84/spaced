/**
 * SPACED — Shared glass styling system
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Single source of truth for the dark-glass UI language used across the
 * homepage, OfferScreen (/ofrecer), Property Detail (/spaces/[id]), and
 * Booking modal.
 *
 * COLOR CONTRACT — 7-tier opacity hierarchy
 *   All text is pure bright white (#FFFFFF). Visual hierarchy is expressed
 *   exclusively through opacity:
 *       • Primary headlines (page titles, hero text, main H1s) ......... 95%
 *       • Secondary headlines (H2s, subsection titles, prices) ......... 80%
 *       • Body text (descriptions, paragraphs, longer text) ............ 70%
 *       • Section labels (small uppercase tracking-wide labels) ........ 60%
 *       • Meta info (counters, timestamps, tags, auxiliary text) ....... 50%
 *       • Placeholder text in input fields ............................. 35%
 *       • Inactive / disabled states ................................... 25%
 *
 *   Interactive elements (pills, links, ghost buttons) stay at their
 *   hierarchy-appropriate opacity at rest and brighten to full 100% white
 *   on hover/focus/active with a smooth 200–300 ms ease.
 *
 *   Borders: subtle white at 10/15% at rest, 30/40% when active/focused.
 *
 * STRUCTURAL TOKENS (preserved verbatim from existing OfferScreen +
 * BookingModal so layouts stay pixel-stable):
 *   - backdrop-blur values: md / xl / 2xl
 *   - border-radius family: rounded-2xl, [22px], [28px], [32px], asym
 *   - layered shadow recipe with inset top/bottom highlights
 */

/* ────────────────────────── PANELS & TILES ─────────────────────────── */

/** Modal outer shell (asymmetric radius + ambient drop shadow + radial mask).
 *  Used by OfferScreen and BookingModal as their outermost glass surface. */
export const GLASS_PANEL_OUTER = [
  "border border-white/10 border-b-transparent border-r-transparent",
  "bg-[#07101d]/58",
  "shadow-[34px_42px_120px_rgba(0,0,0,0.62),inset_0_1px_0_rgba(255,255,255,0.12)]",
  "backdrop-blur-2xl",
].join(" ");

/** Mask used on the outer modal panel to fade its edges into the ambient. */
export const GLASS_PANEL_OUTER_MASK =
  "radial-gradient(ellipse 112% 92% at 24% 42%, black 0%, black 60%, rgba(0,0,0,0.86) 78%, rgba(0,0,0,0.38) 92%, transparent 100%)";

/** Inner glass card — used for the right form panel in OfferScreen, the
 *  video gallery frame, the map frame, etc. */
export const GLASS_PANEL = [
  "rounded-[28px] border border-white/15 bg-white/[0.04]",
  "shadow-[0_28px_80px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-28px_70px_rgba(2,6,16,0.32)]",
  "backdrop-blur-xl",
].join(" ");

/** Soft glass panel — used for description / rules / collapsed host card. */
export const GLASS_PANEL_SOFT = [
  "rounded-[24px] border border-white/10 bg-white/[0.035]",
  "shadow-[0_22px_60px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-22px_50px_rgba(2,6,16,0.3)]",
  "backdrop-blur-xl",
].join(" ");

/** Stat tile — used for the 4-tile key-info row, summary tiles in the
 *  booking modal, "stat" cards inside the OfferScreen. */
export const GLASS_TILE = [
  "rounded-[22px] border border-white/15 bg-white/[0.05]",
  "shadow-[0_16px_34px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-14px_26px_rgba(3,8,18,0.28)]",
  "backdrop-blur-md",
].join(" ");

/** Top-edge rim highlight — drop as an absolutely-positioned span inside
 *  any glass panel to give the floating-glass-pill effect. */
export const RIM_HIGHLIGHT_TOP =
  "pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent";

/* ────────────────────────── SCRIM & AMBIENT ────────────────────────── */

/** Click-through scrim behind modals. */
export const SCRIM = "bg-[#02050d]/65 backdrop-blur-[6px]";

/** Ambient radial wash placed behind a modal (inline `style.background`). */
export const MODAL_AMBIENT_BG =
  "radial-gradient(ellipse 70% 48% at 54% 28%, rgba(72,132,220,0.18), transparent 62%), radial-gradient(circle at 18% 76%, rgba(80,120,210,0.12), transparent 36%), linear-gradient(to bottom, rgba(2,5,13,0.05), rgba(2,5,13,0.46))";

/** Ambient backdrop for full pages (OfferScreen, PropertyDetail). */
export const PAGE_AMBIENT_BG =
  "radial-gradient(ellipse 70% 48% at 54% 18%, rgba(72,132,220,0.18), transparent 62%), radial-gradient(circle at 14% 84%, rgba(80,120,210,0.14), transparent 38%), radial-gradient(circle at 88% 32%, rgba(70,120,200,0.1), transparent 42%), linear-gradient(to bottom, rgba(2,5,13,0.05), rgba(2,5,13,0.55))";

/** Diagonal shimmer overlay used on top of the page ambient. */
export const PAGE_AMBIENT_SHIMMER =
  "opacity-[0.32] [background:repeating-linear-gradient(122deg,rgba(255,255,255,0.018)_0px,rgba(255,255,255,0.018)_1px,transparent_1px,transparent_64px)]";

/* ────────────────────────── TYPOGRAPHY TOKENS ────────────────────── */

/* New camelCase opacity tokens — drop these directly onto any element to
 * place it on the correct rung of the 7-tier hierarchy. */

/** Primary headlines — page titles, hero text, main H1s (95%). */
export const textPrimary = "text-white/95";

/** Secondary headlines — H2s, subsection titles, prices, key values (80%). */
export const textSecondary = "text-white/80";

/** Body text — descriptions, paragraphs, longer-form copy (70%). */
export const textBody = "text-white/70";

/** Section labels — small uppercase tracking-wide labels (60%). */
export const textLabel = "text-white/60";

/** Meta info — counters, timestamps, tags, auxiliary text (50%). */
export const textMeta = "text-white/50";

/** Placeholder text inside input fields (35%). */
export const textPlaceholder = "text-white/35";

/** Inactive / disabled state (25%). */
export const textInactive = "text-white/25";

/* Legacy UPPER_CASE tokens — kept for back-compat with existing imports.
 * Each is now anchored to the 7-tier scale above so the whole app
 * inherits the new hierarchy automatically. */

/** Big heading — uppercase, wide tracking (primary tier, 95%). */
export const TEXT_HEADING =
  "text-white/95 font-medium uppercase tracking-widest";

/** Section eyebrow — uppercase, very wide tracking, label tier (60%). */
export const TEXT_EYEBROW =
  "text-[10px] font-medium uppercase tracking-[0.42em] text-white/60";

/** Smaller eyebrow used inside dense forms — label tier (60%). */
export const TEXT_EYEBROW_SM =
  "text-[10px] uppercase tracking-[0.32em] text-white/60";

/** Field label — same family as eyebrow, label tier (60%). */
export const TEXT_LABEL =
  "text-[10px] uppercase tracking-[0.32em] text-white/60";

/** Body paragraph copy — body tier (70%). Uses font-normal so the
 *  strokes carry enough optical mass to read as white on dark glass. */
export const TEXT_BODY =
  "text-white/70 font-normal tracking-[0.04em]";

/** Secondary body — alias of TEXT_BODY kept for back-compat. */
export const TEXT_BODY_DIM =
  "text-white/70 font-normal tracking-[0.04em]";

/** Hint / counter / footnote — meta tier (50%). */
export const TEXT_HINT =
  "text-[9px] uppercase tracking-[0.26em] text-white/50";

/** Inline metadata — meta tier (50%). */
export const TEXT_META =
  "text-[10px] uppercase tracking-[0.22em] text-white/50";

/* ────────────────────────── TRANSITIONS ────────────────────────────── */

/** Standard interactive transition (300 ms ease-out, respects reduced motion). */
export const TRANSITION_INTERACTIVE =
  "transition-all duration-300 ease-out motion-reduce:transition-none";

/** Color-only transition for ghost/link affordances. */
export const TRANSITION_COLOR =
  "transition-colors duration-300 ease-out motion-reduce:transition-none";

/** Slower fluid swap used between tabs / steps. */
export const TRANSITION_FLUID =
  "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none";

/* ────────────────────────── FOCUS RINGS ────────────────────────────── */

/** Standard keyboard focus ring (white/40, 1px) shared across interactives.
 *  This is the same ring baked into CTA_SECONDARY / CTA_GHOST / PILL_BASE. */
export const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40";

/** Focus ring + offset for cards sitting on the homepage grid surface.
 *  The offset color matches SURFACE_GRID so the ring reads cleanly. */
export const FOCUS_RING_CARD =
  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06070a]";

/* ────────────────────────── PILL BUTTONS ───────────────────────────── */

/** Base classes shared by every pill toggle / chip. */
export const PILL_BASE = [
  "inline-flex items-center justify-center rounded-full border",
  "px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.22em]",
  "backdrop-blur-md outline-none",
  "transition-all duration-300 ease-out motion-reduce:transition-none",
  "focus-visible:ring-1 focus-visible:ring-white/40",
].join(" ");

/** Inactive (rest) pill — label tier (60%), brightens to full white on hover. */
export const PILL_REST = [
  "border-white/20 bg-white/[0.04] text-white/60",
  "shadow-[0_10px_24px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.1)]",
  "hover:border-white/40 hover:bg-white/[0.08] hover:text-white",
  "hover:shadow-[0_14px_28px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.16),0_0_18px_rgba(255,255,255,0.18)]",
].join(" ");

/** Active (selected) pill — primary tier (95%), stronger border, brighter fill. */
export const PILL_ACTIVE = [
  "border-white/40 bg-white/[0.14] text-white/95",
  "shadow-[0_14px_34px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-14px_28px_rgba(8,18,34,0.34),0_0_22px_rgba(255,255,255,0.22)]",
].join(" ");

/** Convenience: full class string for a pill given its active state. */
export function pillClass(isActive: boolean): string {
  return `${PILL_BASE} ${isActive ? PILL_ACTIVE : PILL_REST}`;
}

/** Display-only pill (informational, never interactive — e.g. amenity list).
 *  Label tier (60%) since it carries the same label-class info as a chip. */
export const PILL_DISPLAY = [
  "inline-flex items-center rounded-full border border-white/25 bg-white/[0.08]",
  "px-3.5 py-2 text-[10px] font-medium uppercase tracking-[0.22em] text-white/60",
  "shadow-[0_12px_28px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-12px_24px_rgba(8,18,34,0.3)]",
  "backdrop-blur-md",
].join(" ");

/* ────────────────────────── INPUT FIELDS ───────────────────────────── */

/** Outer wrapper for text/textarea/number/select — focus-within reacts. */
export const INPUT_WRAP = [
  "rounded-2xl border border-white/10 bg-white/[0.04]",
  "shadow-[0_16px_34px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-14px_26px_rgba(3,8,18,0.28)]",
  "backdrop-blur-md",
  "transition-all duration-300 ease-out motion-reduce:transition-none",
  /* Focus state: brighter border, soft inner glow, no color tint */
  "focus-within:border-white/40 focus-within:bg-white/[0.06]",
  "focus-within:shadow-[0_18px_38px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-16px_30px_rgba(3,8,18,0.32),0_0_24px_-6px_rgba(255,255,255,0.4)]",
].join(" ");

/** Inner <input>/<textarea>/<select> — filled value at primary tier (95%),
 *  placeholder at 35%. Uses font-normal so the white reads crisp. */
export const INPUT_INNER = [
  "block w-full bg-transparent text-sm font-normal tracking-[0.04em] text-white/95",
  "placeholder:text-white/35 outline-none",
].join(" ");

/** Error variant of INPUT_WRAP — warm amber border + amber glow. No
 *  focus-within override so the error tone persists while the user fixes
 *  the field. Pair with INPUT_INNER for the inner control. */
export const INPUT_WRAP_ERROR = [
  "rounded-2xl border border-amber-200/45 bg-white/[0.04]",
  "shadow-[0_16px_34px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-14px_26px_rgba(3,8,18,0.28),0_0_24px_-4px_rgba(252,211,77,0.4)]",
  "backdrop-blur-md",
  "transition-all duration-300 ease-out motion-reduce:transition-none",
].join(" ");

/** Pill-shaped field container — same glass tone as INPUT_WRAP but a
 *  full-radius pill that can house several inline regions (e.g. a country
 *  selector + number input sharing one border). focus-within lights up. */
export const FIELD_PILL = [
  "relative flex items-stretch rounded-full border border-white/10 bg-white/[0.04]",
  "shadow-[0_16px_34px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-14px_26px_rgba(3,8,18,0.28)]",
  "backdrop-blur-md transition-all duration-300 ease-out motion-reduce:transition-none",
  "focus-within:border-white/40 focus-within:bg-white/[0.06]",
  "focus-within:shadow-[0_18px_38px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-16px_30px_rgba(3,8,18,0.32),0_0_24px_-6px_rgba(255,255,255,0.4)]",
].join(" ");

/** Error variant of FIELD_PILL — warm amber border + amber glow. */
export const FIELD_PILL_ERROR = [
  "relative flex items-stretch rounded-full border border-amber-200/45 bg-white/[0.04]",
  "shadow-[0_16px_34px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-14px_26px_rgba(3,8,18,0.28),0_0_24px_-4px_rgba(252,211,77,0.4)]",
  "backdrop-blur-md transition-all duration-300 ease-out motion-reduce:transition-none",
].join(" ");

/** Thin vertical hairline used to separate inline regions inside a pill. */
export const DIVIDER_VERTICAL = "w-px self-stretch bg-white/10";

/** Label sitting above an input. */
export const FIELD_LABEL = TEXT_LABEL;

/** Error text under an input — rose tier, used by the booking + list-space
 *  forms. */
export const FIELD_ERROR =
  "mt-1.5 text-[10px] uppercase tracking-[0.22em] text-rose-200/80";

/** Error caption in the KYC flow — warm amber to match the amber field
 *  borders used during identity verification. Pairs with the amber border
 *  treatment (INPUT_WRAP_ERROR / FIELD_PILL_ERROR) for "what you typed is
 *  wrong" states. */
export const FIELD_ERROR_AMBER =
  "mt-2.5 px-2 text-[11px] font-medium uppercase tracking-[0.22em] text-amber-200/85";

/** Hint caption in the KYC flow — IDENTICAL typography to FIELD_ERROR_AMBER
 *  (same size, weight, uppercase, tracking) so all field messages read as one
 *  family. The ONLY differences are color intensity (lower amber opacity) and
 *  that the field carries NO amber border. Reads as a gentle "you still need
 *  to do this" nudge for empty-but-touched fields rather than an alarm. */
export const FIELD_HINT =
  "mt-2.5 px-2 text-[11px] font-medium uppercase tracking-[0.22em] text-amber-200/60";

/* ────────────────────────── CTAs / BUTTONS ─────────────────────────── */

/** Primary CTA — "Reservar", "Publicar", "Siguiente". Primary tier (95%). */
export const CTA_PRIMARY = [
  "rounded-full border border-white/30 bg-white/[0.14] px-5 py-3",
  "text-[11px] font-medium uppercase tracking-[0.34em] text-white/95",
  "shadow-[0_18px_38px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-16px_32px_rgba(8,18,34,0.32),0_0_30px_-6px_rgba(255,255,255,0.4)]",
  "backdrop-blur-md",
  "transition-all duration-300 ease-out motion-reduce:transition-none",
  "hover:border-white/50 hover:bg-white/[0.2] hover:text-white",
  "hover:shadow-[0_22px_42px_rgba(0,0,0,0.36),inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-16px_32px_rgba(8,18,34,0.32),0_0_42px_-4px_rgba(255,255,255,0.55)]",
  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50",
  "disabled:cursor-not-allowed disabled:opacity-40",
].join(" ");

/** Secondary CTA — "Atrás", "Cerrar" pill. Label tier (60%), brightens on hover. */
export const CTA_SECONDARY = [
  "rounded-full border border-white/15 bg-white/[0.04] px-4 py-2.5",
  "text-[10px] uppercase tracking-[0.26em] text-white/60",
  "shadow-[0_10px_24px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.1)]",
  "backdrop-blur-md",
  "transition-all duration-300 ease-out motion-reduce:transition-none",
  "hover:border-white/40 hover:bg-white/[0.08] hover:text-white",
  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40",
].join(" ");

/** Ghost button — "Guardar borrador", "Cancelar". Label tier (60%), brightens on hover. */
export const CTA_GHOST = [
  "rounded-full border border-transparent px-4 py-2.5",
  "text-[10px] uppercase tracking-[0.26em] text-white/60",
  "transition-colors duration-300 ease-out motion-reduce:transition-none",
  "hover:text-white",
  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40",
].join(" ");

/* ────────────────────────── PROGRESS BAR ───────────────────────────── */

export const PROGRESS_TRACK =
  "relative h-px overflow-hidden rounded-full bg-white/10";

export const PROGRESS_FILL =
  "absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-white/40 via-white/90 to-white/40 shadow-[0_0_18px_rgba(255,255,255,0.55)] transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]";

/** Step legend typography (no color) — pair with an opacity tier token so
 *  the active step can sit brighter than the rest. Used beside the KYC
 *  progress bar. */
export const STEP_LEGEND_TYPE =
  "text-[9px] font-medium uppercase tracking-[0.24em]";

/** Flag chip skin — clips the SVG flag to a small rounded rectangle with a
 *  hairline ring so it reads as a crisp badge on dark glass. Pair with an
 *  explicit width/height (e.g. `h-3.5 w-5`). */
export const FLAG_CHIP =
  "shrink-0 overflow-hidden rounded-[3px] shadow-[0_0_0_1px_rgba(255,255,255,0.14)]";

/* ────────────────────────── GLOWS & ACCENTS ────────────────────────── */

/** Soft white hover glow used on upload zones and selectable cards. */
export const HOVER_GLOW_SOFT =
  "hover:shadow-[0_22px_50px_rgba(0,0,0,0.36),0_0_42px_-8px_rgba(255,255,255,0.45),inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-18px_36px_rgba(3,8,18,0.3)]";

/** Active-state white glow used on selected cards / focused upload zones. */
export const ACTIVE_GLOW =
  "shadow-[0_22px_46px_rgba(0,0,0,0.36),0_0_30px_-6px_rgba(255,255,255,0.5),inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-18px_36px_rgba(3,8,18,0.3)]";

/** Tiny dot used as a status indicator (active item, signal, etc.). */
export const STATUS_DOT =
  "h-2 w-2 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.85)]";

/** Small status dot — sibling of STATUS_DOT for tighter overlays/badges. */
export const STATUS_DOT_SM =
  "h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.95)]";

/* ────────────────────────── SURFACES (raw palette) ─────────────────── */

/** Opaque media-card surface (slightly lifted from the page/grid bg). */
export const SURFACE_CARD = "bg-[#0e1016]";

/** Homepage property-grid section background. */
export const SURFACE_GRID = "bg-[#06070a]";

/* ──────────────────── IMAGE-OVERLAY / MEDIA CARDS ──────────────────── */

/** Opaque media-card shell — hairline border, lift + soft glow on hover.
 *  Pair with structural classes (flex / overflow-hidden / rounded) on the
 *  element; this token owns the themeable border / surface / hover skin. */
export const CARD_MEDIA = [
  "border border-white/10 bg-[#0e1016]",
  "transition-all duration-300 ease-out motion-reduce:transition-none",
  "hover:-translate-y-0.5 hover:border-white/30",
  "hover:shadow-[0_22px_50px_rgba(0,0,0,0.36),0_0_30px_-10px_rgba(255,255,255,0.25)]",
].join(" ");

/** Very light top + bottom darkening over card media so overlaid text
 *  stays legible on any image. Apply as an inline `style.background`. */
export const CARD_MEDIA_SCRIM =
  "linear-gradient(to bottom, rgba(0,0,0,0.42) 0%, transparent 24%, transparent 70%, rgba(0,0,0,0.5) 100%)";

/** Drop-shadow for white text sitting over imagery (inline `style.textShadow`). */
export const OVERLAY_TEXT_SHADOW = "0 1px 8px rgba(0,0,0,0.7)";

/** Overlay text at rest (75%) — brightens to full white on card hover. */
export const OVERLAY_TEXT_REST =
  "text-white opacity-75 transition-opacity duration-[250ms] ease-out group-hover:opacity-100 motion-reduce:transition-none";

/** Overlay text pinned bright — used when a card is the actively-viewed one. */
export const OVERLAY_TEXT_ACTIVE =
  "text-white opacity-100 transition-opacity duration-[250ms] ease-out motion-reduce:transition-none";

/** Dark translucent pill floating over card media (category tag, badge). */
export const OVERLAY_PILL =
  "inline-flex items-center rounded-full border border-white/25 bg-black/45 backdrop-blur-md";

/** Category-tag label typography for media overlays. */
export const OVERLAY_LABEL =
  "text-[10px] font-semibold uppercase tracking-[0.24em]";

/** Smaller overlay label typography (instant-access badge). */
export const OVERLAY_LABEL_SM =
  "text-[9px] font-semibold uppercase tracking-[0.2em]";

/** Emoji/icon sizing inside an overlay pill. */
export const OVERLAY_ICON = "text-[11px] leading-none";

/** Overlay info line (neighborhood, distance) — secondary weight. */
export const OVERLAY_INFO = "text-[12px] font-medium";

/** Inline star glyph row in a card overlay. */
export const OVERLAY_RATING_STARS = "text-[11px] leading-none tracking-[0.08em]";

/** Numeric rating value in a card overlay. */
export const OVERLAY_RATING_VALUE = "text-[12px] font-semibold leading-none";

/** Card body title — secondary tier (80%, per the heading/price contract). */
export const CARD_TITLE =
  "text-[14px] font-semibold leading-snug text-white/80";

/** Display-only amenity chip inside a card body. */
export const CARD_AMENITY_CHIP =
  "rounded-md border border-white/15 bg-white/[0.04] px-2 py-0.5 text-[9px] font-medium text-white/50";

/** Card price value — secondary tier (80%, prices per the contract). */
export const CARD_PRICE = "text-[15px] font-bold text-white/80";

/** Card price unit suffix — meta tier (50%). */
export const CARD_PRICE_UNIT = "text-[11px] text-white/50";

/** Hairline top divider (e.g. above a card's price row). */
export const DIVIDER_TOP = "border-t border-white/10";
