import type { Metadata } from "next";
import { GateClient } from "./GateClient";

/**
 * The ad destination.
 *
 * Point the ads here rather than straight at /start. The gate confirms the
 * visitor is an adult, describes the programme in plain terms, and hands the
 * campaign tag forward.
 *
 * Indexed: unlike /start this page is safe to be seen and is the honest
 * public face of the product, so there is no reason to hide it from search.
 */
export const metadata: Metadata = {
  title: "Metron — a private 10-day programme for men",
  description:
    "A private, app-based 10-day training programme. Measure where you are, train for ten days, measure again. Nothing to swallow, nothing to buy.",
};

export default async function WellnessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <GateClient locale={locale} />;
}
