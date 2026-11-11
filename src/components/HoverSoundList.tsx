"use client";

import { useRef, type ComponentProps } from "react";
import { playHoverSound } from "@/lib/sound";

// A <ul> that plays the hover tick (lib/sound.ts) once each time the
// mouse moves onto a new row, a little higher for each row further down.
// Delegated, so the rows themselves can stay server-rendered. Touch is
// ignored: there's no hover on phones.
export function HoverSoundList(props: ComponentProps<"ul">) {
  const current = useRef<Element | null>(null);
  return (
    <ul
      {...props}
      onPointerOver={(e) => {
        if (e.pointerType !== "mouse") return;
        const li = (e.target as Element).closest("li");
        if (li === current.current) return;
        current.current = li; // null in the gaps, so re-entering a row plays again
        if (li) playHoverSound(Array.prototype.indexOf.call(e.currentTarget.children, li));
      }}
      onPointerLeave={() => (current.current = null)}
    />
  );
}
