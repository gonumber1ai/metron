import type { Metadata } from "next";
import { LearnClient } from "./LearnClient";

export const metadata: Metadata = {
  title: "Learn to build websites, mobile apps & AI automations",
  description: "Hands-on bootcamp, starts 27 September. Beginner-friendly.",
};

/** "Learn test" — bootcamp signup. */
export default async function LearnPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <LearnClient locale={locale} />;
}
