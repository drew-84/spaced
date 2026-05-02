import { readGitMeta } from "@/lib/git-meta";

export function DevGitBanner() {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const { branch, shortSha: sha } = readGitMeta();

  if (!branch && !sha) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed bottom-3 right-3 z-[9999] max-w-[min(100vw-1.5rem,20rem)] truncate rounded-md border border-cyan-500/30 bg-[#0d0221]/90 px-2.5 py-1 font-mono text-[10px] leading-snug text-cyan-300/90 shadow-[0_0_20px_rgba(56,182,255,0.15)] backdrop-blur-sm"
      title={[branch, sha].filter(Boolean).join(" · ")}
      suppressHydrationWarning
    >
      {branch ? <span className="text-purple-200/90">{branch}</span> : null}
      {branch && sha ? (
        <span className="mx-1.5 text-purple-400/50" aria-hidden>
          ·
        </span>
      ) : null}
      {sha ? <span className="text-fuchsia-300/90">{sha}</span> : null}
    </div>
  );
}
