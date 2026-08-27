import { NextResponse } from "next/server";
import { findRefByContact } from "@/lib/supabase/server";
import { sendAccessCode, looksLikeEmail } from "@/lib/email/send";

export const runtime = "nodejs";

/**
 * "I have lost my code."
 *
 * He gives the email he paid with and we send the code to that address.
 *
 * The response is ALWAYS the same whether or not the address is known. This
 * endpoint must never become a way to ask "is this man a customer?" — on this
 * product that question is the whole thing he was promised nobody could ask.
 */
export async function POST(req: Request) {
  let body: { email?: string; locale?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const email = (body.email ?? "").trim().slice(0, 120);
  const locale = body.locale === "fr" ? "fr" : "en";

  if (looksLikeEmail(email)) {
    const ref = await findRefByContact(email);
    if (ref) void sendAccessCode({ to: email, locale, code: ref });
  }

  // Deliberately identical either way.
  return NextResponse.json({ ok: true });
}
