import { QuizClient } from "./QuizClient";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <QuizClient locale={locale} />;
}
