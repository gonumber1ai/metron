"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getDict } from "@/lib/i18n";
import { track } from "@/lib/track";
import { PayPanel } from "@/components/PayPanel";
import { getMarketing } from "@/lib/content/marketing";
import { getPrices, type Plan } from "@/lib/payments";
import { load } from "@/lib/store";
import { Logo } from "@/components/Logo";
import { MetaPixel } from "@/components/MetaPixel";
import { Spinner, useAction } from "@/components/Pending";

type Status = "idle" | "working" | "fallback" | "sent";

/**
 * The checkout. NOT a second sales page.
 *
 * The page before this one does the persuading — problem, mechanism, proof,
 * price justification, guarantee. By the time a man arrives here he has
 * already decided. Everything on this page exists to remove friction and
 * complete a payment, and anything that makes him reconsider the offer is a
 * bug, not a feature.
 *
 * ── WHAT CHANGED, AND WHY ─────────────────────────────────────────────────
 * The two big plan tabs are gone. They asked a man who had just decided to
 * buy the 10-Day Reset to choose all over again, with a 69,000 option sitting
 * next to the 7,500 one — the single most expensive thing on the page. The
 * Reset is now simply what he is buying.
 *
 * The 69,000 has not been hidden: it moved BELOW the payment, framed as what
 * comes after the ten days rather than as a competing choice, with the credit
 * spelled out and an explicit "you do not need to decide that today".
 * Eventually that upsell belongs after purchase, inside the app, once he has
 * felt the thing work.
 *
 * The sales copy, the guarantee restated three times, and "less than a meal
 * out" are all gone. He has read them. Repeating them here reads as anxiety.
 *
 * ── WHAT I DID NOT TOUCH ──────────────────────────────────────────────────
 * PayPanel, and the Fapshi and Whop wiring inside it. Same component, same
 * props, same behaviour. This file only changes what surrounds it.
 */
