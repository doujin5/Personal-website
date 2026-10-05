// The four team marks from Figma (381:20814), drawn inline (same shapes and
// colours as the exported SVGs) so their eyes can move: each pair glances
// side to side and blinks on its own rhythm. Animations are in globals.css
// (`.eyes-look`, `.eye-blink`). Tilted eyes (Engineering) get their rotation
// on an outer group so the blink happens along each eye's own axis.

export type TeamMarkName = "operations" | "customer-success" | "customer-success-diamond" | "engineering" | "business";

type Eye = { cx: number; cy: number; rx: number; ry: number; rotate?: number };

// `px` is the drawn size when a mark's Figma box differs from the usual 46px.
const marks: Record<TeamMarkName, { size: number; px?: number; body: React.ReactNode; eyes: Eye[]; look: string }> = {
  operations: {
    size: 44.4444,
    body: <circle cx="22.2222" cy="22.2222" r="22.2222" fill="#838383" />,
    eyes: [
      { cx: 33.3333, cy: 14.0523, rx: 4.57516, ry: 7.51634 },
      { cx: 19.6078, cy: 14.0523, rx: 4.57516, ry: 7.51634 },
    ],
    look: "-2.5px 1px",
  },
  "customer-success": {
    size: 45.759,
    body: <rect width="45.759" height="45.759" rx="3.922" fill="#30A46C" />,
    // Eyes layer sits at (10.7, 14.76) in Figma.
    eyes: [
      { cx: 10.7 + 4.57516, cy: 14.76 + 8.48748, rx: 4.57516, ry: 7.51634 },
      { cx: 10.7 + 18.9542, cy: 14.76 + 8.48748, rx: 4.57516, ry: 7.51634 },
    ],
    look: "2.5px 0px",
  },
  // Order Desk Admin's variant (459:55321): the same green square turned 45°
  // inside a 52.277 box, with the eyes a touch smaller (~0.95×).
  "customer-success-diamond": {
    size: 52.277,
    px: 52,
    body: <rect x="7.656" y="7.656" width="36.965" height="36.965" rx="3.168" transform="rotate(45 26.1385 26.1385)" fill="#30A46C" />,
    eyes: [
      { cx: 19.31, cy: 26.14, rx: 4.34, ry: 7.13 },
      { cx: 32.97, cy: 26.14, rx: 4.34, ry: 7.13 },
    ],
    look: "2.5px 0px",
  },
  engineering: {
    size: 46.4052,
    body: (
      <path
        d="M21.1394 1.27638C22.4037 0.494248 24.0015 0.494248 25.2658 1.27638L28.0509 2.99938C28.6513 3.37081 29.3408 3.57327 30.0467 3.5854L33.3212 3.64166C34.8076 3.66719 36.1518 4.53105 36.7925 5.87253L38.2039 8.82774C38.5082 9.4648 38.9788 10.0079 39.5661 10.3998L42.2903 12.2174C43.527 13.0425 44.1908 14.4959 44.0045 15.9709L43.5942 19.22C43.5057 19.9205 43.608 20.6318 43.8902 21.2789L45.1993 24.2809C45.7935 25.6436 45.5661 27.2251 44.612 28.3652L42.5102 30.8767C42.0571 31.4182 41.7586 32.0719 41.6461 32.7688L41.1244 36.002C40.8876 37.4697 39.8413 38.6772 38.4223 39.1205L35.2963 40.097C34.6224 40.3075 34.0178 40.696 33.5464 41.2216L31.3595 43.6594C30.3669 44.7661 28.8337 45.2162 27.4003 44.8219L24.2426 43.9534C23.5619 43.7662 22.8433 43.7662 22.1626 43.9534L19.0049 44.8219C17.5715 45.2162 16.0384 44.7661 15.0457 43.6594L12.8588 41.2216C12.3874 40.696 11.7828 40.3075 11.109 40.097L7.98297 39.1205C6.56395 38.6772 5.5176 37.4697 5.28078 36.002L4.75909 32.7688C4.64663 32.0719 4.34809 31.4182 3.895 30.8767L1.79318 28.3652C0.839084 27.2251 0.61169 25.6436 1.20594 24.2809L2.51504 21.2789C2.79725 20.6318 2.89952 19.9205 2.81106 19.22L2.40074 15.9709C2.21448 14.4959 2.87824 13.0425 4.11489 12.2174L6.83915 10.3998C7.42642 10.0079 7.89703 9.4648 8.2013 8.82774L9.61274 5.87253C10.2535 4.53105 11.5976 3.66719 13.0841 3.64166L16.3585 3.5854C17.0644 3.57327 17.754 3.37081 18.3544 2.99938L21.1394 1.27638Z"
        fill="#0090FF"
      />
    ),
    // Same tall eyes as Operations / Customer success, keeping the 15° lean.
    eyes: [
      { cx: 12.0698, cy: 17.3312, rx: 4.57516, ry: 7.51634, rotate: 15.4516 },
      { cx: 27.3635, cy: 21.5587, rx: 4.57516, ry: 7.51634, rotate: 15.4516 },
    ],
    // along the slant of the eyes
    look: "2.4px 0.66px",
  },
  business: {
    size: 46.4052,
    body: (
      <path
        d="M21.2418 1.13206C22.4552 0.431537 23.9501 0.431539 25.1634 1.13206L41.3359 10.4692C42.5492 11.1698 43.2967 12.4644 43.2967 13.8654V32.5398C43.2967 33.9408 42.5492 35.2355 41.3359 35.936L25.1634 45.2732C23.9501 45.9737 22.4552 45.9737 21.2418 45.2732L5.06934 35.936C3.856 35.2355 3.10856 33.9408 3.10856 32.5398V13.8654C3.10856 12.4644 3.85601 11.1698 5.06935 10.4692L21.2418 1.13206Z"
        fill="#F76B15"
      />
    ),
    // Tall eyes like Operations / Customer success, a touch smaller and set
    // just below centre so they keep clear of the hexagon's lower edges.
    eyes: [
      { cx: 16.3399, cy: 27.5, rx: 4.3, ry: 7 },
      { cx: 30.719, cy: 27.5, rx: 4.3, ry: 7 },
    ],
    look: "-2.5px -0.5px",
  },
};

