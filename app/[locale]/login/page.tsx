import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/app/AuthForm";

export const metadata: Metadata = { title: "Metron", robots: { index: false } };

/**
 * Number and password. The older access-code path stays reachable at
 * /login/code for anyone who bought before accounts existed.
 */
export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      <style>{`body{background:#070D0F;color:#fff}body::before{display:none}`}</style>
      <AuthForm locale={locale} mode="login" />
      <p className="mt-3 text-center text-[12px] text-white/35">
        <Link href={`/${locale}/login/code`} className="underline underline-offset-4">{locale === "fr" ? "J'ai un code d'accès" : "I have an access code"}</Link>
      </p>
    </>
  );
}
