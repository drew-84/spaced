"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { LoginModal } from "@/components/login/LoginModal";
import { useAuthStore } from "@/lib/auth-store";
import { supabase } from "@/lib/supabase";

/**
 * Top navigation bar.
 *
 *   • "Home"   → "/"
 *   • "Spaces" → smooth-scroll to #spaces on homepage, router.push otherwise
 *   • Unauthenticated → "Login" pill opens LoginModal
 *   • Authenticated   → glass avatar circle (first letter of email username)
 *                        click → dropdown: "Mi perfil" + "CERRAR SESIÓN"
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

export function TopNav({ active }: TopNavProps) {
  const router   = useRouter();
  const pathname = usePathname();
  const [loginOpen, setLoginOpen]   = useState(false);
  const [dropdownOpen, setDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user    = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  /* Close dropdown when clicking outside. */
  useEffect(() => {
    if (!dropdownOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdown(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [dropdownOpen]);

  /* Close dropdown on Escape. */
  useEffect(() => {
    if (!dropdownOpen) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setDropdown(false); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dropdownOpen]);

  async function handleSignOut() {
    setDropdown(false);
    await supabase.auth.signOut();
    router.push("/");
  }

  function handleSpacesClick(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
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

  /* First letter of the email's local part, uppercase. */
  const avatarLetter = user?.email
    ? user.email.split("@")[0].charAt(0).toUpperCase()
    : "?";

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#050506]/40 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-2 sm:px-7 sm:py-2.5">

          {/* Logo */}
          <Link
            href="/"
            className="text-base font-medium tracking-[0.28em] text-white/95 sm:text-lg"
          >
            SPACIO
          </Link>

          {/* Nav pills */}
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

            {!loading && user ? (
              /* ── Avatar + dropdown ── */
              <div ref={dropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setDropdown((v) => !v)}
                  aria-label="Menú de usuario"
                  aria-expanded={dropdownOpen}
                  className="relative flex h-7 w-7 items-center justify-center rounded-full border border-white/25 bg-white/[0.08] text-[11px] font-medium text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_0_16px_-4px_rgba(255,255,255,0.25)] backdrop-blur-md transition-all duration-200 ease-out hover:border-white/45 hover:bg-white/[0.14] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_0_22px_-4px_rgba(255,255,255,0.45)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
                  style={{ letterSpacing: "0.04em" }}
                >
                  {avatarLetter}
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 min-w-[148px] overflow-hidden rounded-[14px] border border-white/12 bg-[#060d1a]/90 shadow-[0_16px_48px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl"
                    style={{ animation: "navDropdownIn 180ms ease-out both" }}
                  >
                    {/* Email identifier */}
                    <div className="border-b border-white/8 px-4 py-2.5">
                      <p className="truncate text-[10px] font-normal tracking-[0.04em] text-white/40">
                        {user.email}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/perfil"
                        onClick={() => setDropdown(false)}
                        className="block px-4 py-2 text-[12px] font-normal tracking-[0.04em] text-white/70 transition-colors duration-150 hover:bg-white/[0.06] hover:text-white/95"
                      >
                        Mi perfil
                      </Link>

                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full px-4 py-2 text-left text-[12px] font-medium uppercase tracking-[0.22em] text-white/60 transition-colors duration-150 hover:bg-white/[0.06] hover:text-white/90"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : !loading ? (
              /* ── Login pill ── */
              <button
                type="button"
                onClick={() => setLoginOpen(true)}
                className={navClass(active === "login")}
              >
                Login
              </button>
            ) : null}
          </nav>
        </div>
      </header>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />

      <style>{`
        @keyframes navDropdownIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
      `}</style>
    </>
  );
}
