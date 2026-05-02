"use client";

import Link from "next/link";

type TopNavProps = {
  active?: "home" | "spaces" | "book" | "login" | "register";
  hideRegisterLink?: boolean;
};

function navClass(isActive: boolean) {
  return isActive
    ? "rounded-full border border-white/[0.12] bg-white/[0.06] px-2.5 py-1 text-xs font-medium text-white/75 backdrop-blur-md"
    : "rounded-full border border-transparent px-2.5 py-1 text-xs text-white/42 transition hover:border-white/[0.08] hover:bg-white/[0.04] hover:text-white/65";
}

export function TopNav({ active, hideRegisterLink = false }: TopNavProps) {
  void hideRegisterLink;

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.04] bg-[#050506]/40 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-2 sm:px-7 sm:py-2.5">
        <Link
          href="/"
          className="relative text-base font-medium tracking-[0.28em] text-white/55 sm:text-lg"
        >
          <span className="text-white/60">SPACIO</span>
        </Link>
        <nav className="relative flex items-center gap-0.5 rounded-full border border-white/[0.07] bg-white/[0.03] p-0.5 backdrop-blur-md">
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
