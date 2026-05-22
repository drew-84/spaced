"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { bookingSchema, type BookingFormValues } from "@/lib/booking-schema";
import { mockSpaces } from "@/lib/mock-spaces";
import { useBookingStore } from "@/store/booking-store";
import {
  CTA_PRIMARY,
  FIELD_ERROR,
  GLASS_PANEL,
  GLASS_TILE,
  INPUT_INNER,
  INPUT_WRAP,
  TEXT_LABEL,
} from "@/styles/glass";

const hourlySpaces = mockSpaces.filter((s) => s.stayType === "hourly");

function formatTotal(duration: string, extension: string, unitPrice: number) {
  const blocks = (Number(duration) + Number(extension)) / 30;
  return blocks * unitPrice;
}

export function BookingForm() {
  const { draft, setDraft } = useBookingStore();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      spaceId: draft.spaceId,
      durationMinutes: String(draft.durationMinutes) as "30" | "60",
      extensionMinutes: String(draft.extensionMinutes) as "0" | "15" | "30",
      notes: draft.notes,
    },
  });

  const [selectedSpaceId, selectedDuration, selectedExtension] = useWatch({
    control: form.control,
    name: ["spaceId", "durationMinutes", "extensionMinutes"],
  });

  const selectedSpace = useMemo(
    () => hourlySpaces.find((space) => space.id === selectedSpaceId),
    [selectedSpaceId],
  );

  const estimatedTotal =
    selectedSpace && selectedSpace.stayType === "hourly"
      ? formatTotal(
          selectedDuration,
          selectedExtension,
          selectedSpace.pricePer30m,
        )
      : 0;

  const onSubmit = (values: BookingFormValues) => {
    setDraft({
      spaceId: values.spaceId,
      durationMinutes: Number(values.durationMinutes) as 30 | 60,
      extensionMinutes: Number(values.extensionMinutes) as 0 | 15 | 30,
      notes: values.notes ?? "",
    });

    alert("Borrador de reserva guardado localmente.");
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={`space-y-5 ${GLASS_PANEL} p-6`}
    >
      <div className="space-y-2">
        <label htmlFor="spaceId" className={TEXT_LABEL}>
          Espacio
        </label>
        <div className={`${INPUT_WRAP} relative px-4 py-3`}>
          <select
            id="spaceId"
            {...form.register("spaceId")}
            className={`${INPUT_INNER} appearance-none pr-8`}
          >
            <option value="" className="bg-[#0a0f1c] text-white/40">
              Elige un espacio cercano
            </option>
            {hourlySpaces.map((space) => (
              <option
                key={space.id}
                value={space.id}
                className="bg-[#0a0f1c] text-white"
              >
                {space.title} ({space.area})
              </option>
            ))}
          </select>
          <span
            aria-hidden
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-white/70"
          >
            ▾
          </span>
        </div>
        {form.formState.errors.spaceId ? (
          <p className={FIELD_ERROR}>{form.formState.errors.spaceId.message}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="durationMinutes" className={TEXT_LABEL}>
            Duración
          </label>
          <div className={`${INPUT_WRAP} relative px-4 py-3`}>
            <select
              id="durationMinutes"
              {...form.register("durationMinutes")}
              className={`${INPUT_INNER} appearance-none pr-8`}
            >
              <option value="30" className="bg-[#0a0f1c] text-white">
                30 minutos
              </option>
              <option value="60" className="bg-[#0a0f1c] text-white">
                60 minutos
              </option>
            </select>
            <span
              aria-hidden
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-white/70"
            >
              ▾
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="extensionMinutes" className={TEXT_LABEL}>
            Ampliación
          </label>
          <div className={`${INPUT_WRAP} relative px-4 py-3`}>
            <select
              id="extensionMinutes"
              {...form.register("extensionMinutes")}
              className={`${INPUT_INNER} appearance-none pr-8`}
            >
              <option value="0" className="bg-[#0a0f1c] text-white">
                Sin ampliación
              </option>
              <option value="15" className="bg-[#0a0f1c] text-white">
                +15 minutos
              </option>
              <option value="30" className="bg-[#0a0f1c] text-white">
                +30 minutos
              </option>
            </select>
            <span
              aria-hidden
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-white/70"
            >
              ▾
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className={TEXT_LABEL}>
          Notas (opcional)
        </label>
        <div className={`${INPUT_WRAP} px-4 py-3`}>
          <textarea
            id="notes"
            {...form.register("notes")}
            rows={3}
            className={`${INPUT_INNER} resize-none leading-relaxed`}
            placeholder="Preferencias de acceso o instrucciones"
          />
        </div>
        {form.formState.errors.notes ? (
          <p className={FIELD_ERROR}>{form.formState.errors.notes.message}</p>
        ) : null}
      </div>

      <div className={`${GLASS_TILE} px-4 py-3 text-sm text-white/80`}>
        Total estimado:{" "}
        <span className="font-semibold text-white">${estimatedTotal}</span>
      </div>

      <button type="submit" className={`w-full ${CTA_PRIMARY}`}>
        Guardar borrador de reserva
      </button>
    </form>
  );
}
