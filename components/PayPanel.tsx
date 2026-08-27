"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { load, update } from "@/lib/store";
import type { Plan, Price } from "@/lib/payments";
import { OperatorMarks } from "./OperatorMarks";

// The embed is browser-only and pulls an iframe — never render it on the server.
const WhopCheckoutEmbed = dynamic(
  () => import("@whop/checkout/react").then((m) => m.WhopCheckoutEmbed),
  {
    ssr: false,
    loading: () => <div className="h-[520px] animate-pulse rounded-2xl bg-ink-800" />,
  },
);

/** 9 digits beginning with 6. Mirrors Fapshi's own SDK check. */
const PHONE_RE = /^6\d{8}$/;

function operatorOf(phone: string): "MTN" | "Orange" | null {
  if (!PHONE_RE.test(phone)) return null;
  const two = phone.slice(0, 2);
  const three = phone.slice(0, 3);
  if (two === "67" || two === "68" || ["650", "651", "652", "653", "654"].includes(three))
    return "MTN";
  if (two === "69" || ["655", "656", "657", "658", "659"].includes(three)) return "Orange";
  return null;
}

const T = {
  en: {
    momo: "Mobile Money",
    card: "Card",
    phoneLabel: "Your Mobile Money number",
    phoneHelp: "9 digits, starts with 6. MTN or Orange.",
    badPhone: "That is not a valid number. 9 digits, starting with 6.",
    pay: (a: string) => `Pay ${a}`,
    charging: "Sending the request…",
    awaitingH: "Check your phone now",
    awaitingP:
      "A prompt has been sent to your handset. Enter your Mobile Money PIN to approve. Keep this page open.",
    stillWaiting: "Still waiting for your PIN…",
    failedH: "Payment did not go through",
    failedP: "Nothing was charged. Check your balance and try again.",
    retry: "Try again",
    paidH: "Paid. You're in.",
    opening: "Opening your programme…",
    secure: "Your statement shows METRON. Nothing else.",
    unavailable: "Payment is not connected yet. Message us and we will open your access.",
    timeoutH: "We did not hear back",
    timeoutP:
      "The request was sent but no PIN came back, so nothing was charged. If you missed the prompt on your phone, just try again.",
  },
  fr: {
    momo: "Mobile Money",
    card: "Carte",
    phoneLabel: "Votre numéro Mobile Money",
    phoneHelp: "9 chiffres, commence par 6. MTN ou Orange.",
    badPhone: "Ce numéro n'est pas valide. 9 chiffres, commençant par 6.",
    pay: (a: string) => `Payer ${a}`,
    charging: "Envoi de la demande…",
    awaitingH: "Regardez votre téléphone",
    awaitingP:
      "Une demande a été envoyée sur votre combiné. Entrez votre code Mobile Money pour valider. Gardez cette page ouverte.",
    stillWaiting: "En attente de votre code…",
    failedH: "Le paiement n'est pas passé",
    failedP: "Rien n'a été débité. Vérifiez votre solde et réessayez.",
    retry: "Réessayer",
    paidH: "Payé. C'est bon.",
    opening: "Ouverture de votre programme…",
    secure: "Votre relevé affiche METRON. Rien d'autre.",
    unavailable:
      "Le paiement n'est pas encore branché. Écrivez-nous et on vous ouvre l'accès.",
    timeoutH: "Pas de réponse",
    timeoutP:
      "La demande est partie mais aucun code n'est revenu, donc rien n'a été débité. Si vous avez raté la demande sur votre téléphone, réessayez.",
  },
};

type MomoState = "idle" | "charging" | "awaiting" | "paid" | "failed" | "timeout" | "unavailable";

/**
 * Embedded checkout, both rails.
 *
 * Nobody leaves the site. On Mobile Money he types his number here, Fapshi
 * pushes a USSD prompt to his handset, and we poll until it settles. On cards
 * Whop's iframe renders inline.
 *
 * Entitlement is never granted here — the client only polls
 * /api/payments/verify, which checks with the provider and sets the signed
 * cookie. This component just draws the waiting.
 */
