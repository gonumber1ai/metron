import { notFound } from "next/navigation";
import { DayClient } from "./DayClient";

export default async function DayPage({ params }: { params: Promise<{ locale: string; n: string }> }) {
  const { locale, n } = await params;
  const day = Number(n);
  if (!Number.isInteger(day) || day < 1 || day > 30 || day === 11) notFound();
  return <DayClient locale={locale} day={day} />;
}
