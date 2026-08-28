"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getQuiz, scoreQuiz, type Answers } from "@/lib/content/quiz";
import { getDict } from "@/lib/i18n";
import { load, update } from "@/lib/store";
import { track } from "@/lib/track";
import { Logo } from "@/components/Logo";

export function QuizClient({ locale }: { locale: string }) {
  const t = getDict(locale);
  const router = useRouter();
  const questions = useMemo(() => getQuiz(locale), [locale]);

  // The ad lands here, so the first screen has to do a landing page's job in
  // one viewport: say what this is, why the answers matter, and ask for
  // honesty before he starts rather than after he has already rounded up.
  const [started, setStarted] = useState(false);
  // One break, after question 5. The Coach runs several because their quiz is
  // thirty questions long and needs the rest stops; ours is nine, so a second
  // one would just be another screen between him and the end.
  const [midShown, setMidShown] = useState(false);
  const MID_AFTER = 4;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [echo, setEcho] = useState<string[]>([]);

  // Every question starts at the top. Without this a short answer list
  // renders below the fold, because the page keeps the scroll position of
  // the question before it — which on a long question looks like a blank
  // screen and reads as broken.
  // Stamp the ad he arrived on, once, before anything else runs.
  //
  // First touch only. A man who clicks the French ad, leaves, and comes back
  // through the English one three days later was won by the French ad —
  // re-stamping him would hand the credit to whichever ad happened to be last,
  // which is exactly backwards when you are deciding what to spend on.
  useEffect(() => {
    try {
      const url = new URLSearchParams(window.location.search);
      const tag = (url.get("c") ?? url.get("utm_campaign") ?? "")
        .replace(/[^a-zA-Z0-9_-]/g, "")
        .slice(0, 40);
      if (!tag) return;
      update((st) => (st.campaign ? st : { ...st, campaign: tag }), locale);
    } catch {
      /* a missing tag is not worth breaking the quiz over */
    }
  }, [locale]);

  const topRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [index, echo]);

  // Named blocks. A bare "3 of 9" is a countdown; a labelled block tells him
  // what he is being asked about and why, which is the difference between
  // enduring a form and answering questions.
  const BLOCKS = [
    { label: t.quiz.blockNumbers, upto: 1 },
    { label: t.quiz.blockPattern, upto: 4 },
    { label: t.quiz.blockTried, upto: 7 },
    { label: t.quiz.blockHealth, upto: 8 },
  ];
  const block = BLOCKS.find((b) => index <= b.upto) ?? BLOCKS[BLOCKS.length - 1];

  const q = questions[index];
  const picked = answers[q.id] ?? [];
  const total = questions.length;
  const pct = Math.round((index / total) * 100);
  // A single-choice question with no echo advances the moment he taps an
  // option, so its Continue button can never be pressed — it only ever sits
  // there greyed out, which reads as a step he has failed to complete. The
  // last question keeps it, because "See my result" is worth showing him.
  const needsContinue =
    q.kind === "multi" || Boolean(q.echo) || index + 1 >= total || echo.length > 0;


  function advance(next: Answers) {
    // The question NUMBER is the point of this: "18 of 35 quit on question 6"
    // tells you what to fix, where a start/finish count only says something is.
    track("quiz_answer", String(index), locale);

    if (index + 1 >= total) {
      const result = scoreQuiz(locale, next);
      update((s) => ({ ...s, locale, quiz: result }), locale);
      track("quiz_complete", result.pattern, locale);
      // Keep every completed assessment, not only the ones that turn into
      // sales. The men who answer nine questions and then walk away are the
      // clearest signal there is about what the offer is failing to do.
      void fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref: load(locale).ref, locale, quiz: result }),
        keepalive: true,
      }).catch(() => {});
      router.push(`/${locale}/result`);
      return;
    }
    if (index === MID_AFTER && !midShown) {
      setMidShown(true);
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
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-ink-700">
            <div className="mx-auto flex max-w-xl items-center justify-between px-5 py-4">
              <Logo size="sm" />
              <Link
                href={`/${locale}/login`}
                className="rounded-full border border-ink-600 bg-ink-800 px-4 py-2 text-[13px] font-bold text-bone transition-colors hover:border-jade hover:text-jade"
              >
                {locale === "fr" ? "Se connecter" : "Log in"}
              </Link>
            </div>
          </header>

          <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 pb-0 pt-8">
            <p className="inline-flex items-center gap-2 self-start rounded-full border border-ink-700 bg-ink-800 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-mute">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-jade" />
              {t.quiz.introKicker}
            </p>
            <h1 className="mt-4 text-[2.35rem] md:text-[2.9rem]">{t.quiz.introH}</h1>

            <p className="mt-4 text-[1.02rem] leading-[1.65] text-mute">{t.quiz.introP1}</p>
            <p className="mt-2.5 text-[1.02rem] leading-[1.65] text-mute">{t.quiz.introP2}</p>

            <div className="mt-7 rounded-xl border border-amber/35 bg-amber-050 px-4 py-3.5">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-amber">
                {t.quiz.introHonestH}
              </p>
              <p className="mt-1.5 text-[0.93rem] leading-relaxed text-bone">
                {t.quiz.introHonestP}
              </p>
            </div>

            <div className="sticky bottom-0 z-10 mt-auto border-t border-ink-700 bg-ink-900/95 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur md:static md:border-0 md:bg-transparent md:pt-8 md:backdrop-blur-none">
              <button
                type="button"
                onClick={() => {
                  track("quiz_start", undefined, locale);
                  setStarted(true);
                }}
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

  if (midShown && index === MID_AFTER) {
    return (
      <>
        <style>{`body{background:var(--color-ink-900);color:var(--color-bone)}`}</style>
        <div className="flex min-h-screen flex-col">
          <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-5 py-10">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-jade-050">
              <span className="text-jade">
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden>
                  <path
                    d="M5 12.5 10 17.5 19 7"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>

            <h1 className="mt-6 text-center text-[1.75rem] font-bold leading-tight tracking-tight">
              {t.quiz.midH}
            </h1>
            <p className="mt-4 text-center text-[1.02rem] leading-[1.7] text-mute">
              {t.quiz.midP}
            </p>
            <p className="mt-3 text-center text-[1.02rem] font-semibold leading-[1.7] text-bone">
              {t.quiz.midP2}
            </p>

            <button
              type="button"
              onClick={() => {
                setIndex(MID_AFTER + 1);
                setEcho([]);
              }}
              className="mt-9 w-full rounded-full btn-go px-6 py-4 text-[15.5px] font-bold"
            >
              {t.quiz.midCta}
            </button>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`body{background:var(--color-ink-900);color:var(--color-bone)}`}</style>

      <div className="flex min-h-screen flex-col">
        {/* progress */}
        <div className="sticky top-0 z-10 border-b border-ink-800 bg-ink-900/95 backdrop-blur">
          <div className="mx-auto max-w-xl px-5 pb-3 pt-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-bone">{block.label}</span>
              <span className="metric text-[13px] font-bold text-mute">
                {String(index + 1).padStart(2, "0")}
                <span className="text-faint">/{String(total).padStart(2, "0")}</span>
              </span>
            </div>
            {/* One segment per question. He can see how little is left, which a
                single continuous bar hides. */}
            <div className="mt-2.5 flex gap-1">
              {questions.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                    i < index ? "bg-jade" : i === index ? "bg-jade/60" : "bg-ink-700"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 pb-0 pt-8 md:pb-8">
          <h1 className="text-[1.95rem] leading-[1.08] md:text-[2.4rem]">{q.q}</h1>
          {q.help && (
            <p className="mt-2.5 text-[0.97rem] leading-relaxed text-mute">{q.help}</p>
          )}
          {q.kind === "multi" && (
            <p className="mt-2.5 inline-flex self-start rounded-md bg-ink-800 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-mute">
              {t.quiz.selectAll}
            </p>
          )}

          <div ref={topRef} className="mt-7 space-y-2.5">
            {q.options.map((o) => {
              const on = picked.includes(o.id);
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => choose(o.id)}
                  aria-pressed={on}
                  className={`relative flex w-full items-center gap-3.5 overflow-hidden rounded-xl border px-5 py-[19px] text-left text-[1.04rem] font-medium leading-snug transition-all active:scale-[0.995] ${
                    on
                      ? "border-jade bg-jade-050 text-bone"
                      : "border-ink-700 bg-ink-800 text-bone hover:border-ink-500"
                  }`}
                >
                  {on && (
                    <span
                      aria-hidden
                      className="absolute inset-y-0 left-0 w-[3px] bg-jade"
                    />
                  )}
                  <span
                    aria-hidden
                    className={`grid h-[22px] w-[22px] shrink-0 place-items-center border-2 transition-colors ${
                      q.kind === "multi" ? "rounded-[6px]" : "rounded-full"
                    } ${on ? "border-jade bg-jade" : "border-ink-500"}`}
                  >
                    {on && (
                      <svg viewBox="0 0 12 12" className="h-3.5 w-3.5 text-ink-900" fill="none">
                        <path
                          d="M2.5 6.2 4.8 8.5 9.5 3.8"
                          stroke="currentColor"
                          strokeWidth="2.4"
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
          {(needsContinue || index > 0) && (
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
            {needsContinue && (
              <button
                type="button"
                disabled={picked.length === 0}
                onClick={next}
                className="flex-1 rounded-full btn-go px-6 py-4 text-[15px] font-bold transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
              >
                {index + 1 >= total ? t.cta.seeResult : t.cta.continue}
              </button>
            )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
