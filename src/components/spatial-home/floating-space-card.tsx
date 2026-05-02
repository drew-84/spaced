"use client";

import { forwardRef } from "react";

export type FloatingCardSpace = {
  id: string;
  title: string;
  imageUrl: string;
  area: string;
};

const CARD_W = 172;
const CARD_H = 228;

type FloatingSpaceCardProps = {
  space: FloatingCardSpace;
  dimmed: boolean;
  selected: boolean;
  hovered: boolean;
  onHover: (enter: boolean) => void;
  onSelect: () => void;
};

export const FloatingSpaceCard = forwardRef<HTMLButtonElement, FloatingSpaceCardProps>(
  function FloatingSpaceCard(
    { space, dimmed, selected, hovered, onHover, onSelect },
    ref,
  ) {
    return (
      <div
        className="relative flex-shrink-0 [transform-style:preserve-3d]"
        style={{ width: CARD_W, height: CARD_H }}
      >
        <button
          ref={ref}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          onMouseEnter={() => onHover(true)}
          onMouseLeave={() => onHover(false)}
          className={[
            "group relative block h-full w-full overflow-visible rounded-[1rem] border text-left",
            "border-white/[0.22]",
            "bg-[linear-gradient(140deg,rgba(190,210,240,0.16)_0%,rgba(60,80,120,0.08)_45%,rgba(20,30,50,0.04)_100%)]",
            "shadow-[0_28px_60px_rgba(0,0,0,0.6),0_8px_18px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.42),inset_0_-1px_0_rgba(0,0,0,0.55),inset_0_0_0_1px_rgba(180,210,255,0.05)]",
            "backdrop-blur-[3px]",
            "transition-[filter,opacity,box-shadow] duration-500 ease-out [transform-style:preserve-3d]",
            dimmed && !hovered && !selected ? "opacity-[0.42] saturate-[0.85]" : "opacity-100",
            hovered || selected
              ? "brightness-[1.1] saturate-[1.05] shadow-[0_36px_70px_rgba(0,0,0,0.55),0_10px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.55),inset_0_-1px_0_rgba(0,0,0,0.6),0_0_0_1px_rgba(190,220,255,0.32),0_0_56px_rgba(110,160,255,0.28)]"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-3 top-0 h-px bg-[linear-gradient(to_right,transparent_0%,rgba(255,255,255,0.85)_50%,transparent_100%)]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-5 top-[1px] h-2 rounded-full bg-[linear-gradient(to_bottom,rgba(255,255,255,0.42),transparent)] blur-[1.5px] opacity-80"
          />

          <span
            aria-hidden
            className="pointer-events-none absolute -inset-px rounded-[1.05rem] [background:linear-gradient(135deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_28%,rgba(255,255,255,0)_72%,rgba(180,210,255,0.22)_100%)] [mask:linear-gradient(black,black)_content-box,linear-gradient(black,black)] [mask-composite:exclude] [-webkit-mask-composite:xor] p-px"
          />

          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[1rem] [background:radial-gradient(ellipse_at_50%_-10%,rgba(255,255,255,0.22)_0%,transparent_55%),radial-gradient(ellipse_at_85%_95%,rgba(120,170,255,0.16)_0%,transparent_50%)] mix-blend-screen"
          />

          <div className="absolute inset-[5px] overflow-hidden rounded-[0.78rem] [transform:translateZ(0)] [box-shadow:inset_0_0_28px_rgba(8,16,36,0.65),inset_0_0_0_1px_rgba(180,210,255,0.06),inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div
              className="absolute inset-0 scale-[1.04] bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-[1.08]"
              style={{ backgroundImage: `url(${space.imageUrl})` }}
            />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_28%,transparent_18%,rgba(0,0,0,0.18)_55%,rgba(0,0,0,0.6)_100%)]" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,rgba(80,120,180,0.16)_0%,transparent_45%,transparent_70%,rgba(20,40,80,0.18)_100%)] mix-blend-overlay" />
            <div className="pointer-events-none absolute inset-0 [background:linear-gradient(165deg,rgba(255,255,255,0.18)_0%,transparent_38%,transparent_70%,rgba(255,255,255,0.04)_100%)] mix-blend-overlay" />
            <div className="pointer-events-none absolute inset-0 rounded-[0.78rem] shadow-[inset_0_0_22px_rgba(0,0,0,0.4)]" />
          </div>

          <span
            aria-hidden
            className="pointer-events-none absolute -left-px top-[14%] h-[58%] w-px bg-[linear-gradient(to_bottom,transparent,rgba(255,255,255,0.55)_50%,transparent)] opacity-80"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -right-px top-[22%] h-[44%] w-px bg-[linear-gradient(to_bottom,transparent,rgba(180,210,255,0.42)_50%,transparent)] opacity-70"
          />

          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.18),transparent)]"
          />

          <span
            aria-hidden
            className="pointer-events-none absolute inset-[5px] rounded-[0.78rem] [background:linear-gradient(115deg,transparent_30%,rgba(255,255,255,0.06)_45%,rgba(255,255,255,0.14)_50%,rgba(255,255,255,0.06)_55%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          />

          <div className="relative flex h-full flex-col justify-end p-2.5 [text-shadow:0_1px_8px_rgba(0,0,0,0.85)]">
            <p className="text-[8px] font-medium uppercase tracking-[0.26em] text-white/55">
              {space.area}
            </p>
            <p className="mt-0.5 line-clamp-2 text-[11px] font-medium leading-snug text-white/[0.96]">
              {space.title}
            </p>
          </div>
        </button>
      </div>
    );
  },
);
