import { z } from "zod";

export const bookingSchema = z.object({
  spaceId: z.string().min(1, "Please choose a space."),
  // Base durations are 45 and 60 minutes. 30 is NOT a base duration.
  // See docs/technical/SCHEMA.md §3 (settled decision).
  durationMinutes: z.enum(["45", "60"]),
  extensionMinutes: z.enum(["0", "15", "30"]),
  notes: z.string().max(200, "Notes must be 200 characters or less.").optional(),
});

export type BookingFormValues = z.infer<typeof bookingSchema>;
