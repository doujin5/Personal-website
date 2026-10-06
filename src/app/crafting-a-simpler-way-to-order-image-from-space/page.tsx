import type { Metadata } from "next";
import { BackButton } from "@/components/case-study/BackButton";
import { PostControls } from "@/components/case-study/PostControls";
import { CaseRuler } from "@/components/case-study/CaseRuler";
import { CaseStudyView } from "@/components/case-study/CaseStudyView";
import { TopBlur } from "@/components/case-study/TopBlur";
import { orderDesk } from "@/data/case-studies/order-desk";
import { profile } from "@/data/profile";

export const metadata: Metadata = {
  title: `${orderDesk.title} — ${profile.name}`,
  description:
    "How Order Desk became Pixxel's unified place to discover, configure, order and receive satellite imagery.",
};

export default function Page() {
  return (
    <main>
      <TopBlur />
      <BackButton />
      <PostControls />
      <CaseStudyView study={orderDesk} />
      <CaseRuler />
    </main>
  );
}
