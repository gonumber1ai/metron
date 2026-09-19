/**
 * The program transform — every Section 6 edit, checked.
 *   npx tsx --test --tsconfig tsconfig.json tests/program.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { getProgram, visibleDays } from "../lib/content/program";

const p = getProgram("en");
const all = JSON.stringify(p);

test("Day 0 is gone; Day 11 is scheduled but never a row", () => {
  assert.equal(p.days.find((d) => d.day === 0), undefined);
  assert.equal(p.days.find((d) => d.day === 11)?.hidden, true);
  assert.deepEqual(visibleDays("en", "p10").map((d) => d.day), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12]);
  assert.equal(visibleDays("en", "p30").length, 29);
});

test("every day has exactly three checklist items", () => {
  for (const d of p.days) assert.equal(d.tasks.length, 3, `day ${d.day}`);
  assert.equal(p.days.find((d) => d.day === 5)!.tasks[0].fixed, true, "rest day first item is pre-checked");
});

test("kegels start Day 3, as a line not a box", () => {
  assert.equal(p.days.find((d) => d.day === 1)!.kegels, false);
  assert.equal(p.days.find((d) => d.day === 2)!.kegels, false);
  assert.equal(p.days.find((d) => d.day === 3)!.kegels, true);
  assert.ok(!all.includes("Pelvic floor: 3 sets of 10, twice today\""), "not in any task label");
});

test("lessons moved: 6/10 to Day 1, not-a-habit to Day 5, Day 9 none, pills renamed", () => {
  assert.equal(p.days.find((d) => d.day === 1)!.lesson, "the-6-10-method");
  assert.equal(p.days.find((d) => d.day === 5)!.lesson, "not-a-habit");
  assert.equal(p.days.find((d) => d.day === 9)!.lesson, undefined);
  assert.equal(p.days.find((d) => d.day === 2)!.lesson, undefined);
  const pills = p.lessons.find((l) => l.slug === "why-pills-fail")!;
  assert.equal(pills.title, "Pills, sprays and 'herbal' products");
  assert.match(pills.body[0], /prescri/i, "prescribed-medication exception is first");
  assert.equal(p.lessons.find((l) => l.slug === "why-you-finish-fast")!.unlockDay, 1);
});

test("Day 2 opens with the training-not-a-pastime paragraph; Day 10 ends on the rest-day line", () => {
  assert.match(p.days.find((d) => d.day === 2)!.brief[0], /^These sessions are training, not a pastime/);
  assert.ok(p.days.find((d) => d.day === 10)!.brief.some((s) => s === "Tomorrow is a rest day. Day 12 you measure again — same way as Day 1."));
});

test("6.2 — nothing removed survives", () => {
  for (const bad of [
    "48-hour", "48 clear hours", "2 days since you last came", "do not come tonight",
    "No ejaculation", "no ejaculation", "no coming", "No extra masturbation", "sex REPLACES", "sex replaces",
    "message us", "refund is judged", "the refund", "whole bottleneck", "upstream of",
    "No alcohol for the 12 days", "Most men start between",
  ]) assert.ok(!all.includes(bad), `residue: ${bad}`);
});

test("6.3 — softened, not deleted", () => {
  assert.ok(all.includes("If you've never felt 6, the end arrives with no warning."));
  assert.ok(all.includes("For a lot of men it's already slower. Check yours."));
  assert.ok(all.includes("often before the clock does"));
  assert.ok(all.includes("It works fast and costs nothing."));
  assert.ok(!all.includes("Most men cannot feel the difference"));
  assert.ok(!all.includes("works in seconds"));
});

test("5.12 — exactly three essentials; foundations keep food and drop the bans", () => {
  assert.deepEqual(p.essentials.map((e) => e.id), ["sleep", "markers", "alcohol"]);
  const ids = p.foundations.map((f) => f.id);
  for (const keep of ["water", "breakfast", "lunch", "dinner", "snack", "move", "stomach"]) assert.ok(ids.includes(keep), keep);
  for (const drop of ["alcohol", "screens", "discipline", "log"]) assert.ok(!ids.includes(drop), drop);
});

test("6.4 — the day titles", () => {
  const t = (n: number) => p.days.find((d) => d.day === n)!.title;
  assert.equal(t(1), "Understand your starting point");
  assert.equal(t(4), "Hold without gripping");
  assert.equal(t(10), "Finish on your own terms");
  assert.equal(t(12), "Measure again and review");
});

test("6.5 — no porn survives only inside sessions", () => {
  assert.ok(!p.foundations.some((f) => /porn/i.test(f.label + f.detail)));
  assert.ok(p.days.find((d) => d.day === 2)!.session!.steps.some((s) => /No screen, no phone/.test(s)));
});

test("FR builds with the same structure", () => {
  const f = getProgram("fr");
  assert.equal(f.days.length, p.days.length);
  assert.equal(f.days.find((d) => d.day === 1)!.title, "Comprendre votre point de départ");
  assert.equal(f.essentials.length, 3);
});
