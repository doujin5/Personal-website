import { SoundToggle } from "../SoundToggle";
import { ThemeToggle } from "../ThemeToggle";

// Sound and theme toggles on the case-study pages, mirroring the back button:
// fixed top-right with the same 16px (30px from sm) inset, on the page colour
// so content scrolling underneath doesn't show through.
export function PostControls() {
  return (
    <div className="fixed top-4 right-4 z-20 flex h-6 items-center gap-2 rounded-xs bg-canvas px-0.5 motion-safe:animate-fade-in sm:top-[30px] sm:right-[30px]">
      <SoundToggle />
      <ThemeToggle />
    </div>
  );
}