export function PayPanel({
  locale,
  plan,
  country,
  prices,
  onUnavailable,
}: {
  locale: string;
  plan: Plan;
  country: string;
  prices: Price[];
  /**
   * Reports whether the RAIL HE IS LOOKING AT can take money, so the caller can
   * offer lead capture. Scoped to the active tab on purpose: the card rail
   * being down must not put a "payment is not live" banner under a working
   * Mobile Money form.
   */
  onUnavailable?: (dead: boolean) => void;
}) {
  const t = T[locale === "fr" ? "fr" : "en"];
  const router = useRouter();

  const momoPrice = prices.find((p) => p.provider === "fapshi");
  const cardPrice = prices.find((p) => p.provider === "whop");
  const [tab, setTab] = useState<"momo" | "card">(momoPrice ? "momo" : "card");

  // Geo resolves a beat after first paint, so the first render often runs with
  // the default market and no MoMo rail. Once Cameroon appears, switch to it —
  // unless he has already picked a tab himself, in which case leave him alone.
  const touched = useRef(false);
  useEffect(() => {
    if (momoPrice && !touched.current) setTab("momo");
  }, [momoPrice]);

  // Held in a ref: the parent passes an inline arrow, so a fresh identity every
  // render would re-fire this and instantly cancel a genuine failure reported
  // moments earlier by the card panel.
  const report = useRef(onUnavailable);
  report.current = onUnavailable;

  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    // Only an actual tab change clears the previous rail's verdict.
    report.current?.(false);
  }, [tab]);

  return (
    <div>
      {momoPrice && cardPrice && (
        <div className="mb-4 flex gap-1 rounded-full border border-ink-600 bg-ink-800 p-1">
          {(["momo", "card"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => {
                touched.current = true;
                setTab(k);
              }}
              className={`flex-1 rounded-full px-4 py-2.5 text-[14px] font-bold transition-colors ${
                tab === k ? "btn-go" : "text-mute"
              }`}
            >
              {k === "momo" ? t.momo : t.card}
            </button>
          ))}
        </div>
      )}

      {tab === "momo" && momoPrice ? (
        <MomoPanel
          locale={locale}
          plan={plan}
          country={country}
          price={momoPrice}
          t={t}
          onPaid={() => router.push(`/${locale}/app`)}
          onUnavailable={onUnavailable}
        />
      ) : cardPrice ? (
        <CardPanel
          locale={locale}
          plan={plan}
          country={country}
          t={t}
          onUnavailable={onUnavailable}
        />
      ) : (
        <p className="rounded-2xl card p-5 text-[0.95rem] text-mute">{t.unavailable}</p>
      )}

      <p className="mt-4 text-center text-[0.85rem] text-faint">{t.secure}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ MoMo */

