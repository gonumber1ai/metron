import { NextResponse } from "next/server";
import {
  transactionsByUser,
  paymentStatus,
  isPaid,
  isConfigured,
} from "@/lib/payments/fapshi";
import * as whop from "@/lib/payments/whop";
import { planFromAmount } from "@/lib/payments/whop";
import { issue, cookieName, cookieOptions } from "@/lib/entitlement";

export const runtime = "nodejs";

/**
 * Log back in, with no database.
 *
 * Entitlement lives in a signed cookie, so clearing site data or changing
 * phone locks a paying customer out of something he owns. This is the way back
 * in, and it works because the payment providers are already the record of who
 * paid — we never needed our own.
 *
 * He gives his access code. We try, in order:
 *   1. Fapshi transactions for that userId  (the code IS his ref)
 *   2. Fapshi payment-status for that transId  (he pasted the reference)
 *   3. Whop membership of that id  (card buyer)
 *
 * Any one of them coming back paid re-mints the cookie. Nothing else does.
 */
export async function POST(req: Request) {
  let body: { code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const code = (body.code ?? "").trim().replace(/[^a-zA-Z0-9_-]/g, "");
  if (code.length < 6) return NextResponse.json({ ok: false, reason: "short" }, { status: 400 });

  // ---- 1 & 2: Mobile Money -------------------------------------------
  if (isConfigured()) {
    try {
      const rows = await transactionsByUser(code);
      const paid = rows.find((r) => r.status === "SUCCESSFUL");
      if (paid) {
        return grant(code, planFromAmount(paid.amount ?? 0, "XAF"), paid.transId);
      }
    } catch (err) {
      console.error("[recover] fapshi user lookup failed", err);
    }

    // Maybe he pasted the transaction reference instead of his access code.
    try {
      const tx = await paymentStatus(code);
      if (isPaid(tx)) {
        return grant(
          tx!.externalId || code,
          planFromAmount(tx!.amount ?? 0, "XAF"),
          tx!.transId,
        );
      }
    } catch {
      /* not a transId — fall through */
    }
  }

  // ---- 3: card ---------------------------------------------------------
  try {
    const m = await whop.membership(code);
    if (whop.isValid(m)) {
      const ref = typeof m?.metadata?.ref === "string" ? m.metadata.ref : code;
      return grant(ref, whop.planFromMembership(m), code);
    }
  } catch {
    /* not a membership id */
  }

  // Deliberately vague: this endpoint must not become a way to discover which
  // codes are real.
  return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });
}

function grant(ref: string, plan: "test" | "sprint", txId: string) {
  const res = NextResponse.json({ ok: true, plan });
  res.cookies.set(
    cookieName,
    issue({ ref, plan, txId, iat: Math.floor(Date.now() / 1000) }),
    cookieOptions,
  );
  return res;
}
