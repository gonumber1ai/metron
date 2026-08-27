import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify, cookieName } from "@/lib/entitlement";
import { postMessage, readThread, markReadByUser } from "@/lib/supabase/server";
import { sendAdminAlert } from "@/lib/email/send";

export const runtime = "nodejs";

/** His own thread. The ref comes from the cookie, never from the request. */
export async function GET() {
  const jar = await cookies();
  const ent = verify(jar.get(cookieName)?.value);
  if (!ent) return NextResponse.json({ messages: [] }, { status: 401 });
  const messages = await readThread(ent.ref);
  // He is looking at them now, so the badge has done its job. Awaited rather
  // than fired and forgotten: if it loses the race with his next page load the
  // badge comes back, and a count that will not clear reads as broken.
  await markReadByUser(ent.ref);
  return NextResponse.json({ messages });
}

export async function POST(req: Request) {
  const jar = await cookies();
  const ent = verify(jar.get(cookieName)?.value);
  if (!ent) return NextResponse.json({ ok: false }, { status: 401 });

  let body: { text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const text = (body.text ?? "").trim();
  if (!text) return NextResponse.json({ ok: false }, { status: 400 });

  await postMessage({ ref: ent.ref, sender: "user", body: text });

  // A paying customer asking a question is worth an interruption.
  void sendAdminAlert({
    subject: "Message from a customer",
    lines: [`code  ${ent.ref}`, `plan  ${ent.plan}`, "", text.slice(0, 1500)],
  });

  return NextResponse.json({ ok: true });
}
