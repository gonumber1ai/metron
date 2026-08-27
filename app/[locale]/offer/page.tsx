import { OfferClient } from "./OfferClient";

export default async function OfferPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <OfferClient locale={locale} />;
}
