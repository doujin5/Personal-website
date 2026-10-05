export type CompanyLogo =
  /** A small mark centred in the white tile. */
  | { kind: "mark"; src: string; size: number; radius?: number }
  /** Image layers that fill the whole tile. */
  | { kind: "fill"; layers: string[] };

export type Role = {
  company: string;
  title: string;
  period: string;
  logo: CompanyLogo;
};

export const experience: Role[] = [
  {
    company: "Pixxel",
    title: "Product Designer II",
    period: "Apr 2024 - Present",
    logo: { kind: "mark", src: "/logos/pixxel.jpg", size: 28, radius: 4 },
  },
  {
    company: "Mool Innovation labs",
    title: "Founding Product Designer",
    period: "APR 2021 - Mar 2024",
    logo: { kind: "fill", layers: ["/logos/mool-1.png", "/logos/mool-2.png"] },
  },
  {
    company: "Nowfloats",
    title: "Product Designer",
    period: "Sept 2019 - Mar 2021",
    logo: { kind: "mark", src: "/logos/nowfloats.png", size: 28 },
  },
];
