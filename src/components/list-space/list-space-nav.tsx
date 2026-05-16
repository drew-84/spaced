"use client";

type Props = {
  current: number;
  total: number;
  onBack: () => void;
  onNext: () => void;
  onPublish: () => void;
  onSaveDraft: () => void;
  savedAt?: Date | null;
};

export function ListSpaceNav({
  current,
  total,
  onBack,
  onNext,
  onPublish,
  onSaveDraft,
  savedAt,
}: Props) {
  const isLast = current === total;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-5">
      <div className="flex items-center gap-3">
        {current > 1 ? (
          <button
            type="button"
            onClick={onBack}
            /* Style mirrors the modal "cerrar" button: same border, bg, shadow, padding language */
            className="rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-[10px] uppercase tracking-[0.26em] text-white/55 shadow-[0_10px_24px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md transition-[transform,border-color,color,background-color] hover:border-sky-200/25 hover:bg-white/[0.06] hover:text-sky-100/85"
          >
            ← Atrás
          </button>
        ) : (
          <span className="invisible">spacer</span>
        )}
        {savedAt && (
          <span className="text-[9px] uppercase tracking-[0.28em] text-white/30">
            Borrador guardado ·{" "}
            {savedAt.toLocaleTimeString("es-CL", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onSaveDraft}
          className="rounded-full border border-transparent px-4 py-2.5 text-[10px] uppercase tracking-[0.26em] text-white/45 transition-colors duration-200 hover:text-sky-100/80"
        >
          Guardar borrador
        </button>
        {isLast ? (
          <button
            type="button"
            onClick={onPublish}
            /* Mirrors the modal "emitir senal" CTA with stronger glow for the publish climax */
            className="rounded-full border border-sky-100/35 bg-sky-100/[0.14] px-6 py-3 text-[11px] font-medium uppercase tracking-[0.34em] text-sky-50 shadow-[0_18px_38px_rgba(0,0,0,0.34),0_0_30px_-6px_rgba(96,165,250,0.55),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-16px_32px_rgba(8,18,34,0.32)] backdrop-blur-md transition-[transform,border-color,background-color,box-shadow] duration-200 hover:border-sky-100/55 hover:bg-sky-100/[0.18]"
          >
            Publicar
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            /* Mirrors the modal "emitir senal" CTA exactly */
            className="rounded-full border border-sky-100/30 bg-sky-100/[0.11] px-6 py-3 text-[11px] font-medium uppercase tracking-[0.34em] text-sky-50 shadow-[0_18px_38px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-16px_32px_rgba(8,18,34,0.32)] backdrop-blur-md transition-[transform,border-color,background-color] duration-200 hover:border-sky-100/45 hover:bg-sky-100/[0.15]"
          >
            Siguiente →
          </button>
        )}
      </div>
    </div>
  );
}
