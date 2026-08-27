import type { Locale } from "@/lib/i18n";
import type { Lesson } from "./lesson-types";
import { lessonsEn } from "./lessons.en";
import { lessonsFr } from "./lessons.fr";

export type { Lesson };

export function getLessons(locale: Locale | string): Lesson[] {
  return locale === "fr" ? lessonsFr : lessonsEn;
}

export function getLesson(locale: Locale | string, slug: string): Lesson | undefined {
  return getLessons(locale).find((l) => l.slug === slug);
}

/** Lessons the user has reached, given the day they are on. */
export function unlockedLessons(locale: Locale | string, day: number): Lesson[] {
  return getLessons(locale).filter((l) => l.unlockDay <= day);
}
