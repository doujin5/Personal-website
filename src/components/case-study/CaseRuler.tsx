"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// Side ruler from the case-study frame (Figma 390:64244), behaving like the
// makingsoftware.com side ruler: an even column of 0.5px ticks (~9px apart,
// as in Figma) fixed at mid-height, 16px in from the right edge, 75% of the
// window tall (398px, the Figma size, up to 720px). The column maps the whole
// page from 0 (top) to 1 (bottom). Each heading snaps to its nearest tick,
// which turns dark and shows the heading's position. Hovering the ruler swaps
// those numbers for the heading names; the tick under the pointer grows and
// darkens, and clicking any tick jumps there. The marker steps tick by tick
// as you read, and the ticks around it swell and blend towards its colour.

const SCRAMBLE_GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=/<>";
const SCRAMBLE_MS = 500; // per name, after its cascade delay
const SCRAMBLE_STEP_MS = 40; // how often the random glyphs change

const MIN_HEIGHT = 398;
const MAX_HEIGHT = 720;
const TICK_GAP = 398 / 44; // ~9.05px, as in Figma

type Heading = { label: string; pct: number };

/** Ruler height for the current window, snapped to whole tick gaps. */
function rulerHeight() {
  const h = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, innerHeight * 0.75));
  return Math.round(h / TICK_GAP) * TICK_GAP;
}

/** Reading position as a share of the whole page: 0 at the top, 1 at the end. */
function readingPosition() {
  const doc = document.documentElement.scrollHeight;
  const max = Math.max(1, doc - innerHeight);
  const p = Math.min(1, Math.max(0, scrollY / max));
  return (scrollY + p * innerHeight) / doc;
}

/** Gives each heading the nearest free tick; returns tick index → heading name. */
function placeHeadings(headings: Heading[], last: number) {
  const at = new Map<number, string>();
  for (const h of headings) {
    let i = Math.round(h.pct * last);
    while (at.has(i) && i < last) i++;
    at.set(i, h.label);
  }
  return at;
}

