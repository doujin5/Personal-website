"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// Image hover + lightbox after makingsoftware.com: hairline guides fade in
// along the image's edges on hover, running past its corners; clicking opens a full-screen view over a blurred page with the
// image enlarged (grown out of its place on the page), its caption typed in
// underneath and an EXIT label. Esc, EXIT or a click anywhere closes it.

type Props = {
  src: string;
  alt: string;
  /** Rendered size on the page; the files are 2× exports. */
  width: number;
  height: number;
  /** "Fig. N" number shown in the caption. */
  figure: number;
  preload?: boolean;
};

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Transform that maps the `to` box onto the `from` box (for FLIP). */
function flip(from: DOMRect, to: DOMRect) {
  const sx = from.width / to.width;
  const sy = from.height / to.height;
  const dx = from.left + from.width / 2 - (to.left + to.width / 2);
  const dy = from.top + from.height / 2 - (to.top + to.height / 2);
  return `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
}

export function ZoomableImage({ src, alt, width, height, figure, preload }: Props) {
  const thumb = useRef<HTMLImageElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const big = useRef<HTMLImageElement>(null);
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState(0);
  const caption = `Fig. ${figure} — ${alt}`;

  // Open: show the dialog, grow the image out of the thumbnail, type the caption.
  useEffect(() => {
    if (!open) return;
    const d = dialog.current!;
    d.showModal();
    document.documentElement.style.overflow = "hidden";
    if (reduced()) return;
    const from = thumb.current!.getBoundingClientRect();
    const to = big.current!.getBoundingClientRect();
    big.current!.animate([{ transform: flip(from, to) }, { transform: "none" }], {
      duration: 320,
      easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    });
    d.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: "ease-out" });
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const n = Math.min(caption.length, Math.round(((now - start - 120) / 400) * caption.length));
      setTyped(Math.max(0, n));
      if (n < caption.length) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [open, caption.length]);

  // Close: shrink back into the thumbnail, then tear down.
  function close() {
    const d = dialog.current;
    if (!d?.open) return;
    const done = () => {
      d.close();
      document.documentElement.style.overflow = "";
      setOpen(false);
      setTyped(0);
    };
    if (reduced()) return done();
    const from = thumb.current!.getBoundingClientRect();
    const to = big.current!.getBoundingClientRect();
    big.current!.animate([{ transform: "none" }, { transform: flip(from, to) }], {
      duration: 260,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      fill: "forwards",
    });
    d.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, easing: "ease-in", fill: "forwards" }).finished.then(done);
  }

  return (
    <>
      <button
        type="button"
        data-reveal
        onClick={() => setOpen(true)}
        aria-label={`Enlarge: ${alt}`}
        className="group/zoom relative block w-full cursor-pointer focus-visible:outline-none"
      >
        {/* Guide lines along each edge, running past the corners. */}
        {[
          "-inset-x-3 top-0 h-px",
          "-inset-x-3 bottom-0 h-px",
          "-inset-y-3 left-0 w-px",
          "-inset-y-3 right-0 w-px",
        ].map((edge) => (
          <span
            key={edge}
            aria-hidden
            className={`pointer-events-none absolute ${edge} bg-fg/10 opacity-0 transition-opacity duration-300 group-hover/zoom:opacity-100 group-focus-visible/zoom:bg-fg/30 group-focus-visible/zoom:opacity-100`}
          />
        ))}
        <Image
          ref={thumb}
          src={src}
          alt={alt}
          // The files' own 2× pixel size: whole numbers, same aspect ratio.
          width={Math.round(width * 2)}
          height={Math.round(height * 2)}
          preload={preload}
          className="block h-auto w-full"
        />
      </button>

      {open && (
        <dialog
          ref={dialog}
          aria-label={caption}
          onCancel={(e) => {
            e.preventDefault(); // Esc: animate out instead of closing at once
            close();
          }}
          onClick={close}
          className="m-0 h-dvh max-h-none w-dvw max-w-none cursor-pointer bg-canvas/40 p-0 backdrop-blur-xl backdrop:bg-transparent"
        >
          <button
            type="button"
            autoFocus
            onClick={close}
            className="fixed top-4 right-5 cursor-pointer font-mono text-xs leading-4 text-fg-muted uppercase outline-none hover:text-fg focus-visible:text-fg focus-visible:underline"
          >
            Exit
          </button>
          <figure className="flex h-full flex-col items-center justify-center gap-4 px-6 py-14 [@media(max-height:500px)]:gap-2 [@media(max-height:500px)]:py-3">
            {/* Plain img: same file as the thumbnail, so it's already loaded. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={big}
              src={src}
              alt={alt}
              width={width * 2}
              height={height * 2}
              className="h-auto max-h-[calc(100dvh-9rem)] w-auto [@media(max-height:500px)]:max-h-[calc(100dvh-3.5rem)] max-w-full will-change-transform"
              // Never wider than the screen, nor than the 2× file itself (max 1200px).
              style={{ maxWidth: `min(100%, ${Math.min(1200, width * 2)}px)` }}
            />
            <figcaption className="min-h-4 max-w-[600px] text-center font-mono text-xs leading-4 text-fg-muted">
              {reduced() ? caption : caption.slice(0, typed)}
            </figcaption>
          </figure>
        </dialog>
      )}
    </>
  );
}
