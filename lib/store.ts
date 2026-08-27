"use client";

/**
 * Client-side persistence.
 *
 * Deliberately a thin, swappable layer. Everything the app needs goes through
 * these functions, so moving to Supabase means reimplementing this file
 * against the database and changing nothing else.
 *
 * All timestamps are stored as ISO strings in UTC and rendered locally, so a
 * user who crosses a timezone does not lose their streak or skip a day.
 */

import type { QuizResult } from "./content/quiz";

const KEY = "metron.v1";

export type Mode = "solo" | "partner";
export type Plan = "test" | "sprint";

export type Measurement = {
  /** 1 = baseline, 12 = retest, 30 = final */
  day: number;
  /** total seconds */
  seconds: number;
  mode: Mode;
  at: string;
};

export type Markers = {
  erection: number;
  energy: number;
  libido: number;
  stress: number;
  sleep: number;
  stomach: number;
  control: number;
};

export type MarkerLog = { day: number; at: string; markers: Markers };

/**
 * One training session, as timed in the app.
 *
 * `cycles` holds the seconds from the start of each cycle to the moment he hit
 * STOP. That is the number that moves first — the climb from 5 to 7 gets
 * slower before the bedroom clock does — so it is worth recording every time.
 */
export type SessionLog = {
  id: string;
  day: number;
  startedAt: string;
  /** seconds per cycle, in order */
  cycles: number[];
  /** total seconds of the whole session, stops included */
  totalSeconds: number;
  finished: boolean;
};

export type Message = { id: string; from: "user" | "coach"; text: string; at: string };

export type State = {
  /** anonymous — no real name is ever asked for */
  username?: string;
  ref: string;
  plan?: Plan;
  locale: string;
  country: string;
  startedAt?: string;
  /** the day the user is currently on */
  day: number;
  mode?: Mode;
  pinEnabled: boolean;
  quiz?: QuizResult;
  measurements: Measurement[];
  markerLogs: MarkerLog[];
  sessions: SessionLog[];
  /** when each day was marked finished — the anti-rush clock, keyed by day */
  dayCompletedAt: Record<string, string>;
  /** task ids the user has ticked, keyed by day */
  done: Record<string, string[]>;
  readLessons: string[];
  messages: Message[];
};

function makeRef(): string {
  // Not security-critical — an opaque handle for reconciling a payment.
  const b = new Uint8Array(9);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(36).padStart(2, "0")).join("");
}

export function emptyState(locale = "en"): State {
  return {
    ref: makeRef(),
    locale,
    country: "default",
    day: 0,
    pinEnabled: false,
    measurements: [],
    markerLogs: [],
    sessions: [],
    dayCompletedAt: {},
    done: {},
    readLessons: [],
    messages: [],
  };
}

export function load(locale = "en"): State {
  if (typeof window === "undefined") return emptyState(locale);
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyState(locale);
    return { ...emptyState(locale), ...(JSON.parse(raw) as State) };
  } catch {
    // Private browsing, cleared storage, or a browser blocking site data.
    return emptyState(locale);
  }
}

export function save(state: State): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable — the app still works for this session */
  }
}

export function update(fn: (s: State) => State, locale = "en"): State {
  const next = fn(load(locale));
  save(next);
  return next;
}

export function clearAll(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* nothing to do */
  }
}

/* ------------------------------------------------------------ selectors */

export function baseline(s: State): Measurement | undefined {
  return s.measurements.find((m) => m.day === 1);
}

export function retest(s: State): Measurement | undefined {
  return s.measurements.find((m) => m.day === 12);
}

export function finalTest(s: State): Measurement | undefined {
  return s.measurements.find((m) => m.day === 30);
}

export function latest(s: State): Measurement | undefined {
  return [...s.measurements].sort((a, b) => b.day - a.day)[0];
}

export function sessionsFor(s: State, day: number): SessionLog[] {
  return s.sessions.filter((x) => x.day === day);
}

/** Average cycle length across every session, used for the trend line. */
export function avgCycle(s: SessionLog): number {
  if (!s.cycles.length) return 0;
  return Math.round(s.cycles.reduce((a, b) => a + b, 0) / s.cycles.length);
}

