"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getQuiz, scoreQuiz, type Answers } from "@/lib/content/quiz";
import { getDict } from "@/lib/i18n";
import { update } from "@/lib/store";
import { Logo } from "@/components/Logo";

export function QuizClient({ locale }: { locale: string }) {
  const t = getDict(locale);
  const router = useRouter();
  const questions = useMemo(() => getQuiz(locale), [locale]);

  // The ad lands here, so the first screen has to do a landing page's job in
  // one viewport: say what this is, why the answers matter, and ask for
  // honesty before he starts rather than after he has already rounded up.
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [echo, setEcho] = useState<string[]>([]);

  // Every question starts at the top. Without this a short answer list
  // renders below the fold, because the page keeps the scroll position of
  // the question before it — which on a long question looks like a blank
  // screen and reads as broken.
  const topRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [index, echo]);

  const q = questions[index];
  const picked = answers[q.id] ?? [];
  const total = questions.length;
  const pct = Math.round((index / total) * 100);

  function advance(next: Answers) {
    if (index + 1 >= total) {
      const result = scoreQuiz(locale, next);
      update((s) => ({ ...s, locale, quiz: result }), locale);
      router.push(`/${locale}/result`);
      return;
    }
    setIndex(index + 1);
    setEcho([]);
  }

  /**
   * Continue handler.
   *
   * On a multi-select the echo cannot fire on tap (he is still choosing), so it
   * fires here instead: first Continue shows the response to what he picked,
   * second Continue moves on. This is where the pills / herbs argument lands.
   */
  function next() {
    if (q.kind === "multi" && echo.length === 0 && q.echo) {
      // Show a response for EVERY box he ticked. Pick pills and herbs, get
      // both answers — each one is a separate objection and each needs killing.
      const order = ["pills", "herbs", "sprays", "alcohol"];
      const hits = order
        .filter((id) => picked.includes(id) && q.echo?.[id])
        .map((id) => q.echo![id]);
      if (hits.length) {
        setEcho(hits);
        return;
      }
    }
    advance(answers);
  }

  function choose(optionId: string) {
    if (q.kind === "multi") {
      // "None of these" is exclusive — picking it clears everything else.
      const isNone = optionId === "none" || optionId === "nothing";
      let next: string[];
      if (isNone) {
        next = picked.includes(optionId) ? [] : [optionId];
      } else {
        const without = picked.filter((p) => p !== "none" && p !== "nothing");
        next = without.includes(optionId)
          ? without.filter((p) => p !== optionId)
          : [...without, optionId];
      }
      setAnswers({ ...answers, [q.id]: next });
      return;
    }

    const next = { ...answers, [q.id]: [optionId] };
    setAnswers(next);

    // Reflect their own answer back before moving on. This is where the
    // assessment stops feeling like a form and starts feeling like a reading.
    const line = q.echo?.[optionId];
    if (line) {
      setEcho([line]);
      return;
    }
    window.setTimeout(() => advance(next), 160);
  }

  if (!started) {
    return (
      <>
        <style>{`body{background:var(--color-ink-900);color:var(--color-bone)}`}</style>
        <div className="flex min-h-screen flex-col bg-ink-900">
          <header className="border-b border-ink-700">
            <div className="mx-auto flex max-w-xl items-center justify-between px-5 py-4">
              <Logo size="sm" />
              <Link
                href={`/${locale}/login`}
                className="text-[13px] font-medium text-mute underline underline-offset-4"
              >
                {locale === "fr" ? "Se connecter" : "Log in"}
              </Link>
            </div>
          </header>

          <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 pb-0 pt-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-jade">
              {t.quiz.introKicker}
            </p>
            <h1 className="mt-3 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.1rem]">
              {t.quiz.introH}
            </h1>

            <p className="mt-5 text-[1.02rem] leading-[1.7] text-mute">{t.quiz.introP1}</p>
            <p className="mt-3 text-[1.02rem] leading-[1.7] text-mute">{t.quiz.introP2}</p>

            <div className="mt-6 rounded-2xl border-l-2 border-amber bg-amber-050 p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-amber">
                {t.quiz.introHonestH}
              </p>
              <p className="mt-2.5 text-[0.98rem] leading-relaxed text-bone">
                {t.quiz.introHonestP}
              </p>
              <p className="mt-2.5 text-[0.98rem] font-semibold leading-relaxed text-bone">
                {t.quiz.introHonestP2}
              </p>
            </div>

            <ul className="mt-6 space-y-2">
              {[t.quiz.introTime, t.quiz.introPrivate].map((line) => (
                <li key={line} className="flex gap-3 text-[0.93rem] leading-snug text-faint">
                  <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-jade" />
                  {line}
                </li>
              ))}
            </ul>

            <div className="sticky bottom-0 z-10 mt-auto border-t border-ink-700 bg-ink-900/95 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur md:static md:border-0 md:bg-transparent md:pt-8 md:backdrop-blur-none">
              <button
                type="button"
                onClick={() => setStarted(true)}
                className="w-full rounded-full btn-go px-6 py-4 text-[15.5px] font-bold"
              >
                {t.quiz.introStart}
              </button>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`body{background:var(--color-ink-900);color:var(--color-bone)}`}</style>

      <div className="flex min-h-screen flex-col bg-ink-900">
        {/* progress */}
        <div className="sticky top-0 z-10 bg-ink-900/95 backdrop-blur">
          <div className="h-1 w-full bg-ink-700">
            <div
              className="h-full bg-jade transition-all duration-300"
              style={{ width: `${Math.max(pct, 4)}%` }}
            />
          </div>
          <div className="mx-auto flex max-w-xl items-center justify-between px-5 py-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
              {t.quiz.kicker}
            </span>
            <span className="text-[12px] tabular-nums text-mute">
              {t.quiz.progress
                .replace("{n}", String(index + 1))
                .replace("{total}", String(total))}
            </span>
          </div>
        </div>

        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 pb-0 pt-6 md:pb-8">
          <h1 className="text-[1.45rem] font-semibold leading-snug tracking-tight md:text-[1.7rem]">
            {q.q}
          </h1>
          {q.help && <p className="mt-2 text-[0.92rem] leading-relaxed text-mute">{q.help}</p>}
          {q.kind === "multi" && (
            <p className="mt-2 text-[0.82rem] uppercase tracking-wide text-faint">
              {t.quiz.selectAll}
            </p>
          )}

          <div ref={topRef} className="mt-6 space-y-2.5">
            {q.options.map((o) => {
              const on = picked.includes(o.id);
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => choose(o.id)}
                  aria-pressed={on}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-4 text-left text-[0.98rem] leading-snug transition-colors ${
                    on
                      ? "border-jade bg-jade-050 text-bone"
                      : "border-ink-600 bg-ink-800 text-bone hover:border-ink-500 hover:bg-ink-700"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`grid h-5 w-5 shrink-0 place-items-center border transition-colors ${
                      q.kind === "multi" ? "rounded-[5px]" : "rounded-full"
                    } ${on ? "border-jade bg-jade" : "border-ink-500"}`}
                  >
                    {on && (
                      <svg viewBox="0 0 12 12" className="h-3 w-3 text-ink-900" fill="none">
                        <path
                          d="M2.5 6.2 4.8 8.5 9.5 3.8"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  {o.label}
                </button>
              );
            })}
          </div>

          {/* the answer reflected back */}
          {echo.length > 0 && (
            <div ref={topRef} className="mt-6 space-y-2.5">
              {echo.map((line, i) => (
                <div
                  key={i}
                  className="rounded-xl border-l-2 border-jade bg-ink-800 px-4 py-4"
                >
                  <p className="text-[0.95rem] leading-relaxed text-mute">{line}</p>
                </div>
              ))}
            </div>
          )}

          {/* Pinned on mobile. Continue must never require a scroll to find —
              it is the only control that matters and the answer list is often
              taller than the viewport. */}
          <div className="sticky bottom-0 z-10 mt-auto flex items-center gap-3 border-t border-ink-700 bg-ink-900/95 px-0 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur md:static md:border-0 md:bg-transparent md:pt-8 md:backdrop-blur-none">
            {index > 0 && (
              <button
                type="button"
                onClick={() => {
                  setIndex(index - 1);
                  setEcho([]);
                }}
                className="rounded-full border border-ink-600 px-5 py-3 text-[14px] font-medium text-mute hover:bg-ink-700"
              >
                {t.cta.back}
              </button>
            )}
            <button
              type="button"
              disabled={picked.length === 0}
              onClick={next}
              className="flex-1 rounded-full btn-go px-6 py-3.5 text-[15px] font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
            >
              {index + 1 >= total ? t.cta.seeResult : t.cta.continue}
            </button>
          </div>
        </main>
      </div>
    </>
  );
}
