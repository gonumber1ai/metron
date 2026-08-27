import type { Metadata } from "next";
import { LoginClient } from "./LoginClient";

export const metadata: Metadata = { title: "Metron", robots: { index: false } };

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <LoginClient locale={locale} />;
}
