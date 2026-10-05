"use client";

import { useState } from "react";
import { iconButtonClass } from "./iconButton";

// Sound on/off in the header, after zero.university's sound control: five
// rounded bars that bounce like an equaliser while on and settle into a row
// of dots when off (see `.sound-bar` in globals.css). Only the icon state for
// now; the audio itself gets wired to `on` later.

// Bar x positions in the 16×16 box, and each bar's bounce period and phase so
// they never move in step. `rest` is the height kept with reduced motion.
const bars = [
  { x: 2.5, d: "0.9s", delay: "-0.3s", rest: 0.45 },
  { x: 5.25, d: "0.7s", delay: "-0.6s", rest: 0.8 },
  { x: 8, d: "1s", delay: "-0.1s", rest: 1 },
  { x: 10.75, d: "0.75s", delay: "-0.45s", rest: 0.7 },
  { x: 13.5, d: "0.85s", delay: "-0.2s", rest: 0.4 },
];

export function SoundToggle() {
  const [on, setOn] = useState(true);

  return (
    <button
      type="button"
      aria-label={on ? "Sound on" : "Sound off"}
      aria-pressed={on}
      onClick={() => setOn((v) => !v)}
      className={`${iconButtonClass} cursor-pointer`}
    >
      <svg
        width={16}
        height={16}
        viewBox="0 0 16 16"
        aria-hidden
        className={`block text-[#646464] dark:text-[#9b9b9b] ${on ? "sound-on" : "sound-off"}`}
      >
        {bars.map((b) => (
          <line
            key={b.x}
            className="sound-bar"
            x1={b.x}
            x2={b.x}
            y1={3}
            y2={13}
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            style={{ "--d": b.d, "--delay": b.delay, "--rest": b.rest } as React.CSSProperties}
          />
        ))}
      </svg>
    </button>
  );
}
