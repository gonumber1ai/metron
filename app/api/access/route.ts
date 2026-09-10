import { NextResponse } from "next/server";
import { findPaidByRef, recordIntake } from "@/lib/supabase/server";
import { sendPurchaseConfirmation, looksLikeEmail } from "@/lib/email/send";

export const runtime = "nodejs";

/**
 * Send a man his access code, after he has paid.
 *
 * The checkout used to demand an email before it would let him pay, and the
 * confirmation was sent from whatever he typed there. Nothing about taking
 * Mobile Money requires it, so it is asked for here instead — once the money
 * has moved and he wants the code rather than us wanting his address.
 *
 * ── WHY THIS CANNOT BE USED TO HARVEST CODES ──────────────────────────────
 * The ref must already be a PAID row. An unpaid or invented ref gets nothing
 * sent and the same reply either way, so the endpoint cannot be used to probe
 * which refs exist. Refs are eighteen random characters, so guessing a paid
 * one is not a practical attack — but a caller who somehow knew a real ref
 * could still redirect that man's code to themselves, which is why this only
 * ever sends the code and never returns it in the response.
 */
export async function POST(req: Request) {
  let body: { ref?: string; contact?: string; locale?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const ref = (body.ref ?? "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 64);
  const contact = (body.contact ?? "").trim().slice(0, 120);
  const locale = body.locale === "fr" ? "fr" : "en";

  if (!ref || contact.length < 4) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const paid = await findPaidByRef(ref);
  if (!paid) {
    // Deliberately the same shape as success. Whether a ref is paid is not
    // something an unauthenticated caller gets to learn.
    return NextResponse.json({ ok: true });
  }

  // Save it either way. A WhatsApp number cannot be emailed, but it is how the
  // admin reaches him, and losing it because it is not an address would leave
  // a paying customer with no way of being contacted at all.
  void recordIntake({ ref, contact, plan: paid.plan, locale, stage: "paid" });

  if (looksLikeEmail(contact)) {
    void sendPurchaseConfirmation({ to: contact, locale, accessCode: ref });
  }

  return NextResponse.json({ ok: true });
}