export function CaseRuler() {
  const track = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const marker = useRef<HTMLSpanElement>(null);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [height, setHeight] = useState(MIN_HEIGHT);
  const last = Math.round(height / TICK_GAP); // index of the bottom tick
  const named = useMemo(() => placeHeadings(headings, last), [headings, last]);
  // Top-to-bottom order of each heading tick, for the hover cascade.
  const order = useMemo(
    () => new Map([...named.keys()].sort((a, b) => a - b).map((tick, n) => [tick, n])),
    [named],
  );

  useEffect(() => {
    function measure() {
      setHeight(rulerHeight());
      const doc = document.documentElement.scrollHeight;
      setHeadings(
        [...document.querySelectorAll<HTMLElement>("article :is(h1, h2, h3)")].map((h) => ({
          label: h.textContent ?? "",
          pct: (h.getBoundingClientRect().top + scrollY) / doc,
        })),
      );
    }
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      removeEventListener("resize", measure);
    };
  }, []);

  // Step the marker to the last tick reached; swell the ticks around it and
  // blend them towards its colour. Kept cheap for fast scrolling: tick
  // elements are looked up once, only the ticks near the old and new marker
  // positions are touched, the marker moves with a transform, and it only
  // eases for slow single-tick steps; anything faster snaps so it never trails.
  useEffect(() => {
    const el = track.current;
    const mark = marker.current;
    if (!el || !mark) return;
    const ticks = [...el.querySelectorAll<HTMLElement>("[data-tick]")];
    const REACH = 4; // ticks either side that swell
    let frame = 0;
    let current = -1;
    let lastStep = 0;
    function paint(index: number, i: number) {
      const t = ticks[index];
      if (!t) return;
      t.dataset.current = String(index === i);
      if (t.dataset.heading !== undefined) return;
      const k = Math.abs(index - i) > REACH ? 0 : Math.exp(-((((index - i) * TICK_GAP) / 13) ** 2));
      t.style.setProperty("--w", `${8 + 10 * k}px`);
      t.style.setProperty(
        "--c",
        k > 0.02
          ? `color-mix(in oklab, var(--rs-color-foreground-base-primary) ${Math.round(k * 100)}%, var(--tick))`
          : "var(--tick)",
      );
    }
    function update() {
      frame = 0;
      const i = Math.min(last, Math.floor(readingPosition() * last + 0.001));
      if (i === current) return;
      const prev = current;
      current = i;
      const now = performance.now();
      const slow = prev >= 0 && Math.abs(i - prev) === 1 && now - lastStep > 160;
      lastStep = now;
      mark!.style.transitionDuration = slow ? "" : "0ms";
      mark!.style.transform = `translateY(${i * TICK_GAP}px)`;
      if (readout.current) readout.current.textContent = (i / last).toFixed(2);
      // Repaint the old neighbourhood (to reset it) and the new one.
      const touched = new Set<number>();
      for (const c of prev < 0 ? [i] : [prev, i])
        for (let n = c - REACH; n <= c + REACH; n++) if (n >= 0 && n <= last) touched.add(n);
      if (prev < 0) ticks.forEach((_, n) => touched.add(n)); // first paint: all
      touched.forEach((n) => paint(n, i));
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [last, named]);

  // Scramble reveal for the heading names while the ruler is hovered: each
  // name starts as random glyphs and locks into its text left to right,
  // starting with the same cascade delay as its fade-in. Mutates the text
  // node directly so React's own node stays in place.
  const scrambling = useRef<number[]>([]);
  function stopScramble(nav: HTMLElement) {
    scrambling.current.forEach(cancelAnimationFrame);
    scrambling.current = [];
    nav.querySelectorAll<HTMLElement>("[data-scramble]").forEach((el) => {
      if (el.firstChild) el.firstChild.nodeValue = el.dataset.scramble!;
    });
  }
  function startScramble(nav: HTMLElement) {
    stopScramble(nav);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const now = performance.now();
    nav.querySelectorAll<HTMLElement>("[data-scramble]").forEach((el, n) => {
      const text = el.dataset.scramble!;
      const node = el.firstChild;
      if (!node) return;
      const start = now + Number(el.dataset.delay);
      let shown = -Infinity;
      const frame = (t: number) => {
        const p = (t - start) / SCRAMBLE_MS;
        if (p >= 1) {
          node.nodeValue = text;
          return;
        }
        if (t - shown >= SCRAMBLE_STEP_MS) {
          shown = t;
          const locked = Math.max(0, Math.floor(p * text.length));
          node.nodeValue = [...text]
            .map((c, k) =>
              k < locked || c === " " ? c : SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)],
            )
            .join("");
        }
        scrambling.current[n] = requestAnimationFrame(frame);
      };
      scrambling.current[n] = requestAnimationFrame(frame);
    });
  }

  // Scroll so the reading position lands on the tick: solve
  // readingPosition() = pct, i.e. s + (s / max) * innerHeight = pct * doc.
  function jump(pct: number) {
    const doc = document.documentElement.scrollHeight;
    const max = Math.max(1, doc - innerHeight);
    const top = (pct * doc) / (1 + innerHeight / max);
    const smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    scrollTo({ top: Math.min(max, Math.max(0, top)), behavior: smooth ? "smooth" : "auto" });
  }

  return (
    <nav
      aria-label="Sections"
      onPointerEnter={(e) => startScramble(e.currentTarget)}
      onPointerLeave={(e) => stopScramble(e.currentTarget)}
      className="group/ruler fixed top-1/2 right-4 z-20 hidden -translate-y-1/2 motion-safe:animate-fade-in lg:block"
      style={{ height, width: 18, animationDelay: "200ms" }}
    >
      <div ref={track} className="relative h-full w-full">
        {Array.from({ length: last + 1 }, (_, i) => {
          const name = named.get(i);
          return (
            <button
              key={i}
              type="button"
              data-tick={i}
              data-heading={name ? "" : undefined}
              aria-label={name ?? `Jump to ${(i / last).toFixed(2)}`}
              onClick={() => jump(i / last)}
              // A tall, wide hit area per tick, like makingsoftware.com.
              className="group/tick absolute right-0 flex h-2 w-24 -translate-y-1/2 cursor-pointer items-center justify-end gap-1"
              style={{ top: i * TICK_GAP }}
            >
              {name && (
                <span className="relative font-mono text-[11px] leading-3 whitespace-nowrap">
                  <span className="text-fg-muted transition-opacity duration-300 ease-out group-hover/ruler:opacity-0 group-hover/ruler:duration-200 group-data-[current=true]/tick:opacity-0">
                    {(i / last).toFixed(2)}
                  </span>
                  {/* Heading name while the ruler is hovered: after a short pause,
                      names slide in and sharpen one after another, top to bottom;
                      on leave they all fade out quickly. */}
                  <span
                    className="pointer-events-none absolute top-0 right-0 translate-x-1.5 text-fg-muted uppercase opacity-0 blur-[2px] transition-[opacity,translate,filter,color] duration-200 ease-out group-hover/ruler:translate-x-0 group-hover/ruler:opacity-100 group-hover/ruler:blur-none group-hover/ruler:delay-(--reveal-delay) group-hover/ruler:duration-400 group-hover/ruler:ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/tick:text-fg"
                    style={{ "--reveal-delay": `${80 + (order.get(i) ?? 0) * 35}ms` } as React.CSSProperties}
                    data-scramble={name}
                    data-delay={80 + (order.get(i) ?? 0) * 35}
                    aria-hidden
                  >
                    {name}
                  </span>
                </span>
              )}
              <span
                className={`h-[0.5px] shrink-0 transition-[width,background-color,opacity] duration-150 group-hover/tick:w-[18px] group-hover/tick:bg-fg group-data-[current=true]/tick:opacity-0 ${
                  name ? "w-3.5 bg-fg" : "w-[var(--w,8px)] bg-[var(--c,var(--tick))]"
                }`}
              />
            </button>
          );
        })}

        {/* The marker steps here tick by tick. */}
        <span
          ref={marker}
          className="pointer-events-none absolute top-0 right-0 flex -translate-y-1/2 items-center gap-1 will-change-transform motion-safe:transition-transform motion-safe:duration-150 motion-safe:ease-out"
        >
          <span
            ref={readout}
            className="font-mono text-[11px] leading-3 text-fg tabular-nums transition-opacity duration-300 ease-out group-hover/ruler:opacity-0 group-hover/ruler:duration-200"
          />
          <span className="h-[2px] w-[18px] bg-fg" />
        </span>
      </div>
    </nav>
  );
}
