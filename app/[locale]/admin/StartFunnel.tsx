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
 * The direct funnel: gate → page → buy → checkout → pay → paid.
 *
 * One language per block, never merged. An English ad and a French ad are two
 * different offers to two different markets, and a combined percentage is a
 * number that describes neither — it moves when the traffic mix moves and
 * looks like the page changed.
 *
 * Nothing from the quiz road appears here. That separation is enforced in SQL
 * (011_two_funnels.sql), not by filtering in this component, so the Ads tab
 * and this one cannot drift apart.
 */

const POSITIONS: Record<string, string> = {
  hero: "Hero",
  urgency: "Urgency block",
  offer: "Offer card",
  final: "Closing section",
  sticky_mobile: "Sticky bar (mobile)",
};

const LANGS: { code: string; name: string }[] = [
  { code: "en", name: "English" },
  { code: "fr", name: "French" },
];

function pct(n: number, of: number): string {
  if (!of) return "—";
  return `${Math.round((n / of) * 100)}%`;
}

export function StartFunnel({ rows, cta }: { rows: StartRow[]; cta: CtaRow[] }) {
  /* Tag names, shared with the Ads tab on purpose — same key, so a tag named
     on either screen is named on both. The tags in the URL stay meaningless
     (b1, w1) because Meta reads them and so does the man before he clicks; the
     meaning lives here, in a browser only you use. */
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

  if (!rows.length && !cta.length) {
    return (
      <div className="rounded-2xl card p-6">
        <h2 className="text-[1.05rem] font-bold text-bone">Nothing here yet</h2>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-mute">
          Nobody has reached the gate or the sales page. If ads are running and
          this is still empty, check where the ad actually points — this funnel
          only fills from <code>/wellness</code> and <code>/start</code>.
        </p>
        <p className="mt-3 text-[0.9rem] leading-relaxed text-faint">
          It also needs <code>supabase/011_two_funnels.sql</code> to have been
          run.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {LANGS.map(({ code, name }) => {
        const langRows = rows.filter((r) => r.locale === code);
        const langCta = cta.filter((r) => r.locale === code);
        if (!langRows.length && !langCta.length) return null;

        const sum = (k: keyof StartRow) =>
          langRows.reduce((t, r) => t + (Number(r[k]) || 0), 0);

        const gateViews = sum("gate_views");
        const gatePassed = sum("gate_passed");
        const pageViews = sum("page_views");
        const clicked = sum("clicked");
        const checkout = sum("saw_checkout");
        const tried = sum("tried_to_pay");
        const paid = sum("paid");

        /* The step losing the most people, said in a sentence, per language.
           The screen should answer "what do I fix" before showing a table. */
        const steps = [
          { at: "the gate", a: gateViews, b: gatePassed },
          { at: "the sales page", a: pageViews, b: clicked },
          { at: "the checkout form", a: checkout, b: tried },
          { at: "the payment itself", a: tried, b: paid },
        ].filter((s) => s.a > 0);

        const worst = steps.length
          ? steps.reduce((w, s) => (s.b / s.a < w.b / w.a ? s : w))
          : null;

        const road: [string, number, number | null][] = [
          ["Saw the gate", gateViews, null],
          ["Passed it", gatePassed, gateViews],
          ["Saw the page", pageViews, gatePassed || gateViews],
          ["Pressed buy", clicked, pageViews],
          ["Reached checkout", checkout, clicked],
          ["Pressed Pay", tried, checkout],
          ["Paid", paid, tried],
        ];

        return (
          <section key={code} className="space-y-4">
            <div className="flex items-baseline gap-3 border-b border-ink-700 pb-3">
              <h2 className="text-[1.15rem] font-bold text-bone">{name}</h2>
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">
                direct funnel
              </span>
              <span className="ml-auto text-[0.85rem] text-faint">
                {paid} paid of {pageViews || gateViews} reached
              </span>
            </div>

            {worst && (
              <p className="text-[1.05rem] font-bold leading-snug text-bone">
                {worst.a - worst.b} of {worst.a} drop out at {worst.at}.{" "}
                <span className="font-normal text-mute">
                  {pct(worst.b, worst.a)} carry on — the widest hole in {name}.
                </span>
              </p>
            )}

            <div className="grid gap-3 sm:grid-cols-4 lg:grid-cols-7">
              {road.map(([label, n, of]) => (
                <div
                  key={label}
                  className="rounded-xl border border-ink-600 bg-ink-850 px-4 py-3.5"
                >
                  <p className="metric text-[1.7rem] font-bold leading-none text-bone">
                    {n}
                  </p>
                  <p className="mt-1.5 text-[0.8rem] leading-snug text-mute">{label}</p>
                  {of ? (
                    <p className="mt-1 text-[0.78rem] font-bold text-jade">
                      {pct(n, of)}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>

            {langRows.length > 0 && (
              <div className="overflow-x-auto rounded-2xl card p-5">
                <h3 className="mb-3 text-[10.5px] font-bold uppercase tracking-[0.14em] text-faint">
                  Per link
                </h3>
                <table className="w-full min-w-[620px] text-left text-[0.9rem]">
                  <thead>
                    <tr className="text-[10.5px] uppercase tracking-[0.12em] text-faint">
                      <th className="pb-2 pr-4 font-bold">Tag</th>
                      <th className="pb-2 pr-4 font-bold">Gate</th>
                      <th className="pb-2 pr-4 font-bold">Page</th>
                      <th className="pb-2 pr-4 font-bold">Pressed</th>
                      <th className="pb-2 pr-4 font-bold">Checkout</th>
                      <th className="pb-2 pr-4 font-bold">Tried</th>
                      <th className="pb-2 font-bold">Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {langRows.map((r) => {
                      const key = `${r.campaign}::${r.locale}`;
                      return (
                        <tr key={key} className="border-t border-ink-700 text-bone">
                          <td className="py-2.5 pr-4">
                            <span className="block font-bold">{r.campaign}</span>
                            <input
                              value={labels[key] ?? ""}
                              onChange={(e) => nameIt(key, e.target.value)}
                              placeholder="name it"
                              className="mt-1 w-32 rounded-md border border-ink-600 bg-ink-900 px-2 py-1 text-[12px] text-mute placeholder:text-faint focus:border-jade focus:text-bone focus:outline-none"
                            />
                          </td>
                          <td className="py-2.5 pr-4 text-mute">
                            {r.gate_passed}/{r.gate_views}
                          </td>
                          <td className="py-2.5 pr-4">{r.page_views}</td>
                          <td className="py-2.5 pr-4">{r.clicked}</td>
                          <td className="py-2.5 pr-4 text-mute">{r.saw_checkout}</td>
                          <td className="py-2.5 pr-4 text-mute">{r.tried_to_pay}</td>
                          <td className="py-2.5 font-bold text-jade">{r.paid}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {langCta.length > 0 && (
              <div className="overflow-x-auto rounded-2xl card p-5">
                <h3 className="mb-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-faint">
                  Which block closes him
                </h3>
                <p className="mb-3 text-[0.85rem] text-faint">
                  Distinct men, not taps. The same man pressing the sticky bar
                  three times is one decision.
                </p>
                <table className="w-full min-w-[420px] text-left text-[0.9rem]">
                  <thead>
                    <tr className="text-[10.5px] uppercase tracking-[0.12em] text-faint">
                      <th className="pb-2 pr-4 font-bold">Position</th>
                      <th className="pb-2 pr-4 font-bold">Men</th>
                      <th className="pb-2 pr-4 font-bold">Taps</th>
                      <th className="pb-2 font-bold">Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {langCta.map((r) => (
                      <tr
                        key={`${r.position}::${r.locale}`}
                        className="border-t border-ink-700 text-bone"
                      >
                        <td className="py-2.5 pr-4 font-bold">
                          {POSITIONS[r.position] ?? r.position}
                        </td>
                        <td className="py-2.5 pr-4">{r.people}</td>
                        <td className="py-2.5 pr-4 text-mute">{r.presses}</td>
                        <td className="py-2.5 font-bold text-jade">{r.paid}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
