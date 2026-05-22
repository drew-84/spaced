"use client";

import Link from "next/link";

type TopNavProps = {
  active?: "home" | "spaces" | "book" | "login" | "register";
  hideRegisterLink?: boolean;
};

function navClass(isActive: boolean) {
  return isActive
    ? "rounded-full border border-white/30 bg-white/[0.1] px-2.5 py-1 text-xs font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-md transition-all duration-300 ease-out"
    : "rounded-full border border-transparent px-2.5 py-1 text-xs text-white/70 transition-all duration-300 ease-out hover:border-white/20 hover:bg-white/[0.05] hover:text-white";
}

export function TopNav({ active, hideRegisterLink = false }: TopNavProps) {
  void hideRegisterLink;

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#050506]/40 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-2 sm:px-7 sm:py-2.5">
        <Link
          href="/"
          className="relative text-base font-medium tracking-[0.28em] text-white sm:text-lg"
        >
          <span className="text-white">SPACIO</span>
        </Link>
        <nav className="relative flex items-center gap-0.5 rounded-full border border-white/15 bg-white/[0.04] p-0.5 backdrop-blur-md">
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
