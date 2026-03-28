"use client";

import Link from "next/link";

type TopNavProps = {
  active?: "home" | "spaces" | "book" | "login" | "register";
  hideRegisterLink?: boolean;
};

function navClass(isActive: boolean) {
  return isActive
    ? "rounded-full border border-pink-200/45 bg-gradient-to-r from-pink-200/18 via-fuchsia-200/10 to-cyan-200/12 px-3 py-1.5 text-sm font-medium text-pink-100 shadow-[0_10px_22px_rgba(10,8,30,0.35)] backdrop-blur-lg"
    : "rounded-full border border-transparent px-3 py-1.5 text-sm text-purple-100/72 transition hover:border-white/20 hover:bg-white/10 hover:text-white hover:backdrop-blur-lg";
}

export function TopNav({ active, hideRegisterLink = false }: TopNavProps) {
  void hideRegisterLink;

  return (
    <header className="sticky top-0 z-30 bg-transparent">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3 sm:px-8 sm:py-4">
        <Link href="/" className="relative text-2xl font-extrabold tracking-widest sm:text-3xl">
          <span className="bg-gradient-to-r from-pink-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(255,0,128,0.6)]">
            SPACED
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-pink-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent blur-[6px]" aria-hidden>
            SPACED
          </span>
        </Link>
        <nav className="relative flex items-center gap-2 overflow-hidden rounded-full border border-white/20 bg-gradient-to-r from-white/10 via-white/[0.04] to-white/[0.02] p-1 shadow-[0_18px_45px_rgba(6,10,28,0.45)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-[1px] rounded-full border border-white/20" />
          <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          <Link href="/" className={navClass(active === "home")}>
            Home
          </Link>
          <Link href="/spaces" className={navClass(active === "spaces")}>
            Spaces
          </Link>
          <Link href="/book" className={navClass(active === "book")}>
            Book
          </Link>
          <Link href="/login" className={navClass(active === "login")}>
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
