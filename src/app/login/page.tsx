"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TopNav } from "@/components/top-nav";

export default function LoginPage() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    // MVP: sin backend; feedback y vuelta al inicio
    window.setTimeout(() => {
      setPending(false);
      alert("Inicio de sesión no conectado aún. Redirigiendo al inicio.");
      router.push("/");
    }, 300);
  }

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-stone-800">
      <TopNav active="login" />
      <main className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center px-6 py-10 sm:px-8">
        <section className="w-full max-w-md space-y-7 rounded-2xl border border-stone-200/90 bg-white p-6 shadow-[0_2px_24px_rgba(28,25,23,0.06)] sm:p-8">
          <header className="space-y-2.5">
            <h1 className="text-3xl font-semibold text-stone-900">
              Iniciar sesión
            </h1>
            <p className="text-sm text-stone-600">
              Accede a tu cuenta SPACED (próximamente con autenticación real).
            </p>
          </header>

          <form className="space-y-5" onSubmit={onSubmit}>
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-stone-800"
              >
                Correo
              </label>
              <input
                id="email"
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
                htmlFor="password"
                className="text-sm font-medium text-stone-800"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Tu contraseña"
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-stone-900 placeholder:text-stone-400 outline-none transition focus:border-stone-400 focus:ring-2 focus:ring-stone-200"
              />
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-full bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 disabled:opacity-60"
              >
                {pending ? "Entrando…" : "Entrar"}
              </button>
            </div>
          </form>

          <p className="text-sm text-stone-600">
            ¿No tienes cuenta?{" "}
            <Link
              href="/register"
              className="font-medium text-stone-900 underline underline-offset-2 hover:text-stone-600"
            >
              Registrarse
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
