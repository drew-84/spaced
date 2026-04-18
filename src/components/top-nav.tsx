"use client";

import Link from "next/link";

type TopNavProps = {
  active?: "home" | "spaces" | "book" | "login" | "register";
  hideRegisterLink?: boolean;
};

function navClass(isActive: boolean) {
  return isActive
    ? "rounded-full border border-stone-800 bg-stone-900 px-3 py-1.5 text-sm font-medium text-white shadow-sm"
    : "rounded-full border border-transparent px-3 py-1.5 text-sm text-stone-600 transition hover:border-stone-200 hover:bg-stone-100 hover:text-stone-900";
}

export function TopNav({ active, hideRegisterLink = false }: TopNavProps) {
  void hideRegisterLink;

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/90 bg-[#F4F1EA]/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3 sm:px-8 sm:py-4">
        <Link
          href="/"
          className="text-xl font-bold tracking-[0.2em] text-stone-900 sm:text-2xl"
        >
          SPACED
        </Link>
        <nav className="relative flex flex-wrap items-center justify-end gap-1.5 rounded-full border border-stone-200/90 bg-white/70 p-1 shadow-sm backdrop-blur-sm sm:gap-2">
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
