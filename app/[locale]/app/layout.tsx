import { Shell } from "@/components/app/Shell";

/**
 * The app. Free users enter — Day 1 is theirs. What each day is allowed
 * to do is decided per day by lib/gating, from what he has bought and
 * done, not by a guard on the door. Program and Progress are never gated.
 */
export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <Shell locale={locale}>{children}</Shell>;
}
