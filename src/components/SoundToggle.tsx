"use client";

import { useEffect, useRef, useState } from "react";
import { iconButtonClass } from "./iconButton";

// Sound on/off in the header, after the audio button on why.zero.university:
// a sine wave that travels sideways while sound is on and flattens into a
// straight line when off (see `.sound-wave` in globals.css). Only the icon
// state for now; the audio itself gets wired to `on` later.

// One cycle across the icon, sampled at 11 points (x 1.6–18.4 in a 20×12
// box, amplitude 3 around y=6) and shifted 1/12 of a cycle per frame. The
// points are morphed with SMIL <animate>, which also works in Safari.
const xs = Array.from({ length: 11 }, (_, i) => 1.6 + i * 1.68);
const FRAMES = 12;
function wavePoints(phase: number) {
  return xs.map((x) => `${x.toFixed(2)},${(6 - 3 * Math.sin(((x - 1.6) / 16.4 + phase) * 2 * Math.PI)).toFixed(2)}`).join(" ");
}
const frames = Array.from({ length: FRAMES + 1 }, (_, i) => wavePoints(i / FRAMES));

export function SoundToggle() {
  const [on, setOn] = useState(true);
  const svg = useRef<SVGSVGElement>(null);

  // Run the wave only while on (and motion is allowed); off freezes it where
  // it is and the CSS flattens it.
  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => (on && !reduce.matches ? el.unpauseAnimations() : el.pauseAnimations());
    sync();
    reduce.addEventListener("change", sync);
    return () => reduce.removeEventListener("change", sync);
  }, [on]);

  return (
    <button
      type="button"
      aria-label={on ? "Sound on" : "Sound off"}
      aria-pressed={on}
      onClick={() => setOn((v) => !v)}
      className={`${iconButtonClass} cursor-pointer`}
    >
      <svg
        ref={svg}
        width={18}
        height={11}
        viewBox="0 0 20 12"
        fill="none"
        aria-hidden
        className={`block text-[#646464] dark:text-[#9b9b9b] ${on ? "sound-on" : "sound-off"}`}
      >
        <g className="sound-wave">
          <polyline
            points={frames[0]}
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          >
            <animate attributeName="points" dur="1.2s" repeatCount="indefinite" calcMode="linear" values={frames.join(";")} />
          </polyline>
        </g>
      </svg>
    </button>
  );
}
