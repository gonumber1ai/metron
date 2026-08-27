import { Suspense } from "react";
import { DoneClient } from "./DoneClient";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <Suspense>
      <DoneClient locale={locale} />
    </Suspense>
  );
}
