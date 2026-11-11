export type Writing = {
  title: string;
  tag: "New" | "Remake";
  href: string;
  /** One line for the hover preview card beside the list. */
  description: string;
  /** Preview picture for the card; without one it shows the logo mark. */
  image?: string;
};

export const writings: Writing[] = [
  {
    title: "Crafting a simpler way to order image from space",
    tag: "New",
    href: "/crafting-a-simpler-way-to-order-image-from-space",
    description: "Satellite imagery is powerful. Getting the right image never was. One place to find it, configure it, order it and receive it.",
    image: "/work/order-desk/hero.webp",
  },
  {
    title: "Designing the core operations for a growing customer platform",
    tag: "New",
    href: "/designing-the-core-operations-for-a-growing-customer-platform",
    description: "The customer sees one order. Behind it, every team saw a different fragment. One shared picture of orders, tasks and imagery.",
    image: "/work/order-desk-admin/hero.webp",
  },
  {
    title: "Medsafe",
    tag: "New",
    href: "https://www.notion.so/hashbrown-documents/Medsafe-536f1f978e414def921aae3e267059f2?pvs=4",
    description: "Every prescription tells part of your health story. Kept in one place, they tell the whole of it: what might go wrong next, and how to prevent it.",
    image: "/work/medsafe/cover.webp",
  },
  {
    title: "Vetan by mool",
    tag: "New",
    href: "https://www.notion.so/hashbrown-documents/Mool-Vetan-041997eb0fdb4eddb68c56b20c5270a2?pvs=4",
    description: "Most people never touch their payslip. They should. Payroll that lets employees reshape their own and save more on tax.",
    image: "/work/vetan/cover.webp",
  },
  {
    title: "Earth’s secret in light",
    tag: "Remake",
    href: "https://www.figma.com/proto/j0UiLQw3ObzjcTV6oGbZmb/Spectral-graph?page-id=1%3A2&node-id=1-3&viewport=175%2C535%2C0.07&t=uVYjEX0KD9b67Odp-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=1%3A3",
    description: "Everything on Earth reflects light in its own way. Read those spectral signatures, and the area starts to explain itself.",
    image: "/work/spectral/cover.webp",
  },
  {
    title: "Analyse and compare changes over time",
    tag: "Remake",
    href: "https://www.figma.com/proto/zQ1nS95fOepEhfCIhi2jEJ/Change-Detection?node-id=3-2&viewport=457%2C604%2C0.36&t=6eeNDsJkbYTtgc5x-0&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=3%3A2",
    description: "One image shows a place. Time shows its story. Compare an area, and the insights drawn from it, across dates to see what changed and what that change affected.",
    image: "/work/change-detection/cover.webp",
  },
];
