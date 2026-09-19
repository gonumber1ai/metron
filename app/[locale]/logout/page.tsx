import { LogoutClient } from "./LogoutClient";

export default async function LogoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <LogoutClient locale={locale} />;
}
