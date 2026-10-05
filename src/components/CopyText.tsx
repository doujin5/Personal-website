"use client";

import { useRef, useState } from "react";
import { MorphText } from "./MorphText";

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // navigator.clipboard is missing outside secure contexts (e.g. testing
    // over a LAN IP), so fall back to the legacy copy command.
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    el.remove();
  }
}

export function CopyText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  async function onClick() {
    await copy(text);
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1500);
  }

  return (
    <span className="group/copy relative inline-block">
      <button type="button" onClick={onClick} className={`cursor-pointer ${className}`}>
        {text}
      </button>
      {/* Figma "Components" › Tooltip (3602:4042): low contrast, top, no nob.
          Letter spacing and shadow adjusted from the component. */}
      <span
        role="status"
        className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 translate-y-1 rounded-sm border-[0.5px] border-line bg-canvas px-2 py-1 text-xs leading-4 font-medium whitespace-nowrap text-fg no-underline opacity-0 shadow-lifted transition-[opacity,translate] duration-150 group-hover/copy:translate-y-0 group-hover/copy:opacity-100 group-has-focus-visible/copy:translate-y-0 group-has-focus-visible/copy:opacity-100"
      >
        {/* Dims while pressed, then morphs to "Copied!" in sage — after the
            copy-link interaction in https://x.com/nitishkmrk/status/2082737956490826189 */}
        <span
          className={`inline-block overflow-clip align-top transition-[opacity,color] duration-200 group-has-active/copy:opacity-50 ${copied ? "text-sage" : ""}`}
        >
          <MorphText text={copied ? "Copied!" : "Click to copy"} />
        </span>
      </span>
    </span>
  );
}
