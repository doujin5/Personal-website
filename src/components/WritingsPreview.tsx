"use client";

import Image from "next/image";
import { useRef, useState, type ReactNode } from "react";
import type { Writing } from "@/data/writings";

// Hover preview for the writings list, after zero.university's founder
// letters: a card beside the list that springs open from its left edge on the
// first row hovered, then glides up and down to stay level with each row.
// Only on wide screens with a mouse (see `.writings-card` in globals.css);
// keyboard focus shows it too. The list rows themselves stay server-rendered.

type Preview = Pick<Writing, "description" | "image"> & { label: string };

export function WritingsPreview({ previews, children }: { previews: Preview[]; children: ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  // The last row shown stays in the card while it closes, so it doesn't empty
  // out mid-animation. `slide` is off when opening, so the card appears at the
  // row instead of travelling from wherever it last closed.
  const [card, setCard] = useState({ row: 0, top: 0, open: false, slide: false });

  const show = (target: EventTarget) => {
    const li = (target as Element).closest("li");
    if (!li || !wrap.current?.contains(li)) return;
    const row = Array.prototype.indexOf.call(li.parentElement!.children, li);
    const top = li.offsetTop + li.offsetHeight / 2;
    setCard((c) => (c.open && c.row === row ? c : { row, top, open: true, slide: c.open }));
  };
  const hide = () => setCard((c) => (c.open ? { ...c, open: false } : c));

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
        className={`writings-card${card.open ? " is-on" : ""}${card.slide ? "" : " no-slide"}`}
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
