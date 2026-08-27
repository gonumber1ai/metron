import { NextResponse } from "next/server";
import { getPrice, type Plan } from "@/lib/payments";
import { initiatePay, isConfigured } from "@/lib/payments/fapshi";
import * as whop from "@/lib/payments/whop";

export const runtime = "nodejs";

/**
 * Start a payment.
 *
 * MoMo goes to Fapshi and comes back as a hosted checkout link. Cards will go
 * to Whop once those credentials arrive; until then that rail reports
 * "unavailable" and the offer page falls back to lead capture, so the funnel
 * keeps collecting contacts rather than dead-ending on a broken button.
 */
export async function POST(req: Request) {
  let body: { plan?: Plan; country?: string; ref?: string; locale?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ status: "error", message: "bad request" }, { status: 400 });
  }

  const plan: Plan = body.plan === "sprint" ? "sprint" : "test";
  const country = body.country ?? "default";
  const locale = body.locale === "fr" ? "fr" : "en";
  const ref = (body.ref ?? "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 64);

  if (!ref) {
    return NextResponse.json({ status: "error", message: "missing ref" }, { status: 400 });
  }

  const price = getPrice(plan, country);

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;

  // ---------------------------------------------------------- card / Whop
  if (price.provider === "whop") {
    if (!whop.isConfigured()) {
      return NextResponse.json({ status: "unavailable", provider: "whop" });
    }
    try {
      const out = await whop.createCheckout({
        plan,
        ref,
        // Price comes from the price book, never from the client.
        amountMinor: price.amountMinor,
        currency: price.currency,
        redirectUrl: `${origin}/${locale}/checkout/done?ref=${ref}&via=whop`,
      });
      if (!out) return NextResponse.json({ status: "unavailable", provider: "whop" });
      return NextResponse.json({ status: "ok", url: out.url, sessionId: out.sessionId });
    } catch (err) {
      console.error("[checkout] whop failed", err);
      return NextResponse.json({ status: "unavailable", provider: "whop" });
    }
  }

  // ------------------------------------------------------- Mobile Money
  if (!isConfigured()) {
    return NextResponse.json({ status: "unavailable", provider: "fapshi" });
  }

  try {
    const result = await initiatePay({
      // XAF has no minor unit, so amountMinor is already whole francs.
      amount: price.amountMinor,
      redirectUrl: `${origin}/${locale}/checkout/done?ref=${ref}`,
      externalId: ref,
      userId: ref,
      message: plan === "sprint" ? "Metron 30" : "Metron 10",
    });

    return NextResponse.json({
      status: "ok",
      url: result.link,
      transId: result.transId,
    });
  } catch (err) {
    console.error("[checkout] fapshi initiate failed", err);
    // Never surface provider internals to the client.
    return NextResponse.json({ status: "unavailable", provider: "fapshi" });
  }
}
