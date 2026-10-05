import Image from "next/image";
import Link from "next/link";
import { profile } from "@/data/profile";
import { iconButtonClass } from "./iconButton";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="flex w-full items-center justify-between">
      <Link href="/" aria-label={profile.name} className="p-[2.783px]">
        <Image
          src="/logo-mark.svg"
          alt=""
          width={37}
          height={26}
          preload
          className="block h-[26.435px] w-[36.828px] dark:hidden"
        />
        {/* Dark-mode logo from Figma (357:43961): light bars, same orange dot. */}
        <Image
          src="/logo-mark-dark.svg"
          alt=""
          width={37}
          height={26}
          className="hidden h-[26.435px] w-[36.828px] dark:block"
        />
      </Link>
      <div className="flex items-center gap-2">
        <a
          href={profile.headerLink.href}
          aria-label={profile.headerLink.label}
          className={iconButtonClass}
        >
          <Image src="/icons/audio-waveform.svg" alt="" width={16} height={16} className="dark:invert" />
        </a>
        <ThemeToggle />
      </div>
    </header>
  );
}
