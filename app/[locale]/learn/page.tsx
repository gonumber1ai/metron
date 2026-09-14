import type { Metadata } from "next";
import { LearnClient } from "./LearnClient";

const TITLE = "Learn to build websites, mobile apps & AI automations";
const DESC = "Hands-on bootcamp, starts 27 September. No coding background needed.";

/* Every field the locale layout sets is set again here, because Next merges
   metadata shallowly per key: a page that only gives `title` still inherits
   the parent's openGraph and twitter blocks whole — which is how this link
   previewed as "Metron — Measure it. Change it." in a chat. */
export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  applicationName: "Bootcamp",
  openGraph: { type: "website", siteName: "Bootcamp", title: TITLE, description: DESC },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
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
