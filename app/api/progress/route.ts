import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify, cookieName } from "@/lib/entitlement";
import { saveProgress, db } from "@/lib/supabase/server";
import { verifySession, sessionCookie } from "@/lib/auth";

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
  const ses = verifySession(jar.get(sessionCookie)?.value);
  /* A paid entitlement or a signed-in account — either authorises the
     mirror. Free men with accounts have a baseline worth keeping. */
  const ref = ent?.ref ?? ses?.uid;
  if (!ref) return NextResponse.json({ ok: false }, { status: 401 });

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
    ref,
    plan: ent?.plan,
    day: Number.isFinite(day) ? Math.min(30, Math.max(0, Math.round(day))) : 0,
    startedAt: body.startedAt,
    measurements: body.measurements,
    sessions: body.sessions,
    markers: body.markers,
  });

  return NextResponse.json({ ok: true });
}

/** His mirrored history, for a device that has just logged in. */
export async function GET() {
  const jar = await cookies();
  const ses = verifySession(jar.get(sessionCookie)?.value);
  if (!ses) return NextResponse.json({ ok: false }, { status: 401 });
  const client = db();
  if (!client) return NextResponse.json({ ok: false }, { status: 503 });
  const { data } = await client.from("progress").select("plan, day, started_at, measurements, sessions, markers").eq("ref", ses.uid).maybeSingle();
  const { data: paid } = await client.from("payments").select("plan").eq("ref", ses.uid).eq("status", "paid").limit(5);
  const plans = (paid ?? []).map((p) => (p as { plan: string }).plan);
  const plan = plans.includes("sprint") ? "sprint" : plans.includes("test") ? "test" : data?.plan ?? null;
  return NextResponse.json({ ok: true, uid: ses.uid, plan, progress: data ?? null }, { headers: { "Cache-Control": "no-store" } });
}
