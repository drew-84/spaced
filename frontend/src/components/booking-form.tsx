"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { bookingSchema, type BookingFormValues } from "@/lib/booking-schema";
import { mockSpaces } from "@/lib/mock-spaces";
import { useBookingStore } from "@/store/booking-store";

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
    () => mockSpaces.find((space) => space.id === selectedSpaceId),
    [selectedSpaceId],
  );

  const estimatedTotal = selectedSpace
    ? formatTotal(selectedDuration, selectedExtension, selectedSpace.pricePer30m)
    : 0;

  const onSubmit = (values: BookingFormValues) => {
    setDraft({
      spaceId: values.spaceId,
      durationMinutes: Number(values.durationMinutes) as 30 | 60,
      extensionMinutes: Number(values.extensionMinutes) as 0 | 15 | 30,
      notes: values.notes ?? "",
    });

    // MVP base: keep feedback inline until API and payment flow are connected.
    alert("Booking draft saved locally.");
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-5 rounded-2xl border border-white/15 bg-white/[0.06] p-6 shadow-[0_16px_34px_rgba(0,0,0,0.35)]"
    >
      <div className="space-y-2">
        <label htmlFor="spaceId" className="text-sm font-medium text-zinc-200">
          Space
        </label>
        <select
          id="spaceId"
          {...form.register("spaceId")}
          className="w-full rounded-xl border border-white/15 bg-black/35 px-3 py-2 text-sm text-zinc-100 outline-none ring-0 transition focus:border-fuchsia-400/50"
        >
          <option value="">Choose a nearby space</option>
          {mockSpaces.map((space) => (
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
            className="text-sm font-medium text-zinc-200"
          >
            Duration
          </label>
          <select
            id="durationMinutes"
            {...form.register("durationMinutes")}
            className="w-full rounded-xl border border-white/15 bg-black/35 px-3 py-2 text-sm text-zinc-100 outline-none ring-0 transition focus:border-fuchsia-400/50"
          >
            <option value="30">30 minutes</option>
            <option value="60">60 minutes</option>
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="extensionMinutes"
            className="text-sm font-medium text-zinc-200"
          >
            Extension
          </label>
          <select
            id="extensionMinutes"
            {...form.register("extensionMinutes")}
            className="w-full rounded-xl border border-white/15 bg-black/35 px-3 py-2 text-sm text-zinc-100 outline-none ring-0 transition focus:border-fuchsia-400/50"
          >
            <option value="0">No extension</option>
            <option value="15">+15 minutes</option>
            <option value="30">+30 minutes</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium text-zinc-200">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          {...form.register("notes")}
          rows={3}
          className="w-full rounded-xl border border-white/15 bg-black/35 px-3 py-2 text-sm text-zinc-100 outline-none ring-0 transition placeholder:text-zinc-500 focus:border-fuchsia-400/50"
          placeholder="Access preferences or special instructions"
        />
        {form.formState.errors.notes ? (
          <p className="text-xs text-red-600">
            {form.formState.errors.notes.message}
          </p>
        ) : null}
      </div>

      <div className="rounded-xl border border-fuchsia-300/20 bg-gradient-to-r from-fuchsia-400/10 to-purple-500/5 px-4 py-3 text-sm text-zinc-300">
        Estimated total:{" "}
        <span className="font-semibold text-fuchsia-200">${estimatedTotal}</span>
      </div>

      <button
        type="submit"
        className="w-full rounded-full border border-fuchsia-400/45 bg-gradient-to-r from-fuchsia-500/35 to-pink-400/20 px-4 py-2.5 text-sm font-medium text-fuchsia-100 transition hover:border-fuchsia-300/65 hover:from-fuchsia-400/45 hover:to-pink-300/30"
      >
        Save Booking Draft
      </button>
    </form>
  );
}
