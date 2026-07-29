import { create } from "zustand";

type BookingDraft = {
  spaceId: string;
  /** Base durations are 45 and 60 min — see docs/technical/SCHEMA.md §3. */
  durationMinutes: 45 | 60;
  extensionMinutes: 0 | 15 | 30;
  notes: string;
};

type BookingState = {
  draft: BookingDraft;
  setDraft: (payload: Partial<BookingDraft>) => void;
  resetDraft: () => void;
};

const initialDraft: BookingDraft = {
  spaceId: "",
  durationMinutes: 45,
  extensionMinutes: 0,
  notes: "",
};

export const useBookingStore = create<BookingState>((set) => ({
  draft: initialDraft,
  setDraft: (payload) =>
    set((state) => ({
      draft: { ...state.draft, ...payload },
    })),
  resetDraft: () => set({ draft: initialDraft }),
}));
