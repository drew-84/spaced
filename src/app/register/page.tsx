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

export default function RegisterPage() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    window.setTimeout(() => {
      setPending(false);
      alert("Registro no conectado aún. Vuelve cuando tengamos backend.");
      router.push("/");
    }, 300);
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
        <TopNav active="register" />
        <main className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center px-6 py-10 sm:px-8">
          <section className={`w-full max-w-md space-y-7 ${GLASS_PANEL} p-6 sm:p-8`}>
            <header className="space-y-2.5">
              <h1 className="text-3xl font-semibold text-white/95">
                Crear cuenta
              </h1>
              <p className={`text-sm ${TEXT_BODY}`}>
                Registro de demostración; la autenticación llegará con el backend.
              </p>
            </header>

            <form className="space-y-5" onSubmit={onSubmit}>
              <div className="space-y-1.5">
                <label htmlFor="reg-email" className={TEXT_LABEL}>
                  Correo
                </label>
                <div className={`${INPUT_WRAP} px-4 py-3`}>
                  <input
                    id="reg-email"
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
                <label htmlFor="reg-password" className={TEXT_LABEL}>
                  Contraseña
                </label>
                <div className={`${INPUT_WRAP} px-4 py-3`}>
                  <input
                    id="reg-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    placeholder="Mínimo 8 caracteres"
                    className={INPUT_INNER}
                  />
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={pending}
                  className={`w-full ${CTA_PRIMARY}`}
                >
                  {pending ? "Creando…" : "Crear cuenta"}
                </button>
              </div>
            </form>

            <p className={`text-sm ${TEXT_BODY}`}>
              ¿Ya tienes cuenta?{" "}
              <Link
                href="/login"
                className="font-medium text-white/70 underline underline-offset-2 transition-colors duration-300 ease-out hover:text-white"
              >
                Iniciar sesión
              </Link>
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
