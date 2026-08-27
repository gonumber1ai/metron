"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDict } from "@/lib/i18n";
import { type QuizResult } from "@/lib/content/quiz";
import { buildVerdict } from "@/lib/content/verdict";
import { getMarketing } from "@/lib/content/marketing";
import { getPrices } from "@/lib/payments";
import { load } from "@/lib/store";
import { track } from "@/lib/track";
import { Logo } from "@/components/Logo";

/**
 * The result page.
 *
 * Built from his own answers rather than from one of four written-out
 * profiles: his numbers, how long it has run, every product he ticked, what it
 * has cost him — then the offer. He arrives straight off the last question
 * with the problem fresh, so the page is short and every line is something he
 * told us thirty seconds ago.
 *
 * The medical note is last. It is a real safety message and also a brake, so
 * it does not sit between him and his own answers; it is repeated in the
 * confirmation email and on Day 0.
 */
export function ResultClient({ locale }: { locale: string }) {
  const t = getDict(locale);
  const m = getMarketing(locale);
  const fr = locale === "fr";
  const [quiz, setQuiz] = useState<QuizResult | null>(null);
  const [country, setCountry] = useState("default");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const s = load(locale);
    setQuiz(s.quiz ?? null);
    if (s.country) setCountry(s.country);
    try {
      const forced = new URLSearchParams(window.location.search).get("country");
      if (forced) setCountry(forced.toUpperCase());
      else if (Intl.DateTimeFormat().resolvedOptions().timeZone === "Africa/Douala") {
        setCountry("CM");
      }
    } catch {
      /* keep the default */
    }
    if (s.quiz) track("result_view", s.quiz.pattern, locale);
    setReady(true);
  }, [locale]);

  if (!ready) {
    return (
      <main className="grid min-h-screen place-items-center bg-ink-900 px-5">
        <p className="text-mute">{t.common.loading}</p>
      </main>
    );
  }

  if (!quiz) {
    return (
      <main className="grid min-h-screen place-items-center bg-ink-900 px-5 text-center">
        <div>
          <p className="text-mute">{t.quiz.title}</p>
          <Link
            href={`/${locale}/quiz`}
            className="mt-5 inline-flex rounded-full btn-go px-6 py-3 text-[15px] font-semibold"
          >
            {t.cta.start}
          </Link>
        </div>
      </main>
    );
  }

  const rows = getPrices(country);
  const priceOf = (plan: "test" | "sprint") => rows.find((r) => r.plan === plan)?.display ?? "";

  const v = buildVerdict(locale, quiz, { test: priceOf("test"), sprint: priceOf("sprint") });
  const hasMedical = quiz.flags.includes("medical");

  return (
    <>
      <style>{`body{background:var(--color-ink-900);color:var(--color-bone)}`}</style>

      <div className="min-h-screen bg-ink-900 pb-28 md:pb-0">
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
          {/* ------------------------------------------- where you are now */}
          <section className="pt-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-jade">
              {t.result.secWhere}
            </p>
            <h1 className="mt-3 text-[1.9rem] font-bold leading-tight tracking-tight md:text-[2.3rem]">
              {v.headline}
            </h1>
            <p className="mt-3 text-[1.05rem] leading-relaxed text-jade-300">{v.gap}</p>
          </section>

          {/* ------------------------------- everything he told us, answered */}
          <section className="mt-8 space-y-3">
            {v.lines.map((line, i) => (
              <div key={i} className="rounded-xl card px-4 py-3.5">
                <p className="text-[0.97rem] leading-relaxed text-bone">{line}</p>
              </div>
            ))}
          </section>

          {/* ---------------------------------------------- cost of waiting */}
          <section className="mt-10">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber">
              {t.result.secCost}
            </h2>
            <p className="mt-3 border-l-2 border-amber pl-4 text-[1.05rem] leading-[1.7] text-bone">
              {v.urgency}
            </p>
          </section>

          {/* ------------------------------------------------ what to do now */}
          <section className="mt-10">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-jade">
              {t.result.secDo}
            </h2>
          </section>

          <section className="mt-3 rounded-2xl card p-6">
            <p className="text-[1.05rem] font-bold leading-snug text-bone">{v.closeLead}</p>

            <p className="mt-4 rounded-xl border-l-2 border-jade bg-jade-050 px-4 py-3 text-[1.02rem] font-bold leading-relaxed text-bone">
              {v.closeRefund}
            </p>

            <p className="mt-4 text-[0.95rem] leading-relaxed text-mute">{v.closeHonest}</p>

            <Link
              href={`/${locale}/offer`}
              className="mt-6 flex w-full items-center justify-center rounded-full btn-go px-6 py-4 text-[15.5px] font-bold"
            >
              {t.cta.getTest}
            </Link>
            <p className="mt-3 text-center text-[12.5px] leading-relaxed text-faint">
              {t.offer.descriptorNote}
            </p>
          </section>

          {/* ------------------------------------------------ medical, last */}
          {hasMedical && (
            <section className="mt-8">
              <div className="rounded-2xl border border-amber/40 bg-amber-050 p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber">
                  {t.result.redFlagTitle}
                </p>
                <p className="mt-2 text-[0.95rem] font-bold leading-relaxed text-bone">
                  {t.medical.seeDoctor}
                </p>
                <p className="mt-2 text-[0.92rem] leading-relaxed text-mute">{t.medical.body}</p>
              </div>
            </section>
          )}

          <footer className="mt-8 border-t border-ink-700 py-8">
            <p className="text-[12px] leading-relaxed text-faint">{m.disclaimer}</p>
          </footer>
        </main>

        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-ink-700 bg-ink-900/95 p-3 backdrop-blur md:hidden">
          <Link
            href={`/${locale}/offer`}
            className="flex w-full items-center justify-center rounded-full btn-go px-6 py-3.5 text-[15px] font-bold"
          >
            {t.cta.getTest}
          </Link>
        </div>
      </div>
    </>
  );
}
