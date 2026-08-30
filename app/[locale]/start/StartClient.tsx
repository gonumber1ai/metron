"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getDirect, withDirectPrices } from "@/lib/content/direct";
import { getMarketing } from "@/lib/content/marketing";
import { getPrices, type Plan } from "@/lib/payments";
import { track } from "@/lib/track";
import { update } from "@/lib/store";
import { Logo } from "@/components/Logo";
import { MetaPixel } from "@/components/MetaPixel";
import { PhoneMock, MeasureFlow, Timeline } from "@/components/MeasureFlow";

/* The two marketing renders, one pair per language. Imported statically so
   next/image knows their dimensions and serves a sized WebP — the sources are
   1.5 MB PNGs and this audience is on mobile data. */
import stepsEn from "@/public/marketing/steps-en.png";
import stepsFr from "@/public/marketing/steps-fr.png";
import sameResultEn from "@/public/marketing/same-result-en.png";
import sameResultFr from "@/public/marketing/same-result-fr.png";

/**
 * The direct sales page. No quiz.
 *
 * ── ARCHITECTURE ──────────────────────────────────────────────────────────
 * hero → product → problem → mechanism → measure/train/measure → the ten days
 * → not-buying → who it is for → proof → offer → guarantee → FAQ → close.
 *
 * It used to say "listen to our explanation". It now says: here is the
 * problem, here is the product, here is how it works, here is the evidence,
 * try it for the price of a meal, and if he is not lasting longer he gets his
 * money back.
 *
 * The refund condition is always "if you are not lasting longer", never "if
 * your number has not moved". The number is how he checks it; lasting longer
 * is what he came for.
 *
 * ── RULES THIS PAGE IS BUILT ON ───────────────────────────────────────────
 * • Desire before mechanics. The protocol is a rail placed after the
 *   recognition, not the argument itself.
 * • Recognition, not misery. The problem section is deliberately short —
 *   making a man feel worse is not the same as making him feel understood,
 *   and only one of them sells.
 * • Scannable. Short paragraph, then points. Nobody reads this like a book.
 * • Never name the technique. The page shows the SHAPE of the ten days and
 *   nothing that happens inside a session.
 * • Nothing invented. No fabricated measurements, no testimonials that do
 *   not exist, no struck-through price that was never charged.
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
  /* Only ever a price this plan was genuinely listed at — see Price.was. */
  const wasOf = (p: Plan) => prices.find((x) => x.plan === p)?.was ?? "";
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
    /* Its own event, not the quiz's.
       This used to fire quiz_start with detail "direct", which meant the two
       funnels shared their first step: every man on this page was counted as
       having started the quiz, and the quiz's numbers were inflated by traffic
       that never saw a question. The views read both names so the rows
       recorded before this change are not lost. */
    track("start_view", undefined, locale);
  }, [locale]);

  /* One button, used four times. The `where` tag rides along so the funnel can
     say WHICH section closed him rather than only that somebody left. */
  const Go = ({ where, className = "" }: { where: string; className?: string }) => (
    <Link
      href={`/${locale}/offer`}
      /* start_cta carries the position in `detail`, so the admin can say which
         block on this page actually closes him. It used to fire result_view
         with a "direct_" prefix, which quietly polluted the quiz funnel's
         result step with men who had never taken a quiz. */
      onClick={() => track("start_cta", where, locale)}
      className={`flex items-center justify-center rounded-full btn-go px-7 py-4 text-center text-[16px] font-bold ${className}`}
    >
      {c.cta}
    </Link>
  );

  const Tick = () => (
    <span aria-hidden className="mt-[3px] shrink-0 text-jade">
      <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none">
        <path
          d="M4 10.5 8.2 14.5 16 5.8"
          stroke="currentColor"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );

  const H2 = ({
    children,
    tone,
  }: {
    children: React.ReactNode;
    /** "alarm" paints the heading red — for the blocks that state the problem
        and what waiting costs, and nowhere else. */
    tone?: "alarm";
  }) => (
    <h2
      className={`max-w-2xl text-[1.9rem] leading-[1.12] md:text-[2.6rem] ${
        tone === "alarm" ? "text-alert" : ""
      }`}
    >
      {children}
    </h2>
  );

  return (
    <>
      <style>{`body{background:var(--color-ink-900);color:var(--color-bone)}`}</style>
      <MetaPixel event="ViewContent" />

      <div className="min-h-screen pb-28 md:pb-0">
        {/* Sticky: on a page this long the only way back to the logo — and to
            the log-in link a returning buyer needs — was a scroll to the top.
            z-30 clears the mobile buy bar at z-20; the blur keeps the page
            legible through it rather than hiding a band of it. */}
        <header className="sticky top-0 z-30 border-b border-ink-700 bg-ink-900/90 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
            <Logo size="sm" />
            <Link
              href={`/${locale}/login`}
              className="rounded-full border border-ink-600 bg-ink-800 px-4 py-2 text-[13px] font-bold text-bone transition-colors hover:border-jade hover:text-jade"
            >
              {fr ? "Se connecter" : "Log in"}
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-5">
          {/* ── 1 + 2. HERO AND PRODUCT ──────────────────────────────────
              The whole offer is understandable without scrolling: outcome,
              mechanism, price, button, risk reversal — and the product
              itself, so "what am I actually buying" is answered on sight. */}
          <section className="grid gap-12 pt-12 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-14 md:pt-20">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-ink-700 bg-ink-800 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-mute">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-jade" />
                {c.kicker}
              </p>

              <h1 className="mt-6 text-[2.4rem] leading-[1.03] md:text-[3.6rem]">
                {c.h}
              </h1>

              <p className="mt-5 max-w-xl text-[1.1rem] leading-[1.6] text-mute md:text-[1.22rem]">
                {c.sub}
              </p>

              {/* measure → train → measure again, stated plainly.
                  A grid rather than a wrapping row of chips: at the widths
                  between a phone and a laptop the row broke after the second
                  chip and left an arrow orphaned at the start of the next
                  line, pointing at nothing. */}
              <ol className="mt-7 grid max-w-xl gap-2 sm:grid-cols-3 sm:gap-2.5">
                {c.flow.map((f) => (
                  <li
                    key={f}
                    className="flex items-baseline gap-2.5 rounded-xl border border-jade-700 bg-jade-050 px-4 py-2.5"
                  >
                    <span className="text-[13.5px] font-bold leading-snug text-bone">
                      {f}
                    </span>
                  </li>
                ))}
              </ol>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
                <Go where="hero" className="w-full sm:w-auto sm:min-w-[18rem]" />
                <p className="text-center text-[1.05rem] font-bold text-bone sm:text-left">
                  {c.priceLine}
                </p>
              </div>
              <p className="mt-3.5 text-[13px] leading-relaxed text-faint">
                {c.ctaNote}
              </p>
            </div>

            <div className="flex justify-center md:justify-end">
              <PhoneMock ui={c.ui} />
            </div>
          </section>

          <ul className="mt-12 flex flex-wrap gap-x-7 gap-y-2.5 border-y border-ink-700 py-5">
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

          {/* ── 3. THE PROBLEM ───────────────────────────────────────────
              Short on purpose. Recognition, then move on. */}
          <section className="mt-20 md:mt-28">
            <H2 tone="alarm">{c.problemH}</H2>
            <div className="mt-7 max-w-2xl border-l-2 border-alert pl-5 md:pl-7">
              {c.problem.map((p, i) => (
                <p
                  key={i}
                  className={`text-[1.1rem] leading-[1.7] ${
                    i === 0 ? "font-bold text-bone" : "text-mute"
                  } ${i ? "mt-3.5" : ""}`}
                >
                  {p}
                </p>
              ))}
            </div>
            {/* The pattern, shown. Four readings weeks apart, all landing in
                the same place — it makes the paragraph above checkable
                against his own memory before the page asks him for anything. */}
            <Image
              src={fr ? sameResultFr : sameResultEn}
              alt={c.sameResultAlt}
              sizes="(min-width: 1024px) 900px, 100vw"
              className="mt-9 h-auto w-full rounded-2xl border border-ink-700"
              placeholder="blur"
            />

            <p className="mt-9 max-w-2xl text-[1.35rem] font-bold leading-[1.4] text-alert md:text-[1.6rem]">
              {c.problemPivot}
            </p>
          </section>

          {/* ── THE PUNCH ────────────────────────────────────────────────
              Pain → urgency → CTA → explanation. This sits between the
              recognition and the mechanism because that is the moment it
              costs him something to keep reading: he has just agreed that
              nothing has changed in years, and the next thing he learns is
              that waiting makes it harder.

              Deliberately bare — one headline, one line, one button. No
              bullets, no icons, nothing underneath. It should hold roughly
              one phone screen and then let him fall straight into "there is
              a reason the same thing keeps happening". */}
          <section className="mt-14 md:mt-20">
            <div className="rounded-3xl border border-alert/40 bg-alert/[0.05] px-6 py-12 md:px-14 md:py-16">
              <h2 className="max-w-3xl text-[2rem] leading-[1.08] md:text-[3.1rem]">
                {c.urgencyBefore}
                <span className="text-alert">{c.urgencyHighlight}</span>
                {c.urgencyAfter}
              </h2>

              <p className="mt-7 max-w-2xl text-[1.05rem] leading-[1.7] text-bone md:text-[1.15rem]">
                {c.urgencyBody}
              </p>

              <p className="mt-8 text-[1.4rem] font-bold leading-tight text-bone md:text-[1.8rem]">
                {c.urgencyPunch}
              </p>

              <Go where="urgency" className="mt-9 w-full sm:w-auto sm:min-w-[19rem]" />
              <p className="mt-3.5 text-[13px] leading-relaxed text-faint">
                {c.priceLine} · {c.ctaNote}
              </p>
            </div>
          </section>

          {/* ── 9. PROOF ─────────────────────────────────────────────────
              The page's only sourced claim. The kicker says whose numbers
              these are and the methodology sits directly under them —
              "1.5–3×" with no answer to "according to who" is worse than no
              number at all. Read the note at the top of
              lib/content/direct.ts before touching these. */}
          <section className="mt-20 md:mt-28">
            <H2>{c.resultsH}</H2>
            <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.16em] text-faint">
              {c.resultsKicker}
            </p>
            <div className="mt-7 grid gap-6 sm:grid-cols-2">
              {c.results.map((r) => (
                <div key={r.multiple} className="rounded-2xl card p-6 md:p-7">
                  <p className="metric text-[3.2rem] font-bold leading-none text-jade md:text-[4rem]">
                    {r.multiple}
                  </p>
                  <p className="mt-3 text-[0.98rem] leading-snug text-mute">{r.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 max-w-2xl text-[0.92rem] leading-relaxed text-faint">
              {c.resultsNote}
            </p>

            {/* Renders only when real testimonials exist. Empty is correct
                until then — see the Testimonial type in direct.ts. */}
            {c.testimonials.length > 0 && (
              <div className="mt-12">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-faint">
                  {c.testimonialsH}
                </h3>
                <div className="mt-6 grid gap-5 md:grid-cols-3">
                  {c.testimonials.map((t) => (
                    <figure key={t.quote} className="rounded-2xl card p-6">
                      {t.before && t.after && (
                        <p className="metric mb-4 text-[1.25rem] font-bold text-jade">
                          {t.before} → {t.after}
                        </p>
                      )}
                      <blockquote className="text-[1rem] leading-[1.65] text-bone">
                        {t.quote}
                      </blockquote>
                      <figcaption className="mt-4 text-[13px] font-bold text-faint">
                        {t.who}
                      </figcaption>
                    </figure>
                  ))}
                </div>

                {/* The originals. The transcribed quotes above are what he
                    reads; these are what convince him we did not write them.
                    Cropped to the conversation — the iOS keyboard was half the
                    pixel weight and none of the proof. */}
                {c.shots.length > 0 && (
                  <div className="mt-10">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-faint">
                      {c.shotsH}
                    </h3>
                    {/* Three columns now that every front carries all three
                        messages. A screenshot written in the other language
                        gets its translation underneath — the image proves a
                        real man wrote it, the caption makes it readable. */}
                    <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {c.shots.map((s) => (
                        <figure key={s.src} className="m-0">
                          <Image
                            src={s.src}
                            alt={s.alt}
                            width={840}
                            height={900}
                            sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 100vw"
                            className="h-auto w-full rounded-2xl border border-ink-600"
                          />
                          {s.caption && (
                            <figcaption className="mt-2.5 text-[0.82rem] leading-relaxed text-faint">
                              {s.caption}
                            </figcaption>
                          )}
                        </figure>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ── 6. THE TEN DAYS ──────────────────────────────────────────
              The mechanics, placed after the desire and drawn as a rail. */}
          <section className="mt-20 md:mt-28">
            <H2>{c.timelineH}</H2>
            <p className="mt-5 max-w-2xl text-[1.05rem] leading-[1.7] text-mute">
              {c.timelineSub}
            </p>
            <div className="mt-10">
              <Timeline steps={c.timeline} />
            </div>
          </section>

          {/* ── 8. WHO IT IS FOR ─────────────────────────────────────────
              Qualifies him, and the medical line sits here where it reads
              as honesty rather than as a warning label. */}
          <section className="mt-20 md:mt-28">
            <H2>{c.whoForH}</H2>
            <ul className="mt-7 grid max-w-3xl gap-3.5 md:grid-cols-2 md:gap-x-9">
              {c.whoFor.map((w) => (
                <li key={w} className="flex gap-3 text-[1.02rem] leading-relaxed text-bone">
                  <Tick />
                  {w}
                </li>
              ))}
            </ul>
            <p className="mt-7 max-w-2xl text-[0.92rem] leading-relaxed text-faint">
              {c.whoForNote}
            </p>
          </section>

          {/* ── 10. THE OFFER ────────────────────────────────────────────
              Two prices, both true, neither struck through: 69,000 is the
              30-day programme and 7,500 is ten days of it. A strikethrough
              would invent a discount nobody was ever charged, on the one
              page whose whole argument is that everyone else makes claims
              you cannot check. The "you don't pay that today" logic does
              the same job and survives being questioned. */}
          <section className="mt-20 md:mt-28">
            <div className="rounded-3xl card p-7 md:p-11">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-faint">
                {c.offerKicker}
              </p>

              <div className="mt-5 flex flex-wrap items-end gap-x-6 gap-y-3">
                <p className="metric text-[3.6rem] font-bold leading-[0.9] text-jade md:text-[5rem]">
                  {priceOf("test")}
                </p>
                {/* The real former price, struck.
                    Muted rather than red on purpose: a red slash is the visual
                    signature of every guru discount on the internet, and this
                    page is trying to be the serious option in a category the
                    buyer already suspects. The anchor still lands; it just does
                    not announce itself as a clearance bin. */}
                {wasOf("test") && (
                  <p className="metric pb-2 text-[1.6rem] font-bold leading-none text-faint">
                    <span className="text-[0.72em] font-normal uppercase tracking-[0.14em]">
                      {c.wasLabel}{" "}
                    </span>
                    <span className="line-through decoration-2">{wasOf("test")}</span>
                  </p>
                )}
                <p className="pb-2 text-[12px] font-bold uppercase leading-relaxed tracking-[0.14em] text-faint">
                  {c.testLabel}
                  <br />
                  <span className="text-mute">
                    {c.fullLabel} · {priceOf("sprint")}
                  </span>
                </p>
              </div>

              {/* Why it fell. An unexplained drop reads as desperation, or as
                  proof the old number was invented — both cost more than the
                  discount wins. */}
              <p className="mt-5 max-w-2xl border-l-2 border-ink-600 pl-4 text-[0.95rem] leading-relaxed text-mute">
                {c.dropNote}
              </p>

              <div className="mt-7 max-w-2xl border-t border-ink-700 pt-6">
                {c.offerBody.map((p, i) => (
                  <p
                    key={i}
                    className={`leading-[1.7] ${i ? "mt-4" : ""} ${
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
                  <li key={w} className="flex gap-3 text-[0.98rem] leading-relaxed text-bone">
                    <Tick />
                    {w}
                  </li>
                ))}
              </ul>

              <Go where="offer" className="mt-9 w-full" />

              {/* micro-trust, immediately under the button */}
              <ul className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2">
                {c.payTrust.map((p) => (
                  <li key={p} className="text-[12px] font-bold text-faint">
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ── 12. FAQ ──────────────────────────────────────────────────
              Native details/summary: keyboard, screen reader, and zero
              JavaScript on a connection where every kilobyte is real. */}
          <section className="mt-20 md:mt-28">
            <H2>{c.faqH}</H2>
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
                  <p className="pb-6 pr-8 text-[1rem] leading-[1.7] text-mute">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* ── 13. CLOSE ────────────────────────────────────────────────── */}
          <section className="mt-20 md:mt-28">
            <h2 className="max-w-2xl text-[2.1rem] leading-[1.08] md:text-[3rem]">
              {c.finalH}
            </h2>
            <p className="mt-4 text-[1.2rem] font-bold text-mute md:text-[1.4rem]">
              {c.finalSub}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
              <Go where="final" className="w-full sm:w-auto sm:min-w-[18rem]" />
              <p className="text-center text-[1.05rem] font-bold text-bone sm:text-left">
                {c.priceLine}
              </p>
            </div>
            <p className="mt-3.5 text-[13px] leading-relaxed text-faint">{c.ctaNote}</p>
            <p className="mt-2 text-[13px] font-bold leading-relaxed text-faint">
              {c.finalMicro}
            </p>
          </section>

          {/* ── FOOTER ───────────────────────────────────────────────────
              No Privacy / Terms / Refund links: those pages do not exist in
              this app yet and a link to a 404 costs more trust on this
              subject than a missing link does. Add them here the day the
              routes ship. */}
          <footer className="mt-20 border-t border-ink-700 py-10">
            <Logo size="sm" />
            <p className="mt-3 text-[14px] font-bold text-mute">{c.footerTag}</p>
            <p className="mt-6 max-w-2xl text-[12px] leading-relaxed text-faint">
              {m.disclaimer}
            </p>
          </footer>
        </main>

        {/* Sticky mobile bar: price and action together, so he never has to
            scroll back up to buy. */}
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-ink-700 bg-ink-900/95 p-3 backdrop-blur md:hidden">
          <div className="flex items-center gap-3">
            <p className="shrink-0 text-[13px] font-bold leading-tight text-bone">
              {c.priceLine}
            </p>
            <Go where="sticky_mobile" className="flex-1 !px-4 !py-3.5 !text-[14px]" />
          </div>
        </div>
      </div>
    </>
  );
}
