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
import { MeasureFlow, Timeline } from "@/components/MeasureFlow";

/**
 * The direct sales page. No quiz.
 *
 * ── WHAT THIS PAGE IS ─────────────────────────────────────────────────────
 * Outcome → recognition → reason → the ten days → proof → offer → guarantee
 * → FAQ → close. Desire before mechanics.
 *
 * The old version opened by naming competitors and then spent its length on
 * the protocol. No man wakes up wanting seven fifteen-minute sessions; he
 * wakes up wanting to stop worrying about it. So the sessions moved down into
 * a rail he can skim, and the top of the page is now the outcome and the
 * thing he already feels.
 *
 * ── THE ARGUMENT ──────────────────────────────────────────────────────────
 * Measure it. Train it. Measure again. Every product on that shelf makes a
 * promise; not one lets him check it. This one hands him two numbers and lets
 * the result do the arguing — which is also why the guarantee can be as loud
 * as it is.
 *
 * ── VISUAL RULES ──────────────────────────────────────────────────────────
 * Near-black ground, one green, huge type, a lot of air. Every section is one
 * idea. Nothing sexual, nothing herbal, nothing "alpha" — the whole
 * positioning is that this is the serious option, and it has to look it from
 * the first screen.
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

  /* One button, used five times. The `where` tag rides along so the funnel can
     say WHICH section closed him rather than only that somebody left. */
  const Go = ({ where, className = "" }: { where: string; className?: string }) => (
    <Link
      href={`/${locale}/offer`}
      onClick={() => track("result_view", `direct_${where}`, locale)}
      className={`flex items-center justify-center rounded-full btn-go px-7 py-4 text-center text-[16px] font-bold ${className}`}
    >
      {c.cta}
    </Link>
  );

  const Kicker = ({ children }: { children: React.ReactNode }) => (
    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-faint">
      {children}
    </p>
  );

  return (
    <>
      <style>{`body{background:var(--color-ink-900);color:var(--color-bone)}`}</style>
      <MetaPixel event="ViewContent" />

      <div className="min-h-screen pb-28 md:pb-0">
        <header className="border-b border-ink-700">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
            <Logo size="sm" />
            <Link
              href={`/${locale}/login`}
              className="rounded-full border border-ink-600 bg-ink-800 px-4 py-2 text-[13px] font-bold text-bone transition-colors hover:border-jade hover:text-jade"
            >
              {fr ? "Se connecter" : "Log in"}
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-5">
          {/* ── HERO ─────────────────────────────────────────────────────
              Outcome, mechanism, price, button, risk reversal. In that
              order, above the fold, on a phone. */}
          <section className="pt-12 md:pt-20">
            <p className="inline-flex items-center gap-2 rounded-full border border-ink-700 bg-ink-800 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-mute">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-jade" />
              {c.kicker}
            </p>

            <h1 className="mt-6 max-w-3xl text-[2.4rem] leading-[1.03] md:text-[3.9rem]">
              {c.h}
            </h1>

            <p className="mt-6 max-w-2xl text-[1.15rem] leading-[1.6] text-mute md:text-[1.3rem]">
              {c.sub}
            </p>

            <div className="mt-9">
              <MeasureFlow ui={c.ui} labels={c.flow} />
            </div>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
              <Go where="hero" className="w-full sm:w-auto sm:min-w-[19rem]" />
              <p className="text-center text-[1.05rem] font-bold text-bone sm:text-left">
                {c.priceLine}
              </p>
            </div>
            <p className="mt-3.5 text-[13px] leading-relaxed text-faint">
              {c.ctaNote}
            </p>

            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2.5 border-t border-ink-700 pt-6">
              {c.trust.map((t) => (
                <li
                  key={t}
                  className="flex items-center gap-2 text-[13px] font-bold text-mute"
                >
                  <span aria-hidden className="text-jade">
                    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
                      <path
                        d="M4 10.5 8.2 14.5 16 5.8"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </section>

          {/* ── RECOGNITION ──────────────────────────────────────────────
              This does the quiz's job without asking him anything. He has
              to see himself here before any number means a thing. */}
          <section className="mt-20 md:mt-28">
            <h2 className="max-w-2xl text-[1.9rem] leading-[1.12] md:text-[2.6rem]">
              {c.problemH}
            </h2>
            <div className="mt-7 max-w-2xl border-l-2 border-ink-600 pl-5 md:pl-7">
              {c.problem.map((p, i) => (
                <p
                  key={i}
                  className={`leading-[1.7] ${i === 0 ? "" : "mt-4"} ${
                    i === 0
                      ? "text-[1.3rem] font-bold text-bone md:text-[1.5rem]"
                      : "text-[1.05rem] text-mute"
                  }`}
                >
                  {p}
                </p>
              ))}
            </div>
          </section>

          {/* ── THE REASON ───────────────────────────────────────────────
              Short, plain, and it removes the shame. A man who believes it
              is his character does not buy training. */}
          <section className="mt-20 md:mt-28">
            <h2 className="max-w-2xl text-[1.9rem] leading-[1.12] md:text-[2.6rem]">
              {c.mechH}
            </h2>
            <div className="mt-7 max-w-2xl">
              {c.mech.map((p, i) => (
                <p
                  key={i}
                  className={`text-[1.05rem] leading-[1.7] ${
                    i === 0 ? "text-bone" : "mt-4 text-mute"
                  }`}
                >
                  {p}
                </p>
              ))}
            </div>
          </section>

          {/* ── THE TEN DAYS ─────────────────────────────────────────────
              The mechanics, but placed after the desire and drawn as a rail
              so it can be skimmed. The shape is the point: measure, train,
              log, measure. Never what happens inside a session. */}
          <section className="mt-20 md:mt-28">
            <h2 className="max-w-2xl text-[1.9rem] leading-[1.12] md:text-[2.6rem]">
              {c.timelineH}
            </h2>
            <p className="mt-5 max-w-2xl text-[1.05rem] leading-[1.7] text-mute">
              {c.timelineSub}
            </p>
            <div className="mt-10">
              <Timeline steps={c.timeline} />
            </div>
          </section>

          {/* ── PROOF ────────────────────────────────────────────────────
              The page's only sourced claim. The methodology sits directly
              under it on purpose — "1.5–3×" with no "according to who"
              answer is worse than no number at all. Read the note at the
              top of lib/content/direct.ts before touching these. */}
          <section className="mt-20 md:mt-28">
            <h2 className="text-[1.9rem] leading-[1.12] md:text-[2.6rem]">
              {c.resultsH}
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {c.results.map((r) => (
                <div key={r.multiple} className="rounded-2xl card p-6 md:p-7">
                  <p className="metric text-[3.2rem] font-bold leading-none text-jade md:text-[4rem]">
                    {r.multiple}
                  </p>
                  <p className="mt-3 text-[0.98rem] leading-snug text-mute">
                    {r.label}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-6 max-w-2xl text-[0.92rem] leading-relaxed text-faint">
              {c.resultsNote}
            </p>
          </section>

          {/* ── THE OFFER ────────────────────────────────────────────────
              Two prices, both true, neither struck through. 69,000 is the
              full programme and 7,500 is ten days of it — a strikethrough
              would invent a discount that does not exist, on the one page
              whose whole argument is that everyone else makes claims you
              cannot check. */}
          <section className="mt-20 md:mt-28">
            <div className="rounded-3xl card p-7 md:p-11">
              <Kicker>{c.offerKicker}</Kicker>

              <div className="mt-5 flex flex-wrap items-end gap-x-7 gap-y-3">
                <p className="metric text-[3.6rem] font-bold leading-[0.9] text-jade md:text-[5rem]">
                  {c.offerH}
                </p>
                <p className="pb-2 text-[13px] font-bold uppercase tracking-[0.14em] text-faint">
                  {c.testLabel}
                  <br />
                  <span className="text-mute">
                    {c.fullLabel} · {priceOf("sprint")}
                  </span>
                </p>
              </div>

              <div className="mt-7 max-w-2xl border-t border-ink-700 pt-6">
                {c.offerBody.map((p, i) => (
                  <p
                    key={i}
                    className={`leading-[1.7] ${i === 0 ? "" : "mt-4"} ${
                      i === 0
                        ? "text-[1.15rem] font-bold text-bone"
                        : "text-[1.02rem] text-mute"
                    }`}
                  >
                    {p}
                  </p>
                ))}
              </div>

              <ul className="mt-8 grid gap-3.5 border-t border-ink-700 pt-7 md:grid-cols-2 md:gap-x-9">
                {c.includes.map((w) => (
                  <li
                    key={w}
                    className="flex gap-3 text-[0.98rem] leading-relaxed text-bone"
                  >
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

              <Go where="offer" className="mt-9 w-full" />
            </div>
          </section>

          {/* ── GUARANTEE ────────────────────────────────────────────────
              The strongest thing on the page. It is loud because the
              mechanism makes it safe: he is not asked to believe anything,
              only to take the same measurement twice. */}
          <section className="mt-20 md:mt-28">
            <h2 className="text-[1.9rem] leading-[1.12] md:text-[2.6rem]">
              {c.guaranteeH}
            </h2>
            <div className="mt-8">
              <MeasureFlow ui={c.ui} labels={c.guaranteeSteps} tone="quiet" />
            </div>
            <p className="mt-7 max-w-2xl rounded-2xl border-l-2 border-jade bg-jade-050 px-6 py-5 text-[1.1rem] font-bold leading-[1.65] text-bone">
              {c.guarantee}
            </p>
          </section>

          {/* ── FAQ ──────────────────────────────────────────────────────
              Native details/summary: it works with the keyboard, it works
              with a screen reader, and it costs no JavaScript on a
              connection where every kilobyte is real. */}
          <section className="mt-20 md:mt-28">
            <h2 className="text-[1.9rem] leading-[1.12] md:text-[2.6rem]">{c.faqH}</h2>
            <div className="mt-8 max-w-2xl divide-y divide-ink-700 border-y border-ink-700">
              {c.faq.map((f) => (
                <details key={f.q} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 text-[1.05rem] font-bold text-bone marker:hidden hover:text-jade">
                    {f.q}
                    <span
                      aria-hidden
                      className="shrink-0 text-faint transition-transform group-open:rotate-45"
                    >
                      <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none">
                        <path
                          d="M10 4v12M4 10h12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  </summary>
                  <p className="pb-6 pr-8 text-[1rem] leading-[1.7] text-mute">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* ── CLOSE ────────────────────────────────────────────────────── */}
          <section className="mt-20 md:mt-28">
            <h2 className="max-w-2xl text-[2.1rem] leading-[1.08] md:text-[3rem]">
              {c.finalH}
            </h2>
            <p className="mt-4 text-[1.2rem] font-bold text-mute md:text-[1.4rem]">
              {c.finalSub}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
              <Go where="final" className="w-full sm:w-auto sm:min-w-[19rem]" />
              <p className="text-center text-[1.05rem] font-bold text-bone sm:text-left">
                {c.priceLine}
              </p>
            </div>
            <p className="mt-3.5 text-[13px] leading-relaxed text-faint">
              {c.ctaNote}
            </p>
          </section>

          <footer className="mt-20 border-t border-ink-700 py-8">
            <p className="max-w-2xl text-[12px] leading-relaxed text-faint">
              {m.disclaimer}
            </p>
          </footer>
        </main>

        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-ink-700 bg-ink-900/95 p-3 backdrop-blur md:hidden">
          <Go where="sticky_mobile" className="w-full !py-3.5 text-[15px]" />
        </div>
      </div>
    </>
  );
}
