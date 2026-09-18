/**
 * The parts of the CRM that decide money and status, tested as pure code.
 *
 *   npx tsx --test tests/crm.test.ts
 *
 * These need no database. Everything that touches Supabase is thin and is
 * exercised by walking the site (see tests/walk.md); everything that can be
 * wrong in a way that costs money — what a man is charged, what status he is
 * given, which funnel a purchase lands on — is here.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fold, recoveryMessage, type Ev, type OfferRow, type PayRow } from "../lib/crm";
import { priceFor, type OfferState } from "../lib/offers";
import { FUNNELS, TIERS, funnelFor, lastChanceUrl } from "../lib/funnels";
import { getPrices, atFullPrice } from "../lib/payments";

const H = 3_600_000;
const iso = (t: number) => new Date(t).toISOString();

function offer(over: Partial<OfferState> = {}): OfferState {
  const now = Date.now();
  return {
    ref: "abc",
    funnel: FUNNELS["1k-fr"],
    startedAt: iso(now - H),
    expiresAt: iso(now + 6 * H),
    recoveryUntil: iso(now + 54 * H),
    status: "live",
    created: false,
    expired: false,
    lastChance: false,
    ...over,
  };
}

test("four funnels, two tiers, and nothing else", () => {
  assert.equal(Object.keys(FUNNELS).length, 4);
  assert.equal(funnelFor("1k", "fr")?.name, "Funnel 1K — FR");
  assert.equal(funnelFor("5k", "en")?.name, "Funnel 5K — EN");
  assert.equal(funnelFor("9k", "fr"), null);
  assert.equal(TIERS["1k"].offer, 1000);
  assert.equal(TIERS["1k"].full, 3500);
  assert.equal(TIERS["1k"].sprint, 5000);
  assert.equal(TIERS["5k"].offer, 5000);
  assert.equal(TIERS["5k"].full, 7500);
  assert.equal(TIERS["5k"].sprint, 15000);
  assert.equal(lastChanceUrl(FUNNELS["5k-en"]), "/en/offer?go=1&lc=1");
});

test("the price book swaps the franc rows by tier and keeps the card rows", () => {
  const rows = getPrices("CM", "1k");
  const test10 = rows.find((r) => r.plan === "test" && r.currency === "XAF")!;
  assert.equal(test10.amountMinor, 1000);
  assert.equal(test10.wasMinor, 3500);
  assert.equal(atFullPrice(test10).amountMinor, 3500);
  assert.equal(rows.find((r) => r.plan === "sprint" && r.currency === "XAF")!.amountMinor, 5000);
  assert.ok(rows.some((r) => r.currency === "USD"), "card rows survive");
  // no tier: the legacy book, untouched
  assert.equal(getPrices("CM").find((r) => r.plan === "test")!.amountMinor, 2500);
});

test("what he pays: live, expired, last chance, and after the window", () => {
  assert.deepEqual(priceFor(offer(), false), { amount: 1000, reason: "offer" });
  assert.deepEqual(priceFor(offer({ expired: true }), false), { amount: 3500, reason: "full" });
  // expired, inside the window, WITH the link
  assert.deepEqual(priceFor(offer({ expired: true, lastChance: true }), true), { amount: 1000, reason: "lastchance" });
  // expired, inside the window, WITHOUT the link — the link is the thing
  assert.deepEqual(priceFor(offer({ expired: true, lastChance: true }), false), { amount: 3500, reason: "full" });
  // expired, window closed, link or not
  assert.deepEqual(priceFor(offer({ expired: true, lastChance: false }), true), { amount: 3500, reason: "full" });
  // no row at all: legacy /c traffic keeps its price
  assert.equal(priceFor(null, false).amount, TIERS["5k"].offer);
});

test("lc cannot be spent twice or after paying", () => {
  const paid = offer({ expired: true, status: "paid", lastChance: false });
  assert.equal(priceFor(paid, true).reason, "full");
});

function ev(ref: string, name: string, at: number, extra: Partial<Ev> = {}): Ev {
  return { ref, name, detail: null, campaign: null, locale: "fr", created_at: iso(at), session: "s1", funnel: "1k-fr", page: "/fr/f/1k", cta: null, ...extra };
}

test("status is derived in the right order", () => {
  const now = Date.now();
  const live: OfferRow = { ref: "r", funnel: "1k-fr", started_at: iso(now - H), expires_at: iso(now + 6 * H), recovery_until: iso(now + 54 * H), status: "live" };
  const expired: OfferRow = { ...live, expires_at: iso(now - H), recovery_until: iso(now + 47 * H), status: "expired" };
  const closed: OfferRow = { ...live, expires_at: iso(now - 60 * H), recovery_until: iso(now - 12 * H), status: "expired" };

  const base = (events: Ev[], offers: OfferRow[] = [], payments: PayRow[] = [], phone?: string) =>
    fold({ events, intake: phone ? [{ ref: "r", whatsapp: phone }] : [], leads: [], payments, offers, recovery: [] }).contacts[0];

  assert.equal(base([ev("r", "start_view", now)]).status, "new");
  assert.equal(base([ev("r", "start_view", now), ev("r", "cta_clicked", now, { cta: "buy_bar" })]).status, "engaged");
  assert.equal(base([ev("r", "start_view", now)], [], [], "677000000").status, "lead");
  assert.equal(base([ev("r", "offer_view", now)]).status, "checkout_started");
  assert.equal(base([ev("r", "offer_view", now), ev("r", "pay_pushed", now)]).status, "payment_pending");
  // expired inside the window beats everything below paid, even a USSD
  assert.equal(base([ev("r", "pay_pushed", now)], [expired]).status, "recovery_eligible");
  // window closed: back to how far he got
  assert.equal(base([ev("r", "offer_view", now)], [closed]).status, "checkout_started");
  // paid beats everything
  const pay: PayRow = { ref: "r", amount_minor: 1000, currency: "XAF", plan: "test", status: "paid", funnel: "1k-fr", created_at: iso(now) };
  assert.equal(base([ev("r", "pay_pushed", now)], [expired], [pay]).status, "customer");
  assert.equal(base([ev("r", "pay_pushed", now)], [{ ...expired, status: "recovered" }], [pay]).status, "recovered");
  // a live clock is not "recovery eligible"
  assert.equal(base([ev("r", "offer_view", now)], [live]).status, "checkout_started");
});

test("a man belongs to the funnel he first landed on; a refresh is one man", () => {
  const now = Date.now();
  const r = fold({
    events: [
      ev("a", "start_view", now - 3 * H, { funnel: "1k-fr", session: "s1" }),
      ev("a", "page_view", now - 3 * H, { funnel: "1k-fr", session: "s1" }),
      ev("a", "start_view", now - 2 * H, { funnel: "1k-fr", session: "s1" }), // refresh
      ev("a", "session_started", now - H, { funnel: "5k-fr", session: "s2" }),
      ev("a", "visitor_returned", now - H, { funnel: "5k-fr", session: "s2" }),
      ev("a", "start_view", now - H, { funnel: "5k-fr", session: "s2" }),
      ev("b", "start_view", now, { funnel: "5k-en", session: "s9", locale: "en" }),
    ],
    intake: [], leads: [], payments: [], offers: [], recovery: [],
  });
  const a = r.contacts.find((c) => c.ref === "a")!;
  assert.equal(a.firstFunnel, "1k-fr", "first touch kept");
  assert.equal(a.funnel, "5k-fr", "last touch for pricing");
  assert.equal(a.sessions, 2);
  assert.equal(a.returned, 1);
  const f1 = r.funnels.find((f) => f.id === "1k-fr")!;
  const f5 = r.funnels.find((f) => f.id === "5k-fr")!;
  assert.equal(f1.visitors, 1, "counted once on the funnel he first landed on");
  assert.equal(f5.visitors, 0, "not counted again on the second funnel");
  assert.equal(f1.returned, 1);
  assert.equal(r.funnels.find((f) => f.id === "all")!.visitors, 2);
});

test("duplicate payments are one purchase; revenue lands on the funnel", () => {
  const now = Date.now();
  const pay = (ref: string, amt: number): PayRow => ({ ref, amount_minor: amt, currency: "XAF", plan: "test", status: "paid", funnel: "5k-fr", created_at: iso(now) });
  const r = fold({
    events: [ev("x", "start_view", now - H, { funnel: "5k-fr" })],
    intake: [], leads: [],
    // the DB's unique key on provider+txn is what stops a true duplicate; the
    // fold still has to sum whatever rows exist, so two rows sum, not one.
    payments: [pay("x", 5000)],
    offers: [], recovery: [],
  });
  const f = r.funnels.find((f) => f.id === "5k-fr")!;
  assert.equal(f.paid, 1);
  assert.equal(f.revenue, 5000);
  assert.equal(r.contacts[0].status, "customer");
});

test("the recovery message is in his language with his tier and his link", () => {
  const c = fold({ events: [ev("z", "start_view", Date.now(), { funnel: "5k-en", locale: "en" })], intake: [], leads: [], payments: [], offers: [], recovery: [] }).contacts[0];
  const m = recoveryMessage(c, "https://metron.life")!;
  assert.match(m.text, /Welcome back/);
  assert.match(m.text, /5 000 FCFA/);
  assert.match(m.text, /7 500 FCFA/);
  assert.equal(m.url, "https://metron.life/en/offer?go=1&lc=1&ref=z");
  const fr = fold({ events: [ev("y", "start_view", Date.now(), { funnel: "1k-fr" })], intake: [], leads: [], payments: [], offers: [], recovery: [] }).contacts[0];
  assert.match(recoveryMessage(fr, "https://metron.life")!.text, /Vous êtes revenu.*1 000 FCFA.*3 500 FCFA/);
});
