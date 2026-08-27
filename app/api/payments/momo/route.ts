import { NextResponse } from "next/server";
import { getPrice, type Plan } from "@/lib/payments";
import { directPay, initiatePay, isConfigured, PHONE_RE, operatorOf } from "@/lib/payments/fapshi";

export const runtime = "nodejs";

/**
 * Mobile Money charge.
 *
 * ── TWO PATHS, AND WHY ───────────────────────────────────────────────────
 * direct-pay pushes a USSD prompt straight to the handset, so the buyer never
 * leaves our page. It is the better experience and it is NOT available by
 * default: Fapshi gate it behind an emailed application to support@fapshi.com
 * and approve it only for "absolutely necessary" use cases. Until that lands,
 * calling it returns "Forbidden request".
 *
 * So unless FAPSHI_DIRECT_PAY=1 says otherwise, we go straight to initiate-pay
 * and hand back a hosted checkout link. That rail is confirmed working on this
 * account today. It costs one redirect and it takes money, which beats an
 * elegant form that cannot charge anybody.
 *
 * If direct-pay IS enabled but fails anyway, we still fall through to the
 * hosted link rather than showing a failure — a live funnel should degrade,
 * not stop.
 *
 * The amount always comes from the price book, never from the request body.
 * A client that sends {"amount": 1} gets charged the real price.
 */
export async function POST(req: Request) {
  if (!isConfigured()) {
    return NextResponse.json({ status: "unavailable" });
  }

  let body: {
    plan?: Plan;
    country?: string;
    ref?: string;
    phone?: string;
    locale?: string;
    name?: string;
    email?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ status: "error", message: "bad request" }, { status: 400 });
  }

  const plan: Plan = body.plan === "sprint" ? "sprint" : "test";
  const ref = (body.ref ?? "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 64);
  const phone = (body.phone ?? "").replace(/\D/g, "");
  const name = (body.name ?? "").trim().slice(0, 80);
  // Pre-filling these is not politeness. Fapshi's own checkout asks for all
  // three, and the email is the only way a Mobile Money buyer ever receives
  // his access code — without it he cannot get back in on a new device.
  const email = (body.email ?? "").trim().slice(0, 120);

  if (!ref) {
    return NextResponse.json({ status: "error", message: "missing ref" }, { status: 400 });
  }
  if (!PHONE_RE.test(phone)) {
    return NextResponse.json({ status: "bad_phone" }, { status: 400 });
  }

  const price = getPrice(plan, body.country ?? "CM");
  if (price.provider !== "fapshi") {
    return NextResponse.json({ status: "unavailable" });
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
  const locale = body.locale === "fr" ? "fr" : "en";
  const message = plan === "sprint" ? "Metron 30" : "Metron 10";

  // ---- preferred path: charge the handset directly, no redirect ----------
  if (process.env.FAPSHI_DIRECT_PAY === "1") {
    try {
      // `medium` is optional for Fapshi, but naming the network removes any
      // ambiguity about which rail the prompt goes down.
      const op = operatorOf(phone);
      const { transId } = await directPay({
        amount: price.amountMinor, // XAF has no minor unit
        phone,
        externalId: ref,
        userId: ref,
        name: name || undefined,
        email: email || undefined,
        medium: op === "orange" ? "orange money" : op === "mtn" ? "mobile money" : undefined,
        message,
      });
      return NextResponse.json({ status: "ok", transId });
    } catch (err) {
      // Do not surface this. Fall through and sell.
      console.error("[momo] direct-pay failed, falling back to hosted link:", err);
    }
  }

  // ---- fallback: hosted checkout. Confirmed working on this account. -----
  try {
    const result = await initiatePay({
      amount: price.amountMinor,
      redirectUrl: `${origin}/${locale}/checkout/done?ref=${ref}`,
      externalId: ref,
      userId: ref,
      name: name || undefined,
      email: email || undefined,
      message,
    });
    return NextResponse.json({ status: "redirect", url: result.link, transId: result.transId });
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown";
    console.error("[momo] initiate-pay failed", reason);
    // The provider's own wording is worth far more than "something went
    // wrong", to him and to us, and it exposes no credentials.
    return NextResponse.json({ status: "failed", reason }, { status: 502 });
  }
}
