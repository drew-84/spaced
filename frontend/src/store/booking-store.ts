import { create } from "zustand";

type BookingDraft = {
  spaceId: string;
  durationMinutes: 30 | 60;
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
  durationMinutes: 30,
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
