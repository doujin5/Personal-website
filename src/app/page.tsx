import { Bio } from "@/components/Bio";
import { Header } from "@/components/Header";
import { Illustration } from "@/components/Illustration";
import { Timeline } from "@/components/Timeline";
import { WritingsList } from "@/components/WritingsList";
import { profile } from "@/data/profile";
import { site } from "@/data/site";

const section = "flex w-full flex-col items-start bg-canvas py-12";

// Tells Google the site's name for search results.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: site.name,
  url: `${site.url}/`,
  author: { "@type": "Person", name: profile.name },
};

export default function Home() {
  return (
    <main data-reveal-root className="overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="relative z-10 mx-auto w-full max-w-[632px] px-4">
        <section className={`${section} gap-8 border-b border-line`}>
          <Header />
          <Bio />
        </section>
        <section className={`${section} gap-7 border-b border-line`}>
          <WritingsList />
        </section>
        <section className={`${section} gap-7`}>
          <Timeline />
        </section>
      </div>
      <div data-reveal>
        <Illustration />
      </div>
    </main>
  );
}
