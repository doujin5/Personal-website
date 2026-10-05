export type InlineLink = { label: string; href: string };
/** Copies `label` to the clipboard on click instead of navigating. */
export type InlineCopy = { label: string; copy: true };
export type Inline = string | InlineLink | InlineCopy;

export const profile = {
  name: "Abhishek Mohanty",
  tagline: "Product designer | cyclist",
  bio: [
    ["A design thinker by the week and cyclist by the weekend."],
    [
      "I currently work as a product designer at ",
      { label: "pixxel", href: "https://www.pixxel.space/" },
      ", where we’re building planetary infrastructure through satellites and software for better understanding a changing planet.",
    ],
    [
      "Over the years I had the opportunity to work on many consumer, business system and developer platform products that are in the space of B2B and B2C, this has also allowed me to explore the products that are at 0-1 and at scale.",
    ],
    [
      "I believe every creation starts with intention, followed by details. It’s in those details that a good product becomes a great one—something people genuinely want to come back to.",
    ],
    [
      "In my free time, I enjoy learning about nutrition and exploring ways to help the body function at its best.",
    ],
    [
      "You can reach me at ",
      { label: "@abhishekmonty24", href: "https://x.com/abhishekmonty24" },
      " , ",
      { label: "abhishek.mohanty712@gmail.com", copy: true },
      ", or on ",
      { label: "LinkedIn", href: "#" },
    ],
  ] satisfies Inline[][],
};
