"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The qualifying questions, one screen at a time: numbered dots across the
 * top, "Question 1 of 3", the question, options with a radio on the right.
 *
 * ── IT IS DOWN TO ONE ─────────────────────────────────────────────────────
 * The /c page now passes a single question — a commitment, not a diagnosis —
 * and every piece of multi-step furniture hides itself when the list is one
 * long. The name is stale and the three-question path still works; nothing
 * here assumes a count.
 *
 * ── ANSWERING ADVANCES ────────────────────────────────────────────────────
 * There is no Next button. Tapping an answer selects it and moves on by
 * itself, and the third answer opens the rest of the page. A Next button on a
 * single-choice question is a second tap that carries no information — it asks
 * a man to confirm a decision he has already made, three times, before he has
 * been given anything.
 *
 * The 260ms pause is deliberate: it lets the option paint as chosen before the
 * screen changes, so he sees his answer land instead of the question appearing
 * to skip. Cleared on unmount so a fast triple-tap cannot fire a stale timer
 * into an unmounted component.
 *
 * ── WHY IT ANSWERS NOTHING TO THE SERVER ──────────────────────────────────
 * No answer leaves the browser and nothing is tracked. The nine-question quiz
 * funnel already proved what happens when a man is asked to hand over answers
 * before he trusts anyone: 115 started, 52 answered nothing at all. These
 * three exist so he tells HIMSELF he qualifies. We do not need to know.
 *
 * `onDone` fires once, when the third is answered, so the page can reveal the
 * verdict and scroll him into it.
 */
export function Quiz3({
  quals,
  ofLabel,
  kicker,
  privateNote,
  onDone,
}: {
  quals: { q: string; options: string[] }[];
  /** "Question {n} of {total}" */
  ofLabel: string;
  /** Single-question mode only, where a count would say nothing. */
  kicker?: string;
  privateNote?: string;
  onDone: () => void;
}) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<Record<number, string>>({});
  const chosen = picked[i];

  const timer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  function choose(option: string) {
    // Ignore taps while a move is already queued, so a double-tap cannot skip
    // a question or fire onDone twice.
    if (timer.current) return;
    setPicked((p) => ({ ...p, [i]: option }));
    timer.current = window.setTimeout(() => {
      timer.current = null;
      if (i + 1 < quals.length) setI(i + 1);
      else onDone();
    }, 260);
  }

  const q = quals[i];
  /* Cut to one, the furniture of a multi-step form becomes a lie: dots that
     chart no progress, "Question 1 of 1", and a radio circle, which is the
     grammar of choosing between alternatives when there are none. All three
     are hidden rather than removed — the component still takes a list, and
     three questions would render exactly as they did before. */
  const single = quals.length === 1;

  return (
    <div className="rounded-3xl border border-white/10 bg-coal-800/90 p-6 backdrop-blur md:p-10">
      {!single && (
        <>
          {/* step dots */}
          <div className="mx-auto flex max-w-sm items-center">
            {quals.map((_, n) => (
              <span key={n} className="flex flex-1 items-center last:flex-none">
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-[13px] font-bold ${
                    n <= i ? "bg-lime text-black" : "bg-white/15 text-white/60"
                  }`}
                >
                  {n + 1}
                </span>
                {n < quals.length - 1 && (
                  <span
                    className={`mx-2 h-px flex-1 ${n < i ? "bg-lime" : "bg-white/15"}`}
                  />
                )}
              </span>
            ))}
          </div>

          <p className="mt-7 text-center text-[12px] font-bold uppercase tracking-[0.14em] text-lime">
            {ofLabel.replace("{n}", String(i + 1)).replace("{total}", String(quals.length))}
          </p>
        </>
      )}

      {/* The one question announcing itself. It sat in the hero as a grey
          lede with four benefit tiles and a script line between it and the
          only button that answers it — a question you have to scroll away
          from to answer is not a question, it is a caption. */}
      {single && kicker && (
        <p className="text-center text-[12px] font-bold uppercase tracking-[0.14em] text-lime">
          {kicker}
        </p>
      )}

      {q.q && (
        <h3
          className={`mx-auto max-w-lg text-center font-bold leading-snug text-white ${
            single
              ? "mt-3 text-[1.5rem] md:text-[1.9rem]"
              : "mt-3 text-[1.3rem] md:text-[1.55rem]"
          }`}
        >
          {q.q}
        </h3>
      )}

      <div className={`mx-auto max-w-lg space-y-3 ${single ? "mt-6" : "mt-7"}`}>
        {q.options.map((o) => {
          const on = chosen === o;
          return (
            <button
              key={o}
              type="button"
              aria-pressed={on}
              onClick={() => choose(o)}
              className={
                single
                  ? /* Solid lime, black text, same as every other button on
                       this page that takes a man somewhere. It was a lime
                       tint at 10% on a near-black card, which is a shade of
                       dark green — technically visible, and nothing you would
                       ever reach for. This is the only way past this screen;
                       it has to look like the way past this screen. */
                    `flex w-full items-center justify-center rounded-xl px-5 py-4 text-center text-[1.15rem] font-bold transition-transform ${
                      on ? "scale-[0.98] bg-lime text-black" : "btn-lime text-black"
                    }`
                  : `flex w-full items-center justify-between rounded-xl border px-5 py-4 text-left text-[1rem] font-medium transition-colors ${
                      on
                        ? "border-lime bg-lime/10 text-white"
                        : "border-white/15 bg-black/40 text-white/85 hover:border-white/30"
                    }`
              }
            >
              {o}
              {!single && (
                <span
                  aria-hidden
                  className={`grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full border-2 ${
                    on ? "border-lime" : "border-white/25"
                  }`}
                >
                  {on && <span className="h-[11px] w-[11px] rounded-full bg-lime" />}
                </span>
              )}
            </button>
          );
        })}
      </div>


      {privateNote && (
      <p className="mt-7 flex items-center justify-center gap-2 text-[12.5px] text-white/50">
        <span aria-hidden className="text-lime">
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
            <path
              d="M10 2.5 16 5v5c0 3.5-2.4 6.4-6 7.5-3.6-1.1-6-4-6-7.5V5l6-2.5Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        {privateNote}
      </p>
      )}
    </div>
  );
}
