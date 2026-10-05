import type { Block, CaseStudy, Para } from "@/data/case-studies/order-desk";
import { TeamMark } from "./TeamMark";
import { ZoomableImage } from "./ZoomableImage";

// Body copy in the case study: Inter 14px on a 24px line, Figma "small" tracking.
const body = "text-sm leading-6 tracking-[0.4px]";

function Paragraph({ p }: { p: Para }) {
  if (typeof p === "string") {
    return <p className={`${body} whitespace-pre-line`}>{p}</p>;
  }
  return (
    <p
      className={`rounded-sm px-3 py-2 font-mono text-xs leading-5 uppercase ${
        p.tone === "secondary" ? "bg-canvas-secondary" : "bg-canvas-hover"
      }`}
    >
      {p.callout}
    </p>
  );
}

// Idle loop for the team marks: each bobs and tilts on its own beat (staggered
// so they move out of sync) while its eyes glance and blink (TeamMark). See
// `.team-bob` in globals.css.
const teamMotion = [
  { tilt: "-4deg", delay: "0s" },
  { tilt: "3deg", delay: "-0.9s" },
  { tilt: "-3deg", delay: "-1.8s" },
  { tilt: "4deg", delay: "-2.7s" },
];

function Teams({ teams }: Extract<Block, { type: "teams" }>) {
  return (
    <div className="flex min-h-[209px] items-center justify-center rounded-lg p-[13px]">
      <ul className="flex flex-wrap items-end justify-center gap-x-9 gap-y-8 sm:flex-nowrap sm:gap-[36.6px]">
        {teams.map((t, i) => (
          <li key={t.label} className="flex flex-col items-center gap-4">
            <span
              className="team-bob block"
              style={{ "--tilt": teamMotion[i % 4].tilt, animationDelay: teamMotion[i % 4].delay } as React.CSSProperties}
            >
              <TeamMark name={t.mark} />
            </span>
            <span className="font-mono text-xs leading-4 whitespace-nowrap text-fg-muted uppercase">{t.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Compare({ items, figure }: Extract<Block, { type: "compare" }> & { figure: number }) {
  return (
    <div className="grid grid-cols-2 gap-[7.27px] rounded-lg p-[9.09px]">
      {items.map((it, i) => (
        <figure key={it.label} className="flex flex-col items-center gap-[13.26px]">
          <ZoomableImage src={it.src} alt={it.alt} width={287.5} height={301} figure={figure + i} />
          <figcaption className="font-mono text-xs leading-5 text-fg-muted uppercase">{it.label}</figcaption>
        </figure>
      ))}
    </div>
  );
}

function BlockView({ block, index, figure }: { block: Block; index: number; figure: number }) {
  switch (block.type) {
    case "image":
      return (
        <ZoomableImage
          src={block.src}
          alt={block.alt}
          width={block.width}
          height={block.height}
          figure={figure}
          preload={index === 0}
        />
      );
    case "intro":
      return (
        <div className="flex flex-col gap-5">
          {block.paragraphs.map((p) => (
            <p key={p} className={body}>
              {p}
            </p>
          ))}
        </div>
      );
    case "section": {
      const h3 = block.level === 3;
      const id = block.heading?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      return (
        <section
          id={id}
          className={`flex flex-col ${h3 ? "gap-3" : block.flush ? "gap-6" : "gap-6 pt-12"} ${
            block.divider ? "mt-4 border-t border-line" : ""
          }`}
        >
          {block.heading &&
            (h3 ? (
              <h3 className="text-[16px] leading-5 font-medium">{block.heading}</h3>
            ) : (
              <h2 className="text-xl leading-6 font-semibold">{block.heading}</h2>
            ))}
          {block.body.map((p, i) => (
            <Paragraph key={i} p={p} />
          ))}
        </section>
      );
    }
    case "teams":
      return <Teams {...block} />;
    case "compare":
      return <Compare {...block} figure={figure} />;
  }
}

/** "Fig. N" for the first image in each block, counting images in page order. */
function figureNumbers(blocks: Block[]) {
  let n = 1;
  return blocks.map((b) => {
    const first = n;
    n += b.type === "image" ? 1 : b.type === "compare" ? b.items.length : 0;
    return first;
  });
}

export function CaseStudyView({ study }: { study: CaseStudy }) {
  const figures = figureNumbers(study.blocks);
  return (
    <article data-reveal-root className="mx-auto w-full max-w-[632px] px-4">
      <div className="flex flex-col gap-8 border-b border-line pt-[72px] pb-[72px]">
        <h1 className="pb-12 text-center text-[32px] leading-tight font-semibold tracking-[-0.02em] text-balance sm:text-5xl sm:leading-normal">
          {study.title}
        </h1>
        {study.blocks.map((b, i) => (
          <BlockView key={i} block={b} index={i} figure={figures[i]} />
        ))}
      </div>
    </article>
  );
}
