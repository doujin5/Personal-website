// Progressive blur along the top edge, after zero.university's founder
// letters: eight stacked backdrop-blur layers, each twice as strong as the
// last (0.125px → 16px) and masked to an overlapping band, so text scrolling up
// sharpens out into a smooth fog with no visible steps. No tint, so it works
// on either theme; it sits under the fixed back button and ruler.

const LAYERS = 8;

export function TopBlur() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-10 h-[min(120px,18dvh)] sm:h-[min(160px,20dvh)]">
      {Array.from({ length: LAYERS }, (_, i) => {
        const at = (n: number) => `${((i + n) * 100) / LAYERS}%`; // band edges every 12.5%
        return (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              backdropFilter: `blur(${0.125 * 2 ** i}px)`,
              WebkitBackdropFilter: `blur(${0.125 * 2 ** i}px)`,
              maskImage: `linear-gradient(to top, transparent ${at(0)}, #000 ${at(1)}, #000 ${at(2)}, transparent ${at(3)})`,
            }}
          />
        );
      })}
    </div>
  );
}
