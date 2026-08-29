import { headers } from "next/headers";
import { StartClient } from "./StartClient";

/**
 * The no-quiz landing page, for testing against the quiz funnel head to head.
 * Country resolves server-side, same as the offer and result pages.
 */
export default async function StartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const h = await headers();
  const country =
    h.get("x-vercel-ip-country") ?? h.get("cf-ipcountry") ?? h.get("x-country") ?? null;

  return <StartClient locale={locale} geoCountry={country?.toUpperCase() ?? null} />;
}
