import { NextResponse } from "next/server";
import { getOrStartOffer, getOffer } from "@/lib/offers";
import { isFunnelId, lastChanceUrl, TIERS } from "@/lib/funnels";

export const runtime = "nodejs";

/**
 * The visitor's offer clock.
 *
 * POST {ref, funnel}  — get it, creating it on first sight. The funnel page
 *                       calls this on mount; the countdown shows what comes
 *                       back and nothing else.
 * GET  ?ref=          — read only. The checkout calls this to learn whether
 *                       to show the full price.
 *
 * Returns the deadlines, the state, and — when he is inside the recovery
 * window and unpaid — the last-chance link and price for HIS funnel. Never a
 * generic one.
 */

function out(o: Awaited<ReturnType<typeof getOrStartOffer>>) {
  if (!o) return NextResponse.json({ ok: false }, { headers: { "Cache-Control": "no-store" } });
  const t = TIERS[o.funnel.tier];
  return NextResponse.json(
    {
      ok: true,
      funnel: o.funnel.id,
      status: o.status,
      expiresAt: o.expiresAt,
      recoveryUntil: o.recoveryUntil,
      expired: o.expired,
      created: o.created,
      offer: t.offer,
      full: t.full,
      lastChance: o.lastChance ? { url: lastChanceUrl(o.funnel), price: t.offer, until: o.recoveryUntil } : null,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(req: Request) {
  let body: { ref?: string; funnel?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const ref = (body.ref ?? "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 64);
  if (!ref || !isFunnelId(body.funnel)) return NextResponse.json({ ok: false }, { status: 400 });
  return out(await getOrStartOffer(ref, body.funnel));
}

export async function GET(req: Request) {
  const ref = (new URL(req.url).searchParams.get("ref") ?? "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 64);
  if (!ref) return NextResponse.json({ ok: false }, { status: 400 });
  return out(await getOffer(ref));
}