// Different rhythms so the four never blink or glance together.
const timing: Record<TeamMarkName, { look: string; blink: string; delay: string }> = {
  operations: { look: "5.2s", blink: "3.8s", delay: "-0.4s" },
  "customer-success": { look: "6.1s", blink: "4.2s", delay: "-2.1s" },
  "customer-success-diamond": { look: "6.1s", blink: "4.2s", delay: "-2.1s" },
  engineering: { look: "4.7s", blink: "5s", delay: "-1.2s" },
  business: { look: "5.6s", blink: "4.6s", delay: "-3s" },
};

export function TeamMark({ name }: { name: TeamMarkName }) {
  const m = marks[name];
  const t = timing[name];
  return (
    <svg width={m.px ?? 46} height={m.px ?? 46} viewBox={`0 0 ${m.size} ${m.size}`} aria-hidden className="block overflow-visible">
      {m.body}
      <g
        className="eyes-look"
        style={{ "--look": m.look, animationDuration: t.look, animationDelay: t.delay } as React.CSSProperties}
      >
        {m.eyes.map((e, i) => (
          // The tilt sits on an outer group so the blink squashes each eye
          // along its own short axis (not straight down the screen).
          <g key={i} transform={e.rotate ? `rotate(${e.rotate} ${e.cx} ${e.cy})` : undefined}>
            <g className="eye-blink" style={{ animationDuration: t.blink, animationDelay: t.delay }}>
              <ellipse cx={e.cx} cy={e.cy} rx={e.rx} ry={e.ry} fill="white" />
            </g>
          </g>
        ))}
      </g>
    </svg>
  );
}
