"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

// Line-by-line fade-in for the page inside [data-reveal-root]: headings,
// paragraphs, list rows, figures and anything marked [data-reveal] rise
// slightly and sharpen into place one after another. Lines already on screen
// play on load; the rest play as they scroll into view. They are hidden before
// paint by the `reveal-pending` class (set early in layout.tsx), which keeps
// them at opacity 0 until they're shown here. See `.line-in` in globals.css.

const LINES = ":is(h1, h2, h3, p, li, header, figure, [data-reveal]):not(dialog *)";
const STAGGER = 70; // ms between lines
const MAX_STAGGER = 12; // cap so long batches don't drag

export function LineReveal() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const html = document.documentElement;
    html.dataset.revealReady = "";
    const scope = document.querySelector("[data-reveal-root]");
    if (!scope || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      html.classList.remove("reveal-pending");
      return;
    }
    html.classList.add("reveal-pending");

    // Animate outermost lines only; nested ones ride along with their parent.
    const all = [...scope.querySelectorAll<HTMLElement>(LINES)];
    const lines = all.filter((el) => {
      const outer = el.parentElement?.closest(LINES);
      if (outer && scope.contains(outer)) {
        el.dataset.shown = "";
        return false;
      }
      return true;
    });

    const show = (el: HTMLElement, order: number) => {
      el.style.animationDelay = `${Math.min(order, MAX_STAGGER) * STAGGER}ms`;
      el.classList.add("line-in");
      el.dataset.shown = "";
    };

    // Arriving through the page wipe (TransitionLink sets data-vt): the wipe
    // is the reveal, so the first screen shows at once instead of fading in
    // behind it, and the fixed chrome skips its fade too. The new page starts
    // at the top, so measure against the document rather than the old scroll.
    const wiped = "vt" in html.dataset;
    if (wiped) {
      document
        .querySelectorAll<HTMLElement>('[class*="animate-fade-in"]')
        .forEach((el) => (el.style.animation = "none"));
    }

    let order = 0;
    const later: HTMLElement[] = [];
    for (const el of lines) {
      const r = el.getBoundingClientRect();
      const top = wiped ? r.top + scrollY : r.top;
      const onScreen = top < innerHeight && top + r.height > 0;
      if (onScreen && wiped) el.dataset.shown = "";
      else if (onScreen) show(el, order++);
      else later.push(el);
    }

    const io = new IntersectionObserver(
      (entries) => {
        let batch = 0;
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          show(e.target as HTMLElement, batch++);
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -6% 0px" },
    );
    later.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
