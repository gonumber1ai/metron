import { test } from "node:test";
import assert from "node:assert/strict";
import { dayState, opensAt, H } from "../lib/gating";
import { fold, recoveryDue, recoveryMessage, day1Message, type Ev, type PayRow } from "../lib/crm";
import { BUCKETS, bucketSeconds, aboutLabel } from "../lib/estimate";

/* Brief 2 — signed up, did not measure. */

const now = Date.parse("2026-09-19T12:00:00Z");
const iso = (t: number) => new Date(t).toISOString();

test("1.1 — five buckets, the stored seconds are the midpoints", () => {
  assert.deepEqual(BUCKETS.map((b) => b.seconds), [30, 90, 150, 240, 360]);
  assert.equal(bucketSeconds("2_3"), 150);
  assert.equal(aboutLabel("2_3", "en"), "about 2-3 minutes".replace("-", "–"));
  assert.equal(aboutLabel("u1", "fr"), "moins d'une minute");
});

test("1.2 — paid on an estimate: Day 2 waits for the number, then opens at once", () => {
  // Day 1 closed on an estimate 30h ago, paid, no baseline.
  const p = { completed: { 1: iso(now - 30 * H) } };
  assert.deepEqual(dayState(2, "p10", p, now), { state: "locked", reason: "measure" });
  // He measured 5 minutes ago: no 18-hour wait.
  const p2 = { ...p, baselineAt: iso(now - 5 * 60_000) };
  assert.equal(opensAt(2, p2), now - 5 * 60_000);
  assert.equal(dayState(2, "p10", p2, now).state, "open");
  // A baseline taken inside Day 1 keeps the usual 18 hours.
  const p3 = { completed: { 1: iso(now - 10 * H) }, baselineAt: iso(now - 10.1 * H) };
  assert.equal(dayState(2, "p10", p3, now).state, "locked");
  assert.equal((dayState(2, "p10", p3, now) as { reason: string }).reason, "wait");
  // Free men still hit the paywall first.
  assert.deepEqual(dayState(2, "free", p, now), { state: "locked", reason: "pay" });
});

test("3 — four branches, two sends max, silence after; measured stops everything", () => {
  const t0 = now - 21 * H;
  // signed up 21h ago, nothing else → first message due
  assert.deepEqual(recoveryDue({ signedUpAt: iso(t0), estimatedAt: null, measuredAt: null, paidAt: null }, 0, now), { branch: "signed_up", step: 1, dueAt: t0 + 20 * H });
  // one sent, 3 days not yet up → nothing
  assert.equal(recoveryDue({ signedUpAt: iso(t0), estimatedAt: null, measuredAt: null, paidAt: null }, 1, now), null);
  // one sent, 3 days up → second
  assert.equal(recoveryDue({ signedUpAt: iso(now - 73 * H), estimatedAt: null, measuredAt: null, paidAt: null }, 1, now)?.step, 2);
  // two sent → never a third
  assert.equal(recoveryDue({ signedUpAt: iso(now - 500 * H), estimatedAt: null, measuredAt: null, paidAt: null }, 2, now), null);
  // estimated 21h ago, not paid
  assert.equal(recoveryDue({ signedUpAt: iso(t0 - H), estimatedAt: iso(t0), measuredAt: null, paidAt: null }, 0, now)?.branch, "estimated");
  // paid on estimate 21h ago, not measured
  assert.equal(recoveryDue({ signedUpAt: iso(t0 - 2 * H), estimatedAt: iso(t0 - H), measuredAt: null, paidAt: iso(t0) }, 0, now)?.branch, "paid_unmeasured");
  // paid on a real number → nothing, ever
  assert.equal(recoveryDue({ signedUpAt: iso(t0 - 2 * H), estimatedAt: null, measuredAt: iso(t0 - H), paidAt: iso(t0) }, 0, now), null);
  // measured → stop
  assert.equal(recoveryDue({ signedUpAt: iso(t0), estimatedAt: iso(t0), measuredAt: iso(now - H), paidAt: null }, 0, now), null);
  // 19h → not yet
  assert.equal(recoveryDue({ signedUpAt: iso(now - 19 * H), estimatedAt: null, measuredAt: null, paidAt: null }, 0, now), null);
});

test("3 — the messages never carry the number or the estimate", () => {
  for (const b of ["signed_up", "estimated", "paid_unmeasured"] as const) {
    for (const s of [1, 2] as const) {
      for (const l of ["en", "fr"] as const) {
        const m = day1Message(b, s, l, "https://metron.life/en/app/day/1");
        assert.doesNotMatch(m, /\d:\d\d|minutes? \d|about \d|environ \d/);
        assert.match(m, /metron\.life/);
      }
    }
  }
  assert.equal(day1Message("signed_up", 1, "en", "L"), "Your first session takes 5 minutes. L");
  assert.equal(day1Message("paid_unmeasured", 1, "en", "L"), "Day 2 is waiting on your Day 1 measurement. About 5 minutes. L");
});

function ev(ref: string, name: string, at: number, extra: Partial<Ev> = {}): Ev {
  return { ref, name, detail: null, campaign: null, locale: "en", created_at: iso(at), session: "s1", funnel: "5k-en", page: "/en/f/5k", cta: null, ...extra };
}

test("4 — the fold knows his Day 1 path and splits paywall and paid by it", () => {
  const pay: PayRow = { ref: "b", amount_minor: 4900, currency: "XAF", plan: "test", status: "paid", funnel: "5k-en", created_at: iso(now - H) };
  const r = fold({
    events: [
      ev("a", "signup", now - 30 * H),
      ev("b", "signup", now - 30 * H),
      ev("b", "day1_estimate", now - 29 * H, { detail: "2_3" }),
      ev("b", "paywall_view", now - 29 * H, { detail: "estimate" }),
      ev("c", "signup", now - 30 * H),
      ev("c", "day1_measured", now - 29 * H, { detail: "108" }),
      ev("c", "paywall_view", now - 29 * H, { detail: "real" }),
    ],
    intake: [], leads: [], payments: [pay], offers: [], recovery: [],
  });
  const by = Object.fromEntries(r.contacts.map((c) => [c.ref, c]));
  assert.equal(by.a.status, "signed_up");
  assert.equal(by.a.day1, "none");
  assert.equal(by.b.day1, "estimate");
  assert.equal(by.b.status, "customer");
  assert.equal(by.c.day1, "real");
  const f = r.funnels.find((x) => x.id === "5k-en")!;
  assert.equal(f.signups, 3);
  assert.equal(f.day1Measured, 1);
  assert.equal(f.day1Estimated, 1);
  assert.equal(f.paywallReal, 1);
  assert.equal(f.paywallEstimate, 1);
  assert.equal(f.paidEstimate, 1);
  assert.equal(f.paidReal, 0);
  // the message for each
  const origin = "https://metron.life";
  assert.match(recoveryMessage(by.a, origin)!.text, /^Your first session takes 5 minutes/);
  assert.match(recoveryMessage(by.b, origin)!.text, /^Day 2 is waiting on your Day 1 measurement/);
  assert.equal(recoveryMessage(by.a, origin)!.url, "https://metron.life/en/app/day/1");
  // a measured man gets the plain offer message, never a Day 1 nudge
  assert.match(recoveryMessage(by.c, origin)!.text, /Welcome back/);
});
