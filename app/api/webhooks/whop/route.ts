import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { membership, isValid, planFromMembership } from "@/lib/payments/whop";
import { recordPayment } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Whop webhook.
 *
 * Endpoint: https://metron.life/api/webhooks/whop
 *
 * ── SIGNATURE ────────────────────────────────────────────────────────────
 * Whop signs with the Standard Webhooks scheme, not a plain HMAC of the body.
 * Three headers arrive:
 *
 *   webhook-id         unique message id, also the idempotency key
 *   webhook-timestamp  unix seconds
 *   webhook-signature  "v1,<base64>", space separated if more than one
 *
 * The signed string is `{id}.{timestamp}.{raw body}`, HMAC-SHA256, base64.
 * The RAW body matters — parse it first and the signature never matches,
 * because re-serialising changes key order and whitespace.
 *
 * An earlier version of this file checked a hex HMAC of the body alone under
 * an x-whop-signature header. That is not a scheme Whop uses; every webhook
 * would have been rejected and every card payment would have looked like it
 * silently failed.
 */

const TOLERANCE_SECONDS = 5 * 60;

/**
 * Standard Webhooks secrets are usually `whsec_<base64>`, where the HMAC key is
 * the DECODED bytes — but Whop's own examples pass the secret straight through
 * as a string, implying the literal is the key. The conventions disagree and we
 * cannot test against live traffic here, so both are tried.
 *
 * This weakens nothing: an attacker still has to hold the secret to produce
 * either signature.
 */
function candidateKeys(secret: string): Buffer[] {
  const keys: Buffer[] = [Buffer.from(secret, "utf8")];
  const b64 = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  try {
    const decoded = Buffer.from(b64, "base64");
    if (decoded.length > 0) keys.push(decoded);
  } catch {
    /* not base64 — the utf8 key is the only candidate */
  }
  return keys;
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

function verify(rawBody: string, headers: Headers): { ok: boolean; reason?: string } {
  const secret = process.env.WHOP_WEBHOOK_SECRET;
  if (!secret) return { ok: false, reason: "WHOP_WEBHOOK_SECRET not set" };

  const id = headers.get("webhook-id");
  const ts = headers.get("webhook-timestamp");
  const sig = headers.get("webhook-signature");
  if (!id || !ts || !sig) return { ok: false, reason: "missing webhook-* headers" };

  // Replay guard — Whop's guidance is a five minute window.
  const sent = Number(ts);
  if (!Number.isFinite(sent)) return { ok: false, reason: "bad timestamp" };
  const drift = Math.abs(Math.floor(Date.now() / 1000) - sent);
  if (drift > TOLERANCE_SECONDS) return { ok: false, reason: `timestamp drift ${drift}s` };

  const signed = `${id}.${ts}.${rawBody}`;
  const expected = candidateKeys(secret).map((key) =>
    createHmac("sha256", key).update(signed).digest("base64"),
  );

  // The header can carry several signatures during a secret rotation.
  const presented = sig
    .split(" ")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => (p.startsWith("v1,") ? p.slice(3) : p));

  const matched = presented.some((given) => expected.some((mine) => safeEqual(given, mine)));
  return matched ? { ok: true } : { ok: false, reason: "signature mismatch" };
}

export async function POST(req: Request) {
  const raw = await req.text();

  const v = verify(raw, req.headers);
  if (!v.ok) {
    console.warn("[whop webhook] rejected:", v.reason);
    // 404, not 403 — do not confirm to a prober that this endpoint is real.
    return new NextResponse("Not found", { status: 404 });
  }

  let event: { type?: string; action?: string; event?: string; data?: Record<string, unknown> };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: true });
  }

  // Whop writes the event name as "type" in some versions and "action" or
  // "event" in others, dotted in the docs and underscored in the dashboard.
  // Normalise to the dotted form so every variant matches.
  const rawType = [event.type, event.action, event.event].find(
    (x): x is string => typeof x === "string" && x.length > 0,
  );
  const type = (rawType ?? "").toLowerCase().replace(/_/g, ".");

  const data = event.data ?? {};
  const membershipId =
    (data.id as string) ?? (data.membership_id as string) ?? (data.membership as string) ?? "";

  if (!membershipId) {
    console.log("[whop webhook] no membership id on", type);
    return NextResponse.json({ ok: true });
  }

  // The payload is still only a rumour. Ask Whop what actually happened.
  const m = await membership(membershipId);

  if (isValid(m)) {
    await recordPayment({
      ref: (typeof m?.metadata?.ref === "string" ? m.metadata.ref : "") || membershipId,
      provider: "whop",
      providerTxn: membershipId,
      plan: planFromMembership(m),
      currency: (m?.currency ?? "USD").toUpperCase(),
      amountMinor: m?.amount ?? m?.receipt?.amount ?? 0,
    });
    console.log("[whop webhook] PAID", { type, membershipId, ref: m?.metadata?.ref });
  } else {
    console.log("[whop webhook] not valid", { type, membershipId, status: m?.status });
  }

  // Always 200 — a non-2xx makes Whop retry, and a retry storm helps nobody.
  return NextResponse.json({ ok: true });
}
