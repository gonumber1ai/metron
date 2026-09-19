import { test } from "node:test";
import assert from "node:assert/strict";
import { dayState, currentDay, canLogMarkers, canMeasure, opensAt, H } from "../lib/gating";

const now = Date.parse("2026-09-19T12:00:00Z");
const iso = (t: number) => new Date(t).toISOString();
// Brief 2: a paid man without a real Day 1 number is locked on "measure", so
// every paid fixture below carries one.
const B = { baselineAt: iso(now - 200 * H) };

test("free: Day 1 open, Day 2 is the paywall, Program viewing is not gated here", () => {
  assert.equal(dayState(1, "free", { completed: {} }, now).state, "open");
  assert.deepEqual(dayState(2, "free", { completed: {} }, now), { state: "locked", reason: "pay" });
  assert.deepEqual(dayState(2, "free", { completed: { 1: iso(now - 30 * H) } }, now), { state: "locked", reason: "pay" });
});

test("p10: 18h after the previous checklist; Day 12 is 36h after Day 10; Day 11 never opens", () => {
  const p = { ...B, completed: { 1: iso(now - 20 * H) } };
  assert.equal(dayState(2, "p10", p, now).state, "open");
  const p2 = { ...B, completed: { 1: iso(now - 20 * H), 2: iso(now - 10 * H) } };
  const s = dayState(3, "p10", p2, now);
  assert.equal(s.state, "locked");
  assert.equal((s as { reason: string }).reason, "wait");
  assert.equal(opensAt(3, p2), now - 10 * H + 18 * H);
  const p10 = { ...B, completed: { 10: iso(now - 20 * H) } };
  assert.equal(dayState(12, "p10", p10, now).state, "locked", "20h is not 36h");
  assert.equal(dayState(12, "p10", { ...B, completed: { 10: iso(now - 37 * H) } }, now).state, "open");
  assert.equal(dayState(11, "p10", { ...B, completed: { 10: iso(now - 100 * H) } }, now).state, "locked");
  assert.equal(dayState(4, "p10", { ...B, completed: { 1: iso(now) } }, now).state, "locked", "cannot skip");
});

test("p30: Day 13 opens the moment he buys if Day 12 is done; 13+ locked on p10", () => {
  const p = { ...B, completed: { 12: iso(now - 1 * H) } };
  assert.equal(dayState(13, "p30", p, now).state, "open");
  assert.deepEqual(dayState(13, "p10", p, now), { state: "locked", reason: "pay" });
  assert.equal(dayState(13, "p30", { ...B, completed: {} }, now).state, "locked");
});

test("currentDay is the first unfinished day he may open, else the last one he finished", () => {
  assert.equal(currentDay("free", { ...B, completed: {} }, now), 1);
  assert.equal(currentDay("free", { ...B, completed: { 1: iso(now) } }, now), 1, "free stays on 1");
  assert.equal(currentDay("p10", { ...B, completed: { 1: iso(now - 20 * H) } }, now), 2);
  assert.equal(currentDay("p10", { ...B, completed: { 1: iso(now - 20 * H), 2: iso(now - 1 * H) } }, now), 2, "waiting shows the day just finished");
  assert.equal(currentDay("p10", { ...B, completed: { 10: iso(now - 40 * H), 1: iso(now - 200 * H) } }, now), 2, "skips nothing");
});

test("markers once per 18h for anyone; measurements by plan and prerequisite", () => {
  assert.deepEqual(canLogMarkers({ completed: {} }, now), { ok: true });
  const r = canLogMarkers({ completed: {}, lastMarkers: iso(now - 10 * H) }, now);
  assert.equal(r.ok, false);
  assert.equal(canMeasure("baseline", "free", { completed: {} }), true);
  assert.equal(canMeasure("baseline", "free", { completed: {}, baselineAt: iso(now) }), false, "once");
  assert.equal(canMeasure("day12", "free", { completed: { 10: iso(now) } }), false);
  assert.equal(canMeasure("day12", "p10", { completed: { 10: iso(now) } }), true);
  assert.equal(canMeasure("day30", "p10", { completed: { 28: iso(now) } }), false);
  assert.equal(canMeasure("day30", "p30", { completed: { 28: iso(now) } }), true);
});
