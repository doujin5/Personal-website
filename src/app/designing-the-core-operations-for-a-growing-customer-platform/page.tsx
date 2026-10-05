import type { Metadata } from "next";
import { BackButton } from "@/components/case-study/BackButton";
import { CaseRuler } from "@/components/case-study/CaseRuler";
import { CaseStudyView } from "@/components/case-study/CaseStudyView";
import { TopBlur } from "@/components/case-study/TopBlur";
import { orderDeskAdmin } from "@/data/case-studies/order-desk-admin";
import { profile } from "@/data/profile";

export const metadata: Metadata = {
  title: `${orderDeskAdmin.title} — ${profile.name}`,
  description:
    "How Order Desk Admin brought the teams behind Order Desk onto one shared picture of organizations, orders, tasks and imagery.",
};

export default function Page() {
  return (
    <main>
      <TopBlur />
      <BackButton />
      <CaseStudyView study={orderDeskAdmin} />
      <CaseRuler />
    </main>
  );
}
