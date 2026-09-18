import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { funnelFor } from "@/lib/funnels";
import { FunnelClient } from "./FunnelClient";

/**
 * /fr/f/1k · /en/f/1k · /fr/f/5k · /en/f/5k — the four priced funnels.
 * Anything else under /f is a 404, not a fifth funnel by accident.
 */
export default async function FunnelPage({
  params,
}: {
  params: Promise<{ locale: string; tier: string }>;
}) {
  const { locale, tier } = await params;
  const funnel = funnelFor(tier, locale);
  if (!funnel) notFound();
  const h = await headers();
  const country =
    h.get("x-vercel-ip-country") ?? h.get("cf-ipcountry") ?? h.get("x-country") ?? null;
  return <FunnelClient locale={locale} geoCountry={country?.toUpperCase() ?? null} funnel={funnel} />;
}
