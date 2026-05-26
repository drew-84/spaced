"use client";

import { useEffect, useRef, useState } from "react";
import { textBody, textLabel } from "@/styles/glass";

/**
 * SPACED — KYC Step 4: ID upload (front + back, same screen)
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Two side-by-side glass drop zones, one for the FRENTE and one for the
 * REVERSO of the user's cédula. The uploaded images are kept as data
 * URLs in parent state so navigating back to Step 3 and forward again
 * preserves them. CONTINUAR is disabled until both zones are filled.
 *
 * Each zone supports three input affordances:
 *   • Click → hidden file input  (desktop + mobile)
 *   • Drag and drop              (desktop only)
 *   • Camera capture             (mobile — `capture="environment"`)
 */

/* ─── Tuning ──────────────────────────────────────────────────────────── */
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ERROR_AUTOCLEAR_MS = 3500;

type Side = "front" | "back";

type StepIdProps = {
  idFront: string | null;
  idBack: string | null;
  onIdFrontChange: (dataUrl: string | null) => void;
  onIdBackChange: (dataUrl: string | null) => void;
  /** Fires when both sides are uploaded and CONTINUAR is clicked. */
  onSubmit: () => void;
  onBack: () => void;
};

export function StepId({
  idFront,
  idBack,
  onIdFrontChange,
  onIdBackChange,
  onSubmit,
  onBack,
}: StepIdProps) {
  /* The two zones report file errors back through this single channel
     so we can show one inline message under the row regardless of
     which side misbehaved. Auto-clears after a few seconds. */
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (!uploadError) return;
    const t = window.setTimeout(
      () => setUploadError(null),
      ERROR_AUTOCLEAR_MS,
    );
    return () => window.clearTimeout(t);
  }, [uploadError]);

  const canContinue = idFront !== null && idBack !== null;

  function handleContinue() {
    if (!canContinue) return;
    console.log("[KYC StepId] both sides uploaded, advancing to step 5");
    onSubmit();
  }

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col">
      {/* ATRÁS — same shape and behaviour as previous steps. */}
      <button
        type="button"
        onClick={onBack}
        className="-ml-1 mb-6 inline-flex w-fit items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-[0.32em] text-white/60 transition-colors duration-200 ease-out hover:text-white/95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 motion-reduce:transition-none"
      >
        <span aria-hidden>←</span> ATRÁS
      </button>

      {/* Step label */}
      <p className={`${textLabel} text-[10px] uppercase tracking-[0.32em]`}>
        DOCUMENTO DE IDENTIDAD
      </p>

      {/* Reassuring subtext */}
      <p
        className={`mt-3 text-[13px] font-normal tracking-[0.02em] ${textBody}`}
      >
        Sube una foto clara del frente y reverso de tu cédula.
      </p>

      {/* Two upload zones — stacked on mobile, side-by-side from sm up. */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:gap-5">
        <UploadZone
          side="front"
          value={idFront}
          onChange={onIdFrontChange}
          onError={setUploadError}
        />
        <UploadZone
          side="back"
          value={idBack}
          onChange={onIdBackChange}
          onError={setUploadError}
        />
      </div>

      {/* Inline upload error — warm amber, label-tier sizing so it sits
          quietly under the zones. */}
      {uploadError && (
        <p
          role="alert"
          className="mt-3 text-center text-[11px] font-medium uppercase tracking-[0.22em] text-amber-200/85"
        >
          {uploadError}
        </p>
      )}

      {/* CONTINUAR — disabled until both sides are filled. */}
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!canContinue}
          aria-disabled={!canContinue}
          className={[
            "group inline-flex items-center gap-2 rounded-full border px-6 py-3 text-[11px] font-medium uppercase tracking-[0.32em] backdrop-blur-md transition-all duration-300 ease-out motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40",
            canContinue
              ? "border-white/20 bg-white/[0.04] text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_18px_-6px_rgba(0,0,0,0.42)] hover:border-white/40 hover:bg-white/[0.08] hover:text-white/95 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_0_26px_-6px_rgba(255,255,255,0.45),0_10px_22px_-6px_rgba(0,0,0,0.42)]"
              : "cursor-not-allowed border-white/10 bg-white/[0.02] text-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
          ].join(" ")}
        >
          CONTINUAR
          <span
            aria-hidden
            className={[
              "transition-transform duration-300 ease-out motion-reduce:transition-none",
              canContinue ? "group-hover:translate-x-0.5" : "",
            ].join(" ")}
          >
            →
          </span>
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────
   UploadZone — single drop / click / camera region
   ─────────────────────────────────────────────────────────────────────── */

