import Link from "next/link";

type TopNavProps = {
  active?: "home" | "spaces" | "book";
};

function navClass(isActive: boolean) {
  return isActive
    ? "rounded-full border border-fuchsia-400/40 bg-gradient-to-r from-fuchsia-500/30 to-pink-400/20 px-3 py-1.5 text-sm font-medium text-fuchsia-100"
    : "rounded-full px-3 py-1.5 text-sm text-purple-300/60 transition hover:bg-fuchsia-400/10 hover:text-white";
}

export function TopNav({ active }: TopNavProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-purple-400/15 bg-purple-950/60 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
        <Link href="/" className="text-lg font-bold tracking-tight text-white">
          SPACED
        </Link>
        <nav className="flex items-center gap-2 rounded-full border border-purple-400/15 bg-purple-500/10 p-1 shadow-[0_8px_24px_rgba(168,85,247,0.15)]">
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