export function OfferClient({
  locale,
  geoCountry,
}: {
  locale: string;
  /** resolved server-side from the edge geo header — trusted over the browser */
  geoCountry?: string | null;
}) {
  const t = getDict(locale);
  const m = getMarketing(locale);
  const router = useRouter();
  const params = useSearchParams();

  const [country, setCountry] = useState(geoCountry ?? "default");
  const [status, setStatus] = useState<Status>("idle");
  const [contact, setContact] = useState("");
  const [ref, setRef] = useState("");

  /* One plan, fixed: whatever the sales page sold him. ?plan=sprint still
     works so the in-app upgrade can link straight here once it exists —
     nothing on this page offers the choice. */
  const plan: Plan = params.get("plan") === "sprint" ? "sprint" : "test";

  useEffect(() => {
    const s = load(locale);
    setRef(s.ref);

    // Country resolution. Kept in its own block on purpose — see below.
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
      // ?country=CM forces a market. Useful for testing, and for a man on a
      // VPN whose IP lies about where he actually is.
      const forced = new URLSearchParams(window.location.search).get("country");
      if (forced) setCountry(forced.toUpperCase());
      // The edge header already told us, and it is more reliable than this.
      else if (!geoCountry && tz === "Africa/Douala") setCountry("CM");
    } catch {
      /* keep the default */
    }

    // Fires unconditionally, and that is the entire point of it living here.
    // It used to sit after the country block, which returned early whenever
    // geoCountry was set — and Vercel sets that header on every production
    // request, so offer_view never fired once in production. The funnel read
    // "0 opened the offer" while men were paying through it.
    track("offer_view", plan, locale);
  }, [locale, geoCountry, plan]);

  const prices = getPrices(country);
  const forPlan = prices.filter((p) => p.plan === plan);
  const priceOf = (p: Plan) => prices.find((x) => x.plan === p)?.display ?? "";
  /* Only ever a price this plan was genuinely listed at — see Price.was. */
  const wasOf = (p: Plan) => prices.find((x) => x.plan === p)?.was ?? "";

  /* No credit arithmetic any more. The 30-day is 15,000 flat — two products,
     two prices, nothing to work out at the moment he is entering a PIN. The
     remainder calculation that used to live here is gone rather than left
     unused, because a dead sum is the kind of thing that gets re-wired into a
     page a year later by someone who assumes it still means something. */
  const afterTen = t.checkout.afterTen
    .split("{sprint}")
    .join(priceOf("sprint"))
    .split("{test}")
    .join(priceOf("test"));

  const [sending, sendLead] = useAction(async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contact, plan, ref, locale }),
    });
    if (res.ok) setStatus("sent");
  });

  const planName = plan === "test" ? t.offer.testName : t.offer.sprintName;

  return (
    <>
      <style>{`body{background:var(--color-ink-900);color:var(--color-bone)}`}</style>
      {/* Scoped here on purpose. The quiz and result pages never load it. */}
      <MetaPixel event="ViewContent" />

      <div className="min-h-screen">
        <header className="border-b border-ink-700">
          <div className="mx-auto flex max-w-xl items-center justify-between px-5 py-4">
            <Logo size="sm" />
            <span className="flex items-center gap-4">
              {/* Real browser back, not a hardcoded /result. It used to point
                  at the quiz result page, so a man who came through the
                  no-quiz page and pressed Back landed on a result screen for
                  a quiz he never took. */}
              <button
                type="button"
                onClick={() => {
                  if (window.history.length > 1) router.back();
                  else router.push(`/${locale}/start`);
                }}
                className="text-[13px] text-mute hover:text-bone"
              >
                {t.cta.back}
              </button>
              <Link
                href={`/${locale}/login`}
                className="rounded-full border border-ink-600 bg-ink-800 px-4 py-2 text-[13px] font-bold text-bone transition-colors hover:border-jade hover:text-jade"
              >
                {locale === "fr" ? "Se connecter" : "Log in"}
              </Link>
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-xl px-5 py-10 md:py-14">
          {/* ── WHAT HE IS BUYING ────────────────────────────────────────
              Stated, not offered. No choice to make here. */}
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-faint">
            {planName}
          </p>
          <h1 className="mt-3 text-[1.9rem] leading-[1.1] md:text-[2.3rem]">
            {plan === "test" ? t.checkout.h : planName}
          </h1>
          <div className="mt-4 flex flex-wrap items-end gap-x-4 gap-y-1">
            <p className="metric text-[2.8rem] font-bold leading-none text-jade md:text-[3.2rem]">
              {priceOf(plan)}
            </p>
            {/* The real former price, struck. Muted rather than red: a red
                slash is the visual signature of every guru discount on the
                internet, and this page is trying to be the serious option in
                a category the buyer already suspects. */}
            {wasOf(plan) && (
              <p className="metric text-[1.3rem] font-bold leading-none text-faint line-through decoration-2">
                {wasOf(plan)}
              </p>
            )}
          </div>
          <p className="mt-4 text-[0.98rem] leading-relaxed text-mute">
            {t.checkout.sub}
          </p>

          {/* Where he is in the process. Three steps, first one live. */}
          <ol className="mt-7 flex items-center gap-2.5">
            {t.checkout.steps.map((s, i) => (
              <li key={s} className="flex flex-1 items-center gap-2.5">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10.5px] font-bold ${
                    i === 0 ? "bg-jade text-[#04140C]" : "bg-ink-700 text-faint"
                  }`}
                >
                  {i + 1}
                </span>
                <span
                  className={`text-[12.5px] font-bold ${
                    i === 0 ? "text-bone" : "text-faint"
                  }`}
                >
                  {s}
                </span>
                {i < t.checkout.steps.length - 1 && (
                  <span aria-hidden className="h-px flex-1 bg-ink-700" />
                )}
              </li>
            ))}
          </ol>

          {/* ── PAYMENT ──────────────────────────────────────────────────
              Untouched. Both rails, embedded — he never leaves the site,
              which matters more than usual on a page about something he is
              embarrassed by. MoMo pushes a USSD prompt to his handset;
              cards render inline. */}
          <section className="mt-8">
            <PayPanel
              locale={locale}
              plan={plan}
              country={country}
              prices={forPlan}
              onUnavailable={(dead) => setStatus(dead ? "fallback" : "idle")}
            />
          </section>

          {/* ── AFTER PAYMENT ────────────────────────────────────────────
              Removes the "what actually happens when I hand over money"
              hesitation, which is the last one standing at this point. */}
          <section className="mt-8 rounded-2xl border border-ink-600 bg-ink-850 px-5 py-5">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-faint">
              {t.checkout.afterH}
            </h2>
            <ol className="mt-4 space-y-2.5">
              {t.checkout.after.map((s, i) => (
                <li key={s} className="flex gap-3 text-[0.95rem] leading-snug text-bone">
                  <span
                    aria-hidden
                    className="metric shrink-0 text-[0.95rem] font-bold text-jade"
                  >
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
          </section>

          {/* Guarantee and privacy, once each and compressed. Both were
              already made on the sales page; restating them at length here
              reads as anxiety rather than reassurance. */}
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <section className="rounded-2xl border border-ink-600 bg-ink-850 px-5 py-4">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-jade">
                {t.checkout.guaranteeH}
              </h2>
              <p className="mt-2 text-[0.88rem] leading-relaxed text-mute">
                {t.checkout.guaranteeShort}
              </p>
            </section>
            <section className="rounded-2xl border border-ink-600 bg-ink-850 px-5 py-4">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-jade">
                {t.checkout.privacyH}
              </h2>
              <p className="mt-2 text-[0.88rem] leading-relaxed text-mute">
                {t.checkout.privacyShort}
              </p>
            </section>
          </div>

          {/* ── THE SPRINT, AS A FUTURE ──────────────────────────────────
              Below the payment and deliberately quiet: no card, no accent,
              no button. It anchors the value of what he is paying today and
              answers "what is this leading to" without asking him to weigh a
              69,000 decision at the moment he is entering a PIN. */}
          {plan === "test" && (
            <section className="mt-8 border-t border-ink-700 pt-6">
              <h2 className="text-[0.98rem] font-bold text-bone">
                {t.checkout.afterTenH}
              </h2>
              <p className="mt-2.5 text-[0.92rem] leading-relaxed text-mute">{afterTen}</p>
              <p className="mt-2.5 text-[0.92rem] font-bold leading-relaxed text-bone">
                {t.checkout.afterTenNote}
              </p>
            </section>
          )}

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
            <p className="text-[11.5px] leading-relaxed text-faint">{m.disclaimer}</p>
          </footer>
        </main>
      </div>
    </>
  );
}
