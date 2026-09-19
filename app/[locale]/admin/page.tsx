import type { UserView } from "./Users";
import { fold, type Contact, type FunnelStats } from "@/lib/crm";
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
    d2Rows: [],
    d2Daily: [],
    learnDays: [],
    learnSignups: [],
    crmContacts: [] as Contact[],
    crmFunnels: [] as FunnelStats[],
    crmReady: false,
    users: [] as UserView[],
    usersReady: false,
    conversations: [],
  };

  if (client) {
    const [funnel, dropoff, recent, payments, activity, campaigns, startRows, ctaRows, d2Rows, d2Daily, learnDays, learnSignups, crmEvents, crmIntake, crmLeads, crmPayments, crmOffers, crmRecovery, uRows, uProgress, uPayments] =
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
      /* 012_funnel_d2.sql — the /c page under its seven Facebook links. */
      client.from("funnel_d2").select("*").limit(50),
      /* 013 — the same funnel by the day a man first landed. Missing
         until that file is run, and an empty list simply hides the
         section rather than breaking the page. */
      client.from("funnel_d2_daily").select("*").limit(400),
      /* The bootcamp page. Raw rows, not a view — the day table is folded
         in code below, so there is no migration to run before the tab
         works. Views earn their place when a query is heavy or shared;
         this is neither. */
      client
        .from("events")
        .select("ref, name, detail, campaign, created_at")
        .or("and(name.eq.start_view,detail.eq.learn),name.eq.learn_signup")
        .order("created_at", { ascending: true })
        .limit(5000),
      client
        .from("leads")
        .select("name, phone, contact, locale, ref, created_at")
        .eq("plan", "learn")
        .order("created_at", { ascending: false })
        .limit(500),
      /* ── the CRM: five raw tables, folded in lib/crm ─────────────────
         The events query names the 015 columns, so it FAILS before that
         migration runs — which is exactly the signal the tab uses to say
         so instead of showing an empty CRM as if nobody had visited. */
      client
        .from("events")
        .select("ref, name, detail, campaign, locale, created_at, session, funnel, page, cta")
        .order("created_at", { ascending: false })
        .limit(30000),
      client.from("intake").select("ref, name, contact, whatsapp, phone, stage, updated_at").limit(5000),
      client.from("leads").select("ref, contact, name, phone, plan, created_at").limit(5000),
      client.from("payments").select("ref, amount_minor, currency, plan, status, funnel, created_at").limit(5000),
      client.from("offers").select("ref, funnel, started_at, expires_at, recovery_until, status").limit(20000),
      client.from("recovery").select("ref, funnel, channel, status, created_at").limit(20000),
      /* ── accounts (017): the user, his mirrored progress, his payments ── */
      client.from("users").select("id, phone, lang, created_at").is("deleted_at", null).order("created_at", { ascending: false }).limit(2000),
      client.from("progress").select("ref, plan, day, measurements, markers").limit(5000),
      client.from("payments").select("ref, plan, amount_minor, status").eq("status", "paid").limit(5000),
    ]);

    if (!uRows.error) {
      type U = { id: string; phone: string; lang: string; created_at: string };
      type P = { ref: string; plan: string | null; day: number; measurements: { day: number; seconds: number; at: string; kind?: string }[]; markers: { at: string; markers: Record<string, number> }[] };
      type Pay = { ref: string; plan: string; amount_minor: number };
      const prog = new Map<string, P>();
      for (const r of (uProgress.data ?? []) as P[]) prog.set(r.ref, r);
      const paid = new Map<string, Pay[]>();
      for (const r of (uPayments.data ?? []) as Pay[]) paid.set(r.ref, [...(paid.get(r.ref) ?? []), r]);
      snap.users = ((uRows.data ?? []) as U[]).map((u) => {
        const p = prog.get(u.id);
        const pays = paid.get(u.id) ?? [];
        const plans = pays.map((x) => x.plan);
        const plan: UserView["plan"] = plans.includes("sprint") ? "p30" : plans.includes("test") ? "p10" : "free";
        const m = (d: number) => p?.measurements?.find((x) => x.day === d && x.kind !== "estimate")?.seconds ?? null;
        const marks = (p?.markers ?? []).map((x) => ({ at: x.at, ...(x.markers as { erection: number; energy: number; sleep: number; control: number; libido?: number; stress?: number; stomach?: number }) }));
        return {
          id: u.id, phone: u.phone, lang: u.lang, createdAt: u.created_at, plan,
          paidMinor: pays.reduce((a, x) => a + Number(x.amount_minor ?? 0), 0),
          day: p?.day ?? 1, baseline: m(1), day12: m(12), day30: m(30),
          markersCount: marks.length, lastMarkers: marks.at(-1)?.at ?? null, markers: marks, daysDone: [],
        };
      });
      snap.usersReady = true;
    }

    if (!crmEvents.error && !crmOffers.error) {
      const r = fold({
        events: (crmEvents.data ?? []) as Parameters<typeof fold>[0]["events"],
        intake: (crmIntake.data ?? []) as Parameters<typeof fold>[0]["intake"],
        leads: (crmLeads.data ?? []) as Parameters<typeof fold>[0]["leads"],
        payments: (crmPayments.data ?? []) as Parameters<typeof fold>[0]["payments"],
        offers: (crmOffers.data ?? []) as Parameters<typeof fold>[0]["offers"],
        recovery: (crmRecovery.data ?? []) as Parameters<typeof fold>[0]["recovery"],
      });
      snap.crmContacts = r.contacts;
      snap.crmFunnels = r.funnels;
      snap.crmReady = true;
    }

    snap.funnel = funnel.data ?? [];
    snap.dropoff = dropoff.data ?? [];
    snap.recent = recent.data ?? [];
    snap.activity = activity.data ?? [];
    snap.campaigns = campaigns.data ?? [];
    snap.startRows = startRows.data ?? [];
    snap.ctaRows = ctaRows.data ?? [];
    snap.d2Rows = d2Rows.data ?? [];
    snap.d2Daily = d2Daily.data ?? [];
    {
      /* A visitor belongs to the day they FIRST landed, Sydney time, and
         every later step counts on that day — same rule as the sales
         funnels, so a signup at 1am does not orphan the arrival that won it. */
      type Ev = { ref: string; name: string; detail: string | null; campaign: string | null; created_at: string };
      const evs = (learnDays.data ?? []) as Ev[];
      const dayOf = (iso: string) =>
        new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));
      const first = new Map<string, { day: string; campaign: string }>();
      for (const e of evs) {
        if (e.name === "start_view" && e.detail === "learn" && !first.has(e.ref)) {
          first.set(e.ref, { day: dayOf(e.created_at), campaign: e.campaign ?? "(none)" });
        }
      }
      const cell = new Map<string, { day: string; campaign: string; arrived: Set<string>; signed: Set<string> }>();
      for (const e of evs) {
        const f = first.get(e.ref);
        if (!f) continue;
        const k = `${f.day}|${f.campaign}`;
        const c = cell.get(k) ?? { day: f.day, campaign: f.campaign, arrived: new Set(), signed: new Set() };
        if (e.name === "start_view") c.arrived.add(e.ref);
        if (e.name === "learn_signup") c.signed.add(e.ref);
        cell.set(k, c);
      }
      snap.learnDays = [...cell.values()].map((c) => ({
        day: c.day, campaign: c.campaign, arrived: c.arrived.size, signed_up: c.signed.size,
      }));

      type Ld = { name: string | null; phone: string | null; contact: string | null; locale: string; ref: string | null; created_at: string };
      snap.learnSignups = ((learnSignups.data ?? []) as Ld[]).map((l) => ({
        name: l.name ?? "",
        phone: l.phone ?? "",
        email: l.contact ?? "",
        locale: l.locale,
        ref: l.ref,
        signed_at: new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(l.created_at)).replace(",", ""),
        campaign: l.ref ? first.get(l.ref)?.campaign ?? null : null,
      }));
    }
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
