import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Payment configuration health check.
 *
 * Reports whether each variable is PRESENT and, where it is safe, its shape —
 * never a value. Secrets are reduced to a boolean and a length, so this can be
 * hit from a phone on a live deployment without leaking anything useful.
 *
 * It also pings each provider with real credentials, because "the variable is
 * set" and "the credentials work" are different problems with the same
 * symptom, and guessing between them wastes a day.
 *
 * Protect it once you are past launch: set HEALTH_TOKEN and call it with
 * ?t=<token>. Until then it is open, which is the right trade while payments
 * are down and you need an answer now.
 */
export async function GET(req: Request) {
  const gate = process.env.HEALTH_TOKEN;
  if (gate) {
    const t = new URL(req.url).searchParams.get("t");
    if (t !== gate) return new NextResponse("Not found", { status: 404 });
  }

  const has = (v?: string) => Boolean(v && v.trim().length > 0);
  const shape = (v?: string) => (has(v) ? `set (${v!.trim().length} chars)` : "MISSING");

  const fapshiBase = process.env.FAPSHI_BASE_URL ?? "https://live.fapshi.com";

  const env = {
    FAPSHI_API_USER: shape(process.env.FAPSHI_API_USER),
    FAPSHI_API_KEY: shape(process.env.FAPSHI_API_KEY),
    FAPSHI_BASE_URL: fapshiBase,
    FAPSHI_WEBHOOK_SECRET: shape(process.env.FAPSHI_WEBHOOK_SECRET),
    FAPSHI_DIRECT_PAY:
      process.env.FAPSHI_DIRECT_PAY === "0"
        ? "disabled by env"
        : "attempted first on every charge, with automatic fallback to the hosted page",
    WHOP_API_KEY: shape(process.env.WHOP_API_KEY),
    WHOP_ACCOUNT_ID: process.env.WHOP_ACCOUNT_ID ?? "MISSING",
    WHOP_PRODUCT_ID: process.env.WHOP_PRODUCT_ID ?? "MISSING",
    WHOP_WEBHOOK_SECRET: shape(process.env.WHOP_WEBHOOK_SECRET),
    WHOP_PRICE_IN_MINOR_UNITS: process.env.WHOP_PRICE_IN_MINOR_UNITS ?? "unset (sends dollars)",
    ENTITLEMENT_SECRET: shape(process.env.ENTITLEMENT_SECRET),
    RESEND_API_KEY: shape(process.env.RESEND_API_KEY),
    EMAIL_FROM: process.env.EMAIL_FROM ?? "MISSING",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "MISSING",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "MISSING",
    SUPABASE_SERVICE_ROLE_KEY: shape(process.env.SUPABASE_SERVICE_ROLE_KEY),
    METRON_DEV_UNLOCK: process.env.METRON_DEV_UNLOCK ?? "unset (correct for production)",
    NEXT_PUBLIC_PRICE_OVERRIDE_XAF:
      process.env.NEXT_PUBLIC_PRICE_OVERRIDE_XAF ?? "unset (charging the real price)",
  };

  const warnings: string[] = [];
  if (fapshiBase.includes("sandbox")) {
    warnings.push(
      "FAPSHI_BASE_URL points at SANDBOX. Live payments will not work. Set https://live.fapshi.com and REDEPLOY.",
    );
  }
  if (process.env.NEXT_PUBLIC_PRICE_OVERRIDE_XAF) {
    warnings.push(
      `PRICE OVERRIDE IS LIVE — every Mobile Money buyer is being charged ${process.env.NEXT_PUBLIC_PRICE_OVERRIDE_XAF} FCFA instead of the real price. Remove NEXT_PUBLIC_PRICE_OVERRIDE_XAF when you finish testing.`,
    );
  }
  if (process.env.METRON_DEV_UNLOCK === "1") {
    warnings.push("METRON_DEV_UNLOCK is on — the paid programme is open to everyone. Remove it.");
  }
  if (!has(process.env.SUPABASE_SERVICE_ROLE_KEY)) {
    warnings.push(
      "Supabase not connected. Payments still work, but a man whose browser dies before the redirect has no record and cannot get in without messaging you.",
    );
  }
  if (!has(process.env.ENTITLEMENT_SECRET)) {
    warnings.push("ENTITLEMENT_SECRET missing — nobody can be granted access even after paying.");
  }
  if ((process.env.ENTITLEMENT_SECRET ?? "").length < 32) {
    if (has(process.env.ENTITLEMENT_SECRET)) {
      warnings.push("ENTITLEMENT_SECRET is under 32 chars — it will be rejected at runtime.");
    }
  }

  /* ---------------------------------------------- live credential pings */

  const checks: Record<string, string> = {};

  // Fapshi: /balance is the cheapest authenticated call and it does NOT move
  // money, so it is safe to hit from a health check.
  if (has(process.env.FAPSHI_API_USER) && has(process.env.FAPSHI_API_KEY)) {
    try {
      const r = await fetch(`${fapshiBase}/balance`, {
        headers: {
          apiuser: process.env.FAPSHI_API_USER!,
          apikey: process.env.FAPSHI_API_KEY!,
        },
        cache: "no-store",
      });
      checks.fapshi =
        r.status === 200
          ? "OK — credentials accepted"
          : r.status === 401 || r.status === 403
            ? `REJECTED (${r.status}) — wrong credentials for this environment, or this server's IP is not whitelisted. Fapshi requires IP whitelisting for initiate-pay, direct-pay and payout.`
            : `unexpected ${r.status}`;
    } catch (e) {
      checks.fapshi = `unreachable: ${(e as Error).message}`;
    }
  } else {
    checks.fapshi = "SKIPPED — credentials not set";
  }

  // Whop: exercise the SAME SDK call production uses. Creating a checkout
  // configuration moves no money — it is only a config.
  if (has(process.env.WHOP_API_KEY) && has(process.env.WHOP_PRODUCT_ID)) {
    try {
      const { Whop, APIError } = await import("@whop/sdk");
      const whop = new Whop({ apiKey: process.env.WHOP_API_KEY! });
      const cfg = await whop.checkoutConfigurations.create({
        ...(process.env.WHOP_ACCOUNT_ID ? { account_id: process.env.WHOP_ACCOUNT_ID } : {}),
        plan: {
          product_id: process.env.WHOP_PRODUCT_ID!,
          initial_price: 1,
          plan_type: "one_time",
          currency: "usd",
        },
        metadata: { probe: "health" },
      });
      checks.whop = cfg?.id ? `OK — created ${cfg.id}` : "created, but no id returned";
      checks.whopMeaning = cfg?.id ? "the card rail should work" : "unexpected response shape";
    } catch (e) {
      const status = (e as { status?: number })?.status;
      checks.whop = `FAILED ${status ?? ""} :: ${(e as Error).message}`.slice(0, 400);
      checks.whopMeaning =
        status === 401 || status === 403
          ? "KEY REJECTED. It must be a server API key on the SAME company as WHOP_ACCOUNT_ID, with scopes: checkout_configuration:create, plan:create, access_pass:create, access_pass:update, checkout_configuration:basic:read."
          : status === 404
            ? "Product not found on this account — check WHOP_PRODUCT_ID belongs to WHOP_ACCOUNT_ID."
            : status === 422 || status === 400
              ? "Key accepted, payload refused — usually product_id or currency."
              : "unexpected";
    }
  } else {
    checks.whop = "SKIPPED — WHOP_API_KEY or WHOP_PRODUCT_ID not set";
  }

  // Supabase: a real round trip. The key length alone proves nothing — the
  // legacy service key is a 200+ char JWT while the newer sb_secret_ format is
  // about 40, so a short value is either correct or completely wrong and only
  // a query can tell the two apart.
  if (has(process.env.NEXT_PUBLIC_SUPABASE_URL) && has(process.env.SUPABASE_SERVICE_ROLE_KEY)) {
    try {
      const { db } = await import("@/lib/supabase/server");
      const client = db();
      if (!client) {
        checks.supabase = "client not created";
      } else {
        const { error } = await client.from("payments").select("id").limit(1);
        if (error) {
          checks.supabase = `FAILED :: ${error.message}`.slice(0, 300);
          checks.supabaseMeaning = /relation .* does not exist|schema cache/i.test(error.message)
            ? "Connected, but the tables are missing. Run supabase/schema.sql in the SQL editor."
            : /JWT|apikey|Invalid|denied|permission/i.test(error.message)
              ? "Key rejected. Use the SERVICE ROLE key from Project Settings -> API, not the anon or publishable key."
              : "unexpected — read the message above";
        } else {
          checks.supabase = "OK — connected and the payments table is readable";
        }
      }
    } catch (e) {
      checks.supabase = `threw :: ${(e as Error).message}`.slice(0, 300);
    }
  } else {
    checks.supabase = "SKIPPED — url or service role key not set";
  }

  // ?probe=directpay answers the only question that matters about the
  // in-house form: will Fapshi let this account push a USSD prompt? Uses a
  // deliberately invalid number so nothing can ever be charged — an approved
  // account rejects it on validation, an unapproved one rejects it on
  // permission, and the two messages are completely different.
  if (
    new URL(req.url).searchParams.get("probe") === "directpay" &&
    checks.fapshi?.startsWith("OK")
  ) {
    try {
      const r = await fetch(`${fapshiBase}/direct-pay`, {
        method: "POST",
        headers: {
          apiuser: process.env.FAPSHI_API_USER!,
          apikey: process.env.FAPSHI_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: 100, phone: "600000000" }),
        cache: "no-store",
      });
      const t = (await r.text()).slice(0, 300);
      const forbidden = /forbidden|activate/i.test(t) || r.status === 403;
      checks.fapshiDirectPay = `${r.status} :: ${t}`;
      checks.fapshiDirectPayMeaning = forbidden
        ? "NOT APPROVED. The in-house form will fall back to the hosted page. Send the application in content/fapshi-direct-pay-application.md."
        : "APPROVED — this account can push USSD prompts, so the in-house form will work. (A validation complaint about the number is the expected reply here.)";
    } catch (e) {
      checks.fapshiDirectPay = `unreachable: ${(e as Error).message}`;
    }
  }

  // A passing /balance does NOT prove charging works: Fapshi applies IP
  // whitelisting only to transaction creation. Say so, so a green tick here is
  // not mistaken for a working rail.
  if (checks.fapshi?.startsWith("OK")) {
    checks.fapshiCaveat =
      "Credentials work. This does NOT prove charging works — Fapshi applies IP whitelisting to initiate-pay, direct-pay and payout only. Add ?probe=fapshi to create a real 100 XAF payment link and test that path. It charges nobody.";
  }

  // Opt-in deeper probe: creates a payment link at the 100 XAF minimum. No
  // money moves unless somebody actually pays it, and nobody will.
  if (new URL(req.url).searchParams.get("probe") === "fapshi" && checks.fapshi?.startsWith("OK")) {
    try {
      const r = await fetch(`${fapshiBase}/initiate-pay`, {
        method: "POST",
        headers: {
          apiuser: process.env.FAPSHI_API_USER!,
          apikey: process.env.FAPSHI_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: 100, externalId: "healthprobe", message: "Metron" }),
        cache: "no-store",
      });
      const t = (await r.text()).slice(0, 300);
      checks.fapshiCharge = r.ok
        ? "OK — transaction creation works, so the IP is whitelisted"
        : `${r.status} :: ${t} — if this is a 403 the server IP is not whitelisted`;
    } catch (e) {
      checks.fapshiCharge = `unreachable: ${(e as Error).message}`;
    }
  }

  return NextResponse.json(
    {
      ok: warnings.length === 0,
      warnings,
      checks,
      env,
      note: "Values are never returned — only whether each is set and how long it is.",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
