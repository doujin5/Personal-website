import { readFileSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import { profile } from "@/data/profile";
import { SoundToggle } from "./SoundToggle";
import { ThemeToggle } from "./ThemeToggle";

// The logo is inlined as SVG rather than shown through <img>: at its Figma
// size (36.828×26.435) and offset the image landed on fractional pixels and
// was resampled, which blurred it. Inline vectors draw crisp at any position.
// Read from public/ at build time, so those files stay the source of truth.
function inlineSvg(file: string) {
  return readFileSync(join(process.cwd(), "public", file), "utf8")
    .replace(/<\?xml[^>]*>\s*/, "")
    .replace(/\s(?:style|preserveAspectRatio|overflow)="[^"]*"/g, "")
    .replace("<svg", '<svg aria-hidden="true" class="block h-full w-full"');
}
const logoLight = inlineSvg("logo-mark.svg");
// Dark-mode logo from Figma (357:43961): light bars, same orange dot.
const logoDark = inlineSvg("logo-mark-dark.svg");

export function Header() {
  return (
    <header className="flex w-full items-center justify-between">
      <Link href="/" aria-label={profile.name} className="p-[2.783px]">
        <span className="block h-[26.435px] w-[36.828px] dark:hidden" dangerouslySetInnerHTML={{ __html: logoLight }} />
        <span className="hidden h-[26.435px] w-[36.828px] dark:block" dangerouslySetInnerHTML={{ __html: logoDark }} />
      </Link>
      <div className="flex items-center gap-2">
        <SoundToggle />
        <ThemeToggle />
      </div>
    </header>
  );
}
