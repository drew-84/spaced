import { z } from "zod";

export const bookingSchema = z.object({
  spaceId: z.string().min(1, "Please choose a space."),
  durationMinutes: z.enum(["30", "60"]),
  extensionMinutes: z.enum(["0", "15", "30"]),
  notes: z.string().max(200, "Notes must be 200 characters or less.").optional(),
});

export type BookingFormValues = z.infer<typeof bookingSchema>;
