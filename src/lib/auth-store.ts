import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type KycStatus = "pending" | "verified" | null;

type AuthStore = {
  user: User | null;
  loading: boolean;
  kycStatus: KycStatus;
  setUser: (user: User | null) => void;
  setKycStatus: (status: KycStatus) => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  kycStatus: null,
  setUser: (user) => set({ user, loading: false }),
  setKycStatus: (kycStatus) => set({ kycStatus }),
}));

async function loadKycStatus(userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("kyc_status")
    .eq("id", userId)
    .single();
  useAuthStore.getState().setKycStatus((data?.kyc_status as KycStatus) ?? null);
}

// Hydrate session on module load and keep in sync with Supabase auth state
supabase.auth.getSession().then(({ data }) => {
  const user = data.session?.user ?? null;
  useAuthStore.getState().setUser(user);
  if (user) loadKycStatus(user.id);
});

supabase.auth.onAuthStateChange((_event, session) => {
  const user = session?.user ?? null;
  useAuthStore.getState().setUser(user);
  useAuthStore.getState().setKycStatus(null);
  if (user) loadKycStatus(user.id);
});
