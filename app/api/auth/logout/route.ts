import { NextResponse } from "next/server";
import { cookieName } from "@/lib/entitlement";

export const runtime = "nodejs";

/**
 * Log out.
 *
 * The entitlement cookie lasts a year and is never expired on its own — a man
 * who paid should not be asked to prove it again every few weeks, and a
 * surprise logout on this product reads as having lost access to something he
 * bought. So it ends only here, when he asks.
 */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookieName, "", { path: "/", maxAge: 0 });
  return res;
}
