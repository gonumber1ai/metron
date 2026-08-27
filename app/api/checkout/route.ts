import { NextResponse } from "next/server";
import { getPrice, getPriceFor, type Plan, type ProviderId } from "@/lib/payments";
import { initiatePay, isConfigured } from "@/lib/payments/fapshi";
import * as whop from "@/lib/payments/whop";
import { recordIntake } from "@/lib/supabase/server";

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
  let body: {
    plan?: Plan;
    country?: string;
    ref?: string;
    locale?: string;
    /** which rail the buyer actually tapped — trusted over his country */
    provider?: ProviderId;
    name?: string;
    email?: string;
    quiz?: unknown;
  };
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

  // The rail the buyer chose wins. Only fall back to the country's default
  // when the client did not say — otherwise a man in Cameroon who taps "Card"
  // gets sent to Mobile Money, which is exactly the bug this replaces.
  const requested = body.provider === "whop" || body.provider === "fapshi" ? body.provider : null;
  const price = (requested && getPriceFor(plan, requested, country)) || getPrice(plan, country);

  if (requested && price.provider !== requested) {
    return NextResponse.json({ status: "unavailable", provider: requested });
  }

  void recordIntake({
    ref,
    name: body.name,
    contact: body.email,
    plan,
    locale,
    provider: body.provider ?? undefined,
    stage: "checkout_started",
    quiz: body.quiz,
  });

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
