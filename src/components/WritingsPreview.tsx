"use client";

import Image from "next/image";
import { useRef, useState, type ReactNode } from "react";
import type { Writing } from "@/data/writings";

// Hover preview for the writings list, after zero.university's founder
// letters: a card beside the list that springs open from its left edge on the
// first row hovered, then glides up and down to stay level with each row.
// Leaving the list wipes it away like the page wipe into a case study
// (`.wipe-out` in globals.css). Only on wide screens with a mouse (see `.writings-card` in globals.css);
// keyboard focus shows it too. The list rows themselves stay server-rendered.

type Preview = Pick<Writing, "description" | "image"> & { label: string };

/** Matches the wipe in `.wipe-out` (globals.css). */
const CLOSE_MS = 600;

export function WritingsPreview({ previews, children }: { previews: Preview[]; children: ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  // The last row shown stays in the card while it closes, so it doesn't empty
  // out mid-animation. "closing" holds the card open while it wipes out; only
  // then is it "closed" and folded, ready to spring open again. `slide` is off
  // when opening from closed, so the card appears at the row instead of
  // travelling from wherever it last closed.
  type Phase = "open" | "closing" | "closed";
  const [card, setCard] = useState<{ row: number; top: number; phase: Phase; slide: boolean }>({
    row: 0,
    top: 0,
    phase: "closed",
    slide: false,
  });
  const closing = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = (target: EventTarget) => {
    const li = (target as Element).closest("li");
    if (!li || !wrap.current?.contains(li)) return;
    const row = Array.prototype.indexOf.call(li.parentElement!.children, li);
    const top = li.offsetTop + li.offsetHeight / 2;
    clearTimeout(closing.current);
    setCard((c) =>
      c.phase === "open" && c.row === row ? c : { row, top, phase: "open", slide: c.phase !== "closed" },
    );
  };
  const hide = () => {
    setCard((c) => (c.phase === "open" ? { ...c, phase: "closing" } : c));
    clearTimeout(closing.current);
    closing.current = setTimeout(
      () => setCard((c) => (c.phase === "closing" ? { ...c, phase: "closed" } : c)),
      CLOSE_MS,
    );
  };

  const p = previews[card.row];
  return (
    <div
      ref={wrap}
      className="writings relative w-full"
      onPointerOver={(e) => e.pointerType === "mouse" && show(e.target)}
      onPointerLeave={hide}
      onFocus={(e) => show(e.target)}
      onBlur={(e) => !wrap.current?.contains(e.relatedTarget) && hide()}
    >
      {children}
      <div
        aria-hidden="true"
        data-state={card.phase}
        className={`writings-card wipe-out${card.slide ? "" : " no-slide"}`}
        style={{ top: card.top }}
      >
        <div className="writings-card-in rounded-[14px] border-[0.5px] border-line bg-canvas p-1.5 pb-3 shadow-lifted">
          <div className="relative aspect-[16/10] overflow-hidden rounded-[9px] bg-canvas-secondary">
            {previews.map((q, i) =>
              q.image ? (
                <Image
                  key={q.image}
                  src={q.image}
                  alt=""
                  fill
                  sizes="272px"
                  className={`object-cover ${i === card.row ? "" : "opacity-0"}`}
                />
              ) : null,
            )}
            {!p?.image && (
              <div className="absolute inset-0 grid place-items-center">
                <Image src="/logo-mark.svg" alt="" width={37} height={26} className="dark:hidden" />
                <Image src="/logo-mark-dark.svg" alt="" width={37} height={26} className="hidden dark:block" />
              </div>
            )}
          </div>
          <p className="mx-1.5 mt-3 font-mono text-xs leading-normal text-fg-muted uppercase">{p?.label}</p>
          <p className="mx-1.5 mt-1 text-xs leading-normal text-pretty text-fg">{p?.description}</p>
        </div>
      </div>
    </div>
  );
}
