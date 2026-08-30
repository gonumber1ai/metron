"use client";

import { useEffect, useState } from "react";

export type StartRow = {
  campaign: string;
  locale: string;
  gate_views: number;
  gate_passed: number;
  page_views: number;
  clicked: number;
  saw_checkout: number;
  tried_to_pay: number;
  paid: number;
};

export type CtaRow = {
  position: string;
  locale: string;
  people: number;
  presses: number;
  paid: number;
};

/**
 * The direct funnel — the gate, the sales page, the checkout.
 *
 * The Ads tab measures the quiz. This measures the other road, which is the
 * one the money is being spent to rebuild, and until now it was a black box:
 * men arrived, some paid, and nothing in between was recorded.
 *
 * Two questions only:
 *   1. Where do they fall out — the gate, the page, or the checkout?
 *   2. Which block on the page actually closes them?
 *
 * The second is the one that changes what gets written next. Five buttons sit
 * on that page and they are not equal; if the urgency block closes three men
 * for every one the hero closes, the hero is the thing to rewrite.
 */

const LABELS: Record<string, string> = {
  hero: "Hero",
  urgency: "Urgency block",
  offer: "Offer card",
  final: "Closing section",
  sticky_mobile: "Sticky bar (mobile)",
};

function pct(n: number, of: number): string {
  if (!of) return "—";
  return `${Math.round((n / of) * 100)}%`;
}

