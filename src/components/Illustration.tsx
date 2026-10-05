"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// Layer geometry comes from the Figma frame "Isometric – Laptop & Pen (Light)"
// (1440×550, node 348:43619), in paint order. `inset` is the stroke overflow of
// the exported SVG relative to the layer box.
type Layer = {
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  inset?: string;
  group: string;
  shadow?: boolean;
  float?: boolean;
};

const d = "/illustration/";
const layers: Layer[] = [
  { src: "cube1-shadow", x: 712.66, y: 586.57, w: 77.975, h: 53.704, group: "cube1", shadow: true },
  { src: "cube2-shadow", x: 734.65, y: 637.35, w: 48.899, h: 33.815, group: "cube2", shadow: true },
  { src: "cube3-shadow", x: 1027, y: 259.57, w: 43.078, h: 29.838, group: "cube3", shadow: true },
  { src: "stack-shadow", x: 315.96, y: 162.38, w: 84.473, h: 61.801, group: "stack", shadow: true },
  { src: "ball1-shadow", x: 1039.43, y: 546.73, w: 60.569, h: 44.282, group: "ball1", shadow: true },
  { src: "ball2-shadow", x: 980.35, y: 619.82, w: 36.345, h: 26.565, group: "ball2", shadow: true },
  { src: "ball3-shadow", x: 193.89, y: 272.95, w: 48.457, h: 35.423, group: "ball3", shadow: true },
  { src: "ball4-shadow", x: 651.21, y: 483.68, w: 28.267, h: 20.66, group: "ball4", shadow: true },
  { src: "ball5-shadow", x: 711.45, y: 207.82, w: 33.919, h: 24.797, group: "ball5", shadow: true },
  { src: "cube-stack", x: 315.96, y: 113.01, w: 64.97, h: 86.881, inset: "-0.68% -0.9%", group: "stack" },
  { src: "ball5", x: 710, y: 189, w: 29.02, h: 29.02, inset: "-2.03%", group: "ball5", float: true },
  { src: "ball3", x: 191.81, y: 246.07, w: 41.461, h: 41.461, inset: "-1.42%", group: "ball3", float: true },
  { src: "laptop-shadow", x: 582, y: 233.57, w: 573.743, h: 336.217, group: "laptop", shadow: true },
  { src: "laptop", x: 592, y: 211, w: 566.314, h: 349.532, inset: "-0.24% -0.15%", group: "laptop" },
  { src: "cube3", x: 1027, y: 237, w: 35.659, h: 43.154, inset: "-1.36% -1.65%", group: "cube3" },
  { src: "ball4", x: 650, y: 468, w: 24.186, h: 24.186, inset: "-2.43%", group: "ball4", float: true },
  { src: "notebook-shadow", x: 287, y: 173.72, w: 396.626, h: 231.348, group: "notebook", shadow: true },
  { src: "notebook", x: 287, y: 163, w: 393.099, h: 237.676, inset: "-0.28% -0.17%", group: "notebook" },
  { src: "pen", x: 345.51, y: 188.73, w: 247.437, h: 160.274, inset: "-0.44% 0 0 0", group: "notebook" },
  { src: "ball1", x: 1036.84, y: 513.12, w: 51.823, h: 51.823, inset: "-1.13%", group: "ball1", float: true },
  { src: "cube1", x: 712.66, y: 547.08, w: 64.97, h: 77.007, inset: "-0.76% -0.9%", group: "cube1" },
  { src: "ball2", x: 978.8, y: 599.65, w: 31.098, h: 31.098, inset: "-1.89%", group: "ball2", float: true },
  { src: "cube2", x: 734.65, y: 611.96, w: 40.539, h: 48.796, inset: "-1.2% -1.45%", group: "cube2" },
  { src: "cube1b-shadow", x: 513.91, y: 431.05, w: 82.92, h: 57.11, group: "cube1b", shadow: true },
  { src: "cube2b-shadow", x: 537.29, y: 485.05, w: 52, h: 35.96, group: "cube2b", shadow: true },
  { src: "cube1b", x: 513.91, y: 389.05, w: 69.09, h: 81.891, inset: "-0.76% -0.9%", group: "cube1b" },
  { src: "cube2b", x: 537.29, y: 458.05, w: 43.11, h: 51.891, inset: "-1.2% -1.45%", group: "cube2b" },
];

/** Where a layer's image is drawn on the canvas, including its stroke-overflow inset. */
function drawnBox({ x, y, w, h, inset }: Layer) {
  const [t, r = t, b = t, l = r] = (inset ?? "0").split(" ").map((v) => parseFloat(v) / 100);
  return { x: x + l * w, y: y + t * h, width: w * (1 - l - r), height: h * (1 - t - b) };
}

function drawnSize(l: Layer) {
  const { width, height } = drawnBox(l);
  return { width: Math.round(width), height: Math.round(height) };
}

