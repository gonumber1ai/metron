import { NextResponse } from "next/server";
import { recordIntake } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Save a completed assessment.
 *
 * Fired the moment he finishes the last question, before he has seen a price
 * and long before he decides anything. Every completed quiz is worth keeping:
 * the men who answer nine questions about this and then do not buy are the
 * clearest signal you have about what the offer is failing to do.
 *
 * stage stays "lead" — recordIntake only overwrites the fields it is given, so
 * this cannot downgrade somebody who has already paid.
 */
export async function POST(req: Request) {
  let body: { ref?: string; locale?: string; quiz?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const ref = (body.ref ?? "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 64);
  if (!ref || !body.quiz) return NextResponse.json({ ok: true });

  await recordIntake({
    ref,
    locale: body.locale === "fr" ? "fr" : "en",
    stage: "lead",
    quiz: body.quiz,
  });

  return NextResponse.json({ ok: true });
}
