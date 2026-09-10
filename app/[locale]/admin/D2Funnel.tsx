"use client";

export type D2Row = {
  campaign: string;
  locale: string;
  arrived: number;
  passed_quiz: number;
  clicked: number;
  saw_checkout: number;
  tried_to_pay: number;
  paid: number;
};

/**
 * Direct Funnel 2 — the /c challenge page, seven French Facebook links.
 *
 * ── ONE TABLE, SEVEN ROWS, ALWAYS ─────────────────────────────────────────
 * The seven links are fixed here, so every row exists from the first minute,
 * named in plain English, in the same order every time. A link that has had
 * no traffic yet shows zeros rather than being absent — an absent row and a
 * dead link look identical, and this screen has to tell them apart.
 *
 * Nothing from any other page can appear. The view is scoped to men who fired
 * start_view on /c, and this component shows only the seven known tags. A
 * stray tag or an untagged visit is listed separately underneath, so it is
 * visible without being mixed into the ads you are paying for.
 *
 * The verdict at the top is computed from the same numbers the table shows.
 */
export const D2_LINKS: { tag: string; name: string }[] = [
  { tag: "fb1", name: "Facebook FR · Ad 1" },
  { tag: "fb2", name: "Facebook FR · Ad 2" },
  { tag: "fb3", name: "Facebook FR · Ad 3" },
  { tag: "fb4", name: "Facebook FR · Ad 4" },
  { tag: "fb5", name: "Facebook FR · Ad 5" },
  { tag: "fb6", name: "Facebook FR · Ad 6" },
  { tag: "fb7", name: "Facebook FR · Ad 7" },
];

/** The six counted columns — everything on a row except its identity. */
type Counts = Omit<D2Row, "campaign" | "locale">;

/**
 * The real sequence, and what each step is a share OF.
 *
 * The quiz is NOT a gate. The sticky header button and the mobile bottom bar
 * are live from the moment a man lands, so he can press buy without answering
 * anything — which is why an earlier version of this table showed 800% and
 * 164% for "pressed a buy button": it was dividing by the quiz, a step most
 * buyers never touch. Both the quiz and the first buy press are measured
 * against `arrived`; only from the buy press onward is the funnel truly
 * sequential.
 */
const STEPS: { key: keyof Counts; label: string; of: keyof Counts | null }[] = [
  { key: "arrived", label: "Arrived", of: null },
  /* Was "Answered all 3". The /c page asks one question now — a commitment,
     not a qualification — so the count is men who pressed "Yes I can". The
     event behind it is unchanged (quiz_complete, fired on the same callback),
     which is why the numbers either side of this change are still comparable. */
  { key: "passed_quiz", label: "Said yes", of: "arrived" },
  { key: "clicked", label: "Pressed a buy button", of: "arrived" },
  { key: "saw_checkout", label: "Reached checkout", of: "clicked" },
  { key: "tried_to_pay", label: "Pressed Pay", of: "saw_checkout" },
  { key: "paid", label: "Paid", of: "tried_to_pay" },
];

const EMPTY: Omit<D2Row, "campaign" | "locale"> = {
  arrived: 0, passed_quiz: 0, clicked: 0, saw_checkout: 0, tried_to_pay: 0, paid: 0,
};

function pct(n: number, d: number): string {
  return d > 0 ? `${Math.round((n / d) * 100)}%` : "—";
}

