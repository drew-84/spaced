"use client";

import Link from "next/link";

type TopNavProps = {
  active?: "home" | "spaces" | "book" | "login" | "register";
  hideRegisterLink?: boolean;
};

function navClass(isActive: boolean) {
  return isActive
    ? "rounded-full border border-pink-500/50 bg-gradient-to-r from-pink-500/25 to-fuchsia-500/15 px-3 py-1.5 text-sm font-medium text-pink-200 shadow-[0_0_12px_rgba(255,0,128,0.2)]"
    : "rounded-full px-3 py-1.5 text-sm text-purple-300/60 transition hover:bg-pink-500/10 hover:text-white";
}

export function TopNav({ active, hideRegisterLink = false }: TopNavProps) {
  void hideRegisterLink;

  return (
    <header className="sticky top-0 z-20 border-b border-purple-500/15 bg-[#0d0221]/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
        <Link href="/" className="relative text-2xl font-extrabold tracking-widest sm:text-3xl">
          <span className="bg-gradient-to-r from-pink-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(255,0,128,0.6)]">
            SPACED
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-pink-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent blur-[6px]" aria-hidden>
            SPACED
          </span>
        </Link>
        <nav className="flex items-center gap-2 rounded-full border border-purple-500/15 bg-purple-500/8 p-1 shadow-[0_0_20px_rgba(190,0,255,0.1)]">
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
