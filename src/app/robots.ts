import type { MetadataRoute } from "next";
import { site } from "@/data/site";

// Required with `output: "export"`: written once at build time.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