export function D2Funnel({ rows }: { rows: D2Row[] }) {
  // Fold every locale for a tag into one row. The links are all French, but
  // a man who switches language mid-visit must not become a second row.
  const byTag = new Map<string, Omit<D2Row, "campaign" | "locale">>();
  for (const r of rows) {
    const cur = byTag.get(r.campaign) ?? { ...EMPTY };
    for (const s of STEPS) cur[s.key] = (cur[s.key] as number) + Number(r[s.key] ?? 0);
    byTag.set(r.campaign, cur);
  }

  const known = D2_LINKS.map((l) => ({ ...l, ...(byTag.get(l.tag) ?? EMPTY) }));
  const knownTags = new Set(D2_LINKS.map((l) => l.tag));
  const other = [...byTag.entries()].filter(([tag]) => !knownTags.has(tag));

  const total = known.reduce(
    (acc, r) => {
      for (const s of STEPS) acc[s.key] = (acc[s.key] as number) + (r[s.key] as number);
      return acc;
    },
    { ...EMPTY },
  );

  // The one sentence this screen exists to produce. Best = most paid; on a
  // tie, or before anyone has paid, most men who reached checkout.
  const ranked = [...known].sort(
    (a, b) => b.paid - a.paid || b.saw_checkout - a.saw_checkout || b.arrived - a.arrived,
  );
  const best = ranked[0];
  const anyTraffic = total.arrived > 0;

  // Where the funnel loses the most men, across all seven.
  // Only across steps that genuinely follow one another. The quiz is skippable,
  // so "arrived → answered all 3" is not a loss and naming it as the biggest
  // one buries the drop that is actually costing money.
  let worst: { from: string; to: string; lost: number } | null = null;
  for (const s of STEPS) {
    if (!s.of || s.key === "passed_quiz") continue;
    const from = STEPS.find((x) => x.key === s.of)!;
    const lost = (total[s.of] as number) - (total[s.key] as number);
    if (lost > (worst?.lost ?? 0)) worst = { from: from.label, to: s.label, lost };
  }

  return (
    <div className="mt-6 space-y-6">
      {/* ------------------------------------------------------ the answer */}
      <section className="rounded-2xl card p-5">
        <p className="text-[11px] font-bold uppercase tracking-wide text-faint">Direct Funnel 2</p>
        {!anyTraffic ? (
          <p className="mt-2 text-[1.05rem] leading-relaxed text-mute">
            No one has arrived yet. The seven links are below — the moment any of them gets a
            click, its row fills in.
          </p>
        ) : (
          <>
            <p className="mt-2 text-[1.25rem] font-bold leading-snug text-bone">
              {best.paid > 0
                ? `${best.name} is winning — ${best.paid} paid.`
                : `${best.name} is furthest along — ${best.saw_checkout} reached checkout, nobody has paid yet.`}
            </p>
            {worst && worst.lost > 0 && (
              <p className="mt-2 text-[0.95rem] leading-relaxed text-mute">
                Biggest loss across all seven: <strong className="text-alert">{worst.lost} men</strong>{" "}
                stopped between “{worst.from}” and “{worst.to}”.
              </p>
            )}
          </>
        )}
      </section>

      {/* -------------------------------------------------- the seven links */}
      <section className="rounded-2xl card p-5">
        <h2 className="text-[0.95rem] font-bold text-bone">The seven links</h2>
        <p className="mt-0.5 mb-4 text-[12px] text-faint">
          One row per ad, always in this order. Counts are people, not taps. “Answered all 3” and
          “Pressed a buy button” are shares of Arrived — the quiz is skippable, and the buy button
          is on screen from the moment he lands. Everything after that is a share of the column
          before it.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-[0.88rem]">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-faint">
                <th className="pb-2 pr-4 font-bold">Link</th>
                {STEPS.map((s) => (
                  <th key={s.key} className="pb-2 pr-4 font-bold">{s.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {known.map((r) => {
                const isBest = anyTraffic && r.tag === best.tag && r.arrived > 0;
                return (
                  <tr key={r.tag} className={`border-t border-ink-700 ${isBest ? "bg-jade-050/40" : ""}`}>
                    <td className="py-2.5 pr-4">
                      <span className="block font-bold text-bone">{r.name}</span>
                      <span className="metric block text-[11px] text-faint">?c={r.tag}</span>
                    </td>
                    {STEPS.map((s) => {
                      const v = r[s.key] as number;
                      const prev = s.of ? (r[s.of] as number) : null;
                      return (
                        <td key={s.key} className="metric py-2.5 pr-4">
                          <span className={s.key === "paid" ? "font-bold text-jade" : "text-bone"}>{v}</span>
                          {prev !== null && (
                            <span className="ml-1.5 text-[11px] text-faint">{pct(v, prev)}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              <tr className="border-t-2 border-ink-600">
                <td className="py-2.5 pr-4 font-bold text-bone">All seven</td>
                {STEPS.map((s) => {
                  const v = total[s.key] as number;
                  const prev = s.of ? (total[s.of] as number) : null;
                  return (
                    <td key={s.key} className="metric py-2.5 pr-4 font-bold">
                      <span className={s.key === "paid" ? "text-jade" : "text-bone"}>{v}</span>
                      {prev !== null && (
                        <span className="ml-1.5 text-[11px] font-normal text-faint">{pct(v, prev)}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {other.length > 0 && (
          <p className="mt-4 border-t border-ink-700 pt-3 text-[12px] leading-relaxed text-faint">
            Also reached this page, not from one of the seven:{" "}
            {other
              .map(([tag, r]) => `${tag === "(none)" ? "untagged" : tag} (${r.arrived})`)
              .join(", ")}
            . Not counted above.
          </p>
        )}
      </section>
    </div>
  );
}
