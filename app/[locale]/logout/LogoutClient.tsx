"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { forgetAccount } from "@/components/app/useAccount";

export function LogoutClient({ locale }: { locale: string }) {
  const router = useRouter();
  useEffect(() => {
    (async () => {
      try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
      forgetAccount(locale);
      router.replace(`/${locale}/login`);
    })();
  }, [locale, router]);
  return null;
}