export function StartFunnel({ rows, cta }: { rows: StartRow[]; cta: CtaRow[] }) {
  /* Tag names, shared with the Ads tab on purpose — same key, so a tag named
     on either screen is named on both. The tags in the URL are deliberately
     meaningless (b1, w1) because Meta reads them and so does the man before he
     clicks; the meaning lives here, in a browser only you use. */
  const [labels, setLabels] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("metron.adlabels");
      if (raw) setLabels(JSON.parse(raw) as Record<string, string>);
    } catch {
      /* no saved names is fine — the tag still identifies the row */
    }
  }, []);

  function nameIt(key: string, v: string) {
    const next = { ...labels, [key]: v };
    setLabels(next);
    try {
      window.localStorage.setItem("metron.adlabels", JSON.stringify(next));
    } catch {
      /* private mode; the table works, it just will not remember */
    }
  }

  const keyOf = (r: StartRow) => `${r.campaign}::${r.locale}`;

  const sum = (k: keyof StartRow) =>
    rows.reduce((t, r) => t + (Number(r[k]) || 0), 0);

  const gateViews = sum("gate_views");
  const gatePassed = sum("gate_passed");
  const pageViews = sum("page_views");
  const clicked = sum("clicked");
  const checkout = sum("saw_checkout");
  const tried = sum("tried_to_pay");
  const paid = sum("paid");

  if (!rows.length && !cta.length) {
    return (
      <div className="rounded-2xl card p-6">
        <h2 className="text-[1.05rem] font-bold text-bone">Nothing here yet</h2>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-mute">
          No traffic has reached the gate or the sales page. If ads are running
          and this is still empty, check where the ad actually points — the
          funnel only fills once the link goes to <code>/wellness</code> or{" "}
          <code>/start</code>.
        </p>
        <p className="mt-3 text-[0.9rem] leading-relaxed text-faint">
          This screen also needs <code>supabase/009_start_funnel.sql</code> to
          have been run.
        </p>
      </div>
    );
  }

  /* The step that loses the most people, named in a sentence. The screen
     should answer "what do I fix" before it shows any table. */
  const steps = [
    { from: "the gate", a: gateViews, b: gatePassed },
    { from: "the sales page", a: pageViews, b: clicked },
    { from: "the checkout form", a: checkout, b: tried },
    { from: "the payment itself", a: tried, b: paid },
  ].filter((s) => s.a > 0);

  const worst = steps.length
    ? steps.reduce((w, s) => (s.b / s.a < w.b / w.a ? s : w))
    : null;

  return (
    <div className="space-y-6">
      {worst && (
        <div className="rounded-2xl card p-6">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">
            Where they are lost
          </h2>
          <p className="mt-3 text-[1.15rem] font-bold leading-snug text-bone">
            {worst.a - worst.b} of {worst.a} drop out at {worst.from}.
          </p>
          <p className="mt-2 text-[0.92rem] leading-relaxed text-mute">
            {pct(worst.b, worst.a)} carry on. That is the widest hole in the
            direct funnel right now.
          </p>
        </div>
      )}

      {/* ---------------------------------------------------------- steps */}
      <div className="rounded-2xl card p-6">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">
          The whole road
        </h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {[
            ["Saw the gate", gateViews, null],
            ["Passed it", gatePassed, gateViews],
            ["Saw the page", pageViews, gatePassed || gateViews],
            ["Pressed buy", clicked, pageViews],
            ["Reached checkout", checkout, clicked],
            ["Pressed Pay", tried, checkout],
            ["Paid", paid, tried],
          ].map(([label, n, of]) => (
            <div
              key={label as string}
              className="rounded-xl border border-ink-600 bg-ink-850 px-4 py-3.5"
            >
              <p className="metric text-[1.7rem] font-bold leading-none text-bone">
                {n as number}
              </p>
              <p className="mt-1.5 text-[0.8rem] leading-snug text-mute">
                {label as string}
              </p>
              {of ? (
                <p className="mt-1 text-[0.78rem] font-bold text-jade">
                  {pct(n as number, of as number)}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------ which CTA */}
      {cta.length > 0 && (
        <div className="rounded-2xl card p-6">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">
            Which block closes him
          </h2>
          <p className="mt-2 text-[0.9rem] leading-relaxed text-faint">
            Distinct men, not presses. The same man tapping the sticky bar three
            times is one decision.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-[0.9rem]">
              <thead>
                <tr className="text-[10.5px] uppercase tracking-[0.12em] text-faint">
                  <th className="pb-2 pr-4 font-bold">Position</th>
                  <th className="pb-2 pr-4 font-bold">Lang</th>
                  <th className="pb-2 pr-4 font-bold">Men</th>
                  <th className="pb-2 pr-4 font-bold">Presses</th>
                  <th className="pb-2 font-bold">Paid</th>
                </tr>
              </thead>
              <tbody>
                {cta.map((r) => (
                  <tr
                    key={`${r.position}::${r.locale}`}
                    className="border-t border-ink-700 text-bone"
                  >
                    <td className="py-2.5 pr-4 font-bold">
                      {LABELS[r.position] ?? r.position}
                    </td>
                    <td className="py-2.5 pr-4 uppercase text-mute">{r.locale}</td>
                    <td className="py-2.5 pr-4">{r.people}</td>
                    <td className="py-2.5 pr-4 text-mute">{r.presses}</td>
                    <td className="py-2.5 font-bold text-jade">{r.paid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------- per ad */}
      {rows.length > 0 && (
        <div className="rounded-2xl card p-6">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">
            Per ad
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[0.9rem]">
              <thead>
                <tr className="text-[10.5px] uppercase tracking-[0.12em] text-faint">
                  <th className="pb-2 pr-4 font-bold">Tag</th>
                  <th className="pb-2 pr-4 font-bold">Lang</th>
                  <th className="pb-2 pr-4 font-bold">Gate</th>
                  <th className="pb-2 pr-4 font-bold">Page</th>
                  <th className="pb-2 pr-4 font-bold">Pressed</th>
                  <th className="pb-2 pr-4 font-bold">Checkout</th>
                  <th className="pb-2 pr-4 font-bold">Tried</th>
                  <th className="pb-2 font-bold">Paid</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={`${r.campaign}::${r.locale}`}
                    className="border-t border-ink-700 text-bone"
                  >
                    <td className="py-2.5 pr-4">
                      <span className="block font-bold">{r.campaign}</span>
                      <input
                        value={labels[keyOf(r)] ?? ""}
                        onChange={(e) => nameIt(keyOf(r), e.target.value)}
                        placeholder="name it"
                        className="mt-1 w-32 rounded-md border border-ink-600 bg-ink-900 px-2 py-1 text-[12px] text-mute placeholder:text-faint focus:border-jade focus:text-bone focus:outline-none"
                      />
                    </td>
                    <td className="py-2.5 pr-4 uppercase text-mute">{r.locale}</td>
                    <td className="py-2.5 pr-4 text-mute">
                      {r.gate_passed}/{r.gate_views}
                    </td>
                    <td className="py-2.5 pr-4">{r.page_views}</td>
                    <td className="py-2.5 pr-4">{r.clicked}</td>
                    <td className="py-2.5 pr-4 text-mute">{r.saw_checkout}</td>
                    <td className="py-2.5 pr-4 text-mute">{r.tried_to_pay}</td>
                    <td className="py-2.5 font-bold text-jade">{r.paid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
