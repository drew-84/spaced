"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { bookingSchema, type BookingFormValues } from "@/lib/booking-schema";
import { mockSpaces } from "@/lib/mock-spaces";
import { useBookingStore } from "@/store/booking-store";

const hourlySpaces = mockSpaces.filter((s) => s.stayType === "hourly");

function formatTotal(duration: string, extension: string, unitPrice: number) {
  const blocks = (Number(duration) + Number(extension)) / 30;
  return blocks * unitPrice;
}

const inputClass =
  "w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 outline-none ring-0 transition placeholder:text-stone-400 focus:border-stone-400 focus:ring-2 focus:ring-stone-200";

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
      className="space-y-5 rounded-2xl border border-stone-200/90 bg-white p-6 shadow-[0_2px_24px_rgba(28,25,23,0.06)]"
    >
      <div className="space-y-2">
        <label htmlFor="spaceId" className="text-sm font-medium text-stone-800">
          Espacio
        </label>
        <select
          id="spaceId"
          {...form.register("spaceId")}
          className={inputClass}
        >
          <option value="">Elige un espacio cercano</option>
          {hourlySpaces.map((space) => (
            <option key={space.id} value={space.id}>
              {space.title} ({space.area})
            </option>
          ))}
        </select>
        {form.formState.errors.spaceId ? (
          <p className="text-xs text-red-600">
            {form.formState.errors.spaceId.message}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="durationMinutes"
            className="text-sm font-medium text-stone-800"
          >
            Duración
          </label>
          <select
            id="durationMinutes"
            {...form.register("durationMinutes")}
            className={inputClass}
          >
            <option value="30">30 minutos</option>
            <option value="60">60 minutos</option>
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="extensionMinutes"
            className="text-sm font-medium text-stone-800"
          >
            Ampliación
          </label>
          <select
            id="extensionMinutes"
            {...form.register("extensionMinutes")}
            className={inputClass}
          >
            <option value="0">Sin ampliación</option>
            <option value="15">+15 minutos</option>
            <option value="30">+30 minutos</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium text-stone-800">
          Notas (opcional)
        </label>
        <textarea
          id="notes"
          {...form.register("notes")}
          rows={3}
          className={inputClass}
          placeholder="Preferencias de acceso o instrucciones"
        />
        {form.formState.errors.notes ? (
          <p className="text-xs text-red-600">
            {form.formState.errors.notes.message}
          </p>
        ) : null}
      </div>

      <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800">
        Total estimado:{" "}
        <span className="font-semibold text-stone-900">${estimatedTotal}</span>
      </div>

      <button
        type="submit"
        className="w-full rounded-full bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800"
      >
        Guardar borrador de reserva
      </button>
    </form>
  );
}
