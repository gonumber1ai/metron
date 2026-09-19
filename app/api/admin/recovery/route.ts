import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdmin, adminCookie } from "@/lib/admin";
import { db } from "@/lib/supabase/server";
import { sendPlain } from "@/lib/email/send";
import { FUNNELS, isFunnelId } from "@/lib/funnels";
import { recoveryMessage, type Contact } from "@/lib/crm";
import { getOffer } from "@/lib/offers";

export const runtime = "nodejs";

/**
 * Send — or record — a recovery message to one contact.
 *
 *   channel "email"     builds the message for his funnel and language and
 *                       sends it. Needs an email on the contact.
 *   channel "whatsapp"  records that the admin sent it by hand. There is no
 *                       WhatsApp Business API on this project, so the admin
 *                       opens the wa.me link the CRM gives him, sends the
 *                       prefilled text, and presses "mark sent" — which lands
 *                       here. Say so rather than pretend.
 *
 * ── THE RULES THAT CANNOT BE SKIPPED ─────────────────────────────────────
 * Refuses if he has paid: the whole point of the campaign is gone. Refuses
 * a second message on the same channel inside 24 hours: the frequency cap
 * lives here, not in the admin's memory. Writes a `recovery` row and a
 * `recovery_sent` event on success, and a `recovery` row with status
 * `failed`/`suppressed` when it does not go, so the CRM shows what happened
 * either way.
 */
export async function POST(req: Request) {
  const jar = await cookies();
  if (!verifyAdmin(jar.get(adminCookie)?.value)) return new NextResponse("Not found", { status: 404 });

  let body: { ref?: string; channel?: "email" | "whatsapp"; email?: string; funnel?: string; locale?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad request" }, { status: 400 });
  }
  const ref = (body.ref ?? "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 64);
  const channel = body.channel === "whatsapp" ? "whatsapp" : "email";
  if (!ref) return NextResponse.json({ ok: false, error: "missing ref" }, { status: 400 });

  const client = db();
  if (!client) return NextResponse.json({ ok: false, error: "no database" }, { status: 503 });

  const offer = await getOffer(ref);
  const funnelId = offer?.funnel.id ?? (isFunnelId(body.funnel) ? body.funnel : null);
  const lang: "en" | "fr" = funnelId ? FUNNELS[funnelId].lang : body.locale === "fr" ? "fr" : "en";

  const log = async (status: string, detail?: string) => {
    await client.from("recovery").insert({ ref, funnel: funnelId ?? "none", channel, status, detail: detail ?? null });
  };

  // Brief 2: his Day 1 story decides the message. Measured: nothing, ever.
  const { data: d1 } = await client
    .from("events")
    .select("name, created_at")
    .eq("ref", ref)
    .in("name", ["signup", "day1_estimate", "day1_measured"])
    .order("created_at", { ascending: true })
    .limit(50);
  const first = (n: string) => (d1 ?? []).find((e: { name: string; created_at: string }) => e.name === n)?.created_at ?? null;
  const signedUpAt = first("signup"), estimatedAt = first("day1_estimate"), measuredAt = first("day1_measured");
  if (measuredAt && signedUpAt) {
    await log("suppressed", "already measured");
    return NextResponse.json({ ok: false, error: "he has measured — nothing to recover" });
  }

  // Paid: stop — unless he paid on an estimate and still owes Day 1 its number.
  const { data: paid } = await client.from("payments").select("created_at").eq("ref", ref).eq("status", "paid").order("created_at", { ascending: true }).limit(1);
  const paidAt = paid?.[0]?.created_at ?? null;
  const paidUnmeasured = Boolean(paidAt && estimatedAt && !measuredAt);
  if (paidAt && !paidUnmeasured) {
    await log("suppressed", "already paid");
    return NextResponse.json({ ok: false, error: "already paid — no message sent" });
  }
  if (!paidUnmeasured && offer && (offer.status === "paid" || offer.status === "recovered")) {
    await log("suppressed", "offer closed");
    return NextResponse.json({ ok: false, error: "already paid — no message sent" });
  }

  // Brief 2, Section 3: two per branch, then silence.
  const { count: sentSoFar } = await client.from("recovery").select("id", { count: "exact", head: true }).eq("ref", ref).eq("status", "sent");
  if (signedUpAt && (sentSoFar ?? 0) >= 2) {
    await log("suppressed", "two already sent");
    return NextResponse.json({ ok: false, error: "two messages already went out — no third" });
  }

  // Frequency cap: one per channel per 24h.
  const dayAgo = new Date(Date.now() - 24 * 3_600_000).toISOString();
  const { data: recent } = await client
    .from("recovery")
    .select("id")
    .eq("ref", ref)
    .eq("channel", channel)
    .eq("status", "sent")
    .gte("created_at", dayAgo)
    .limit(1);
  if (recent && recent.length > 0) {
    await log("suppressed", "sent within 24h");
    return NextResponse.json({ ok: false, error: "a message on this channel went out in the last 24h" });
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
  const stub: Contact = {
    ref, name: null, phone: null, email: body.email ?? null, locale: lang,
    funnel: funnelId, firstFunnel: funnelId, campaign: null, firstSeen: "", lastSeen: "",
    sessions: 0, returned: 0, status: "recovery_eligible", paidMinor: 0, offer: null,
    recovery: { email: 0, whatsapp: sentSoFar ?? 0, popup: 0 }, lastRecoveryAt: null, events: [],
    signedUpAt, estimatedAt, measuredAt, paidAt, day1: measuredAt ? "real" : estimatedAt ? "estimate" : "none",
  };
  const msg = recoveryMessage(stub, origin);
  if (!msg) return NextResponse.json({ ok: false, error: funnelId ? "could not build message" : "no funnel for this contact" }, { status: 400 });

  if (channel === "email") {
    const to = (body.email ?? "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      await log("failed", "no email");
      return NextResponse.json({ ok: false, error: "no email on this contact" }, { status: 400 });
    }
    const sent = await sendPlain({ to, subject: msg.subject, text: msg.text });
    if (!sent) {
      await log("failed", "send returned false");
      return NextResponse.json({ ok: false, error: "email did not send — check RESEND_API_KEY" }, { status: 502 });
    }
  }

  await log("sent", channel === "whatsapp" ? "by hand" : undefined);
  await client.from("events").insert({
    ref, name: "recovery_sent", detail: channel, funnel: funnelId, locale: lang, eid: `rec-${ref}-${channel}-${Date.now()}`,
  });
  return NextResponse.json({ ok: true, url: msg.url });
}
