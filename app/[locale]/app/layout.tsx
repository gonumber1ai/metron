import { cookies } from "next/headers";
import { AppShell } from "@/components/AppShell";
import { PaidGuard } from "@/components/PaidGuard";
import { verify, cookieName } from "@/lib/entitlement";

/**
 * AppShell sits OUTSIDE the guard on purpose: a locked visitor still gets the
 * navigation, so he can tap through and see what he is missing on each tab.
 *
 * Entitlement is read here, on the server, from the signed HttpOnly cookie —
 * the client cannot forge it. PaidGuard receives the verdict rather than
 * deciding for itself.
 */
export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Local testing only. Set METRON_DEV_UNLOCK=1 in .env.local to walk the
  // paid app without paying. It is read server-side and is not present in
  // production unless somebody deliberately sets it there.
  let entitled = process.env.METRON_DEV_UNLOCK === "1";
  try {
    if (entitled) throw new Error("dev unlock");
    const jar = await cookies();
    entitled = verify(jar.get(cookieName)?.value) !== null;
  } catch {
    // Either the dev unlock is on, or ENTITLEMENT_SECRET is missing. In the
    // second case we stay locked, which is the safe direction to fail.
    entitled = entitled || false;
  }

  return (
    <AppShell locale={locale}>
      <PaidGuard locale={locale} entitled={entitled}>
        {children}
      </PaidGuard>
    </AppShell>
  );
}
