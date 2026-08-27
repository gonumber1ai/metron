import { NextResponse } from "next/server";
import { getPrice, type Plan } from "@/lib/payments";
import {
  directPay,
  initiatePay,
  isConfigured,
  PHONE_RE,
  operatorOf,
} from "@/lib/payments/fapshi";
import { recordIntake } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Mobile Money charge.
 *
 * ── IN-HOUSE FIRST ───────────────────────────────────────────────────────
 * direct-pay pushes a USSD prompt straight to the handset, so the buyer never
 * leaves our page. That is the experience we want, so it is what we TRY first,
 * every time, with no flag to remember to turn on.
 *
 * Fapshi gate direct-pay behind an emailed application and it answers
 * "Forbidden request" until they approve the account. So if it refuses we fall
 * straight through to initiate-pay, which is confirmed working here, and the
 * buyer gets a hosted page instead. He still pays. He just takes one redirect
 * to do it.
 *
 * ── WHY THE COOLDOWN ─────────────────────────────────────────────────────
 * While the account is unapproved, every single purchase would otherwise
 * burn a guaranteed-to-fail round trip before doing the thing that works.
 * The first Forbidden parks direct-pay for an hour, so buyer number two goes
 * straight to the rail that sells. After the hour it tries again by itself,
 * which means the day Fapshi approve you it starts working with no deploy and
 * nothing to switch on.
 *
 * FAPSHI_DIRECT_PAY=0 disables the attempt outright, if it ever needs to be.
 *
 * The amount always comes from the price book, never from the request body.
 * A client that sends {"amount": 1} gets charged the real price.
 */

const COOLDOWN_MS = 60 * 60 * 1000;
let directPayBlockedUntil = 0;
let lastDirectPayError = "";

function directPayAllowed(): boolean {
  if (process.env.FAPSHI_DIRECT_PAY === "0") return false;
  return Date.now() >= directPayBlockedUntil;
}

/** Fapshi says "Forbidden request" when the service is not approved for it. */
function looksForbidden(message: string): boolean {
  return /forbidden|not allowed|activate|403/i.test(message);
}

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
    /** the scored assessment, so the admin view shows who this man is */
    quiz?: unknown;
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
  // Not politeness: Fapshi's own checkout asks for all three, and the email is
  // the only way a Mobile Money buyer ever receives his access code.
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

  // Write what he told us BEFORE creating the payment. A man who fills the
  // form and then abandons at the checkout page is the most valuable person on
  // the site, and he only exists in the data if we save first.
  void recordIntake({
    ref,
    name,
    contact: email || undefined,
    phone,
    plan,
    locale,
    provider: "fapshi",
    stage: "checkout_started",
    quiz: body.quiz,
  });

  /* ---------------------------------------------- 1. charge the handset */

  if (directPayAllowed()) {
    try {
      // `medium` is optional for Fapshi, but naming the network removes any
      // ambiguity about which rail the prompt should go down.
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
      // Worked — clear any parking from a previous failure.
      directPayBlockedUntil = 0;
      lastDirectPayError = "";
      return NextResponse.json({ status: "ok", transId, mode: "direct" });
    } catch (err) {
      const reason = err instanceof Error ? err.message : "unknown";
      lastDirectPayError = reason;
      if (looksForbidden(reason)) {
        directPayBlockedUntil = Date.now() + COOLDOWN_MS;
        console.warn("[momo] direct-pay not approved on this account, parking for 1h:", reason);
      } else {
        console.error("[momo] direct-pay failed:", reason);
      }
      // Fall through. Never show this to the buyer — he is about to be sent
      // somewhere that works.
    }
  }

  /* ------------------------------------------- 2. hosted checkout page */

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
    return NextResponse.json({
      status: "redirect",
      url: result.link,
      transId: result.transId,
      mode: "hosted",
      // Only useful to us, and it names why the in-house path was skipped.
      directPayNote: lastDirectPayError || undefined,
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown";
    console.error("[momo] initiate-pay failed", reason);
    // The provider's own wording is worth far more than "something went
    // wrong", to him and to us, and it exposes no credentials.
    return NextResponse.json({ status: "failed", reason }, { status: 502 });
  }
}
