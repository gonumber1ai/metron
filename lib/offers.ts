import { db } from "@/lib/supabase/server";
import { FUNNELS, isFunnelId, TIERS, type Funnel } from "@/lib/funnels";

/**
 * The offer clock, on the server.
 *
 * One row per visitor, created the first time he lands on a funnel and never
 * restarted. Refresh, close the browser, come back tomorrow, press the button
 * ten times — same row, same deadline. The countdown in the browser only
 * displays what this says, and the payment route reads this, not a cookie,
 * to decide what he pays.
 *
 * ── STATES ────────────────────────────────────────────────────────────────
 *   live         offer price holds
 *   expired      clock ran; full price
 *   recovering   he came back after expiry through the last-chance link; the
 *                offer price is honoured for this attempt, within the window
 *   paid         money moved at the live or full price
 *   recovered    money moved through the last-chance link
 *
 * ── THE LAST CHANCE IS A DEFINED THING ────────────────────────────────────
 * After expiry, for `recoveryHours`, a returning visitor is shown a popup
 * whose link carries lc=1. That link — and only that link — prices the 10-day
 * at the offer price again. After the window, the popup stops and the price
 * stays full. It is not a countdown that quietly restarts and it is not an
 * expiry that was never real; it is one clock, one second chance, and both
 * are dated in the row.
 */

export type OfferState = {
  ref: string;
  funnel: Funnel;
  startedAt: string;
  expiresAt: string;
  recoveryUntil: string;
  status: "live" | "expired" | "recovering" | "paid" | "recovered";
  /** true on the call that created the row — the client fires timer_started */
  created: boolean;
  /** the offer is past its clock */
  expired: boolean;
  /** he is inside the recovery window and has not paid */
  lastChance: boolean;
};

type Row = {
  ref: string;
  funnel: string;
  started_at: string;
  expires_at: string;
  recovery_until: string;
  status: OfferState["status"];
  expired_logged: boolean;
};

function shape(r: Row, created: boolean): OfferState | null {
  if (!isFunnelId(r.funnel)) return null;
  const now = Date.now();
  const expired = Date.parse(r.expires_at) <= now;
  const unpaid = r.status !== "paid" && r.status !== "recovered";
  return {
    ref: r.ref,
    funnel: FUNNELS[r.funnel],
    startedAt: r.started_at,
    expiresAt: r.expires_at,
    recoveryUntil: r.recovery_until,
    status: r.status,
    created,
    expired,
    lastChance: expired && unpaid && Date.parse(r.recovery_until) > now,
  };
}

/**
 * Get the visitor's offer, creating it on first sight. Idempotent on ref:
 * a second call with a different funnel returns the ORIGINAL row — his clock
 * started when he first landed, whichever page that was.
 *
 * On any read past the deadline the row flips to `expired` and timer_expired
 * is written to events exactly once. The server does this, not the browser,
 * so it happens whether or not he ever comes back.
 */
export async function getOrStartOffer(ref: string, funnelId: string): Promise<OfferState | null> {
  const client = db();
  if (!client || !ref || !isFunnelId(funnelId)) return null;
  const f = FUNNELS[funnelId];

  try {
    const { data: have } = await client.from("offers").select("*").eq("ref", ref).maybeSingle();
    let row = have as Row | null;
    let created = false;

    if (!row) {
      const now = Date.now();
      const ins = {
        ref,
        funnel: f.id,
        started_at: new Date(now).toISOString(),
        expires_at: new Date(now + f.timerHours * 3_600_000).toISOString(),
        recovery_until: new Date(now + (f.timerHours + f.recoveryHours) * 3_600_000).toISOString(),
        status: "live" as const,
        expired_logged: false,
      };
      // Two tabs racing to create the same row: the second insert loses on
      // the primary key and we read what the first one wrote.
      const { error } = await client.from("offers").insert(ins);
      if (error && !/duplicate|unique|23505/i.test(error.message)) {
        console.error("[offers] insert", error.message);
        return null;
      }
      if (error) {
        const again = await client.from("offers").select("*").eq("ref", ref).maybeSingle();
        row = again.data as Row | null;
      } else {
        row = { ...ins };
        created = true;
      }
    }
    if (!row) return null;

    // Flip to expired on first read past the deadline, and log it once.
    if (row.status === "live" && Date.parse(row.expires_at) <= Date.now()) {
      await client
        .from("offers")
        .update({ status: "expired", updated_at: new Date().toISOString() })
        .eq("ref", ref)
        .eq("status", "live");
      row.status = "expired";
    }
    if (row.status !== "live" && !row.expired_logged) {
      const { data: flipped } = await client
        .from("offers")
        .update({ expired_logged: true })
        .eq("ref", ref)
        .eq("expired_logged", false)
        .select("ref");
      // Only the caller that actually flipped the flag writes the event.
      if (flipped && flipped.length > 0) {
        await client.from("events").insert({
          ref,
          name: "timer_expired",
          detail: row.funnel,
          funnel: row.funnel,
          locale: FUNNELS[row.funnel as keyof typeof FUNNELS]?.lang ?? "en",
          eid: `expired-${ref}`,
        });
      }
      row.expired_logged = true;
    }

    return shape(row, created);
  } catch (e) {
    console.error("[offers]", (e as Error).message);
    return null;
  }
}

/** Read without creating. Null if he has no clock. */
export async function getOffer(ref: string): Promise<OfferState | null> {
  const client = db();
  if (!client || !ref) return null;
  const { data } = await client.from("offers").select("*").eq("ref", ref).maybeSingle();
  if (!data) return null;
  return getOrStartOffer(ref, (data as Row).funnel);
}

/**
 * What the 10-day costs him right now, in XAF, and why.
 * `lc` is the last-chance flag from the checkout link.
 */
export function priceFor(o: OfferState | null, lc: boolean): { amount: number; reason: "offer" | "full" | "lastchance" } {
  if (!o) return { amount: TIERS["5k"].offer, reason: "offer" }; // no clock: legacy /c traffic, unchanged
  const t = TIERS[o.funnel.tier];
  if (!o.expired) return { amount: t.offer, reason: "offer" };
  if (lc && o.lastChance) return { amount: t.offer, reason: "lastchance" };
  return { amount: t.full, reason: "full" };
}

/** Mark the row when he pays. Recovered if he came through the last-chance link. */
export async function markPaid(ref: string, viaLastChance: boolean): Promise<void> {
  const client = db();
  if (!client || !ref) return;
  await client
    .from("offers")
    .update({ status: viaLastChance ? "recovered" : "paid", updated_at: new Date().toISOString() })
    .eq("ref", ref)
    .in("status", ["live", "expired", "recovering"]);
}

/** He pressed the last-chance link and reached the checkout. */
export async function markRecovering(ref: string): Promise<void> {
  const client = db();
  if (!client || !ref) return;
  await client
    .from("offers")
    .update({ status: "recovering", updated_at: new Date().toISOString() })
    .eq("ref", ref)
    .eq("status", "expired");
}
