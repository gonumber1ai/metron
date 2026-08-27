import { ProgramClient } from "./ProgramClient";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <ProgramClient locale={locale} />;
}
