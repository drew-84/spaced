import Link from "next/link";
import { TopNav } from "@/components/top-nav";

export default function LoginPage() {
  return (
    <div className="min-h-screen text-zinc-100">
      <TopNav active="login" hideRegisterLink />
      <main className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-6xl items-center justify-center px-6 py-10 sm:px-8">
        <section className="w-full max-w-md space-y-7 rounded-3xl border border-white/15 bg-white/[0.05] p-6 shadow-[0_20px_45px_rgba(0,0,0,0.35)] sm:p-8">
          <header className="space-y-2.5">
            <h1 className="text-3xl font-semibold text-zinc-100">Sign in</h1>
            <p className="text-sm text-zinc-300">
              Continue to your SPACED account.
            </p>
          </header>

          <form className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-zinc-200">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-2.5 text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-fuchsia-400/50 focus:ring-2 focus:ring-fuchsia-400/25"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-zinc-200"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-2.5 text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-fuchsia-400/50 focus:ring-2 focus:ring-fuchsia-400/25"
              />
            </div>

            <div className="pt-1">
              <button
                type="button"
                className="w-full rounded-xl border border-fuchsia-400/45 bg-gradient-to-r from-fuchsia-500/35 to-pink-400/20 px-4 py-2.5 text-sm font-medium text-fuchsia-100 transition hover:border-fuchsia-300/65 hover:from-fuchsia-400/45 hover:to-pink-300/30"
              >
                Sign In
              </button>
            </div>
          </form>

          <p className="text-sm text-zinc-300">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-zinc-100 underline hover:text-fuchsia-200"
            >
              Register
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
