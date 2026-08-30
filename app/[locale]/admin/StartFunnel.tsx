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

        /* The biggest fall between two consecutive counts.
           Two rules keep this honest, and both came from it lying:
             • a step is skipped when the one before it is empty, or when it
               somehow holds MORE men than the step before — the road is not a
               strict sequence, since traffic older than the gate enters at the
               page, and dividing across that produced "300%".
             • a step is skipped when nothing has ever been recorded at it but
               men clearly got past it. pay_attempt shipped after these sales,
               so the screen announced "0% carry on" directly above a payment
               that had plainly happened. */
        const road: [string, number][] = [
          ["Saw the gate", gateViews],
          ["Passed the gate", gatePassed],
          ["Saw the page", pageViews],
          ["Pressed buy", clicked],
          ["Reached checkout", checkout],
          ["Pressed Pay", tried],
          ["Paid", paid],
        ];

        let worst: { from: string; to: string; lost: number } | null = null;
        for (let i = 1; i < road.length; i++) {
          const [fromLabel, a] = road[i - 1];
          const [toLabel, b] = road[i];
          if (a <= 0 || b > a) continue;
          const laterHasPeople = road.slice(i + 1).some(([, n]) => n > 0);
          if (b === 0 && laterHasPeople) continue;
          const lost = a - b;
          if (lost > 0 && (!worst || lost > worst.lost)) {
            worst = { from: fromLabel, to: toLabel, lost };
          }
        }

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

            <p className="text-[1.05rem] leading-relaxed text-bone">
              {worst ? (
                <>
                  Biggest loss:{" "}
                  <span className="font-bold">
                    {worst.lost} {worst.lost === 1 ? "man" : "men"}
                  </span>{" "}
                  <span className="text-mute">
                    stopped between &ldquo;{worst.from}&rdquo; and &ldquo;
                    {worst.to}&rdquo;.
                  </span>
                </>
              ) : (
                <span className="text-mute">Nobody has dropped out yet.</span>
              )}
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
              {road.map(([label, n], i) => (
                <div
                  key={label}
                  className={`rounded-xl border px-4 py-3.5 ${
                    i === road.length - 1
                      ? "border-jade-700 bg-jade-050"
                      : "border-ink-600 bg-ink-850"
                  }`}
                >
                  <p
                    className={`metric text-[1.7rem] font-bold leading-none ${
                      i === road.length - 1 ? "text-jade" : "text-bone"
                    }`}
                  >
                    {n}
                  </p>
                  <p className="mt-1.5 text-[0.8rem] leading-snug text-mute">{label}</p>
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
