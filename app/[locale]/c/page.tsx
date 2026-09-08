import { headers } from "next/headers";
import { ChallengeClient } from "./ChallengeClient";

/** The 10-Day Challenge funnel. Country resolves server-side, as everywhere. */
export default async function ChallengePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const h = await headers();
  const country =
    h.get("x-vercel-ip-country") ?? h.get("cf-ipcountry") ?? h.get("x-country") ?? null;

  return <ChallengeClient locale={locale} geoCountry={country?.toUpperCase() ?? null} />;
}
