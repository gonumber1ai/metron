"use client";

import { load, save, emptyState, type State } from "@/lib/store";

/**
 * After signup or login: make this device his.
 *
 * The account id becomes the device's ref, so everything the app writes
 * from here keys to the account. Then ask the server for whatever history
 * that account already has — a man logging in on a second phone gets his
 * baseline, his days and his markers back — and merge it over the local
 * state, preferring the server copy where both exist.
 */
export async function adoptAccount(uid: string, locale: string): Promise<State> {
  const local = load(locale);
  let next: State = { ...local, ref: uid };
  try {
    const res = await fetch("/api/progress", { cache: "no-store" });
    if (res.ok) {
      const j = await res.json();
      const p = j.progress as null | { plan?: string | null; day?: number; started_at?: string | null; measurements?: State["measurements"]; sessions?: State["sessions"]; markers?: State["markerLogs"] };
      if (p) {
        next = {
          ...next,
          day: Math.max(next.day, p.day ?? 0),
          startedAt: next.startedAt ?? p.started_at ?? undefined,
          measurements: (p.measurements?.length ? p.measurements : next.measurements) ?? [],
          sessions: (p.sessions?.length ? p.sessions : next.sessions) ?? [],
          markerLogs: (p.markers?.length ? p.markers : next.markerLogs) ?? [],
        };
      }
      if (j.plan === "test" || j.plan === "sprint") next = { ...next, plan: j.plan };
    }
  } catch {
    /* offline: the local copy stands */
  }
  save(next);
  return next;
}

export function forgetAccount(locale: string) {
  save(emptyState(locale));
}
