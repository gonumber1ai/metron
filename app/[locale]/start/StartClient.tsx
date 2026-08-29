"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDirect, withDirectPrices } from "@/lib/content/direct";
import { getMarketing } from "@/lib/content/marketing";
import { getPrices, type Plan } from "@/lib/payments";
import { track } from "@/lib/track";
import { update } from "@/lib/store";
import { Logo } from "@/components/Logo";
import { MetaPixel } from "@/components/MetaPixel";

/**
 * Straight to the offer. No quiz.
 *
 * The quiz asks a man to state his number before he trusts anyone. This page
 * states the pattern instead and lets him recognise himself — the same
 * admission, made privately, costing him nothing. The two questions move into
 * the app, after payment.
 */
export function StartClient({
  locale,
  geoCountry,
}: {
  locale: string;
  geoCountry?: string | null;
}) {
  const fr = locale === "fr";
  const m = getMarketing(locale);
  const [country] = useState(geoCountry ?? "default");

  const prices = getPrices(country);
  const priceOf = (p: Plan) => prices.find((x) => x.plan === p)?.display ?? "";
  const c = withDirectPrices(getDirect(locale), {
    test: priceOf("test"),
    sprint: priceOf("sprint"),
  });

  useEffect(() => {
    // Same tag capture as the quiz, so a man who lands here is attributed to
    // the ad that sent him exactly as one who lands on the quiz.
    try {
      const url = new URLSearchParams(window.location.search);
      const tag = (url.get("c") ?? url.get("utm_campaign") ?? "")
        .replace(/[^a-zA-Z0-9_-]/g, "")
        .slice(0, 40);
      if (tag) update((st) => (st.campaign ? st : { ...st, campaign: tag }), locale);
    } catch {
      /* a missing tag is not worth breaking the page over */
    }
    track("quiz_start", "direct", locale);
  }, [locale]);

  return (
    <>
      <style>{`body{background:var(--color-ink-900);color:var(--color-bone)}`}</style>
      <MetaPixel event="ViewContent" />

      <div className="min-h-screen pb-28 md:pb-0">
        <header className="border-b border-ink-700">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4">
            <Logo size="sm" />
            <Link
              href={`/${locale}/login`}
              className="rounded-full border border-ink-600 bg-ink-800 px-4 py-2 text-[13px] font-bold text-bone transition-colors hover:border-jade hover:text-jade"
            >
              {fr ? "Se connecter" : "Log in"}
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-2xl px-5">
          <section className="pt-10">
            <p className="inline-flex items-center gap-2 rounded-full border border-ink-700 bg-ink-800 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-mute">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-jade" />
              {c.kicker}
            </p>
            <h1 className="mt-4 text-[2.15rem] md:text-[2.7rem]">{c.h}</h1>

            <ul className="mt-6 space-y-2.5">
              {c.qualify.map((q) => (
                <li
                  key={q}
                  className="flex gap-3 rounded-xl border-l-2 border-jade bg-ink-800/60 px-4 py-3 text-[1rem] leading-relaxed text-bone"
                >
                  {q}
                </li>
              ))}
            </ul>
          </section>

          {/* The numbers, big.
              They sit under the recognition on purpose — a multiple means
              nothing until a man has seen himself in the pattern above it.
              And they are the page's only visual anchor: without them it is an
              unbroken column of prose, which is what made it read cold. */}
          <section className="mt-10 rounded-2xl card p-6">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">
              {c.resultsH}
            </h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {c.results.map((r) => (
                <div key={r.multiple}>
                  <p className="metric text-[2.9rem] font-bold leading-none text-jade md:text-[3.3rem]">
                    {r.multiple}
                  </p>
                  <p className="mt-2.5 text-[0.93rem] leading-snug text-mute">{r.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 border-t border-ink-700 pt-4 text-[0.9rem] leading-relaxed text-faint">
              {c.resultsNote}
            </p>
          </section>

          {/* The recognition. This does the quiz's job without asking. */}
          <section className="mt-10">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">
              {c.patternH}
            </h2>
            {c.pattern.map((p, i) => (
              <p
                key={i}
                className={`mt-3 leading-[1.7] ${
                  i === 0 ? "text-[1.15rem] font-bold text-bone" : "text-[1.02rem] text-mute"
                }`}
              >
                {p}
              </p>
            ))}
          </section>

          <section className="mt-10">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-alert">
              {c.costH}
            </h2>
            <p className="mt-3 border-l-[3px] border-alert pl-4 text-[1.05rem] leading-[1.7] text-bone">
              {c.cost}
            </p>
          </section>

          <section className="mt-10 rounded-2xl card p-6">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">
              {c.whatH}
            </h2>
            <ul className="mt-4 space-y-3.5">
              {c.what.map((w) => (
                <li key={w} className="flex gap-3 text-[0.98rem] leading-relaxed text-bone">
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
                  {w}
                </li>
              ))}
            </ul>
          </section>

          {/* Honesty as the differentiator, since every competitor lies. */}
          <section className="mt-10">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">
              {c.honestH}
            </h2>
            <p className="mt-3 text-[1.05rem] leading-[1.7] text-bone">{c.honest}</p>
          </section>

          <section className="mt-8 rounded-2xl card p-6">
            <p className="text-[1.05rem] font-bold leading-snug text-bone">{c.priceLead}</p>
            <p className="mt-4 rounded-xl border-l-2 border-jade bg-jade-050 px-4 py-3 text-[1rem] font-bold leading-relaxed text-bone">
              {c.guarantee}
            </p>

            <Link
              href={`/${locale}/offer`}
              onClick={() => track("result_view", "direct", locale)}
              className="mt-6 flex w-full items-center justify-center rounded-full btn-go px-6 py-4 text-[15.5px] font-bold"
            >
              {c.cta}
            </Link>
            <p className="mt-3 text-center text-[12.5px] leading-relaxed text-faint">
              {c.ctaNote}
            </p>
          </section>

          <footer className="mt-10 border-t border-ink-700 py-8">
            <p className="text-[12px] leading-relaxed text-faint">{m.disclaimer}</p>
          </footer>
        </main>

        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-ink-700 bg-ink-900/95 p-3 backdrop-blur md:hidden">
          <Link
            href={`/${locale}/offer`}
            onClick={() => track("result_view", "direct", locale)}
            className="flex w-full items-center justify-center rounded-full btn-go px-6 py-3.5 text-[15px] font-bold"
          >
            {c.cta}
          </Link>
        </div>
      </div>
    </>
  );
}
