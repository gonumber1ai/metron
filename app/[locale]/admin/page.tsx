import { cookies } from "next/headers";
import { verifyAdmin, adminCookie, isConfigured } from "@/lib/admin";
import { db, allConversations } from "@/lib/supabase/server";
import { AdminLogin } from "./AdminLogin";
import { Dashboard, type Snapshot } from "./Dashboard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Metron", robots: { index: false, follow: false } };

/**
 * Admin.
 *
 * Everything is read here, on the server, with the service-role key. No
 * customer data is ever sent to a browser that has not proved it is the admin,
 * and the password never reaches the client at all.
 */
export default async function AdminPage() {
  if (!isConfigured()) {
    return (
      <main className="grid min-h-screen place-items-center px-5 text-center">
        <p className="max-w-sm text-[0.95rem] leading-relaxed text-mute">
          Set ADMIN_PASSWORD (12 characters or more) in the environment, then redeploy.
        </p>
      </main>
    );
  }

  const jar = await cookies();
  if (!verifyAdmin(jar.get(adminCookie)?.value)) return <AdminLogin />;

  const client = db();
  const snap: Snapshot = {
    connected: Boolean(client),
    funnel: [],
    dropoff: [],
    recent: [],
    revenue: [],
    activity: [],
    campaigns: [],
    startRows: [],
    ctaRows: [],
    conversations: [],
  };

  if (client) {
    const [funnel, dropoff, recent, payments, activity, campaigns, startRows, ctaRows] =
      await Promise.all([
      client.from("funnel").select("*"),
      client.from("quiz_dropoff").select("*"),
      client.from("intake").select("*").limit(60),
      client.from("payments").select("currency, amount_minor, plan").eq("status", "paid"),
      client.from("activity").select("*").limit(100),
      client.from("funnel_by_campaign").select("*").limit(50),
      /* Views from 009_start_funnel.sql. Missing until that file is run, and a
         missing view must not take the whole dashboard down with it — the
         Start tab explains itself when empty. */
      client.from("funnel_start").select("*").limit(50),
      client.from("start_cta_breakdown").select("*").limit(50),
    ]);

    snap.funnel = funnel.data ?? [];
    snap.dropoff = dropoff.data ?? [];
    snap.recent = recent.data ?? [];
    snap.activity = activity.data ?? [];
    snap.campaigns = campaigns.data ?? [];
    snap.startRows = startRows.data ?? [];
    snap.ctaRows = ctaRows.data ?? [];
    // Not filtered by stage. The Customers tab reads the `activity` view,
    // which is gated on stage = 'paid', so a message from anybody else was
    // stored and then shown nowhere.
    snap.conversations = await allConversations();

    // Summed per currency: adding XAF to USD would produce a number that means
    // nothing, and a wrong revenue figure is worse than none.
    const totals = new Map<string, { total: number; count: number }>();
    for (const p of payments.data ?? []) {
      const cur = (p.currency as string) ?? "?";
      const t = totals.get(cur) ?? { total: 0, count: 0 };
      t.total += (p.amount_minor as number) ?? 0;
      t.count += 1;
      totals.set(cur, t);
    }
    snap.revenue = [...totals.entries()].map(([currency, v]) => ({
      currency,
      // USD is stored in cents; XAF has no minor unit.
      total: currency === "USD" ? v.total / 100 : v.total,
      count: v.count,
    }));
  }

  return <Dashboard snap={snap} />;
}
