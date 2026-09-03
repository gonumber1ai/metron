"use client";

import { useState } from "react";

/**
 * The three-question qualifier from the mockups.
 *
 * Interactive, and the pass message is hidden until all three are answered —
 * that is the whole mechanic. A man who has just tapped "Yes, yes, yes" has
 * told himself he qualifies, and the page agreeing with him a second later is
 * worth more than the same sentence sitting there from the start.
 *
 * Nothing is submitted anywhere. No answer leaves the browser and none is
 * tracked: the quiz funnel already proved that asking a man to hand over his
 * answers at this point is where he leaves. He is answering himself.
 */
export function Qualifier({
  h,
  sub,
  quals,
  passH,
  passBody,
  privacyNote,
}: {
  h: string;
  sub: string;
  quals: { q: string; options: string[] }[];
  passH: string;
  passBody: string;
  privacyNote: string;
}) {
  const [picked, setPicked] = useState<Record<number, string>>({});
  const answered = Object.keys(picked).length === quals.length;

  return (
    <section className="mt-14 rounded-3xl bg-paper px-5 py-10 md:mt-20 md:px-12 md:py-14">
      <h2 className="text-center text-[1.6rem] leading-tight text-graphite md:text-[2.1rem]">{h}</h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-[1rem] leading-relaxed text-graphite-2">
        {sub}
      </p>

      <div className="mt-9 grid gap-4 md:grid-cols-3">
        {quals.map((q, i) => (
          <div key={q.q} className="rounded-2xl border border-rule bg-paper-2/50 p-5">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-jade-700 text-[13px] font-bold text-white">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="mt-4 text-[1.02rem] font-bold leading-snug text-graphite">{q.q}</p>

            <div className="mt-4 space-y-2">
              {q.options.map((o) => {
                const on = picked[i] === o;
                return (
                  <button
                    key={o}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setPicked((p) => ({ ...p, [i]: o }))}
                    className={`w-full rounded-lg border-2 px-4 py-2.5 text-center text-[13.5px] font-bold transition-colors ${
                      on
                        ? "border-jade-700 bg-jade-700 text-white"
                        : "border-rule bg-paper text-graphite-2 hover:border-jade-700/50"
                    }`}
                  >
                    {o}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Only after all three. This is the point of the section. */}
      {answered ? (
        <div className="mt-8 flex items-start gap-4 rounded-2xl border border-jade-700/30 bg-jade-700/10 px-5 py-5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-jade-700 text-white">
            <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" aria-hidden>
              <path
                d="M4 10.5 8.2 14.5 16 5.8"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div>
            <p className="text-[1.05rem] font-bold text-graphite">{passH}</p>
            <p className="mt-1 text-[0.95rem] leading-relaxed text-graphite-2">{passBody}</p>
          </div>
        </div>
      ) : (
        <p className="mt-8 border-t border-rule pt-6 text-center text-[0.95rem] text-graphite-2">
          {privacyNote}
        </p>
      )}
    </section>
  );
}
