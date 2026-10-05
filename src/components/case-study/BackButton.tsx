import Image from "next/image";
import { TransitionLink } from "../TransitionLink";

// Figma 395:35827: 24px icon button fixed 30px from the top-left corner.
export function BackButton() {
  return (
    <TransitionLink
      href="/"
      direction="close"
      aria-label="Back to home"
      className="fixed top-4 left-4 z-20 flex motion-safe:animate-fade-in size-6 items-center justify-center rounded-xs bg-canvas p-0.5 transition-colors hover:bg-hover focus-visible:outline-2 focus-visible:outline-fg-muted before:absolute before:-inset-2.5 before:content-[''] sm:top-[30px] sm:left-[30px]"
    >
      <Image src="/icons/arrow-left.svg" alt="" width={20} height={20} loading="eager" className="size-5 dark:invert" />
    </TransitionLink>
  );
}
