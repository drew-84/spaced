import {
  PROGRESS_FILL,
  PROGRESS_TRACK,
  TEXT_EYEBROW,
  TEXT_LABEL,
} from "@/styles/glass";
import { STEPS, TOTAL_STEPS } from "./types";

type Props = { current: number };

export function ListSpaceProgress({ current }: Props) {
  const pct = (current / TOTAL_STEPS) * 100;
  const stepMeta = STEPS[current - 1];
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      <p className={`shrink-0 ${TEXT_EYEBROW}`}>
        Paso {current} / {TOTAL_STEPS}
      </p>
      <div className={`${PROGRESS_TRACK} flex-1 min-w-[120px]`}>
        <span aria-hidden className={PROGRESS_FILL} style={{ width: `${pct}%` }} />
      </div>
      <p className={`shrink-0 ${TEXT_LABEL}`}>{stepMeta.titulo}</p>
    </div>
  );
}
