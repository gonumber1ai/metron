"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDict } from "@/lib/i18n";
import { track } from "@/lib/track";
import { PayPanel } from "@/components/PayPanel";
import { getMarketing, withPrices } from "@/lib/content/marketing";
import { getPrices, type Plan, type Price } from "@/lib/payments";
import { load, update } from "@/lib/store";
import { Logo } from "@/components/Logo";
import { Spinner, useAction } from "@/components/Pending";

type Status = "idle" | "working" | "fallback" | "sent";

export function OfferClient({
  locale,
  geoCountry,
}: {
  locale: string;
  /** resolved server-side from the edge geo header — trusted over the browser */
  geoCountry?: string | null;
}) {
  const t = getDict(locale);

  const [country, setCountry] = useState(geoCountry ?? "default");
  const [plan, setPlan] = useState<Plan>("test");
  const [status, setStatus] = useState<Status>("idle");
  const [contact, setContact] = useState("");
  const [ref, setRef] = useState("");

  useEffect(() => {
    const s = load(locale);
    setRef(s.ref);
    // Country drives the price book and which rail is shown first. Timezone is
    // a decent proxy and needs no permission or third-party lookup.
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
      // ?country=CM forces a market. Useful for testing, and for a man on a
      // VPN whose IP lies about where he actually is.
      const forced = new URLSearchParams(window.location.search).get("country");
      if (forced) {
        setCountry(forced.toUpperCase());
        return;
      }
      // The edge header already told us, and it is more reliable than this.
      if (geoCountry) return;
      if (tz === "Africa/Douala") setCountry("CM");
    } catch {
      /* keep the default */
    }
    track("offer_view", plan, locale);
  }, [locale, geoCountry, plan]);

  const prices = getPrices(country);
  const forPlan = prices.filter((p) => p.plan === plan);
  // The toggle used to show two names and no money. A man choosing between two
  // plans is choosing between two prices, and hiding them behind a tap is the
  // one thing on this page guaranteed to cost a sale.
  const priceOf = (p: Plan) => prices.find((x) => x.plan === p)?.display ?? "";
  // Copy and buttons read the same price book, so an English page in London
  // quotes dollars rather than francs.
  const m = withPrices(getMarketing(locale), {
    test: priceOf("test"),
    sprint: priceOf("sprint"),
  });

  const [sending, sendLead] = useAction(async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contact, plan, ref, locale }),
    });
    if (res.ok) setStatus("sent");
  });

  const includes = plan === "test" ? m.includes : m.sprintIncludes;

  return (
    <>
      <style>{`body{background:var(--color-ink-900);color:var(--color-bone)}`}</style>

      <div className="min-h-screen">
        <header className="border-b border-ink-700">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4">
            <Logo size="sm" />
            <span className="flex items-center gap-4">
              <Link href={`/${locale}/result`} className="text-[13px] text-mute hover:text-bone">
                {t.cta.back}
              </Link>
              <Link
                href={`/${locale}/login`}
                className="rounded-full border border-ink-600 bg-ink-800 px-4 py-2 text-[13px] font-bold text-bone transition-colors hover:border-jade hover:text-jade"
              >
                {locale === "fr" ? "Se connecter" : "Log in"}
              </Link>
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-2xl px-5 py-10">
          {/* plan toggle */}
          <div
            role="tablist"
            aria-label="Plan"
            className="grid grid-cols-2 gap-2"
          >
            {(["test", "sprint"] as Plan[]).map((p) => {
              const on = plan === p;
              return (
                <button
                  key={p}
                  role="tab"
                  aria-selected={on}
                  onClick={() => {
                    setPlan(p);
                    setStatus("idle");
                  }}
                  className={`rounded-2xl border-2 px-4 py-3.5 text-left transition-colors ${
                    on
                      ? "border-jade bg-jade-050"
                      : "border-ink-700 bg-ink-800 hover:border-ink-500"
                  }`}
                >
                  <span
                    className={`block text-[13px] font-bold ${on ? "text-bone" : "text-mute"}`}
                  >
                    {p === "test" ? t.offer.testName : t.offer.sprintName}
                  </span>
                  <span className="metric mt-1.5 block text-[1.15rem] font-bold text-bone">
                    {priceOf(p)}
                  </span>
                </button>
              );
            })}
          </div>

          <section className="mt-6 rounded-2xl card p-6">
            {/* The anchor. The trial only looks cheap next to the real price,
                so the real price has to be on the page before it. */}
            {plan === "test" ? (
              <>
                <h1 className="text-[1.35rem] font-bold leading-snug tracking-tight">
                  {m.offerIntro.h}
                </h1>
                <div className="mt-4 space-y-3">
                  {m.offerIntro.p.map((line, i) => (
                    <p
                      key={i}
                      className={
                        i === 2
                          ? "rounded-xl border-l-2 border-jade bg-jade-050 px-4 py-3 text-[1rem] font-semibold leading-relaxed text-bone"
                          : "text-[0.98rem] leading-relaxed text-mute"
                      }
                    >
                      {line}
                    </p>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h1 className="text-[1.35rem] font-bold leading-snug tracking-tight">
                  {t.offer.sprintName}
                </h1>
                <p className="mt-2 text-[0.98rem] leading-relaxed text-mute">{m.sprintPitch}</p>
              </>
            )}

            <h2 className="mt-7 text-[11px] font-bold uppercase tracking-[0.14em] text-faint">
              {t.offer.includes}
            </h2>
            <ul className="mt-3 space-y-2.5">
              {includes.map((x) => (
                <li key={x} className="flex gap-3 text-[0.95rem] leading-relaxed text-bone">
                  <span aria-hidden className="mt-[3px] shrink-0 text-jade">
                    <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none">
                      <path
                        d="M4 10.5 8.2 14.5 16 5.8"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  {x}
                </li>
              ))}
            </ul>
          </section>

          {/* ------------------------------------------------------- payment */}
          {/* Embedded, both rails. He never leaves the site — which matters
              more than usual on a page about something he is embarrassed by.
              MoMo pushes a USSD prompt to his handset; cards render inline. */}
          <section className="mt-6">
            <PayPanel
              locale={locale}
              plan={plan}
              country={country}
              prices={forPlan}
              onUnavailable={(dead) => setStatus(dead ? "fallback" : "idle")}
            />
          </section>

          <p className="mt-4 text-center text-[0.9rem] leading-relaxed text-faint">
            {t.offer.guarantee}
          </p>

          {/* --------------------------------------------- fallback capture */}
          {status === "fallback" && (
            <section className="mt-6 rounded-2xl border border-amber/40 bg-amber-050 p-5">
              <p className="text-[0.98rem] font-semibold text-bone">{t.offer.comingSoon}</p>
              <p className="mt-1.5 text-[0.92rem] leading-relaxed text-mute">
                {t.offer.comingSoonBody}
              </p>
              <form onSubmit={sendLead} className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                <input
                  type="text"
                  inputMode="email"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder={locale === "fr" ? "E-mail ou numéro" : "Email or number"}
                  className="flex-1 rounded-xl border border-ink-600 bg-ink-900 px-4 py-3 text-[15px] text-bone placeholder:text-faint focus:border-jade focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="flex items-center justify-center gap-2 rounded-xl btn-go px-6 py-3 text-[15px] font-semibold disabled:opacity-50"
                >
                  {sending && <Spinner />}
                  {t.messages.send}
                </button>
              </form>
            </section>
          )}

          {status === "sent" && (
            <section className="mt-6 rounded-2xl border border-jade/40 bg-jade-050 p-5">
              <p className="text-[0.98rem] font-semibold text-bone">
                {locale === "fr" ? "C'est noté." : "Got it."}
              </p>
              <p className="mt-1.5 text-[0.92rem] leading-relaxed text-mute">
                {locale === "fr"
                  ? "Nous vous écrivons dès que le paiement est actif. En attendant, vous pouvez déjà parcourir le programme."
                  : "We'll write the moment payment is live. In the meantime you can already look through the programme."}
              </p>
              {/* No programme access here — this man has not paid yet. */}
            </section>
          )}

          <footer className="mt-10 border-t border-ink-700 pt-6">
            <p className="text-[12px] leading-relaxed text-faint">{m.disclaimer}</p>
          </footer>
        </main>
      </div>
    </>
  );
}
