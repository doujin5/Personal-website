"use client";

import { useEffect, useRef } from "react";

// The Figma "audio-waveform" icon (public/icons/audio-waveform.svg) drawn
// inline so its line can move: one stroke with four rounded humps (up, down,
// up, down) whose heights ripple in a loop, like audio playing. The heights
// are morphed with SMIL <animate> (works in Safari, unlike CSS `d`). Frame 0
// is the Figma shape, shown when paused or with reduced motion.

const R = 4 / 3; // hump corner radius, as in the Figma icon
const K = 0.5523 * R; // cubic handle length for a quarter circle

/** Waveform path for hump heights [up, down, up, down] measured from y=8. */
function wave([a1, b1, a2, b2]: number[]) {
  const f = (n: number) => +n.toFixed(3);
  // Quarter-circle turns between a column at x and the next one at x + 2R.
  const over = (x: number, top: number) => {
    const c = top + R;
    return `V${f(c)}C${f(x)} ${f(c - K)} ${f(x + R - K)} ${f(top)} ${f(x + R)} ${f(top)}C${f(x + R + K)} ${f(top)} ${f(x + 2 * R)} ${f(c - K)} ${f(x + 2 * R)} ${f(c)}`;
  };
  const under = (x: number, bottom: number) => {
    const c = bottom - R;
    return `V${f(c)}C${f(x)} ${f(c + K)} ${f(x + R - K)} ${f(bottom)} ${f(x + R)} ${f(bottom)}C${f(x + R + K)} ${f(bottom)} ${f(x + 2 * R)} ${f(c + K)} ${f(x + 2 * R)} ${f(c)}`;
  };
  return [
    `M${f(R)} ${f(8 + R / 2)}C${f(R + K)} ${f(8 + R / 2)} ${f(2 * R)} ${f(8 - R / 2 + K)} ${f(2 * R)} ${f(8 - R / 2)}`,
    over(2 * R, 8 - a1),
    under(4 * R, 8 + b1),
    over(6 * R, 8 - a2),
    under(8 * R, 8 + b2),
    `V${f(8 + R / 2)}C${f(10 * R)} ${f(8 + R / 2 - K)} ${f(11 * R - K)} ${f(8 - R / 2)} ${f(11 * R)} ${f(8 - R / 2)}`,
  ].join("");
}

// Figma heights first, then a few ripples; each hump stays clear of the
// centre so the rounded turns never overlap.
const frames = [
  [4.667, 6.667, 6.667, 4.667],
  [6.2, 3.4, 4.2, 6.4],
  [3.0, 5.8, 6.6, 3.2],
  [5.4, 6.4, 3.0, 5.6],
  [4.667, 6.667, 6.667, 4.667],
];
const values = frames.map(wave).join(";");
const keySplines = Array(frames.length - 1).fill("0.45 0 0.55 1").join(";");

export function WaveformIcon({ playing = true }: { playing?: boolean }) {
  const svg = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (playing && !reduce.matches) el.unpauseAnimations();
      else {
        el.pauseAnimations();
        el.setCurrentTime(0);
      }
    };
    sync();
    reduce.addEventListener("change", sync);
    return () => reduce.removeEventListener("change", sync);
  }, [playing]);

  return (
    <svg ref={svg} width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden className="block text-[#646464] dark:text-[#9b9b9b]">
      <path d={wave(frames[0])} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <animate attributeName="d" dur="1.8s" repeatCount="indefinite" calcMode="spline" values={values} keySplines={keySplines} />
      </path>
    </svg>
  );
}
