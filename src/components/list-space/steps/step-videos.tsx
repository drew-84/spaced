"use client";

import { type DragEvent, useRef, useState } from "react";
import type { ListSpaceFormData } from "../types";

type Props = {
  data: ListSpaceFormData;
  onChange: <K extends keyof ListSpaceFormData>(
    key: K,
    value: ListSpaceFormData[K],
  ) => void;
};

export function StepVideos({ data, onChange }: Props) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [activeDrag, setActiveDrag] = useState<number | null>(null);

  function setVideoAt(idx: number, file: File | null) {
    const next = data.videos.map((v, i) => {
      if (i !== idx) return v;
      if (v.previewUrl) URL.revokeObjectURL(v.previewUrl);
      return {
        ...v,
        file,
        previewUrl: file ? URL.createObjectURL(file) : null,
        name: file ? file.name : null,
      };
    });
    onChange("videos", next);
  }

  function handleFiles(idx: number, files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = Array.from(files).find((f) => f.type.startsWith("video/"));
    if (!file) return;
    setVideoAt(idx, file);
  }

  const filledCount = data.videos.filter((v) => v.file).length;

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-light leading-relaxed tracking-[0.04em] text-white/45">
          Sube hasta 3 mini clips. Mejor si revelan textura, luz y sonido del
          lugar.
        </p>
        <span className="shrink-0 text-[9px] uppercase tracking-[0.28em] text-white/30">
          {filledCount}/3
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {data.videos.map((v, idx) => {
          const filled = Boolean(v.file);
          const dragging = activeDrag === idx;
          return (
            <div
              key={v.id}
              onDragOver={(e: DragEvent<HTMLDivElement>) => {
                e.preventDefault();
                setActiveDrag(idx);
              }}
              onDragLeave={() => setActiveDrag(null)}
              onDrop={(e: DragEvent<HTMLDivElement>) => {
                e.preventDefault();
                setActiveDrag(null);
                handleFiles(idx, e.dataTransfer.files);
              }}
              className={[
                "group relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-[28px] border text-center",
                "transition-[border-color,background-color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                "backdrop-blur-xl",
                filled
                  ? "border-sky-100/30 bg-white/[0.04] shadow-[0_22px_46px_rgba(0,0,0,0.36),0_0_30px_-6px_rgba(96,165,250,0.4),inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-18px_36px_rgba(3,8,18,0.3)]"
                  : dragging
                    ? "border-sky-100/55 bg-sky-100/[0.07] shadow-[0_0_42px_-6px_rgba(96,165,250,0.6),inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-18px_36px_rgba(3,8,18,0.3)]"
                    : "border-white/[0.06] bg-white/[0.012] shadow-[0_14px_30px_rgba(0,0,0,0.26),inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-16px_30px_rgba(3,8,18,0.24)] hover:border-sky-100/35 hover:bg-white/[0.04] hover:shadow-[0_22px_50px_rgba(0,0,0,0.36),0_0_42px_-8px_rgba(96,165,250,0.55),inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-18px_36px_rgba(3,8,18,0.3)]",
              ].join(" ")}
            >
              {/* Soft aura — like the signal-zone-diffusion in the modal */}
              <span
                aria-hidden
                className={[
                  "pointer-events-none absolute inset-0 transition-opacity duration-500",
                  filled || dragging
                    ? "opacity-100"
                    : "opacity-55 group-hover:opacity-100",
                ].join(" ")}
                style={{
                  background:
                    "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(186,230,253,0.14), transparent 65%), radial-gradient(ellipse 50% 38% at 50% 100%, rgba(72,132,220,0.16), transparent 70%)",
                }}
              />
              {/* Top rim highlight */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />

              {filled && v.previewUrl && (
                <video
                  src={v.previewUrl}
                  className="absolute inset-0 h-full w-full object-cover opacity-70 transition-opacity duration-500 group-hover:opacity-90"
                  muted
                  playsInline
                  loop
                  autoPlay
                />
              )}
              {filled && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"
                />
              )}

              <input
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="file"
                accept="video/*"
                className="sr-only"
                onChange={(e) => {
                  handleFiles(idx, e.target.files);
                  e.target.value = "";
                }}
              />

              <button
                type="button"
                onClick={() => inputRefs.current[idx]?.click()}
                aria-label={
                  filled
                    ? `Cambiar clip ${idx + 1}`
                    : `Subir clip ${idx + 1}`
                }
                className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-2 px-4 py-6 outline-none"
              >
                {!filled ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-sky-100/85 shadow-[0_0_14px_rgba(140,190,255,0.85)]" />
                    <span className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.42em] text-sky-100/80 [text-shadow:0_0_14px_rgba(140,185,255,0.42)]">
                      Clip {idx + 1}
                    </span>
                    <span className="text-[9px] uppercase tracking-[0.28em] text-white/35">
                      Click o arrastra aquí
                    </span>
                  </>
                ) : (
                  <span className="mt-auto pb-2 text-[10px] font-medium uppercase tracking-[0.34em] text-sky-50 [text-shadow:0_0_14px_rgba(140,190,255,0.7)]">
                    Cambiar clip
                  </span>
                )}
              </button>

              {filled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setVideoAt(idx, null);
                  }}
                  className="absolute right-3 top-3 z-20 rounded-full border border-white/[0.12] bg-black/45 px-2.5 py-1 text-[9px] uppercase tracking-[0.26em] text-white/65 backdrop-blur-md transition-[border-color,color] duration-200 hover:border-sky-100/35 hover:text-sky-100/85"
                >
                  Quitar
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
