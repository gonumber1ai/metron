import { ResultClient } from "./ResultClient";

export default async function ResultPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <ResultClient locale={locale} />;
}