// Hover is hit-tested against each object's painted pixels rather than its
// box: the boxes overlap (the notebook's covers the cube stack, the laptop's
// covers the notebook's edge) and per-box enter/leave events only fire when
// the pointer crosses a box edge, so the wrong object — or none — lifted.
// Until a layer's image has been read (or if reading it fails) it falls back
// to its box, so hover works from the first frame on slow connections.
type Mask = { box: ReturnType<typeof drawnBox>; group: string; w: number; h: number; alpha: Uint8ClampedArray | null };
const hittable = layers.filter((l) => !l.shadow).reverse(); // topmost first

function emptyMasks(): Mask[] {
  return hittable.map((l) => {
    const box = drawnBox(l);
    return { box, group: l.group, w: Math.max(1, Math.round(box.width)), h: Math.max(1, Math.round(box.height)), alpha: null };
  });
}

async function readAlpha(src: string, w: number, h: number) {
  const img = new window.Image();
  img.src = `${d}${src}.svg`;
  await img.decode();
  const ctx = Object.assign(document.createElement("canvas"), { width: w, height: h }).getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h).data;
}

function groupAt(masks: Mask[], x: number, y: number) {
  for (const m of masks) {
    const px = Math.floor(x - m.box.x), py = Math.floor(y - m.box.y);
    if (px < 0 || py < 0 || px >= m.w || py >= m.h) continue;
    if (!m.alpha || m.alpha[(py * m.w + px) * 4 + 3] > 24) return m.group;
  }
  return null;
}

export function Illustration() {
  const [lifted, setLifted] = useState<string | null>(null);
  const masks = useRef<Mask[]>(emptyMasks());

  useEffect(() => {
    let live = true;
    hittable.forEach((l, i) => {
      const m = masks.current[i];
      readAlpha(l.src, m.w, m.h).then(
        (alpha) => live && (m.alpha = alpha),
        () => {},
      );
    });
    return () => {
      live = false;
    };
  }, []);

  // Map the pointer back onto the unscaled 1440×550 canvas.
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 1440, y = ((e.clientY - r.top) / r.height) * 550;
    const g = groupAt(masks.current, x, y);
    setLifted((prev) => (prev === g ? prev : g));
  };

  return (
    <div
      aria-hidden
      className="illustration relative h-[calc(550px*var(--s))] w-full overflow-hidden"
    >
      {/* The SVGs have light colours baked in; in dark mode the whole scene is
          inverted (hues kept) so white surfaces land on the #121212 page, and
          dimmed to 75% so the now-light outlines don't pull focus. */}
      <div
        className="absolute top-0 left-1/2 ml-[-702px] h-[550px] w-[1440px] origin-[702px_0] scale-(--s) dark:opacity-75 dark:[filter:invert(0.93)_hue-rotate(180deg)]"
        onPointerMove={onPointerMove}
        onPointerDown={onPointerMove}
        onPointerLeave={() => setLifted(null)}
      >
        {/* Shifted left of the Figma position so the grid's densest part sits
            under the laptop and cubes; the extra gradient fades the right edge
            into the page. */}
        <div
          className="pointer-events-none absolute top-0 left-[-140px] h-[670.24px] w-[1440px]"
          style={{
            maskImage: `url(${d}grid-mask.svg), linear-gradient(to right, #000 68%, transparent)`,
            maskMode: "alpha",
            maskSize: "1440px 670.24px, 100% 100%",
            maskRepeat: "no-repeat",
            maskComposite: "intersect",
          }}
        >
          {/* Lines are #E2E0D9 in Figma; darkened 20% so they read on the page.
              The Figma grid runs at ±20.73°, flatter than the 30° isometric
              scene, so it's stretched vertically by tan 30° / tan 20.73°. */}
          <Image src={`${d}grid.svg`} alt="" width={1440} height={670} className="block size-full max-w-none origin-top scale-y-[1.5254] brightness-80" />
        </div>
        <div className="pointer-events-none absolute top-[48.67px] left-[-147.91px] h-[625.695px] w-[1171.109px]">
          <Image src={`${d}guides.svg`} alt="" width={1171} height={626} className="block size-full max-w-none" />
        </div>

        {layers.map((l, i) => {
          const isLifted = lifted === l.group;
          return (
            <div
              key={l.src}
              className="pointer-events-none absolute"
              style={{ left: l.x, top: l.y, width: l.w, height: l.h }}
            >
              <div
                className={`absolute motion-safe:transition-[translate,opacity] motion-safe:duration-300 ${
                  isLifted ? (l.shadow ? "opacity-60" : "motion-safe:-translate-y-2") : ""
                }`}
                style={{ inset: l.inset ?? 0 }}
              >
                <Image
                  src={`${d}${l.src}.svg`}
                  alt=""
                  {...drawnSize(l)}
                  className={`block size-full max-w-none ${l.float ? "motion-safe:animate-float" : ""}`}
                  style={l.float ? { animationDelay: `${-i * 0.37}s` } : undefined}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
