"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { load, update } from "@/lib/store";
import { Logo } from "@/components/Logo";

type State = "checking" | "paid" | "pending" | "failed" | "unavailable";

/**
 * Return page from the payment provider.
 *
 * The previous version unlocked the app from the URL alone, which meant a
 * shared link granted the programme for free. Now the URL is only a hint: we
 * hand the transId to our own server, which asks Fapshi directly and mints the
 * signed entitlement cookie only if Fapshi says SUCCESSFUL.
 *
 * MoMo settles in seconds but not instantly, so PENDING is normal for a moment
 * and we poll a few times before giving up.
 */
export function DoneClient({ locale }: { locale: string }) {
  const t = getDict(locale);
  const search = useSearchParams();
  const fr = locale === "fr";
  const [state, setState] = useState<State>("checking");
  const tries = useRef(0);

  const transId = search.get("transId") ?? search.get("transactionId") ?? "";
  const refFromUrl = search.get("ref") ?? "";
  const via = search.get("via") ?? "";
  // Whop labels this differently across versions — take whichever turns up.
  const membershipId =
    search.get("membership_id") ??
    search.get("membershipId") ??
    search.get("session_id") ??
    search.get("id") ??
    "";

  useEffect(() => {
    let cancelled = false;
    const ref = refFromUrl || load(locale).ref;

    async function check() {
      if (cancelled) return;
      if (!ref || (via !== "whop" && !transId)) {
        setState("failed");
        return;
      }
      try {
        const res = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transId, ref, via, membershipId }),
        });
        const data = (await res.json()) as {
          status?: string;
          paid?: boolean;
          plan?: "test" | "sprint";
        };

        if (cancelled) return;

        if (data.paid) {
          update((s) => ({
            ...s,
            plan: data.plan ?? "test",
            locale,
            startedAt: s.startedAt ?? new Date().toISOString(),
          }), locale);
          setState("paid");
          return;
        }

        if (data.status === "unavailable") {
          setState("unavailable");
          return;
        }

        // Still settling. MoMo takes seconds; on the card rail the webhook may
        // land before the redirect resolves, so both get a few goes.
        if ((data.status === "PENDING" || data.status === "CREATED") && tries.current < 6) {
          tries.current += 1;
          window.setTimeout(check, 2500);
          setState("pending");
          return;
        }

        setState(data.status === "PENDING" || data.status === "CREATED" ? "pending" : "failed");
      } catch {
        if (!cancelled) setState("failed");
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [transId, refFromUrl, locale, via, membershipId]);

  const copy = {
    checking: {
      h: fr ? "Vérification du paiement…" : "Checking your payment…",
      p: fr ? "Quelques secondes." : "This takes a few seconds.",
    },
    pending: {
      h: fr ? "Paiement en cours" : "Payment still processing",
      p: fr
        ? "Le Mobile Money met parfois une minute. Gardez cette page ouverte."
        : "Mobile Money sometimes takes a minute. Keep this page open.",
    },
    paid: {
      h: fr ? "C'est bon. Vous êtes inscrit." : "Done. You're in.",
      p: fr
        ? "Commencez par le Jour 0 — c'est une journée de préparation, sans entraînement."
        : "Start with Day 0 — it's a preparation day, no training.",
    },
    failed: {
      h: fr ? "Paiement non confirmé" : "Payment not confirmed",
      p: fr
        ? "Rien ne vous a été débité, ou le paiement n'est pas passé. Réessayez, ou écrivez-nous si votre argent est parti."
        : "Either nothing was charged, or the payment did not go through. Try again — and write to us if money did leave your account.",
    },
    unavailable: {
      h: fr ? "Paiement indisponible" : "Payment unavailable",
      p: fr
        ? "Le paiement n'est pas encore branché. Écrivez-nous et on vous ouvre l'accès."
        : "Payment is not connected yet. Write to us and we will open your access.",
    },
  }[state];

  const good = state === "paid";

  return (
    <>
      <style>{`body{background:var(--color-ink-900);color:var(--color-bone)}`}</style>

      <main className="grid min-h-screen place-items-center bg-ink-900 px-5">
        <div className="w-full max-w-md text-center">
          <span className="mb-8 inline-flex"><Logo size="sm" /></span>
          <div
            className={`mx-auto grid h-14 w-14 place-items-center rounded-full ${
              good ? "bg-jade-050" : "bg-ink-800"
            }`}
          >
            {state === "checking" || state === "pending" ? (
              <span
                aria-hidden
                className="h-6 w-6 animate-spin rounded-full border-2 border-ink-500 border-t-jade"
              />
            ) : (
              <svg
                viewBox="0 0 24 24"
                className={`h-7 w-7 ${good ? "text-jade" : "text-amber"}`}
                fill="none"
                aria-hidden
              >
                <path
                  d={good ? "M5 12.5 10 17.5 19 7" : "M12 8v5m0 3.5h.01M12 3l9 16H3l9-16Z"}
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>

          <h1 className="mt-6 text-[1.6rem] font-bold leading-tight tracking-tight">{copy.h}</h1>
          <p className="mt-3 text-[0.98rem] leading-relaxed text-mute">{copy.p}</p>

          {good ? (
            <Link
              href={`/${locale}/app`}
              className="mt-7 inline-flex w-full items-center justify-center rounded-2xl btn-go py-4 text-[1rem] font-bold"
            >
              {t.cta.openApp}
            </Link>
          ) : state === "failed" || state === "unavailable" ? (
            <div className="mt-7 space-y-2.5">
              <Link
                href={`/${locale}/offer`}
                className="flex w-full items-center justify-center rounded-2xl btn-go py-4 text-[1rem] font-bold"
              >
                {fr ? "Réessayer" : "Try again"}
              </Link>
              <Link
                href={`/${locale}/app/messages`}
                className="flex w-full items-center justify-center rounded-2xl border border-ink-600 py-3.5 text-[0.95rem] font-medium text-mute"
              >
                {fr ? "Nous écrire" : "Message us"}
              </Link>
            </div>
          ) : null}

          {good && (
            <div className="mt-7 rounded-2xl border border-ink-600 bg-ink-850 p-5 text-left">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-jade">
                {fr ? "Votre code d'accès" : "Your access code"}
              </p>
              <p className="metric mt-2 select-all break-all text-[1.15rem] font-bold text-bone">
                {load(locale).ref}
              </p>
              <p className="mt-2.5 text-[0.86rem] leading-relaxed text-mute">
                {fr
                  ? "Gardez-le. C'est ce qui vous fait revenir dans votre programme si vous changez de téléphone ou effacez vos données. Il est aussi dans votre email."
                  : "Keep this. It is what gets you back into your programme if you change phone or clear your data. It is in your email too."}
              </p>
            </div>
          )}

          {transId && !good && (
            <p className="mt-6 text-[0.78rem] text-faint">
              {fr ? "Référence" : "Reference"}: <span className="metric">{transId}</span>
            </p>
          )}
        </div>
      </main>
    </>
  );
}
