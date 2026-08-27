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
    WHOP_API_KEY: shape(process.env.WHOP_API_KEY),
    WHOP_ACCOUNT_ID: process.env.WHOP_ACCOUNT_ID ?? "MISSING",
    WHOP_PRODUCT_ID: process.env.WHOP_PRODUCT_ID ?? "MISSING",
    WHOP_WEBHOOK_SECRET: shape(process.env.WHOP_WEBHOOK_SECRET),
    WHOP_CHECKOUT_ENDPOINT:
      process.env.WHOP_CHECKOUT_ENDPOINT ??
      "https://api.whop.com/api/v5/company/checkout_configurations (default)",
    WHOP_PRICE_IN_MINOR_UNITS: process.env.WHOP_PRICE_IN_MINOR_UNITS ?? "unset (sends dollars)",
    ENTITLEMENT_SECRET: shape(process.env.ENTITLEMENT_SECRET),
    RESEND_API_KEY: shape(process.env.RESEND_API_KEY),
    EMAIL_FROM: process.env.EMAIL_FROM ?? "MISSING",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "MISSING",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "MISSING",
    SUPABASE_SERVICE_ROLE_KEY: shape(process.env.SUPABASE_SERVICE_ROLE_KEY),
    METRON_DEV_UNLOCK: process.env.METRON_DEV_UNLOCK ?? "unset (correct for production)",
  };

  const warnings: string[] = [];
  if (fapshiBase.includes("sandbox")) {
    warnings.push(
      "FAPSHI_BASE_URL points at SANDBOX. Live payments will not work. Set https://live.fapshi.com and REDEPLOY.",
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

  // Whop: probe the endpoint we ACTUALLY use, not a guessed one. A 401 against
  // some unrelated path proves nothing — it may just mean that path is wrong.
  // Creating a checkout configuration moves no money; it is only a config.
  if (has(process.env.WHOP_API_KEY)) {
    const endpoint =
      process.env.WHOP_CHECKOUT_ENDPOINT ??
      "https://api.whop.com/api/v5/company/checkout_configurations";
    try {
      const r = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHOP_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: {
            company_id: process.env.WHOP_ACCOUNT_ID,
            product_id: process.env.WHOP_PRODUCT_ID,
            currency: "usd",
            plan_type: "one_time",
            initial_price: 1,
          },
          metadata: { probe: "health" },
        }),
        cache: "no-store",
      });
      const bodyText = (await r.text()).slice(0, 400);
      checks.whop =
        r.ok
          ? "OK — checkout configuration created"
          : `${r.status} at ${endpoint} :: ${bodyText}`;
      checks.whopMeaning =
        r.ok
          ? "the card rail should work"
          : r.status === 404
            ? "WRONG ENDPOINT. The path has moved. Get the correct one from Whop's docs and set WHOP_CHECKOUT_ENDPOINT — no redeploy of code needed, just the env var."
            : r.status === 401 || r.status === 403
              ? "KEY REJECTED. Create the key under the SAME company as WHOP_ACCOUNT_ID, and make sure it is a server/secret API key rather than a public or app key."
              : r.status === 422 || r.status === 400
                ? "Key accepted but the payload was refused — read the body above; usually product_id or currency."
                : "unexpected";
    } catch (e) {
      checks.whop = `unreachable: ${(e as Error).message}`;
    }
  } else {
    checks.whop = "SKIPPED — WHOP_API_KEY not set";
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
