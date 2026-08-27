import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify, cookieName } from "@/lib/entitlement";
import { unreadForUser } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * How many coach messages he has not opened.
 *
 * The ref comes from his signed cookie and never from the request, so a device
 * cannot read somebody else's count. No entitlement means zero rather than an
 * error: the bell is decoration for a man who is not logged in, and a 401 in
 * the console on every page load is noise.
 */
export async function GET() {
  const jar = await cookies();
  const ent = verify(jar.get(cookieName)?.value);
  if (!ent) return NextResponse.json({ unread: 0 });
  return NextResponse.json({ unread: await unreadForUser(ent.ref) });
}
