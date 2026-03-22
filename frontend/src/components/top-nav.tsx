import Link from "next/link";

type TopNavProps = {
  active?: "home" | "spaces" | "book";
};

function navClass(isActive: boolean) {
  return isActive
    ? "rounded-full border border-amber-300/35 bg-gradient-to-r from-amber-400/30 to-orange-300/20 px-3 py-1.5 text-sm font-medium text-amber-100"
    : "rounded-full px-3 py-1.5 text-sm text-zinc-400 transition hover:bg-amber-300/10 hover:text-zinc-100";
}

export function TopNav({ active }: TopNavProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-black/35 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
        <Link href="/" className="text-lg font-semibold tracking-tight text-zinc-100">
          SPACED
        </Link>
        <nav className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 shadow-[0_8px_24px_rgba(245,158,11,0.08)]">
          <Link href="/" className={navClass(active === "home")}>
            Home
          </Link>
          <Link href="/spaces" className={navClass(active === "spaces")}>
            Spaces
          </Link>
          <Link href="/book" className={navClass(active === "book")}>
            Book
          </Link>
        </nav>
      </div>
    </header>
  );
}
