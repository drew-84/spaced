"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TopNav } from "@/components/top-nav";
import {
  CTA_PRIMARY,
  GLASS_PANEL,
  INPUT_INNER,
  INPUT_WRAP,
  PAGE_AMBIENT_BG,
  PAGE_AMBIENT_SHIMMER,
  TEXT_BODY,
  TEXT_LABEL,
} from "@/styles/glass";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setPending(false);
      return;
    }

    router.push("/");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#02050d] text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: PAGE_AMBIENT_BG }}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 ${PAGE_AMBIENT_SHIMMER}`}
      />

      <div className="relative">
        <TopNav active="login" />
        <main className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center px-6 py-10 sm:px-8">
          <section className={`w-full max-w-md space-y-7 ${GLASS_PANEL} p-6 sm:p-8`}>
            <header className="space-y-2.5">
              <h1 className="text-3xl font-semibold text-white/95">
                Iniciar sesión
              </h1>
              <p className={`text-sm ${TEXT_BODY}`}>
                Accede a tu cuenta SPACED.
              </p>
            </header>

            <form className="space-y-5" onSubmit={onSubmit}>
              <div className="space-y-1.5">
                <label htmlFor="email" className={TEXT_LABEL}>
                  Correo
                </label>
                <div className={`${INPUT_WRAP} px-4 py-3`}>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="tu@correo.com"
                    className={INPUT_INNER}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className={TEXT_LABEL}>
                  Contraseña
                </label>
                <div className={`${INPUT_WRAP} px-4 py-3`}>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="Tu contraseña"
                    className={INPUT_INNER}
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-400/90">{error}</p>
              )}

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={pending}
                  className={`w-full ${CTA_PRIMARY}`}
                >
                  {pending ? "Entrando…" : "Entrar"}
                </button>
              </div>
            </form>

            <p className={`text-sm ${TEXT_BODY}`}>
              ¿No tienes cuenta?{" "}
              <Link
                href="/register"
                className="font-medium text-white/70 underline underline-offset-2 transition-colors duration-300 ease-out hover:text-white"
              >
                Registrarse
              </Link>
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
