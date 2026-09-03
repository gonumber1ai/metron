import { headers } from "next/headers";
import { F3Client } from "./F3Client";

/** Funnel 3. Country resolves server-side, same as every other sales page. */
export default async function F3Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const h = await headers();
  const country =
    h.get("x-vercel-ip-country") ?? h.get("cf-ipcountry") ?? h.get("x-country") ?? null;

  return <F3Client locale={locale} geoCountry={country?.toUpperCase() ?? null} />;
}
