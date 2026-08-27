import { NextResponse } from "next/server";
import { paymentStatus, isPaid, isConfigured } from "@/lib/payments/fapshi";
import * as whop from "@/lib/payments/whop";
import { sendPurchaseConfirmation, looksLikeEmail } from "@/lib/email/send";
import { issue, cookieName, cookieOptions } from "@/lib/entitlement";

export const runtime = "nodejs";

/**
 * The only place access is granted.
 *
 * The browser comes back from Fapshi with a transId. We ignore whatever the
 * URL claims and ask Fapshi directly. If — and only if — it says SUCCESSFUL,
 * we mint the signed entitlement cookie.
 */
export async function POST(req: Request) {
  let body: { transId?: string; ref?: string; membershipId?: string; via?: string; locale?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ status: "error" }, { status: 400 });
  }

  const ref = (body.ref ?? "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 64);
  if (!ref) return NextResponse.json({ status: "error" }, { status: 400 });

  // ------------------------------------------------------------ card / Whop
  if (body.via === "whop") {
    const membershipId = (body.membershipId ?? "").trim();
    if (!membershipId) {
      // Whop does not always put an id on the redirect. The webhook is the
      // authority on that rail; tell the client to wait rather than to fail.
      return NextResponse.json({ status: "PENDING", paid: false });
    }
    const m = await whop.membership(membershipId);
    if (!whop.isValid(m)) {
      return NextResponse.json({ status: m?.status ?? "UNKNOWN", paid: false });
    }
    const wPlan = whop.planFromMembership(m);
    const wEmail = typeof m?.metadata?.email === "string" ? m.metadata.email : undefined;
    if (wEmail && looksLikeEmail(wEmail)) {
      void sendPurchaseConfirmation({ to: wEmail, locale: body.locale === "fr" ? "fr" : "en" });
    }
    const res = NextResponse.json({ status: "SUCCESSFUL", paid: true, plan: wPlan });
    res.cookies.set(
      cookieName,
      issue({ ref, plan: wPlan, txId: membershipId, iat: Math.floor(Date.now() / 1000) }),
      cookieOptions,
    );
    return res;
  }

  // -------------------------------------------------------- Mobile Money
  if (!isConfigured()) {
    return NextResponse.json({ status: "unavailable" });
  }

  const transId = (body.transId ?? "").trim();
  if (!transId) {
    return NextResponse.json({ status: "error" }, { status: 400 });
  }

  const tx = await paymentStatus(transId);

  if (!isPaid(tx)) {
    return NextResponse.json({ status: tx?.status ?? "UNKNOWN", paid: false });
  }

  // The payment must belong to this device, or a leaked transId would unlock
  // somebody else's browser.
  if (tx!.externalId && tx!.externalId !== ref) {
    console.warn("[verify] externalId mismatch", { transId });
    return NextResponse.json({ status: "MISMATCH", paid: false }, { status: 403 });
  }

  // Amount decides which plan was bought — never trust a plan sent by the
  // client. Same rule as the card rail, one definition, in whop.planFromAmount.
  const plan = whop.planFromAmount(tx!.amount ?? 0, "XAF");

  if (tx!.email && looksLikeEmail(tx!.email)) {
    void sendPurchaseConfirmation({ to: tx!.email, locale: body.locale === "fr" ? "fr" : "en" });
  }

  const res = NextResponse.json({ status: "SUCCESSFUL", paid: true, plan });
  res.cookies.set(
    cookieName,
    issue({ ref, plan, txId: transId, iat: Math.floor(Date.now() / 1000) }),
    cookieOptions,
  );
  return res;
}
