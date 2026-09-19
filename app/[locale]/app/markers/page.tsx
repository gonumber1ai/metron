import { MarkersClient } from "./MarkersClient";

export default async function MarkersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <MarkersClient locale={locale} />;
}
