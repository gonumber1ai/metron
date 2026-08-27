import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdmin, adminCookie } from "@/lib/admin";
import { db, postMessage, readThread } from "@/lib/supabase/server";
import { sendCoachReply } from "@/lib/email/send";

export const runtime = "nodejs";

/** Read one customer's thread, and mark his messages as seen. */
export async function GET(req: Request) {
  const jar = await cookies();
  if (!verifyAdmin(jar.get(adminCookie)?.value)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const ref = new URL(req.url).searchParams.get("ref") ?? "";
  if (!ref) return NextResponse.json({ messages: [] });

  const client = db();
  if (client) {
    await client
      .from("threads")
      .update({ read_by_admin: true })
      .eq("ref", ref)
      .eq("sender", "user");
  }

  return NextResponse.json({ messages: await readThread(ref) });
}

/** Reply as the coach, and email him so he actually sees it. */
export async function POST(req: Request) {
  const jar = await cookies();
  if (!verifyAdmin(jar.get(adminCookie)?.value)) {
    return new NextResponse("Not found", { status: 404 });
  }

  let body: { ref?: string; text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const ref = (body.ref ?? "").replace(/[^a-zA-Z0-9]/g, "");
  const text = (body.text ?? "").trim();
  if (!ref || !text) return NextResponse.json({ ok: false }, { status: 400 });

  await postMessage({ ref, sender: "coach", body: text });

  // He will not sit refreshing the app. Nudge him — with a subject that says
  // nothing, as every subject on this product must.
  const client = db();
  if (client) {
    const { data } = await client
      .from("leads")
      .select("contact, locale")
      .eq("ref", ref)
      .maybeSingle();
    const to = (data?.contact as string) ?? "";
    if (to.includes("@")) {
      void sendCoachReply({ to, locale: data?.locale === "fr" ? "fr" : "en" });
    }
  }

  return NextResponse.json({ ok: true });
}
