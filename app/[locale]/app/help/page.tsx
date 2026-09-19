import { HelpClient } from "./HelpClient";

export default async function HelpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <HelpClient locale={locale} />;
}
