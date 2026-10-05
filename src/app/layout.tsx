import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { LineReveal } from "@/components/LineReveal";
import { RouteChangeSignal } from "@/components/TransitionLink";
import { profile } from "@/data/profile";
import { site } from "@/data/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const departureMono = localFont({
  variable: "--font-departure-mono",
  src: "../fonts/DepartureMono-Regular.woff2",
});

// Restores a theme picked with the toggle before first paint, so there's no
// flash; without one the CSS follows the system theme.
// Also hides text lines before paint for LineReveal, with a fallback that shows
// everything if that component never runs.
const themeScript = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}if(!matchMedia("(prefers-reduced-motion: reduce)").matches){var h=document.documentElement;h.classList.add("reveal-pending");setTimeout(function(){if(!("revealReady" in h.dataset))h.classList.remove("reveal-pending")},3000)}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.name,
  description: profile.tagline,
  // Only site-wide fields: pages inherit this object, so a title or url here
  // would leak onto the case studies.
  openGraph: { siteName: site.name, type: "website" },
  // Monty logo from Figma ("Monty_Logo (64*64) light/dark"): slate strokes for
  // light browser chrome, white strokes for dark. PNGs cover browsers without
  // SVG favicon support.
  icons: {
    icon: [
      { url: "/favicon-light.png", type: "image/png", sizes: "192x192", media: "(prefers-color-scheme: light)" },
      { url: "/favicon-dark.png", type: "image/png", sizes: "192x192", media: "(prefers-color-scheme: dark)" },
      { url: "/favicon-light.svg", type: "image/svg+xml", media: "(prefers-color-scheme: light)" },
      { url: "/favicon-dark.svg", type: "image/svg+xml", media: "(prefers-color-scheme: dark)" },
    ],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${departureMono.variable} antialiased`}
      // The theme script below may set data-theme before React hydrates.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans">
        {children}
        <LineReveal />
        <RouteChangeSignal />
      </body>
    </html>
  );
}
