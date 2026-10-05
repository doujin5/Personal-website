import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { writings } from "@/data/writings";

// Required with `output: "export"`: written once at build time.
export const dynamic = "force-static";

// The home page plus every on-site case study from the writings list (external
// Notion/Figma links are skipped), so new case studies are picked up as they're
// added there.
export default function sitemap(): MetadataRoute.Sitemap {
  const caseStudies = writings.filter((w) => w.href.startsWith("/"));
  return [
    { url: `${site.url}/`, changeFrequency: "monthly", priority: 1 },
    ...caseStudies.map((w) => ({ url: `${site.url}${w.href}`, changeFrequency: "yearly" as const, priority: 0.8 })),
  ];
}
