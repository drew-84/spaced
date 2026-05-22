"use client";

import { type DragEvent, useRef, useState } from "react";
import { STATUS_DOT, TEXT_BODY, TEXT_HINT } from "@/styles/glass";
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
        <p className={`text-sm leading-relaxed ${TEXT_BODY}`}>
          Sube hasta 3 mini clips. Mejor si revelan textura, luz y sonido del
          lugar.
        </p>
        <span className={`shrink-0 ${TEXT_HINT}`}>{filledCount}/3</span>
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
                "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
                "backdrop-blur-xl",
                filled
                  ? "border-white/30 bg-white/[0.05] shadow-[0_22px_46px_rgba(0,0,0,0.36),0_0_30px_-6px_rgba(255,255,255,0.4),inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-18px_36px_rgba(3,8,18,0.3)]"
                  : dragging
                    ? "border-white/45 bg-white/[0.08] shadow-[0_0_42px_-6px_rgba(255,255,255,0.55),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-18px_36px_rgba(3,8,18,0.3)]"
                    : "border-white/15 bg-white/[0.025] shadow-[0_14px_30px_rgba(0,0,0,0.26),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-16px_30px_rgba(3,8,18,0.24)] hover:border-white/40 hover:bg-white/[0.05] hover:shadow-[0_22px_50px_rgba(0,0,0,0.36),0_0_42px_-8px_rgba(255,255,255,0.5),inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-18px_36px_rgba(3,8,18,0.3)]",
              ].join(" ")}
            >
              {/* Soft aura — white instead of cyan tint */}
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
                    "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,255,255,0.12), transparent 65%), radial-gradient(ellipse 50% 38% at 50% 100%, rgba(255,255,255,0.1), transparent 70%)",
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
                    <span className={STATUS_DOT} />
                    <span className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.42em] text-white [text-shadow:0_0_14px_rgba(255,255,255,0.4)]">
                      Clip {idx + 1}
                    </span>
                    <span className={TEXT_HINT}>Click o arrastra aquí</span>
                  </>
                ) : (
                  <span className="mt-auto pb-2 text-[10px] font-medium uppercase tracking-[0.34em] text-white [text-shadow:0_0_14px_rgba(255,255,255,0.55)]">
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
                  className="absolute right-3 top-3 z-20 rounded-full border border-white/20 bg-black/45 px-2.5 py-1 text-[9px] uppercase tracking-[0.26em] text-white/80 backdrop-blur-md transition-colors duration-300 ease-out hover:border-white/40 hover:text-white"
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
