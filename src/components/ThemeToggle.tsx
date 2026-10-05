"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { iconButtonClass } from "./iconButton";

type Mode = "system" | "light" | "dark";
const next: Record<Mode, Mode> = { system: "light", light: "dark", dark: "system" };

const icons = [
  { mode: "system", src: "/icons/tv-minimal.svg" },
  { mode: "light", src: "/icons/sun.svg" },
  { mode: "dark", src: "/icons/moon-star.svg" },
] as const;

// Cycles system (monitor) → light (sun) → dark (moon) → system. Light and dark
// are stored and set as `data-theme` on <html> (restored before paint by the
// script in layout.tsx); system clears both so the CSS follows the OS. The
// visible icon is picked by CSS from `data-theme` (see globals.css), so it is
// right on first paint without waiting for hydration. Each icon has a wrapper
// for its entrance animation and the image itself for its hover motion.
export function ThemeToggle() {
  const button = useRef<HTMLButtonElement>(null);

  // Replays the monitor icon's entrance when the OS flips light/dark while
  // following the system. It stays visible then, so the CSS animation won't
  // restart on its own; play the same keyframes (theme-system-in) directly.
  useEffect(() => {
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const icon = button.current?.querySelector(".theme-icon-system");
      if (!icon || document.documentElement.dataset.theme) return;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      icon.animate(
        [{ opacity: 0, transform: "translateY(5px) scale(0.6)" }, {}],
        { duration: 420, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" },
      );
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  function cycle() {
    // The newly shown icon's entrance restarts on its own (it goes from
    // display:none to shown); this just enables them after the first switch.
    button.current?.setAttribute("data-animate", "");
    const root = document.documentElement;
    const mode = (root.dataset.theme as Mode | undefined) ?? "system";
    const to = next[mode];
    const apply = () => {
      try {
        if (to === "system") {
          delete root.dataset.theme;
          localStorage.removeItem("theme");
        } else {
          root.dataset.theme = to;
          localStorage.setItem("theme", to);
        }
      } catch {}
    };

    // Crossfade the whole page between themes with a view transition (see
    // `data-theme-fade` in globals.css): it covers colours, images and the
    // illustration's dark-mode filter alike, which CSS transitions can't.
    if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      apply();
      return;
    }
    root.dataset.themeFade = "";
    document.startViewTransition(apply).finished.finally(() => delete root.dataset.themeFade);
  }

  return (
    <button
      ref={button}
      type="button"
      onClick={cycle}
      className={`theme-toggle group/theme relative ${iconButtonClass}`}
    >
      {icons.map(({ mode, src }) => (
        <span key={mode} className={`theme-icon-${mode}`}>
          <Image src={src} alt={`Theme: ${mode}`} width={16} height={16} className="block dark:invert" />
        </span>
      ))}
      {/* Current mode, styled like the email tooltip (Figma Tooltip). Sits
          below the button (the header is near the top) and right-aligned so
          it never runs off small screens. The label is picked by CSS. */}
      <span
        aria-hidden
        className="pointer-events-none absolute top-full right-0 mt-2 -translate-y-1 rounded-sm border-[0.5px] border-line bg-canvas px-2 py-1 text-xs leading-4 font-medium whitespace-nowrap text-fg opacity-0 shadow-lifted transition-[opacity,translate] duration-150 group-hover/theme:translate-y-0 group-hover/theme:opacity-100 group-focus-visible/theme:translate-y-0 group-focus-visible/theme:opacity-100"
      >
        {icons.map(({ mode }) => (
          <span key={mode} className={`theme-label-${mode}`}>
            {mode[0].toUpperCase() + mode.slice(1)}
          </span>
        ))}
      </span>
    </button>
  );
}
