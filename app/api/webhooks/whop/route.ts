import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { membership, isValid, planFromMembership } from "@/lib/payments/whop";

export const runtime = "nodejs";

/**
 * Whop webhook.
 *
 * Set the endpoint in Whop -> Developer -> Webhooks:
 *   https://metron.life/api/webhooks/whop
 *
 * Whop signs the raw body with your webhook secret. We verify that signature
 * against the RAW text — not a re-serialised object, since re-serialising
 * changes key order and whitespace and the signature would never match.
 *
 * Then, exactly as with Fapshi, the payload is still only a rumour: we take the
 * membership id from it and ask Whop directly whether that membership is live.
 *
 * ⚠ Confirm the header name and signing scheme against Whop's current docs.
 * Both common shapes are accepted below (raw HMAC hex, and a t=/v1= scheme).
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const secret = process.env.WHOP_WEBHOOK_SECRET;

  if (secret) {
    const header =
      req.headers.get("x-whop-signature") ??
      req.headers.get("whop-signature") ??
      req.headers.get("x-whop-webhook-signature") ??
      "";
    if (!verifySignature(raw, header, secret)) {
      // 404, not 403 — do not confirm the endpoint exists.
      return new NextResponse("Not found", { status: 404 });
    }
  }

  let event: { action?: string; type?: string; data?: Record<string, unknown> };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: true });
  }

  const data = event.data ?? {};
  const membershipId =
    (data.id as string) ?? (data.membership_id as string) ?? (data.membership as string) ?? "";

  if (!membershipId) return NextResponse.json({ ok: true });

  const m = await membership(membershipId);

  if (isValid(m)) {
    // TODO(supabase): upsert entitlement { ref: m.metadata?.ref, plan, txId: membershipId }
    console.log("[whop webhook] VALID", {
      membershipId,
      plan: planFromMembership(m),
      ref: m?.metadata?.ref,
      event: event.action ?? event.type,
    });
  } else {
    console.log("[whop webhook] not valid", { membershipId, status: m?.status });
  }

  // Always 200 — a non-2xx triggers retries, and a retry storm helps nobody.
  return NextResponse.json({ ok: true });
}

function verifySignature(raw: string, header: string, secret: string): boolean {
  if (!header) return false;

  const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");

  // Shape A: the header is just the hex digest.
  if (safeEqual(header.trim(), expected)) return true;

  // Shape B: "t=<ts>,v1=<hex>" — compare each v1 part.
  for (const part of header.split(",")) {
    const [k, v] = part.split("=");
    if (!v) continue;
    if (k.trim() === "v1" && safeEqual(v.trim(), expected)) return true;
  }
  return false;
}

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  if (x.length !== y.length) {
    crypto.timingSafeEqual(y, y);
    return false;
  }
  return crypto.timingSafeEqual(x, y);
}
