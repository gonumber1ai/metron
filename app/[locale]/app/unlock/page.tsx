import { UnlockClient } from "./UnlockClient";

export default async function UnlockPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <UnlockClient locale={locale} />;
}
