import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { paymentStatus, isPaid, isConfigured } from "@/lib/payments/fapshi";
import { recordPayment } from "@/lib/supabase/server";
import { sendEvent as metaEvent } from "@/lib/meta";
import { planFromAmount } from "@/lib/payments/whop";

export const runtime = "nodejs";

/** Constant-time compare, so a wrong guess reveals nothing by how long it took. */
function sameSecret(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  if (x.length !== y.length) {
    // Still burn a comparison so length alone is not a timing oracle.
    crypto.timingSafeEqual(y, y);
    return false;
  }
  return crypto.timingSafeEqual(x, y);
}

/**
 * Fapshi webhook.
 *
 * Dashboard -> Quick Actions -> Configure Webhook:
 *   URL:    https://metron.life/api/webhooks/fapshi
 *   Secret: the value of FAPSHI_WEBHOOK_SECRET
 *
 * Fapshi sends that secret back on every call as the `x-wh-secret` header.
 *
 * SECURITY, in two layers:
 *
 * 1. The shared secret. Compared in constant time, because a plain !== leaks
 *    how much of the secret a prober got right. A caller without it gets a 404
 *    rather than a 403 — a 403 confirms the endpoint is real.
 *
 * 2. The body is a rumour, never a fact. Even a caller who has the secret
 *    cannot fake a payment: all we read from the payload is the transId, then
 *    we ask Fapshi ourselves what actually happened. That call is worth more
 *    than the signature check, which is why layer 1 is a bonus rather than the
 *    thing holding the door shut.
 *
 * Right now a confirmed payment is only logged, because entitlement is minted
 * on the redirect path. Once Supabase is in, this is where the row gets
 * written — which matters for the man whose browser dies before he is
 * redirected back. He has paid, and the webhook is the only thing that knows.
 */
export async function POST(req: Request) {
  const expected = process.env.FAPSHI_WEBHOOK_SECRET;
  if (expected) {
    const supplied =
      req.headers.get("x-wh-secret") ??
      new URL(req.url).searchParams.get("t") ??
      "";
    if (!sameSecret(supplied, expected)) {
      // 404, not 403 — do not confirm to a prober that this endpoint is real.
      return new NextResponse("Not found", { status: 404 });
    }
  }

  if (!isConfigured()) return NextResponse.json({ ok: true });

  let payload: { transId?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const transId = (payload.transId ?? "").trim();
  if (!transId) return NextResponse.json({ ok: true });

  const tx = await paymentStatus(transId);

  if (isPaid(tx)) {
    // The point of this write: if his browser died between paying and being
    // redirected, this row is the only record that he paid. Recovery reads it.
    await recordPayment({
      ref: tx!.externalId || tx!.userId || transId,
      provider: "fapshi",
      providerTxn: transId,
      plan: planFromAmount(tx!.amount ?? 0, "XAF"),
      currency: "XAF",
      amountMinor: tx!.amount ?? 0,
    });
    // Purchase, from the one place that knows for certain money moved.
    // Not awaited into the response path: Meta being slow or down must never
    // make us return non-2xx and trigger a Fapshi retry storm.
    void metaEvent({
      event: "Purchase",
      ref: tx!.externalId || tx!.userId || transId,
      value: tx!.amount ?? 0,
      currency: "XAF",
      plan: planFromAmount(tx!.amount ?? 0, "XAF"),
      eventId: `fapshi_${transId}`,
    });

    console.log("[fapshi webhook] PAID", {
      transId,
      externalId: tx?.externalId,
      amount: tx?.amount,
    });
  } else {
    console.log("[fapshi webhook] status", { transId, status: tx?.status });
  }

  // Always 200 — a non-2xx makes Fapshi retry, and a retry storm helps nobody.
  return NextResponse.json({ ok: true });
}
