"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/**
 * Magic-link landing page.
 *
 * Supabase redirects here after the user clicks the link in their email.
 * Two possible shapes:
 *   • PKCE flow  → ?code=XXXX  (Supabase v2 default for web)
 *   • Implicit   → #access_token=XXXX (older / mobile clients)
 *
 * The PKCE code needs an explicit exchange; the implicit hash is handled
 * automatically by the Supabase client on the next getSession() call, so
 * we just let onAuthStateChange in auth-store.ts pick it up.
 *
 * After the session is established we redirect to wherever the user was
 * trying to go (stored in spacio_redirect_after_auth), defaulting to "/".
 */
export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    const redirect = (() => {
      try {
        const stored = localStorage.getItem("spacio_redirect_after_auth");
        localStorage.removeItem("spacio_redirect_after_auth");
        return stored ?? "/";
      } catch {
        return "/";
      }
    })();

    if (code) {
      supabase.auth
        .exchangeCodeForSession(code)
        .then(() => router.replace(redirect));
    } else {
      // Implicit flow — client picks up the hash automatically on next tick.
      router.replace(redirect);
    }
  }, [router]);

  return (
    <div className="flex h-[100dvh] items-center justify-center bg-[#02050d]">
      <p className="text-xs uppercase tracking-[0.32em] text-white/40">
        Verificando...
      </p>
    </div>
  );
}
