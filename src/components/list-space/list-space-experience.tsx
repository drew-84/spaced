"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  INITIAL_DATA,
  STEPS,
  TOTAL_STEPS,
  type ListSpaceFormData,
  type StepErrors,
} from "./types";
import { ListSpaceNav } from "./list-space-nav";
import { ListSpaceProgress } from "./list-space-progress";
import { StepBasics } from "./steps/step-basics";
import { StepLocation } from "./steps/step-location";
import { StepPricing } from "./steps/step-pricing";
import { StepVideos } from "./steps/step-videos";
import { StepAmenities } from "./steps/step-amenities";
import { StepDetails } from "./steps/step-details";
import { StepPayment } from "./steps/step-payment";

function validateStep(step: number, data: ListSpaceFormData): StepErrors {
  const e: StepErrors = {};
  if (step === 1) {
    if (!data.titulo.trim()) e.titulo = "Ingresa un título";
    if (!data.descripcion.trim()) e.descripcion = "Cuéntanos sobre el espacio";
    if (!data.tipoPropiedad) e.tipoPropiedad = "Elige un tipo de propiedad";
  }
  if (step === 2) {
    if (!data.direccion.trim()) e.direccion = "Ingresa la dirección";
    if (!data.comuna.trim()) e.comuna = "Ingresa la comuna";
    if (!data.ciudad.trim()) e.ciudad = "Ingresa la ciudad";
    if (!data.region.trim()) e.region = "Ingresa la región";
  }
  if (step === 3) {
    if (
      data.precioPor15Min === "" ||
      typeof data.precioPor15Min !== "number" ||
      data.precioPor15Min <= 0
    ) {
      e.precioPor15Min = "Ingresa un precio válido";
    }
  }
  if (step === 6) {
    if (data.capacidadMaxima < 1 || data.capacidadMaxima > 4) {
      e.capacidadMaxima = "Entre 1 y 4 personas";
    }
  }
  if (step === 7) {
    if (!data.titularCuenta.trim())
      e.titularCuenta = "Ingresa el nombre del titular";
    if (!data.banco) e.banco = "Selecciona un banco";
    if (data.numeroCuenta.replace(/\D/g, "").length < 6) {
      e.numeroCuenta = "Número de cuenta inválido";
    }
  }
  return e;
}

