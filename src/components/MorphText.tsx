"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

/** Words and the whitespace between them, as separate tokens. */
const tokenize = (t: string) => t.split(/(\s+)/).filter(Boolean);

/** Splits a → b into shared leading words, changed words, shared trailing words. */
function diff(a: string, b: string) {
  const x = tokenize(a);
  const y = tokenize(b);
  let p = 0;
  while (p < x.length && p < y.length && x[p] === y[p]) p++;
  let s = 0;
  while (s < x.length - p && s < y.length - p && x[x.length - 1 - s] === y[y.length - 1 - s]) s++;
  return {
    prefix: y.slice(0, p).join(""),
    out: x.slice(p, x.length - s),
    in: y.slice(p, y.length - s),
    suffix: y.slice(y.length - s).join(""),
  };
}

/**
 * Swaps text word by word, changing only the words that differ. Old words
 * roll up and out, new ones rise from below in a left-to-right stagger, and
 * the changed span eases its width so any shared words glide into place. Motion is skipped under
 * prefers-reduced-motion (see globals.css).
 */
export function MorphText({ text }: { text: string }) {
  const [state, setState] = useState({ text, prev: null as string | null, n: 0 });
  if (text !== state.text) {
    setState({ text, prev: state.text, n: state.n + 1 });
  }
  const { prev, n } = state;

  const middle = useRef<HTMLSpanElement>(null);
  const outgoing = useRef<HTMLSpanElement>(null);
  const incoming = useRef<HTMLSpanElement>(null);

  // Ease the changed span from the old letters' width to the new ones'.
  useLayoutEffect(() => {
    const el = middle.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const from = outgoing.current?.offsetWidth ?? 0;
    const to = incoming.current?.offsetWidth ?? 0;
    el.style.transition = "none";
    el.style.width = `${from}px`;
    void el.offsetWidth;
    el.style.transition = "width 260ms cubic-bezier(0.2, 0.7, 0.2, 1)";
    el.style.width = `${to}px`;
  }, [n]);

  useEffect(() => {
    if (prev === null) return;
    const t = setTimeout(() => setState((s) => ({ ...s, prev: null })), 500);
    return () => clearTimeout(t);
  }, [prev, n]);

  if (prev === null) return <span className="whitespace-pre">{text}</span>;

  const d = diff(prev, text);
  return (
    <span className="whitespace-pre">
      {d.prefix}
      <span ref={middle} className="relative inline-block align-top">
        <span ref={outgoing} aria-hidden className="absolute top-0 left-0">
          {d.out.map((c, i) => (
            <span key={`${n}-out-${i}`} className="morph-out inline-block" style={{ animationDelay: `${i * 30}ms` }}>
              {c}
            </span>
          ))}
        </span>
        <span ref={incoming} className="inline-block">
          {d.in.map((c, i) => (
            <span key={`${n}-in-${i}`} className="morph-in inline-block" style={{ animationDelay: `${60 + i * 60}ms` }}>
              {c}
            </span>
          ))}
        </span>
      </span>
      {d.suffix}
    </span>
  );
}
