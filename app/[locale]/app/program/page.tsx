import { Suspense } from "react";
import { ProgramClient } from "./ProgramClient";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // useSearchParams (the ?tab= from the menu) needs a boundary at prerender.
  return (
    <Suspense fallback={null}>
      <ProgramClient locale={locale} />
    </Suspense>
  );
}