export function ListSpaceExperience() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<ListSpaceFormData>(INITIAL_DATA);
  const [errors, setErrors] = useState<StepErrors>({});
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const update = useCallback(
    <K extends keyof ListSpaceFormData>(
      key: K,
      value: ListSpaceFormData[K],
    ) => {
      setData((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    [],
  );

  function goNext() {
    const e = validateStep(step, data);
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  }

  function goBack() {
    setErrors({});
    setStep((s) => Math.max(1, s - 1));
  }

  function handleSaveDraft() {
    setSavedAt(new Date());
    console.log("[Spaced] guardar borrador", {
      step,
      data,
      savedAt: new Date().toISOString(),
    });
  }

  function handlePublish() {
    let all: StepErrors = {};
    for (let s = 1; s <= TOTAL_STEPS; s++) {
      all = { ...all, ...validateStep(s, data) };
    }
    if (Object.keys(all).length > 0) {
      setErrors(all);
      const firstBad = STEPS.find(
        (stp) => Object.keys(validateStep(stp.id, data)).length > 0,
      );
      if (firstBad) setStep(firstBad.id);
      return;
    }
    console.log("[Spaced] publicar espacio", {
      ...data,
      videos: data.videos
        .filter((v) => v.file)
        .map((v) => ({ id: v.id, name: v.name })),
      publishedAt: new Date().toISOString(),
    });
  }

  const stepMeta = STEPS[step - 1];

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[#02050d] text-white">
      {/* Ambient backdrop — same recipe as the modal's behind-scrim */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 48% at 54% 18%, rgba(72,132,220,0.18), transparent 62%), radial-gradient(circle at 14% 84%, rgba(80,120,210,0.14), transparent 38%), radial-gradient(circle at 88% 32%, rgba(70,120,200,0.1), transparent 42%), linear-gradient(to bottom, rgba(2,5,13,0.05), rgba(2,5,13,0.55))",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.32] [background:repeating-linear-gradient(122deg,rgba(255,255,255,0.018)_0px,rgba(255,255,255,0.018)_1px,transparent_1px,transparent_64px)]"
      />

      {/* Close — matches the modal "cerrar" pill */}
      <button
        type="button"
        onClick={() => router.push("/")}
        aria-label="Volver al inicio"
        className="absolute right-5 top-5 z-30 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-[10px] uppercase tracking-[0.26em] text-white/55 shadow-[0_10px_24px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md transition-[transform,border-color,color,background-color] duration-200 hover:border-sky-200/25 hover:bg-white/[0.06] hover:text-sky-100/85 sm:right-8 sm:top-8"
      >
        cerrar
      </button>

      <main
        className="relative mx-auto flex min-h-[100dvh] w-full max-w-[1440px] flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8 lg:flex-row lg:gap-8 lg:p-10"
        style={{ perspective: "1180px" }}
      >
        {/* LEFT panel — static-ish context */}
        <aside
          aria-label="Contexto"
          /* Style lifted from modal's left panel: asymmetric border-radius, transparent right/bottom borders,
             same dark glass fill, same drop-shadow + inner highlight, same backdrop-blur level */
          className="relative flex w-full shrink-0 flex-col gap-8 overflow-hidden rounded-[28px_56px_28px_48px] border border-sky-100/[0.07] border-b-transparent border-r-transparent bg-[#07101d]/42 p-7 shadow-[34px_42px_120px_rgba(0,0,0,0.62),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-2xl sm:p-9 lg:max-w-[36%]"
          style={{
            maskImage:
              "radial-gradient(ellipse 112% 96% at 22% 42%, black 0%, black 60%, rgba(0,0,0,0.88) 80%, rgba(0,0,0,0.5) 94%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 112% 96% at 22% 42%, black 0%, black 60%, rgba(0,0,0,0.88) 80%, rgba(0,0,0,0.5) 94%, transparent 100%)",
          }}
        >
          {/* Ambient gradient wash — same recipe as the modal */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 52% 42% at 18% 0%, rgba(150,205,255,0.12), transparent 68%), linear-gradient(120deg, rgba(255,255,255,0.075), transparent 30%, transparent 62%, rgba(96,165,250,0.045))",
            }}
          />
          {/* Subtle vertical light accent */}
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-16 left-9 top-32 hidden w-px sm:block"
            style={{
              background:
                "linear-gradient(180deg, transparent, rgba(186,230,253,0.5) 30%, rgba(186,230,253,0.5) 70%, transparent)",
              filter: "blur(0.5px)",
              boxShadow: "0 0 12px rgba(140,185,255,0.42)",
            }}
          />

          <div className="relative">
            <p className="text-[10px] font-medium uppercase tracking-[0.62em] text-sky-200/55">
              OFRECER ESPACIO
            </p>
            <h1 className="mt-10 text-2xl font-medium uppercase leading-[1.15] tracking-[0.42em] text-white/85 sm:text-3xl">
              PUBLICA TU
              <br />
              NODO
            </h1>
            <p className="mt-5 max-w-[28ch] text-sm font-light leading-relaxed tracking-[0.06em] text-white/42">
              Cada espacio entra a la red como un nodo temporal: tiempo, zona y
              atmósfera.
            </p>
          </div>

          <div className="relative mt-auto">
            <p className="text-[10px] uppercase tracking-[0.46em] text-white/35">
              Paso {step} de {TOTAL_STEPS}
            </p>
            <p className="mt-3 text-lg font-medium uppercase tracking-[0.34em] text-sky-100/85 transition-[color,opacity] duration-500">
              {stepMeta.titulo}
            </p>
            <p className="mt-3 max-w-[30ch] text-sm font-light leading-relaxed tracking-[0.04em] text-white/40 transition-opacity duration-500">
              {stepMeta.subtitulo}
            </p>
          </div>
        </aside>

        {/* RIGHT panel — form for current step */}
        <section
          aria-label="Formulario"
          /* Style lifted from modal's right panel — same radius, border, fill, layered shadows, blur */
          className="relative flex flex-1 flex-col gap-7 overflow-hidden rounded-[32px] border border-sky-100/[0.075] bg-white/[0.026] p-5 shadow-[0_28px_80px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.11),inset_0_-28px_70px_rgba(2,6,16,0.32)] backdrop-blur-xl sm:p-7"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 38% at 78% 0%, rgba(147,197,253,0.1), transparent 60%), linear-gradient(150deg, transparent 0%, transparent 50%, rgba(96,165,250,0.04) 100%)",
            }}
          />
          {/* Top rim highlight */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
          />

          <header className="relative">
            <ListSpaceProgress current={step} />
          </header>

          <div
            key={step}
            className="relative flex-1 overflow-y-auto pr-1 sm:pr-2"
            style={{
              animation:
                "lsFadeIn 500ms cubic-bezier(0.16, 1, 0.3, 1) both",
            }}
          >
            {step === 1 && (
              <StepBasics data={data} errors={errors} onChange={update} />
            )}
            {step === 2 && (
              <StepLocation data={data} errors={errors} onChange={update} />
            )}
            {step === 3 && (
              <StepPricing data={data} errors={errors} onChange={update} />
            )}
            {step === 4 && <StepVideos data={data} onChange={update} />}
            {step === 5 && <StepAmenities data={data} onChange={update} />}
            {step === 6 && (
              <StepDetails data={data} errors={errors} onChange={update} />
            )}
            {step === 7 && (
              <StepPayment data={data} errors={errors} onChange={update} />
            )}
          </div>

          <ListSpaceNav
            current={step}
            total={TOTAL_STEPS}
            onBack={goBack}
            onNext={goNext}
            onPublish={handlePublish}
            onSaveDraft={handleSaveDraft}
            savedAt={savedAt}
          />
        </section>
      </main>

      <style>{`
        @keyframes lsFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
