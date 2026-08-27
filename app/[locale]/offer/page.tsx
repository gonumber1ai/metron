import { headers } from "next/headers";
import { OfferClient } from "./OfferClient";

/**
 * Country is resolved on the server from the edge geo header.
 *
 * The client used to guess from the browser timezone, which is wrong often
 * enough to matter: a Cameroonian man on a phone set to another timezone was
 * shown the card rail only and never saw Mobile Money at all — the rail that
 * actually works for him.
 */
export default async function OfferPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const h = await headers();
  const country =
    h.get("x-vercel-ip-country") ?? h.get("cf-ipcountry") ?? h.get("x-country") ?? null;

  return <OfferClient locale={locale} geoCountry={country?.toUpperCase() ?? null} />;
}
