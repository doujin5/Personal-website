import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { LineReveal } from "@/components/LineReveal";
import { RouteChangeSignal } from "@/components/TransitionLink";
import { profile } from "@/data/profile";
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
  title: profile.name,
  description: profile.tagline,
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