type UploadZoneProps = {
  side: Side;
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  onError: (msg: string) => void;
};

function UploadZone({ side, value, onChange, onError }: UploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  /* Dedicated counter for drag enter/leave — HTML5 dragleave fires on
     every child boundary, which would flicker the active state. The
     counter only flips back to 0 when the cursor actually leaves the
     entire zone. */
  const dragDepthRef = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [hovering, setHovering] = useState(false);

  const labelText = side === "front" ? "FRENTE DE CÉDULA" : "REVERSO DE CÉDULA";
  const confirmLabel = side === "front" ? "FRENTE" : "REVERSO";
  const filled = value !== null;
  const active = filled ? false : hovering || dragging;

  async function ingestFile(file: File) {
    if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
      console.log("[KYC StepId] rejected file — wrong type:", file.type);
      onError("Formato no válido");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      console.log("[KYC StepId] rejected file — too large:", file.size);
      onError("Archivo demasiado grande");
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      console.log(`[KYC StepId] ${side} uploaded:`, file.name, file.size);
      onChange(dataUrl);
    } catch {
      onError("Error al leer el archivo");
    }
  }

  function openPicker() {
    fileInputRef.current?.click();
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void ingestFile(file);
    /* Reset the input so selecting the SAME file again still fires
       onChange (browsers skip the event when value hasn't changed). */
    e.target.value = "";
  }

  function handleDragEnter(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    dragDepthRef.current += 1;
    setDragging(true);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    /* Must prevent default for the drop event to fire. */
    e.preventDefault();
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) setDragging(false);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    dragDepthRef.current = 0;
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void ingestFile(file);
  }

  function handleReplace(e: React.MouseEvent | React.KeyboardEvent) {
    /* Stop the bubble so the parent zone's click handler doesn't fire
       (which would also open the picker — same result, but cleaner). */
    e.stopPropagation();
    openPicker();
  }

  function handleZoneKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (filled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openPicker();
    }
  }

  const zoneClass = [
    "group relative h-40 overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 ease-out motion-reduce:transition-none focus-visible:outline-none",
    "sm:flex-1",
    filled
      ? "cursor-default border-white/30 bg-white/[0.03]"
      : active
        ? "cursor-pointer border-white/40 bg-white/[0.06] shadow-[inset_0_0_28px_rgba(255,255,255,0.08)]"
        : "cursor-pointer border-white/15 bg-white/[0.02] hover:border-white/40 hover:bg-white/[0.05] hover:shadow-[inset_0_0_28px_rgba(255,255,255,0.06)]",
    "focus-visible:border-white/50 focus-visible:bg-white/[0.06]",
  ].join(" ");

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={
        filled
          ? `${confirmLabel.toLowerCase()} de cédula subida — pulsa Cambiar para reemplazar`
          : `Subir ${labelText.toLowerCase()}`
      }
      onClick={filled ? undefined : openPicker}
      onKeyDown={handleZoneKeyDown}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className={zoneClass}
    >
      {filled ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value as string}
            alt={`${confirmLabel} de cédula`}
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Bottom confirmation strip — gradient so the image stays
              legible behind it. */}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/75 via-black/55 to-transparent px-3 pb-2 pt-6">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.32em] text-white/95">
              <Checkmark />
              {confirmLabel}
            </span>
            <button
              type="button"
              onClick={handleReplace}
              className="rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-[0.32em] text-white/80 transition-colors duration-200 ease-out hover:bg-white/[0.08] hover:text-white/95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 motion-reduce:transition-none"
            >
              Cambiar
            </button>
          </div>
        </>
      ) : (
        <div
          className={`flex h-full flex-col items-center justify-center gap-1.5 px-4 text-center transition-opacity duration-300 ease-out motion-reduce:transition-none ${
            active ? "opacity-100" : "opacity-0"
          }`}
        >
          <span
            className={`text-[10px] font-medium uppercase tracking-[0.32em] ${textLabel}`}
          >
            {labelText}
          </span>
          <span className="text-[11px] font-normal tracking-[0.02em] text-white/35">
            Click o arrastra aquí
          </span>
        </div>
      )}

      {/* Hidden native file input — opened programmatically from the
          zone's click handler and from the Cambiar button. */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        capture="environment"
        className="sr-only"
        onChange={handleInputChange}
        aria-hidden
        tabIndex={-1}
      />
    </div>
  );
}

/* ─── Helpers ─────────────────────────────────────────────────────────── */

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

function Checkmark() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 12"
      className="h-3 w-3"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 6.5 5 9l4.5-5" />
    </svg>
  );
}
