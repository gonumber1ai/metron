"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDict } from "@/lib/i18n";
import { getPattern } from "@/lib/content/patterns";
import { formatMins, type QuizResult } from "@/lib/content/quiz";
import { getMarketing } from "@/lib/content/marketing";
import { load } from "@/lib/store";
import { Logo } from "@/components/Logo";
import { Proof } from "@/components/Proof";

/**
 * The result page.
 *
 * Order matters more than anything else here. He arrives straight off the last
 * question with the problem fresh, so:
 *
 *   his gap -> what it means -> why nothing worked -> it is getting WORSE ->
 *   the offer -> proof -> optional email -> the medical note
 *
 * Two deliberate decisions:
 *
 * 1. Nothing is gated. An earlier version asked for an email before showing
 *    the result, which put a wall in front of the one thing he came for. The
 *    capture now sits below the offer, optional, for men who want to think.
 *
 * 2. The medical note is last. It is a genuine safety message and it is also a
 *    brake, so it does not sit between him and his own answers. It is still
 *    hard to miss, and it is repeated in the confirmation email and on Day 0.
 */
export function ResultClient({ locale }: { locale: string }) {
  const t = getDict(locale);
  const m = getMarketing(locale);
  const fr = locale === "fr";
  const [quiz, setQuiz] = useState<QuizResult | null>(null);
  const [ready, setReady] = useState(false);

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    setQuiz(load(locale).quiz ?? null);
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

  const p = getPattern(locale, quiz.pattern);
  const hasMedical = quiz.flags.includes("medical");
  const nowLabel = formatMins(quiz.now, locale);

  async function saveEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return;
    setSent(true);
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: email,
          plan: "test",
          ref: load(locale).ref,
          locale,
        }),
      });
    } catch {
      /* the result is already on his screen; a failed capture changes nothing */
    }
  }

  return (
    <>
      <style>{`body{background:var(--color-ink-900);color:var(--color-bone)}`}</style>

      <div className="min-h-screen bg-ink-900 pb-28 md:pb-0">
        <header className="border-b border-ink-700">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4">
            <Logo size="sm" />
            <Link
              href={`/${locale}/login`}
              className="text-[13px] font-medium text-mute underline underline-offset-4"
            >
              {locale === "fr" ? "Se connecter" : "Log in"}
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-2xl px-5">
          {/* --------------------------------------------------------- gap */}
          <section className="pt-10 pb-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">
              {t.result.kicker}
            </p>

            <div className="mt-6 rounded-2xl card p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">
                {t.result.theGap}
              </p>
              <div className="mt-3 flex items-end gap-3">
                <span className="metric text-[4.2rem] font-bold text-jade md:text-[5.5rem]">
                  {quiz.gap}
                </span>
                <span className="pb-3 text-[1rem] text-mute">{t.result.gapUnit}</span>
              </div>
              <p className="mt-3 text-[0.98rem] leading-relaxed text-mute">
                {t.result.gapExplain
                  .replace("{now}", nowLabel)
                  .replace("{want}", formatMins(quiz.want, locale))}
              </p>
            </div>

            <div className="mt-4 rounded-2xl card p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">
                {t.result.yourType}
              </p>
              <h1 className="mt-2 text-[1.7rem] font-bold leading-tight tracking-tight md:text-[2.1rem]">
                {p.name}
              </h1>
              <p className="mt-2 text-[1rem] leading-relaxed text-jade-300">{p.strap}</p>
            </div>
          </section>

          {/* -------------------------------------------------- what it means */}
          <section className="border-t border-ink-700 py-9">
            <h2 className="text-[1.35rem] font-bold leading-snug tracking-tight">
              {t.result.whatNow}
            </h2>
            <div className="mt-4 space-y-4">
              {p.whatItMeans.map((x, i) => (
                <p key={i} className="text-[1rem] leading-[1.75] text-mute">
                  {x}
                </p>
              ))}
            </div>
          </section>

          {/* ------------------------------------------------------ why failed */}
          <section className="border-t border-ink-700 py-9">
            <h2 className="text-[1.35rem] font-bold leading-snug tracking-tight">
              {t.result.whyFailed}
            </h2>
            <div className="mt-5 space-y-3">
              {p.whyFailed.map((f) => (
                <div key={f.label} className="rounded-xl card p-4">
                  <p className="text-[0.95rem] font-bold text-bone">{f.label}</p>
                  <p className="mt-1.5 text-[0.94rem] leading-relaxed text-mute">{f.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* --------------------------------------------------- it gets worse */}
          {/* The cost of doing nothing, in his own number. A reflex is built by
              repetition, so every month he waits is a month of practice at the
              thing he is trying to undo. This is the strongest true urgency
              available and it needs no deadline or fake scarcity. */}
          <section className="border-t border-ink-700 py-9">
            <h2 className="text-[1.35rem] font-bold leading-snug tracking-tight text-amber">
              {t.result.adaptTitle}
            </h2>
            <p className="mt-4 text-[1.05rem] leading-[1.75] text-bone">
              {t.result.adaptBody.replaceAll("{now}", nowLabel)}
            </p>
          </section>

          {/* ---------------------------------------------------- bridge + CTA */}
          <section className="border-t border-ink-700 py-9">
            <p className="border-l-2 border-jade pl-4 text-[1.05rem] leading-[1.7] text-bone">
              {p.bridge}
            </p>

            <div className="mt-8 rounded-2xl card p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">
                {t.result.offerLead}
              </p>
              <h3 className="mt-2 text-[1.25rem] font-bold leading-snug">{t.offer.testName}</h3>
              <p className="mt-2 text-[0.98rem] leading-relaxed text-mute">{t.offer.testPitch}</p>

              <ul className="mt-5 space-y-2.5">
                {m.includes.slice(0, 5).map((x) => (
                  <li key={x} className="flex gap-3 text-[0.93rem] leading-relaxed text-bone">
                    <span
                      aria-hidden
                      className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-jade"
                    />
                    {x}
                  </li>
                ))}
              </ul>

              <Link
                href={`/${locale}/offer`}
                className="mt-7 flex w-full items-center justify-center rounded-full btn-go px-6 py-4 text-[15px] font-bold"
              >
                {t.cta.getTest}
              </Link>
              <p className="mt-3 text-[12.5px] leading-relaxed text-faint">
                {t.offer.descriptorNote}
              </p>
            </div>
          </section>

          {/* -------------------------------------------------------- proof */}
          {/* Proof renders its own heading — do not add one here or it prints twice. */}
          <section className="border-t border-ink-700 py-9">
            <Proof locale={locale} tone="dark" />
          </section>

          {/* ------------------------------------------- optional email capture */}
          <section className="border-t border-ink-700 py-9">
            <div className="rounded-2xl card p-5">
              <p className="text-[1rem] font-bold text-bone">{t.result.emailTitle}</p>
              <p className="mt-1.5 text-[0.92rem] leading-relaxed text-mute">
                {t.result.emailBody}
              </p>
              {sent ? (
                <p className="mt-3 text-[0.95rem] font-bold text-jade">{t.result.emailSent}</p>
              ) : (
                <form onSubmit={saveEmail} className="mt-3 flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.result.emailPlaceholder}
                    className="min-w-0 flex-1 rounded-xl border border-ink-600 bg-ink-900 px-4 py-3 text-[0.95rem] text-bone placeholder:text-faint focus:border-jade focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="shrink-0 rounded-xl border border-ink-600 px-4 py-3 text-[0.9rem] font-bold text-mute"
                  >
                    {t.result.emailSend}
                  </button>
                </form>
              )}
            </div>
          </section>

          {/* ------------------------------------------------- medical, last */}
          {hasMedical && (
            <section className="border-t border-ink-700 py-9">
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

          <footer className="border-t border-ink-700 py-8">
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
