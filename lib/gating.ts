import { TEST_LAST_DAY, SPRINT_LAST_DAY } from "./content/program";

/**
 * Who can open what, and when. Section 7 of the brief, as one pure module.
 *
 * Everything here is a function of three things: what he has bought, which
 * checklists he has completed and when, and the clock. No component decides
 * a lock on its own; they all ask this.
 *
 * ── THE RULES ─────────────────────────────────────────────────────────────
 *   free       Day 1 fully open. Paywall after its last step. Days 2+ locked.
 *   p10        Day n+1 opens 18h after Day n's checklist is complete.
 *              Day 12 opens 36h after Day 10 — Day 11 is the gap, never a row.
 *   p30        Days 13+ 18h apart. Day 13 opens the moment he buys, if Day 12
 *              is done.
 *   markers    once per 18h, always, for anyone.
 *   measure    Day 1 free; Day 12 needs p10 and Day 10 done; Day 30 needs
 *              p30 and Day 28 done.
 *   viewing    Program and Progress are never gated.
 */

export type Plan = "free" | "p10" | "p30";
export const H = 3_600_000;
export const GAP_H = 18;

export type Progress = {
  /** day → ISO when its checklist was completed (all three items) */
  completed: Record<number, string>;
  /** ISO of the last markers log */
  lastMarkers?: string;
  baselineAt?: string;
  day12At?: string;
  day30At?: string;
};

export type DayState =
  | { state: "open" }
  | { state: "done"; at: string }
  | { state: "locked"; reason: "pay" | "measure" | "finish_today" | "wait"; opensAt?: number; needsDay?: number };

export function lastDayFor(plan: Plan): number {
  return plan === "p30" ? SPRINT_LAST_DAY : TEST_LAST_DAY;
}

/** The day he should be on: the first unfinished day he is allowed to open. */
export function currentDay(plan: Plan, p: Progress, now = Date.now()): number {
  const last = lastDayFor(plan);
  for (let d = 1; d <= last; d++) {
    if (d === 11) continue;
    if (p.completed[d]) continue;
    const s = dayState(d, plan, p, now);
    if (s.state === "open") return d;
    // locked — he is still "on" the last finished day until it opens
    return Math.max(1, prevRow(d));
  }
  return last;
}

function prevRow(d: number): number {
  return d === 12 ? 10 : d - 1;
}

/** When day `d` may open given what came before, or null if a prior day is unfinished. */
export function opensAt(d: number, p: Progress): number | null {
  if (d === 1) return 0;
  if (d === 12) {
    const at = p.completed[10];
    return at ? Date.parse(at) + 36 * H : null;
  }
  if (d === 13) {
    const at = p.completed[12];
    return at ? Date.parse(at) : null; // immediately, once bought
  }
  const at = p.completed[prevRow(d)];
  if (!at) return null;
  // Brief 2, 1.2: a man who estimated on Day 1 and measured later gets Day 2
  // the moment he measures. The 18 hours only count from a Day 1 that
  // included the measurement.
  if (d === 2 && p.baselineAt && Date.parse(p.baselineAt) > Date.parse(at)) return Date.parse(p.baselineAt);
  return Date.parse(at) + GAP_H * H;
}

export function dayState(d: number, plan: Plan, p: Progress, now = Date.now()): DayState {
  if (p.completed[d]) return { state: "done", at: p.completed[d] };
  if (d === 11) return { state: "locked", reason: "wait" };
  if (d >= 2 && plan === "free") return { state: "locked", reason: "pay" };
  if (d >= 13 && plan !== "p30") return { state: "locked", reason: "pay" };
  // Brief 2, 1.2: paid on an estimate — Day 2 waits for the real number.
  if (d >= 2 && !p.baselineAt) return { state: "locked", reason: "measure" };
  const t = opensAt(d, p);
  if (t === null) return { state: "locked", reason: "finish_today", needsDay: prevRow(d) };
  if (t > now) return { state: "locked", reason: "wait", opensAt: t };
  return { state: "open" };
}

export function canLogMarkers(p: Progress, now = Date.now()): { ok: true } | { ok: false; nextIn: number } {
  if (!p.lastMarkers) return { ok: true };
  const next = Date.parse(p.lastMarkers) + GAP_H * H;
  return next <= now ? { ok: true } : { ok: false, nextIn: next - now };
}

export function canMeasure(kind: "baseline" | "day12" | "day30", plan: Plan, p: Progress): boolean {
  if (kind === "baseline") return !p.baselineAt;
  if (kind === "day12") return plan !== "free" && Boolean(p.completed[10]) && !p.day12At;
  return plan === "p30" && Boolean(p.completed[28]) && !p.day30At;
}

/** Hours, rounded up, for "Tomorrow opens in {n}h". */
export function hoursUntil(t: number, now = Date.now()): number {
  return Math.max(1, Math.ceil((t - now) / H));
}
