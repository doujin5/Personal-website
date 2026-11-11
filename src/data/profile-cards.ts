import type { InlineLink } from "./profile";

/** A social profile shown in the hover card on a bio link (ProfileCardLink).
 *  The site is static, so these are snapshots that don't update by
 *  themselves: refresh them (and public/social/) when a profile changes. */
export type ProfileCard = {
  name: string;
  /** Line under the name, e.g. the @handle. */
  subtitle?: string;
  /** Bio, split so links (e.g. an @mention) can be clickable. */
  bio?: (string | InlineLink)[];
  /** Numbers are shortened (1,250 → 1.3K); strings show as written ("500+"). */
  stats: { value: number | string; label: string }[];
  avatar: string;
  banner: string;
};

/** X (Twitter). Taken 11 Nov 2026 from api.fxtwitter.com/abhishekmonty24. */
export const xProfile: ProfileCard = {
  name: "Abhishek Mohanty 🙌",
  subtitle: "@abhishekmonty24",
  bio: [
    "Product Designer 💻 | Full time creative 🎨 and part time explorer 🚴🚗 | creating rectangles ",
    { label: "@pixxelspace", href: "https://x.com/pixxelspace" },
    " | I like to know the why before shifting a pixel 💅",
  ],
  stats: [
    { value: 170, label: "Posts" },
    { value: 448, label: "Following" },
    { value: 55, label: "Followers" },
  ],
  avatar: "/social/x-avatar.webp",
  banner: "/social/x-banner.webp",
};

/** LinkedIn. Name, counts and banner from the public profile page, photo
 *  from the profile owner; taken 11 Nov 2026. */
export const linkedinProfile: ProfileCard = {
  name: "Abhishek Mohanty",
  stats: [
    { value: "1K", label: "Followers" },
    { value: "500+", label: "Connections" },
  ],
  avatar: "/social/linkedin-avatar.webp",
  banner: "/social/linkedin-banner.webp",
};

export const profileCards = { x: xProfile, linkedin: linkedinProfile } satisfies Record<string, ProfileCard>;
export type ProfileCardId = keyof typeof profileCards;
