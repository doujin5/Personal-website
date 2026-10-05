import { profile } from "@/data/profile";
import { CopyText } from "./CopyText";

const linkClass =
  "font-medium text-fg-muted underline decoration-link-decoration decoration-dotted decoration-[0.035em] [text-underline-position:from-font] transition-colors hover:text-fg";

export function Bio() {
  return (
    <>
      <div className="flex w-full max-w-[540px] flex-col gap-3 leading-normal">
        <h1 className="text-xl font-semibold">{profile.name}</h1>
        <p className="font-mono text-xs text-fg-muted uppercase">
          {profile.tagline}
        </p>
      </div>
      {profile.bio.map((paragraph, i) => (
        <p key={i} className="text-sm">
          {paragraph.map((part, j) =>
            typeof part === "string" ? (
              part
            ) : "copy" in part ? (
              <CopyText key={j} text={part.label} className={linkClass} />
            ) : (
              <a
                key={j}
                href={part.href}
                className={linkClass}
                // Off-site links open in a new tab.
                {...(/^https?:/.test(part.href) && { target: "_blank", rel: "noopener noreferrer" })}
              >
                {part.label}
              </a>
            ),
          )}
        </p>
      ))}
    </>
  );
}
