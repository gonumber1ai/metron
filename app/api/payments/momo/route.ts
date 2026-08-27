import { NextResponse } from "next/server";
import { getPrice, type Plan } from "@/lib/payments";
import { directPay, isConfigured, PHONE_RE, operatorOf } from "@/lib/payments/fapshi";

export const runtime = "nodejs";

/**
 * Embedded Mobile Money charge.
 *
 * Takes a phone number from our own form and pushes a USSD prompt to the
 * handset. Returns only a transId — the client then polls /api/payments/verify,
 * which is the single place entitlement is ever granted.
 *
 * The amount comes from the price book, never from the request body. A client
 * that sends {"amount": 1} gets charged the real price.
 */
export async function POST(req: Request) {
  if (!isConfigured()) {
    return NextResponse.json({ status: "unavailable" });
  }

  let body: { plan?: Plan; country?: string; ref?: string; phone?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ status: "error", message: "bad request" }, { status: 400 });
  }

  const plan: Plan = body.plan === "sprint" ? "sprint" : "test";
  const ref = (body.ref ?? "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 64);
  const phone = (body.phone ?? "").replace(/\D/g, "");

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

  try {
    // Fapshi treats `medium` as optional, but naming the network removes any
    // ambiguity about which rail the prompt should be pushed down.
    const op = operatorOf(phone);
    const { transId } = await directPay({
      amount: price.amountMinor, // XAF has no minor unit
      phone,
      externalId: ref,
      userId: ref,
      medium: op === "orange" ? "orange money" : op === "mtn" ? "mobile money" : undefined,
      message: plan === "sprint" ? "Metron 30" : "Metron 10",
    });
    return NextResponse.json({ status: "ok", transId });
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown";
    console.error("[momo] direct-pay failed", reason);
    // The provider's own wording is far more useful to a man staring at a
    // failure than "something went wrong", and it exposes no credentials.
    // If direct-pay is not enabled on the account this is where it says so.
    return NextResponse.json({ status: "failed", reason }, { status: 502 });
  }
}
