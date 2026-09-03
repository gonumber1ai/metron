"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getF3 } from "@/lib/content/f3";
import { getMarketing } from "@/lib/content/marketing";
import { getPrices, type Plan } from "@/lib/payments";
import { track } from "@/lib/track";
import { update } from "@/lib/store";
import { Logo } from "@/components/Logo";
import { MetaPixel } from "@/components/MetaPixel";
import { Qualifier } from "@/components/Qualifier";

/**
 * Funnel 3, page 1 of 2 — mockup 1.
 *
 * Hook, qualify, show him the two futures. It does not sell: the price is in
 * the bar and the button goes to page 2, which is where the plan, the proof
 * and the offer live.
 *
 * The countdown from the mockup is not here. A clock that restarts for every
 * visitor is a lie a man catches by reopening the page.
 */
export function F3Client({
  locale,
  geoCountry,
}: {
  locale: string;
  geoCountry?: string | null;
}) {
  const fr = locale === "fr";
  const c = getF3(locale);
  const m = getMarketing(locale);
  const [country] = useState(geoCountry ?? "default");

  const prices = getPrices(country);
  const priceOf = (p: Plan) => prices.find((x) => x.plan === p)?.display ?? "";

  useEffect(() => {
    try {
      const url = new URLSearchParams(window.location.search);
      const tag = (url.get("c") ?? url.get("utm_campaign") ?? "")
        .replace(/[^a-zA-Z0-9_-]/g, "")
        .slice(0, 40);
      if (tag) update((st) => (st.campaign ? st : { ...st, campaign: tag }), locale);
    } catch {
      /* a missing tag must not break the page */
    }
    track("start_view", "f3", locale);
  }, [locale]);

  /* Page 1's buttons go to page 2, not to checkout. */
  const Go = ({ where, label, className = "" }: { where: string; label: string; className?: string }) => (
    <Link
      href={`/${locale}/f3/plan`}
      onClick={() => track("start_cta", `f3_${where}`, locale)}
      className={`flex items-center justify-center rounded-xl btn-go px-6 py-4 text-center text-[15.5px] font-bold ${className}`}
    >
      {label}
    </Link>
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
              <span className="hidden text-[10.5px] font-bold uppercase leading-tight tracking-[0.1em] text-faint sm:block">
                {c.brandLine}
              </span>
            </span>
            <Go
              where="bar"
              label={`${c.barCta}  →`}
              className="shrink-0 !py-2.5 !text-[13px]"
            />
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-5">
          {/* ── HERO ─────────────────────────────────────────────────────── */}
          <section className="grid gap-10 pt-10 md:grid-cols-[1.05fr_1fr] md:items-center md:gap-12 md:pt-14">
            <div>
              <h1 className="text-[2.5rem] leading-[1.02] md:text-[3.7rem]">
                {c.h1a}
                <br />
                {c.h1b}
                <br />
                <span className="text-jade">{c.h1c}</span>
              </h1>

              <p className="mt-6 max-w-lg text-[1.1rem] leading-[1.55] text-mute md:text-[1.2rem]">
                {c.sub}
                <span className="font-bold text-jade">{c.subHighlight}</span>
              </p>

              {/* The three-column badge block from the mockup. */}
              <div className="mt-8 grid grid-cols-3 divide-x divide-ink-700 rounded-2xl border border-ink-700 bg-ink-850">
                {c.benefits.map((b) => (
                  <div key={b.label} className="px-3 py-5 text-center">
                    <p className="text-[13px] font-bold text-bone">{b.label}</p>
                    <p className="mt-1.5 text-[11.5px] leading-snug text-faint">{b.body}</p>
                  </div>
                ))}
              </div>

              <Go where="hero" label={c.cta} className="mt-8 w-full sm:w-auto sm:min-w-[20rem]" />
              <p className="mt-3 text-[12.5px] text-faint">
                {priceOf("test")} · {c.microTrust.join(" · ")}
              </p>
            </div>

            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-ink-700 md:aspect-[1/1]">
              <Image
                src="/marketing/f3-hero.jpg"
                alt=""
                fill
                priority
                sizes="(min-width: 768px) 46vw, 100vw"
                className="object-cover"
              />
            </div>
          </section>

          {/* ── QUALIFIER ────────────────────────────────────────────────── */}
          <Qualifier
            h={c.qualH}
            sub={c.qualSub}
            quals={c.quals}
            passH={c.qualPassH}
            passBody={c.qualPassBody}
            privacyNote={c.qualPrivacy}
          />

          {/* ── WITHOUT / WITH ───────────────────────────────────────────── */}
          <section className="mt-16 md:mt-24">
            <h2 className="text-center text-[1.8rem] leading-tight md:text-[2.5rem]">{c.vsH}</h2>

            <div className="mt-9 grid gap-4 md:grid-cols-2">
              <div className="overflow-hidden rounded-3xl border border-alert/30 bg-alert/[0.04]">
                <div className="relative aspect-[16/10]">
                  <Image
                    src="/marketing/f3-without.jpg"
                    alt=""
                    fill
                    sizes="(min-width: 768px) 46vw, 100vw"
                    className="object-cover opacity-80"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-alert px-4 py-1.5 text-[12px] font-bold uppercase tracking-wide text-white">
                    {c.withoutH}
                  </span>
                </div>
                <div className="p-6">
                  <p className="text-[0.93rem] text-mute">{c.withoutSub}</p>
                  <ul className="mt-4 space-y-2.5">
                    {c.without.map((x) => (
                      <li key={x} className="flex gap-3 text-[0.98rem] leading-snug text-bone">
                        <span aria-hidden className="mt-[3px] shrink-0 text-alert">
                          <svg viewBox="0 0 20 20" className="h-[16px] w-[16px]" fill="none">
                            <path d="M5.5 5.5l9 9M14.5 5.5l-9 9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                          </svg>
                        </span>
                        {x}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="overflow-hidden rounded-3xl border border-jade/40 bg-jade-050">
                <div className="relative aspect-[16/10]">
                  <Image
                    src="/marketing/f3-with.jpg"
                    alt=""
                    fill
                    sizes="(min-width: 768px) 46vw, 100vw"
                    className="object-cover"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-jade px-4 py-1.5 text-[12px] font-bold uppercase tracking-wide text-ink-900">
                    {c.withH}
                  </span>
                </div>
                <div className="p-6">
                  <p className="text-[0.93rem] text-mute">{c.withSub}</p>
                  <ul className="mt-4 space-y-2.5">
                    {c.with.map((x) => (
                      <li key={x} className="flex gap-3 text-[0.98rem] leading-snug text-bone">
                        <span aria-hidden className="mt-[3px] shrink-0 text-jade">
                          <svg viewBox="0 0 20 20" className="h-[16px] w-[16px]" fill="none">
                            <path d="M4 10.5 8.2 14.5 16 5.8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        {x}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* The mockup says "Over 10,000+ men". There are not 10,000 men.
                This says the true version of the same thing. */}
            <p className="mt-8 text-center text-[0.98rem] leading-relaxed text-mute">
              {c.vsFooter}
            </p>

            <Go
              where="vs"
              label={c.page2Cta}
              className="mx-auto mt-8 w-full sm:w-auto sm:min-w-[22rem]"
            />
          </section>

          <footer className="mt-14 border-t border-ink-700 py-8">
            <p className="text-[12px] leading-relaxed text-faint">{m.disclaimer}</p>
          </footer>
        </main>

        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-ink-700 bg-ink-900/95 p-3 backdrop-blur md:hidden">
          <Go where="sticky" label={`${c.barCta}  →`} className="w-full" />
        </div>
      </div>
    </>
  );
}
