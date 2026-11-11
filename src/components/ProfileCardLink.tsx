"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { ProfileCard } from "@/data/profile-cards";

// A bio link (X, LinkedIn) with a profile card that opens on hover, after the
// "Profile Card Design" shot on Dribbble (26600142): banner, photo overlapping
// it, name and handle or headline, the bio, then counts, set in the site's
// own text styles. Opens upward and closes like the writings preview card
// (`.writings-card` in globals.css): it springs open from its corner above
// the link (scale 0.4 × 0 → full) and folds back the same way. It stays open
// while the pointer moves onto the card (the gap below it is padding, so
// there's no dead zone), so links in the bio can be clicked.
// Keyboard focus opens it too; Escape closes it. Mouse only: on touch the
// link just opens the profile.
//
// It sits inside a <p>, so everything here is a <span> styled as a block.

// Opens at once, like the writings card; closing waits a beat so crossing
// the link's edge onto the card doesn't fold it. CLOSE_MS matches the wipe
// in `.wipe-out` (globals.css).
const OPEN_DELAY = 0;
const CLOSE_DELAY = 60;
const CLOSE_MS = 600;

const count = new Intl.NumberFormat("en", { notation: "compact" });

export function ProfileCardLink({
  label,
  href,
  card,
  className,
}: {
  label: string;
  href: string;
  card: ProfileCard;
  className?: string;
}) {
  // "closing" holds the card full size while it wipes out; only then does
  // it fold back down ("closed"), ready to spring open again.
  const [state, setState] = useState<"open" | "closing" | "closed">("closed");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const wrap = useRef<HTMLSpanElement>(null);

  const later = (open: boolean, ms: number) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (open) return setState("open");
      setState((s) => (s === "open" ? "closing" : s));
      timer.current = setTimeout(() => setState((s) => (s === "closing" ? "closed" : s)), CLOSE_MS);
    }, ms);
  };

  return (
    <span
      ref={wrap}
      className="relative inline-block"
      onPointerEnter={(e) => e.pointerType === "mouse" && later(true, OPEN_DELAY)}
      onPointerLeave={(e) => e.pointerType === "mouse" && later(false, CLOSE_DELAY)}
      onFocus={(e) => e.target.matches(":focus-visible") && later(true, 0)}
      onBlur={(e) => !wrap.current?.contains(e.relatedTarget) && later(false, 0)}
      onKeyDown={(e) => e.key === "Escape" && later(false, 0)}
    >
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {label}
      </a>
      <span
        data-state={state}
        className="profile-card wipe-out absolute bottom-full -left-6 z-30 block w-[368px] px-6 pt-6 pb-2 font-normal no-underline"
      >
        <span className="block rounded-[18px] border-[0.5px] border-line bg-canvas-secondary p-1.5 shadow-lifted">
          <span className="relative block aspect-[4/1] overflow-hidden rounded-[12px] bg-canvas-hover">
            <Image src={card.banner} alt="" fill sizes="308px" className="object-cover" />
          </span>
          <span className="mt-1.5 block rounded-[12px] border-[0.5px] border-line bg-canvas px-3 pb-3">
            <span className="relative -mt-8 block size-14 overflow-hidden rounded-full bg-canvas-hover ring-[3px] ring-canvas">
              <Image src={card.avatar} alt="" fill sizes="56px" className="object-cover" />
            </span>
            <span className="mt-2 block text-sm leading-normal font-medium text-fg">{card.name}</span>
            {card.subtitle && (
              <span className="block font-mono text-xs leading-normal text-fg-muted uppercase">{card.subtitle}</span>
            )}
            {card.bio && (
              <span className="mt-2 block text-xs leading-normal text-pretty text-fg-muted">
                {card.bio.map((part, i) =>
                  typeof part === "string" ? (
                    part
                  ) : (
                    <a
                      key={i}
                      href={part.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-fg transition-colors hover:text-link-hover"
                    >
                      {part.label}
                    </a>
                  ),
                )}
              </span>
            )}
            <span className="mt-3 flex gap-3">
              {card.stats.map((s) => (
                <span key={s.label} className="flex items-baseline gap-1">
                  <span className="text-sm leading-normal font-medium text-fg tabular-nums">{typeof s.value === "number" ? count.format(s.value) : s.value}</span>
                  <span className="font-mono text-xs leading-normal text-fg-muted uppercase">{s.label}</span>
                </span>
              ))}
            </span>
          </span>
        </span>
      </span>
    </span>
  );
}
