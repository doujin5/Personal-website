"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { isAudioUnlocked, isSoundOn, onSoundChange, setSoundOn, takeUnlockClick } from "@/lib/sound";
import { iconButtonClass } from "./iconButton";

// Sound on/off, after the audio button on why.zero.university: a sine wave
// that travels sideways while sound is on and flattens into a straight line
// when off (see `.sound-wave` in globals.css). Browsers keep every page load
// silent until the first click, tap or key press, so the wave also stays flat
// until then; that first gesture anywhere unlocks audio and starts it.

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
  // The choice is remembered (lib/sound.ts) so UI sounds elsewhere follow it.
  // The wave only moves when sound is chosen *and* audio is unlocked, so it
  // always matches what can be heard; the server render is flat.
  const chosen = useSyncExternalStore(onSoundChange, isSoundOn, () => true);
  const unlocked = useSyncExternalStore(onSoundChange, isAudioUnlocked, () => false);
  const on = chosen && unlocked;
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
      aria-label={on ? "Sound on" : chosen ? "Enable sound" : "Sound off"}
      aria-pressed={on}
      onClick={() => {
        // The click that unlocked audio just turns the (chosen) sound on.
        if (takeUnlockClick() && chosen) return;
        setSoundOn(!chosen);
      }}
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
