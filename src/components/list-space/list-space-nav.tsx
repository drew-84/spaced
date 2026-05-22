"use client";

import {
  CTA_GHOST,
  CTA_PRIMARY,
  CTA_SECONDARY,
  TEXT_HINT,
} from "@/styles/glass";

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
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
      <div className="flex items-center gap-3">
        {current > 1 ? (
          <button type="button" onClick={onBack} className={CTA_SECONDARY}>
            ← Atrás
          </button>
        ) : (
          <span className="invisible">spacer</span>
        )}
        {savedAt && (
          <span className={TEXT_HINT}>
            Borrador guardado ·{" "}
            {savedAt.toLocaleTimeString("es-CL", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={onSaveDraft} className={CTA_GHOST}>
          Guardar borrador
        </button>
        {isLast ? (
          <button type="button" onClick={onPublish} className={CTA_PRIMARY}>
            Publicar
          </button>
        ) : (
          <button type="button" onClick={onNext} className={CTA_PRIMARY}>
            Siguiente →
          </button>
        )}
      </div>
    </div>
  );
}
