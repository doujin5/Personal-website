"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLayoutEffect, type ComponentProps } from "react";

// Page wipe after opening a post on zero.university/founder-letters: the new
// page is uncovered from the bottom up through a soft gradient edge while the
// old page stays put ("open"); "close" runs the wipe from the top down. Uses
// the View Transitions API with root snapshots; the animation lives in
// globals.css under html[data-vt]. Falls back to a plain navigation where
// view transitions aren't supported or motion is reduced.

type Direction = "open" | "close";

let finishNavigation: (() => void) | null = null;

/** Mount once (layout): lets a pending wipe capture the new page once it's rendered. */
export function RouteChangeSignal() {
  const pathname = usePathname();
  useLayoutEffect(() => {
    finishNavigation?.();
    finishNavigation = null;
  }, [pathname]);
  return null;
}

export function TransitionLink({
  direction,
  onClick,
  href,
  ...props
}: ComponentProps<typeof Link> & { direction: Direction; href: string }) {
  const router = useRouter();
  return (
    <Link
      href={href}
      {...props}
      onClick={(e) => {
        onClick?.(e);
        const plain = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;
        if (
          e.defaultPrevented ||
          plain ||
          !document.startViewTransition ||
          matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
          return;
        }
        e.preventDefault();
        const html = document.documentElement;
        html.dataset.vt = direction;
        const vt = document.startViewTransition(
          () =>
            new Promise<void>((resolve) => {
              finishNavigation = resolve;
              router.push(href);
              setTimeout(resolve, 3000); // never hang if the route doesn't change
            }),
        );
        vt.finished.finally(() => delete html.dataset.vt);
      }}
    />
  );
}
