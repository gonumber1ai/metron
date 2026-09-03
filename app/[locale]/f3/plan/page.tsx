import { headers } from "next/headers";
import { PlanClient } from "./PlanClient";

/** Funnel 3, page 2. Country resolves server-side like every sales page. */
export default async function F3PlanPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const h = await headers();
  const country =
    h.get("x-vercel-ip-country") ?? h.get("cf-ipcountry") ?? h.get("x-country") ?? null;

  return <PlanClient locale={locale} geoCountry={country?.toUpperCase() ?? null} />;
}
