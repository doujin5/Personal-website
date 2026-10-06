import Image from "next/image";
import Link from "next/link";
import { writings } from "@/data/writings";
import { HoverSoundList } from "./HoverSoundList";
import { SectionLabel } from "./SectionLabel";
import { TransitionLink } from "./TransitionLink";

// Hover: the row tint eases in; the tag drifts up and blurs out while the
// arrow glides in from the lower left and sharpens, a beat behind it.
const ease = "ease-[cubic-bezier(0.22,1,0.36,1)]";
const row = `group flex min-h-8 items-center justify-between gap-4 rounded-sm px-2 py-1 transition-colors duration-300 ${ease} hover:bg-hover focus-visible:outline-2 focus-visible:outline-fg-muted`;

export function WritingsList() {
  return (
    <>
      <SectionLabel>Writings</SectionLabel>
      <HoverSoundList className="flex w-full flex-col gap-3">
        {writings.map((w) => {
          // Posts with their own page open with the page wipe.
          const post = w.href.startsWith("/");
          const content = (
            <>
              <span className="text-sm">{w.title}</span>
              <span className="relative shrink-0 font-mono text-xs leading-normal text-fg-muted uppercase">
                <span
                  className={`inline-block transition-[opacity,translate,filter] duration-300 ${ease} group-hover:-translate-y-0.5 group-hover:opacity-0 group-hover:blur-[2px]`}
                >
                  {w.tag}
                </span>
                <Image
                  src="/icons/arrow-up-right.svg"
                  alt=""
                  width={16}
                  height={16}
                  className={`absolute top-1/2 right-0 -translate-x-1 -translate-y-1/4 opacity-0 blur-[2px] transition-[opacity,translate,filter] duration-300 ${ease} group-hover:translate-x-0 group-hover:-translate-y-1/2 group-hover:opacity-100 group-hover:blur-none group-hover:delay-60 dark:invert`}
                />
              </span>
            </>
          );
          return (
            <li key={w.title}>
              {post ? (
                <TransitionLink href={w.href} direction="open" className={row}>
                  {content}
                </TransitionLink>
              ) : /^https?:/.test(w.href) ? (
                // Off-site work (e.g. a Figma prototype) opens in a new tab.
                <a href={w.href} target="_blank" rel="noopener noreferrer" className={row}>
                  {content}
                </a>
              ) : (
                <Link href={w.href} className={row}>
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </HoverSoundList>
    </>
  );
}