function MomoPanel({
  locale,
  plan,
  country,
  price,
  t,
  onPaid,
  onUnavailable,
}: {
  locale: string;
  plan: Plan;
  country: string;
  price: Price;
  t: (typeof T)["en"];
  onPaid: () => void;
  onUnavailable?: (dead: boolean) => void;
}) {
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<MomoState>("idle");
  const [err, setErr] = useState<string | null>(null);
  const tries = useRef(0);
  const stop = useRef(false);

  useEffect(() => () => { stop.current = true; }, []);

  const digits = phone.replace(/\D/g, "").slice(0, 9);
  const valid = PHONE_RE.test(digits);
  const op = operatorOf(digits);

  async function pay() {
    setErr(null);
    if (!valid) {
      setErr(t.badPhone);
      return;
    }
    setState("charging");
    const ref = load(locale).ref;

    try {
      const res = await fetch("/api/payments/momo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, country, ref, phone: digits }),
      });
      const data = (await res.json()) as { status?: string; transId?: string; reason?: string };

      if (data.status === "unavailable") {
        onUnavailable?.(true);
        return setState("unavailable");
      }
      if (data.status === "bad_phone") {
        setErr(t.badPhone);
        return setState("idle");
      }
      if (data.status !== "ok" || !data.transId) {
        if (data.reason) setErr(data.reason);
        return setState("failed");
      }

      setState("awaiting");
      tries.current = 0;
      poll(data.transId, ref);
    } catch {
      setState("failed");
    }
  }

  // MoMo prompts sit on the handset until he types a PIN, so this waits a
  // genuinely long time — up to about two minutes — before calling it dead.
  async function poll(transId: string, ref: string) {
    if (stop.current) return;
    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transId, ref }),
      });
      const data = (await res.json()) as { paid?: boolean; status?: string; plan?: Plan };

      if (stop.current) return;

      if (data.paid) {
        update((s) => ({
          ...s,
          plan: data.plan ?? plan,
          locale,
          startedAt: s.startedAt ?? new Date().toISOString(),
        }), locale);
        setState("paid");
        window.setTimeout(onPaid, 900);
        return;
      }

      if (data.status === "FAILED" || data.status === "EXPIRED") return setState("failed");

      if (tries.current < 40) {
        tries.current += 1;
        window.setTimeout(() => poll(transId, ref), 3000);
      } else {
        // Two minutes with no approval is almost always an ignored prompt, not
        // a refused payment. Saying "nothing was charged, try again" to a man
        // who simply took too long sends him away thinking it is broken.
        setErr(null);
        setState("timeout");
      }
    } catch {
      if (!stop.current) setState("failed");
    }
  }

  if (state === "awaiting" || state === "charging") {
    return (
      <div className="rounded-2xl border border-jade bg-jade-050 p-6 text-center">
        <span
          aria-hidden
          className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-ink-500 border-t-jade"
        />
        <h3 className="mt-4 text-[1.15rem] font-bold">
          {state === "charging" ? t.charging : t.awaitingH}
        </h3>
        {state === "awaiting" && (
          <>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-mute">{t.awaitingP}</p>
            {tries.current > 8 && (
              <p className="mt-3 text-[0.85rem] text-faint">{t.stillWaiting}</p>
            )}
          </>
        )}
      </div>
    );
  }

  if (state === "paid") {
    return (
      <div className="rounded-2xl border border-jade bg-jade-050 p-6 text-center">
        <h3 className="text-[1.2rem] font-bold text-jade">{t.paidH}</h3>
        <p className="mt-2 text-[0.95rem] text-mute">{t.opening}</p>
      </div>
    );
  }

  if (state === "timeout") {
    return (
      <div className="rounded-2xl border border-amber/50 bg-amber-050 p-6 text-center">
        <h3 className="text-[1.1rem] font-bold">{t.timeoutH}</h3>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-mute">{t.timeoutP}</p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="mt-4 w-full rounded-2xl btn-go py-4 text-[1rem] font-bold"
        >
          {t.retry}
        </button>
      </div>
    );
  }

  if (state === "failed" || state === "unavailable") {
    return (
      <div className="rounded-2xl border border-amber/50 bg-amber-050 p-6 text-center">
        <h3 className="text-[1.1rem] font-bold">
          {state === "unavailable" ? "—" : t.failedH}
        </h3>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-mute">
          {state === "unavailable" ? t.unavailable : t.failedP}
        </p>
        {state === "failed" && err && (
          <p className="mt-2 text-[0.85rem] leading-snug text-faint">{err}</p>
        )}
        {state === "failed" && (
          <button
            type="button"
            onClick={() => setState("idle")}
            className="mt-4 w-full rounded-2xl btn-go py-4 text-[1rem] font-bold"
          >
            {t.retry}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl card p-5">
      <label className="block">
        <span className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[0.9rem] font-semibold text-bone">{t.phoneLabel}</span>
          <OperatorMarks detected={op} />
        </span>
        <div className="relative mt-2.5">
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            value={digits}
            onChange={(e) => {
              setPhone(e.target.value);
              setErr(null);
            }}
            placeholder="6XXXXXXXX"
            aria-invalid={Boolean(err)}
            className="metric w-full rounded-xl border-2 border-ink-600 bg-ink-900 px-4 py-4 text-[1.5rem] font-bold tracking-wide text-bone placeholder:text-faint focus:border-jade focus:outline-none"
          />
        </div>
      </label>

      <p className={`mt-2 text-[0.85rem] ${err ? "text-alert" : "text-faint"}`}>
        {err ?? t.phoneHelp}
      </p>

      <button
        type="button"
        onClick={pay}
        disabled={!valid}
        className="mt-4 w-full rounded-2xl btn-go py-5 text-[1.05rem] font-bold disabled:opacity-40"
      >
        {t.pay(price.display)}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ Card */

function CardPanel({
  locale,
  plan,
  country,
  t,
  onUnavailable,
}: {
  locale: string;
  plan: Plan;
  country: string;
  t: (typeof T)["en"];
  onUnavailable?: (dead: boolean) => void;
}) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [dead, setDead] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ref = load(locale).ref;
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Say which rail. Without this the server infers it from the
          // country and a Cameroonian tapping "Card" lands on Mobile Money.
          body: JSON.stringify({ plan, country, ref, locale, provider: "whop" }),
        });
        const data = (await res.json()) as { status?: string; sessionId?: string; url?: string };
        if (cancelled) return;
        if (data.status === "ok" && data.sessionId) setSessionId(data.sessionId);
        // No session id means the dynamic call fell back to a hosted link —
        // that cannot be embedded, so send him there rather than show nothing.
        else if (data.status === "ok" && data.url) window.location.href = data.url;
        else {
          onUnavailable?.(true);
          setDead(true);
        }
      } catch {
        if (!cancelled) {
          onUnavailable?.(true);
          setDead(true);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [plan, country, locale, onUnavailable]);

  if (dead) {
    return <p className="rounded-2xl card p-5 text-[0.95rem] text-mute">{t.unavailable}</p>;
  }
  if (!sessionId) {
    return <div className="h-[520px] animate-pulse rounded-2xl bg-ink-800" />;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-600">
      <WhopCheckoutEmbed
        sessionId={sessionId}
        theme="dark"
        themeOptions={{ accentColor: "jade" }}
        onComplete={() => {
          // Whop's callback is a hint, not proof. Send him to the return page,
          // which asks our server, which asks Whop.
          router.push(`/${locale}/checkout/done?via=whop`);
        }}
      />
    </div>
  );
}
