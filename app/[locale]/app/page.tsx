import { TodayClient } from "./TodayClient";

export default async function TodayPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <TodayClient locale={locale} />;
}
