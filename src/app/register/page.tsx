"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TopNav } from "@/components/top-nav";

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
    <div className="min-h-screen bg-[#F4F1EA] text-stone-800">
      <TopNav active="register" />
      <main className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center px-6 py-10 sm:px-8">
        <section className="w-full max-w-md space-y-7 rounded-2xl border border-stone-200/90 bg-white p-6 shadow-[0_2px_24px_rgba(28,25,23,0.06)] sm:p-8">
          <header className="space-y-2.5">
            <h1 className="text-3xl font-semibold text-stone-900">
              Crear cuenta
            </h1>
            <p className="text-sm text-stone-600">
              Registro de demostración; la autenticación llegará con el backend.
            </p>
          </header>

          <form className="space-y-5" onSubmit={onSubmit}>
            <div className="space-y-1.5">
              <label
                htmlFor="reg-email"
                className="text-sm font-medium text-stone-800"
              >
                Correo
              </label>
              <input
                id="reg-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="tu@correo.com"
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-stone-900 placeholder:text-stone-400 outline-none transition focus:border-stone-400 focus:ring-2 focus:ring-stone-200"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="reg-password"
                className="text-sm font-medium text-stone-800"
              >
                Contraseña
              </label>
              <input
                id="reg-password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                placeholder="Mínimo 8 caracteres"
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-stone-900 placeholder:text-stone-400 outline-none transition focus:border-stone-400 focus:ring-2 focus:ring-stone-200"
              />
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-full bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 disabled:opacity-60"
              >
                {pending ? "Creando…" : "Crear cuenta"}
              </button>
            </div>
          </form>

          <p className="text-sm text-stone-600">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/login"
              className="font-medium text-stone-900 underline underline-offset-2 hover:text-stone-600"
            >
              Iniciar sesión
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
