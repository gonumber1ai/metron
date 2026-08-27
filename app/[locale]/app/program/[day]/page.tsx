import { DayClient } from "./DayClient";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; day: string }>;
}) {
  const { locale, day } = await params;
  return <DayClient locale={locale} day={Number(day)} />;
}