/* ------------------------------------------------------- the anti-rush gate */

/**
 * A day cannot be finished less than this long after the previous one.
 *
 * Without it a man can tap through twelve days in an evening, log a flattering
 * Day 12, and ask for his money back. 18 hours lets someone who trains at 9pm
 * carry on the next evening at 8pm without being locked out, while making it
 * impossible to run the whole programme overnight.
 */
export const MIN_DAY_GAP_HOURS = 18;

/** Same idea for the nightly markers — one honest entry per day. */
export const MIN_MARKER_GAP_HOURS = 18;

export type Gate =
  | { ok: true }
  | { ok: false; reason: "incomplete"; missing: number }
  | { ok: false; reason: "too-soon"; unlocksAt: string; hoursLeft: number };

function hoursSince(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / 36e5;
}

/**
 * Can he move to the next day?
 *
 * Two conditions: today's required work is ticked, and enough real time has
 * passed since the previous day was finished.
 */
export function dayGate(s: State, day: number, requiredIds: string[]): Gate {
  const done = tasksDone(s, day);
  const missing = requiredIds.filter((id) => !done.includes(id)).length;
  if (missing > 0) return { ok: false, reason: "incomplete", missing };

  // Day 0 has no predecessor, so nothing to wait for.
  const prev = s.dayCompletedAt[String(day - 1)];
  if (day > 0 && prev) {
    const elapsed = hoursSince(prev);
    if (elapsed < MIN_DAY_GAP_HOURS) {
      const unlocks = new Date(
        new Date(prev).getTime() + MIN_DAY_GAP_HOURS * 36e5,
      ).toISOString();
      return {
        ok: false,
        reason: "too-soon",
        unlocksAt: unlocks,
        hoursLeft: Math.max(1, Math.ceil(MIN_DAY_GAP_HOURS - elapsed)),
      };
    }
  }
  return { ok: true };
}

/** Stamps the day as finished and moves him on. */
export function completeDay(s: State, day: number, lastDay: number): State {
  return {
    ...s,
    dayCompletedAt: { ...s.dayCompletedAt, [String(day)]: new Date().toISOString() },
    day: Math.min(lastDay, day + 1),
  };
}

/** Markers are once a day, for the same reason. */
export function markerGate(s: State): Gate {
  const last = [...s.markerLogs].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  )[0];
  if (!last) return { ok: true };
  const elapsed = hoursSince(last.at);
  if (elapsed < MIN_MARKER_GAP_HOURS) {
    return {
      ok: false,
      reason: "too-soon",
      unlocksAt: new Date(new Date(last.at).getTime() + MIN_MARKER_GAP_HOURS * 36e5).toISOString(),
      hoursLeft: Math.max(1, Math.ceil(MIN_MARKER_GAP_HOURS - elapsed)),
    };
  }
  return { ok: true };
}

/** Did Day 12 actually beat Day 1? Drives whether we offer the 30-day at all. */
export function improved(s: State): boolean {
  const b = baseline(s);
  const r = retest(s);
  if (!b || !r) return false;
  return r.seconds > b.seconds;
}

export function tasksDone(s: State, day: number): string[] {
  return s.done[String(day)] ?? [];
}

export function isDone(s: State, day: number, taskId: string): boolean {
  return tasksDone(s, day).includes(taskId);
}

export function toggleTask(s: State, day: number, taskId: string): State {
  const key = String(day);
  const current = s.done[key] ?? [];
  const next = current.includes(taskId)
    ? current.filter((t) => t !== taskId)
    : [...current, taskId];
  return { ...s, done: { ...s.done, [key]: next } };
}

/** Consecutive days, counting back from the current one, with any task ticked. */
export function streak(s: State): number {
  let n = 0;
  for (let d = s.day; d >= 0; d--) {
    if ((s.done[String(d)] ?? []).length > 0) n++;
    else break;
  }
  return n;
}

export function formatDuration(seconds: number, locale = "en"): string {
  const m = Math.floor(seconds / 60);
  const sec = seconds % 60;
  if (m === 0) return locale === "fr" ? `${sec} s` : `${sec}s`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}
