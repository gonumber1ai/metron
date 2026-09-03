"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getF3 } from "@/lib/content/f3";
import { getDirect } from "@/lib/content/direct";
import { getMarketing } from "@/lib/content/marketing";
import { getPrices, type Plan } from "@/lib/payments";
import { track } from "@/lib/track";
import { Logo } from "@/components/Logo";
import { MetaPixel } from "@/components/MetaPixel";

/**
 * Funnel 3, page 2 of 2 — mockup 2.
 *
 * The plan, what is inside a session, the proof, the two paths, the close.
 * Page 1 hooked and qualified him; this one sells.
 *
 * Reviews are imported from direct.ts rather than copied, so both funnels
 * quote the same men and a new review is added in one place. The mockup's
 * Frank/David/Mike with stock headshots are invented, and there are real ones.
 */
export function PlanClient({
  locale,
  geoCountry,
}: {
  locale: string;
  geoCountry?: string | null;
}) {
  const c = getF3(locale);
  const d = getDirect(locale);
  const m = getMarketing(locale);
  const [country] = useState(geoCountry ?? "default");

  const prices = getPrices(country);
  const priceOf = (p: Plan) => prices.find((x) => x.plan === p)?.display ?? "";
  const wasOf = (p: Plan) => prices.find((x) => x.plan === p)?.was ?? "";

  useEffect(() => {
    track("start_view", "f3_plan", locale);
  }, [locale]);

  const Go = ({
    where,
    label,
    className = "",
    tone = "go",
  }: {
    where: string;
    label: string;
    className?: string;
    tone?: "go" | "stop";
  }) => (
    <Link
      href={`/${locale}/offer`}
      onClick={() => track("start_cta", `f3plan_${where}`, locale)}
      className={`flex items-center justify-center rounded-xl ${
        tone === "go" ? "btn-go" : "btn-stop"
      } px-6 py-4 text-center text-[15.5px] font-bold ${className}`}
    >
      {label}
    </Link>
  );

  const Tick = () => (
    <span aria-hidden className="mt-[3px] shrink-0 text-jade">
      <svg viewBox="0 0 20 20" className="h-[17px] w-[17px]" fill="none">
        <path d="M4 10.5 8.2 14.5 16 5.8" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );

  const H2 = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-center text-[1.75rem] leading-[1.14] md:text-[2.5rem]">{children}</h2>
  );

  return (
    <>
      <style>{`body{background:var(--color-ink-900);color:var(--color-bone)}`}</style>
      <MetaPixel event="ViewContent" />

      <div className="min-h-screen pb-24 md:pb-0">
        <header className="sticky top-0 z-30 border-b border-ink-700 bg-ink-900/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
            <span className="flex min-w-0 items-center gap-3">
              <Logo size="sm" />
              <span className="hidden text-[10.5px] font-bold uppercase tracking-[0.1em] text-faint sm:block">
                {c.brandLine}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-4">
              <span className="hidden text-right sm:block">
                <span className="metric block text-[1.05rem] font-bold leading-none text-jade">
                  {priceOf("test")}
                </span>
                <span className="text-[10.5px] uppercase tracking-wide text-faint">
                  {c.tenDayLabel}
                </span>
              </span>
              <Go where="bar" label={c.barCta} className="!py-2.5 !text-[13px]" />
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-5">
          {/* ── THE 10-DAY PLAN ──────────────────────────────────────────── */}
          <section className="pt-12 md:pt-16">
            <H2>{c.flowH}</H2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-[1.02rem] leading-relaxed text-mute">
              {c.flowSub}
            </p>

            <div className="mt-10 grid gap-4 lg:grid-cols-[1fr_1.5fr_1fr]">
              <div className="rounded-3xl card p-6">
                <span className="inline-flex rounded-md bg-jade px-3 py-1 text-[12px] font-bold uppercase text-ink-900">
                  {c.flowDay1Tag}
                </span>
                <p className="mt-4 text-[1.4rem] font-bold text-bone">{c.flowDay1H}</p>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-mute">{c.flowDay1Body}</p>
              </div>

              <div className="rounded-3xl card p-6">
                <span className="inline-flex rounded-md bg-jade px-3 py-1 text-[12px] font-bold uppercase text-ink-900">
                  {c.flowTrainTag}
                </span>
                <p className="mt-4 text-[1.4rem] font-bold text-bone">{c.flowTrainH}</p>
                <div className="mt-5 grid grid-cols-2 gap-2.5">
                  {c.flowTrainPillars.map((p) => (
                    <p
                      key={p}
                      className="rounded-xl border border-ink-700 bg-ink-850 px-3 py-3 text-center text-[12px] font-bold uppercase tracking-wide text-mute"
                    >
                      {p}
                    </p>
                  ))}
                </div>
                <p className="mt-5 text-[0.95rem] leading-relaxed text-jade">{c.flowTrainNote}</p>
              </div>

              <div className="rounded-3xl card p-6">
                <span className="inline-flex rounded-md bg-jade px-3 py-1 text-[12px] font-bold uppercase text-ink-900">
                  {c.flowDay12Tag}
                </span>
                <p className="mt-4 text-[1.4rem] font-bold text-bone">{c.flowDay12H}</p>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-mute">{c.flowDay12Body}</p>
              </div>
            </div>
          </section>

          {/* ── INSIDE A SESSION ─────────────────────────────────────────── */}
          <section className="mt-16 md:mt-24">
            <H2>{c.insideH}</H2>
            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {c.inside.map((x) => (
                <div key={x.label} className="rounded-2xl card p-5">
                  <p className="text-[1rem] font-bold text-bone">{x.label}</p>
                  <p className="mt-2 text-[0.9rem] leading-relaxed text-mute">{x.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── PROOF ────────────────────────────────────────────────────── */}
          <section className="mt-16 md:mt-24">
            <H2>{c.proofH}</H2>

            <div className="mt-9 rounded-3xl card p-7 md:p-10">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-faint">
                {c.proofKicker}
              </p>
              <div className="mt-6 grid gap-7 sm:grid-cols-2">
                {c.results.map((r) => (
                  <div key={r.multiple}>
                    <p className="metric text-[3rem] font-bold leading-none text-jade md:text-[3.6rem]">
                      {r.multiple}
                    </p>
                    <p className="mt-3 text-[0.95rem] leading-snug text-mute">{r.label}</p>
                  </div>
                ))}
              </div>
              <p className="mt-7 border-t border-ink-700 pt-5 text-[0.9rem] leading-relaxed text-faint">
                {c.resultsNote}
              </p>
            </div>

            {d.testimonials.length > 0 && (
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {d.testimonials.map((t) => (
                  <figure key={t.quote} className="rounded-2xl card p-6">
                    {t.before && t.after && (
                      <p className="metric mb-4 text-[1.2rem] font-bold text-jade">
                        {t.before} <span className="text-faint">→</span> {t.after}
                      </p>
                    )}
                    <blockquote className="text-[0.98rem] leading-relaxed text-bone">
                      “{t.quote}”
                    </blockquote>
                    <figcaption className="mt-4 text-[12px] text-faint">{t.who}</figcaption>
                  </figure>
                ))}
              </div>
            )}

            {d.shots.length > 0 && (
              <>
                <p className="mt-10 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-faint">
                  {d.shotsH}
                </p>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {d.shots.map((s) => (
                    <figure key={s.src} className="rounded-2xl border border-ink-700 bg-ink-850 p-3">
                      <Image
                        src={s.src}
                        alt={s.alt}
                        width={700}
                        height={900}
                        className="h-auto w-full rounded-xl"
                      />
                      {s.caption && (
                        <figcaption className="mt-3 px-1 pb-1 text-[12px] leading-relaxed text-faint">
                          {s.caption}
                        </figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* ── CHOOSE YOUR PATH ─────────────────────────────────────────── */}
          <section className="mt-16 md:mt-24">
            <H2>{c.pathsH}</H2>
            <div className="mt-9 grid gap-4 lg:grid-cols-[1fr_1fr_0.8fr]">
              <div className="rounded-3xl border-2 border-jade bg-jade-050 p-6 md:p-7">
                <span className="inline-flex rounded-full bg-jade px-3.5 py-1 text-[11px] font-bold uppercase tracking-wide text-ink-900">
                  {c.startHere}
                </span>
                <p className="metric mt-5 text-[2.7rem] font-bold leading-none text-jade">
                  {priceOf("test")}
                </p>
                {wasOf("test") && (
                  <p className="mt-2 text-[0.95rem] text-faint line-through">{wasOf("test")}</p>
                )}
                <p className="mt-2 text-[13px] font-bold uppercase tracking-wide text-mute">
                  {c.tenDayLabel}
                </p>
                <ul className="mt-5 space-y-2.5">
                  {c.tenDayIncludes.map((x) => (
                    <li key={x} className="flex gap-2.5 text-[0.93rem] leading-snug text-bone">
                      <Tick />
                      {x}
                    </li>
                  ))}
                </ul>
                <Go where="path_10" label={c.tenDayCta} className="mt-6 w-full" />
              </div>

              <div className="rounded-3xl border border-amber/40 bg-amber-050 p-6 md:p-7">
                <span className="inline-flex rounded-full bg-amber px-3.5 py-1 text-[11px] font-bold uppercase tracking-wide text-ink-900">
                  {c.mostContinue}
                </span>
                <p className="metric mt-5 text-[2.7rem] font-bold leading-none text-amber">
                  {priceOf("sprint")}
                </p>
                <p className="mt-2 text-[13px] font-bold uppercase tracking-wide text-mute">
                  {c.thirtyDayLabel}
                </p>
                <ul className="mt-5 space-y-2.5">
                  {c.thirtyDayIncludes.map((x) => (
                    <li key={x} className="flex gap-2.5 text-[0.93rem] leading-snug text-bone">
                      <Tick />
                      {x}
                    </li>
                  ))}
                </ul>
                <Go where="path_30" label={c.thirtyDayCta} tone="stop" className="mt-6 w-full" />
              </div>

              <div className="rounded-3xl border border-alert/35 bg-alert/[0.05] p-6 md:p-7">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-alert">
                  {c.costH}
                </p>
                <p className="mt-4 text-[0.98rem] leading-relaxed text-bone">{c.costBody}</p>
                <p className="mt-4 text-[1.05rem] font-bold leading-snug text-alert">{c.costPunch}</p>
              </div>
            </div>
          </section>

          {/* ── CLOSE ────────────────────────────────────────────────────── */}
          <section className="mt-16 md:mt-24">
            <div className="rounded-3xl card p-7 text-center md:p-12">
              <h2 className="mx-auto max-w-3xl text-[1.8rem] leading-tight md:text-[2.6rem]">
                {c.closeH}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[1.02rem] leading-relaxed text-mute">
                {c.closeSub}
              </p>
              <Go
                where="close"
                label={c.closeCta}
                className="mx-auto mt-8 w-full sm:w-auto sm:min-w-[23rem]"
              />
              <p className="mx-auto mt-5 max-w-xl text-[0.93rem] leading-relaxed text-jade-300">
                {c.guaranteeNote}
              </p>
            </div>
          </section>

          {/* ── TRUST BAR ────────────────────────────────────────────────── */}
          <section className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {c.trustBar.map((t) => (
              <div key={t.label} className="rounded-2xl border border-ink-700 bg-ink-850 px-5 py-4">
                <p className="text-[13px] font-bold text-bone">{t.label}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-faint">{t.body}</p>
              </div>
            ))}
          </section>

          <footer className="mt-14 border-t border-ink-700 py-8">
            <p className="text-[12px] leading-relaxed text-faint">{m.disclaimer}</p>
          </footer>
        </main>

        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-ink-700 bg-ink-900/95 p-3 backdrop-blur md:hidden">
          <Go where="sticky" label={`${c.barCta}`} className="w-full" />
        </div>
      </div>
    </>
  );
}
