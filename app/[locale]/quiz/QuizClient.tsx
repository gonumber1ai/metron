"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getQuiz, scoreQuiz, type Answers } from "@/lib/content/quiz";
import { getDict } from "@/lib/i18n";
import { update } from "@/lib/store";

export function QuizClient({ locale }: { locale: string }) {
  const t = getDict(locale);
  const router = useRouter();
  const questions = useMemo(() => getQuiz(locale), [locale]);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [echo, setEcho] = useState<string[]>([]);

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

        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 pb-8 pt-6">
          <h1 className="text-[1.45rem] font-semibold leading-snug tracking-tight md:text-[1.7rem]">
            {q.q}
          </h1>
          {q.help && <p className="mt-2 text-[0.92rem] leading-relaxed text-mute">{q.help}</p>}
          {q.kind === "multi" && (
            <p className="mt-2 text-[0.82rem] uppercase tracking-wide text-faint">
              {t.quiz.selectAll}
            </p>
          )}

          <div className="mt-6 space-y-2.5">
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
            <div className="mt-6 space-y-2.5">
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

          <div className="mt-auto flex items-center gap-3 pt-8">
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
