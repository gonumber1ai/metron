import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify, cookieName } from "@/lib/entitlement";
import { saveProgress } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Mirror the app's local state.
 *
 * Only a paying customer may write, and only against the ref inside HIS OWN
 * signed entitlement cookie — the body's ref is ignored entirely. Otherwise
 * anyone could post a perfect set of measurements against somebody else's code
 * and, once results are published, against the numbers we quote.
 */
export async function POST(req: Request) {
  const jar = await cookies();
  const ent = verify(jar.get(cookieName)?.value);
  if (!ent) return NextResponse.json({ ok: false }, { status: 401 });

  let body: {
    day?: number;
    startedAt?: string;
    measurements?: unknown;
    sessions?: unknown;
    markers?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const day = Number(body.day);
  await saveProgress({
    ref: ent.ref,
    plan: ent.plan,
    day: Number.isFinite(day) ? Math.min(30, Math.max(0, Math.round(day))) : 0,
    startedAt: body.startedAt,
    measurements: body.measurements,
    sessions: body.sessions,
    markers: body.markers,
  });

  return NextResponse.json({ ok: true });
}
