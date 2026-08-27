import { headers } from "next/headers";
import { ResultClient } from "./ResultClient";

/**
 * Country is resolved on the server, the same way the offer page does it.
 *
 * It used to be guessed on the client from the browser timezone, so a man in
 * Douala whose phone was set to another zone was quoted dollars here and
 * francs on the very next screen. Two prices for the same thing, one click
 * apart, is the fastest way to lose a sale on a page about trust.
 */
export default async function ResultPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const h = await headers();
  const country =
    h.get("x-vercel-ip-country") ?? h.get("cf-ipcountry") ?? h.get("x-country") ?? null;

  return <ResultClient locale={locale} geoCountry={country?.toUpperCase() ?? null} />;
}
