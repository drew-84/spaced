"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, type MouseEvent } from "react";
import { LoginModal } from "@/components/login/LoginModal";

/**
 * Top navigation bar — appears at the top of every page.
 *
 *  • "Home"   → routes to "/"
 *  • "Spaces" → smooth-scrolls to the #spaces anchor on the homepage
 *               (just above the search bar + pill filters in
 *               HostCardsSection). When the user is on another route
 *               we router.push("/#spaces") and let the browser handle
 *               the hash jump once the homepage mounts.
 *  • "Login"  → opens the LoginModal placeholder.
 *
 * The "Book" entry was removed entirely — booking is now reached via
 * the in-page Reservar flows on property detail surfaces.
 */

type TopNavProps = {
  active?: "home" | "spaces" | "login" | "register";
  hideRegisterLink?: boolean;
};

function navClass(isActive: boolean) {
  return isActive
    ? "rounded-full border border-white/30 bg-white/[0.1] px-2.5 py-1 text-xs font-medium text-white/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-md transition-all duration-300 ease-out"
    : "rounded-full border border-transparent px-2.5 py-1 text-xs text-white/60 transition-all duration-300 ease-out hover:border-white/20 hover:bg-white/[0.05] hover:text-white";
}

export function TopNav({ active, hideRegisterLink = false }: TopNavProps) {
  void hideRegisterLink;
  const router = useRouter();
  const pathname = usePathname();
  const [loginOpen, setLoginOpen] = useState(false);

  function handleSpacesClick(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    /* In-page smooth scroll when we're already on "/"; otherwise route
       to "/#spaces" and let the browser handle the hash jump once
       the homepage has mounted. */
    if (pathname === "/") {
      const target = document.getElementById("spaces");
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", "#spaces");
        return;
      }
    }
    router.push("/#spaces");
  }

  function handleLoginClick(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    setLoginOpen(true);
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#050506]/40 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-2 sm:px-7 sm:py-2.5">
          <Link
            href="/"
            className="relative text-base font-medium tracking-[0.28em] text-white/95 sm:text-lg"
          >
            <span className="text-white/95">SPACIO</span>
          </Link>
          {/* `gap-1` (vs the old gap-0.5) gives the now-three-item nav a
              touch more breathing room and keeps it visually balanced
              after Book was removed. */}
          <nav className="relative flex items-center gap-1 rounded-full border border-white/15 bg-white/[0.04] p-0.5 backdrop-blur-md">
            <Link href="/" className={navClass(active === "home")}>
              Home
            </Link>
            <Link
              href="/#spaces"
              onClick={handleSpacesClick}
              className={navClass(active === "spaces")}
            >
              Spaces
            </Link>
            <Link
              href="/login"
              onClick={handleLoginClick}
              className={navClass(active === "login")}
            >
              Login
            </Link>
          </nav>
        </div>
      </header>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
