import { STEPS, TOTAL_STEPS } from "./types";

type Props = { current: number };

export function ListSpaceProgress({ current }: Props) {
  const pct = (current / TOTAL_STEPS) * 100;
  const stepMeta = STEPS[current - 1];
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      <p className="shrink-0 text-[10px] font-medium uppercase tracking-[0.42em] text-sky-200/65">
        Paso {current} / {TOTAL_STEPS}
      </p>
      <div className="relative h-px flex-1 min-w-[120px] overflow-hidden rounded-full bg-white/[0.06]">
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-sky-200/30 via-sky-100/80 to-sky-200/30 shadow-[0_0_18px_rgba(140,190,255,0.5)] transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="shrink-0 text-[10px] uppercase tracking-[0.32em] text-white/40">
        {stepMeta.titulo}
      </p>
    </div>
  );
}
