import { MessagesClient } from "./MessagesClient";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <MessagesClient locale={locale} />;
}
