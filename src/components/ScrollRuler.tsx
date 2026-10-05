"use client";

import { useEffect, useRef, useState } from "react";

// A vertical tick tape on the right edge. The marker stays fixed at mid-height
// and the tape slides past it as the page scrolls (after why.zero.university's
// top ruler); long ticks mark sections, hovering shows their names and clicking
// jumps to them, and the marker reads progress 0.00–1.00 (after the side ruler
// on makingsoftware.com). Sections are any elements with `data-ruler="Label"`.

const GAP = 8; // px between ticks on the tape
const TAPE_PER_SCROLL = 0.6; // tape px travelled per px of page scroll
const MIN_TAPE = 240;

type Mark = { label: string; at: number; top: number };

export function ScrollRuler() {
  const tape = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const [length, setLength] = useState(0);
  const [marks, setMarks] = useState<Mark[]>([]);

  // Measure the scroll range and where each section sits on the tape.
  useEffect(() => {
    function measure() {
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      const len = Math.max(MIN_TAPE, Math.round(max * TAPE_PER_SCROLL));
      setLength(len);
      setMarks(
        [...document.querySelectorAll<HTMLElement>("[data-ruler]")].map((el) => {
          const top = el.getBoundingClientRect().top + scrollY;
          return { label: el.dataset.ruler!, top, at: (Math.min(top, max) / max) * len };
        }),
      );
    }
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, []);

  // Slide the tape with the scroll, easing towards the target so it glides.
  useEffect(() => {
    if (!length) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let current = -1;
    let frame = 0;
    const progress = () =>
      Math.min(1, Math.max(0, scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)));
    function render() {
      const target = progress();
      current = still || current < 0 ? target : current + (target - current) * 0.18;
      if (Math.abs(target - current) < 0.0005) current = target;
      tape.current?.style.setProperty("transform", `translateY(${-current * length}px)`);
      if (readout.current) readout.current.textContent = current.toFixed(2);
      frame = current === target ? 0 : requestAnimationFrame(render);
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(render);
    }
    render();
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [length]);

  function jump(top: number) {
    const smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    scrollTo({ top, behavior: smooth ? "smooth" : "auto" });
  }

  const minor = length ? Array.from({ length: Math.floor(length / GAP) + 1 }, (_, i) => i * GAP) : [];

  return (
    <nav
      aria-label="Sections"
      className="pointer-events-none fixed inset-y-0 right-0 z-20 hidden w-48 [mask-image:linear-gradient(to_bottom,transparent_8%,#000_35%,#000_65%,transparent_92%)] lg:block"
    >
      <div className="group/ruler pointer-events-auto absolute inset-y-0 right-0 w-14">
        <div ref={tape} className="absolute top-1/2 right-6 will-change-transform">
          {minor
            .filter((y) => marks.every((m) => Math.abs(m.at - y) > GAP / 2))
            .map((y) => (
              <span key={y} className="absolute right-0 h-px w-2 bg-fg-muted/30" style={{ top: y }} />
            ))}
          {marks.map((m) => (
            <button
              key={m.label}
              type="button"
              onClick={() => jump(m.top)}
              className="group/tick absolute right-0 flex h-3 -translate-y-1/2 cursor-pointer items-center justify-end"
              style={{ top: m.at }}
            >
              <span className="mr-2 font-mono text-[11px] leading-none whitespace-nowrap text-fg-muted uppercase opacity-0 transition-opacity duration-200 group-hover/ruler:opacity-100 group-hover/tick:text-fg group-focus-visible/tick:opacity-100">
                {m.label}
              </span>
              <span className="h-px w-3 bg-fg-muted transition-[width,background-color] duration-150 group-hover/tick:w-5 group-hover/tick:bg-fg" />
            </button>
          ))}
        </div>

        {/* Fixed marker at mid-height; the tape moves under it. */}
        <div className="pointer-events-none absolute top-1/2 right-6 flex -translate-y-1/2 items-center gap-2 text-sage">
          <span
            ref={readout}
            className="font-mono text-[11px] leading-none tabular-nums transition-opacity duration-200 group-hover/ruler:opacity-0"
          >
            0.00
          </span>
          <span className="h-px w-5 bg-sage" />
        </div>
      </div>
    </nav>
  );
}
