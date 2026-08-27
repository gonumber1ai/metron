"use client";

import Link from "next/link";
import { getDict } from "@/lib/i18n";
import { getLessons } from "@/lib/content/lessons";
import { useMetron } from "@/components/useMetron";

export function LessonsClient({ locale }: { locale: string }) {
  const t = getDict(locale);
  const { state, ready } = useMetron(locale);
  const lessons = getLessons(locale);

  if (!ready) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <p className="text-mute">{t.common.loading}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-6 md:py-10">
      <h1 className="text-[1.7rem] font-semibold tracking-tight">{t.lessons.title}</h1>
      <p className="mt-1.5 text-[0.95rem] text-mute">{t.lessons.sub}</p>

      <ul className="mt-6 space-y-2">
        {lessons.map((l) => {
          const unlocked = l.unlockDay <= state.day;
          const read = state.readLessons.includes(l.slug);

          const inner = (
            <div
              className={`flex items-center gap-4 rounded-xl border px-4 py-4 transition-colors ${
                unlocked
                  ? "border-ink-600 bg-ink-800 hover:border-jade"
                  : "border-ink-700 bg-ink-800/40"
              }`}
            >
              <span
                className={`metric grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[13px] font-semibold ${
                  unlocked ? "bg-ink-700 text-jade" : "bg-ink-800 text-faint"
                }`}
              >
                {l.unlockDay}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={`block text-[0.98rem] font-medium leading-snug ${
                    unlocked ? "text-bone" : "text-faint"
                  }`}
                >
                  {l.title}
                </span>
                <span className="mt-0.5 block text-[0.84rem] text-faint">
                  {t.lessons.minRead.replace("{n}", String(l.minutes))}
                </span>
              </span>
              {unlocked && !read && (
                <span className="shrink-0 rounded-full bg-jade-050 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-jade">
                  {t.lessons.unread}
                </span>
              )}
            </div>
          );

          return (
            <li key={l.slug}>
              {unlocked ? (
                <Link href={`/${locale}/app/lessons/${l.slug}`}>{inner}</Link>
              ) : (
                <div aria-disabled="true">{inner}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
