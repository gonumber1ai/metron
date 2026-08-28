"use client";

import { useEffect, useState } from "react";

export type CampaignRow = {
  campaign: string;
  locale: string;
  started: number;
  finished: number;
  saw_offer: number;
  paid: number;
};

/**
 * Which ad is doing the work.
 *
 * The whole screen exists to answer one question — where should the next
 * dollar go — so it answers it in a sentence at the top and shows the working
 * underneath. Nobody running four ads at a dollar each wants to interpret a
 * table.
 *
 * Spend is typed in rather than pulled from Meta: hooking up the Marketing API
 * needs an app review, and the number is four values he already knows. It is
 * kept in this browser only, because it is his business's data and there is no
 * reason for it to sit in a database.
 *
 * Cost per sale is the only column that decides anything. Clicks flatter a bad
 * ad — the one that gets 150 curious taps and no buyers is the expensive one.
 */
export function Ads({ rows }: { rows: CampaignRow[] }) {
  const [spend, setSpend] = useState<Record<string, string>>({});
  // Tags in the URL are deliberately meaningless — a1, a2 — because the URL is
  // crawled by Meta and visible to the man before he clicks, and "nopills" is
  // a free extra signal in a category that is already scrutinised. The meaning
  // lives here instead, where only you read it.
  const [labels, setLabels] = useState<Record<string, string>>({});

  // Kept per-browser. A wrong number here changes nothing but this screen.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("metron.adspend");
      if (raw) setSpend(JSON.parse(raw) as Record<string, string>);
      const rawL = window.localStorage.getItem("metron.adlabels");
      if (rawL) setLabels(JSON.parse(rawL) as Record<string, string>);
    } catch {
      /* no saved spend is fine */
    }
  }, []);

  function setFor(key: string, v: string) {
    const next = { ...spend, [key]: v };
    setSpend(next);
    try {
      window.localStorage.setItem("metron.adspend", JSON.stringify(next));
    } catch {
      /* private mode; the table still works, it just will not remember */
    }
  }

  function labelFor(key: string, v: string) {
    const next = { ...labels, [key]: v };
    setLabels(next);
    try {
      window.localStorage.setItem("metron.adlabels", JSON.stringify(next));
    } catch {
      /* private mode; the tag still identifies the row */
    }
  }

  const keyOf = (r: CampaignRow) => `${r.campaign}::${r.locale}`;
  const spendOf = (r: CampaignRow) => Number(spend[keyOf(r)] ?? "") || 0;

  const scored = rows.map((r) => {
    const s = spendOf(r);
    return {
      ...r,
      spend: s,
      // Only meaningful once he has both spent something and sold something.
      costPerSale: s > 0 && r.paid > 0 ? s / r.paid : null,
      costPerFinish: s > 0 && r.finished > 0 ? s / r.finished : null,
      finishRate: r.started > 0 ? r.finished / r.started : 0,
      buyRate: r.finished > 0 ? r.paid / r.finished : 0,
    };
  });

  // Best = cheapest real sale. Falls back to cheapest completed quiz while
  // nobody has bought yet, which is the only honest early signal — and says so.
  const withSales = scored.filter((r) => r.costPerSale !== null);
  const withFinishes = scored.filter((r) => r.costPerFinish !== null);
  const best =
    withSales.sort((a, b) => a.costPerSale! - b.costPerSale!)[0] ??
    withFinishes.sort((a, b) => a.costPerFinish! - b.costPerFinish!)[0] ??
    null;
  const onSales = withSales.length > 0;
  const runnerUp = onSales
    ? withSales[1]
    : withFinishes[1];

  return (
    <div className="mt-6 space-y-6">
      {/* ------------------------------------------------------- the answer */}
      <section className="rounded-2xl card p-5">
        <p className="text-[11px] font-bold uppercase tracking-wide text-faint">
          Where the next money goes
        </p>
        {best ? (
          <>
            <p className="mt-2 text-[1.25rem] font-bold leading-snug text-bone">
              {best.campaign === "(none)"
                ? "Untagged traffic"
                : labels[`${best.campaign}::${best.locale}`] || best.campaign}{" "}
              <span className="text-faint">({best.locale.toUpperCase()})</span> is winning.
            </p>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-mute">
              {onSales ? (
                <>
                  It costs <strong className="text-jade">${best.costPerSale!.toFixed(2)}</strong> to
                  make one sale.
                  {runnerUp && "costPerSale" in runnerUp && runnerUp.costPerSale ? (
                    <>
                      {" "}
                      The next best is ${runnerUp.costPerSale.toFixed(2)} —{" "}
                      {(runnerUp.costPerSale / best.costPerSale!).toFixed(1)}× more expensive.
                    </>
                  ) : null}{" "}
                  Put the money here.
                </>
              ) : (
                <>
                  Nobody has bought yet, so this is judged on completed quizzes, not sales — at{" "}
                  <strong className="text-amber">${best.costPerFinish!.toFixed(2)}</strong> each.
                  That is a real signal but not the one that pays: an ad can pull cheap quizzes
                  and still sell nothing. Wait for a sale before you scale it.
                </>
              )}
            </p>
          </>
        ) : (
          <p className="mt-2 text-[0.95rem] leading-relaxed text-mute">
            Type what you spent on each ad below and this will tell you which one to put money
            behind. Until then there is nothing to compare.
          </p>
        )}
      </section>

      {/* -------------------------------------------------------- the table */}
      <section className="rounded-2xl card p-5">
        <h2 className="text-[0.95rem] font-bold text-bone">Every ad</h2>
        <p className="mt-0.5 mb-4 text-[12px] leading-relaxed text-faint">
          Tag each link with <span className="metric">?c=a1</span>, <span className="metric">a2</span> and
          so on — keep the tag meaningless, because Meta crawls the URL and the man can see it.
          Write what the ad actually says in the second column; that stays on this device. The tag
          is remembered from his first visit right through to his payment, and clicks are people,
          not taps — one man reloading four times counts once.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[0.88rem]">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-faint">
                <th className="pb-2 pr-4 font-bold">Ad</th>
                <th className="pb-2 pr-4 font-bold">What it says</th>
                <th className="pb-2 pr-4 font-bold">Lang</th>
                <th className="pb-2 pr-4 font-bold">Clicked</th>
                <th className="pb-2 pr-4 font-bold">Finished quiz</th>
                <th className="pb-2 pr-4 font-bold">Paid</th>
                <th className="pb-2 pr-4 font-bold">Spent ($)</th>
                <th className="pb-2 font-bold">Cost per sale</th>
              </tr>
            </thead>
            <tbody>
              {scored.map((r) => {
                const isBest = best && keyOf(r) === keyOf(best);
                return (
                  <tr
                    key={keyOf(r)}
                    className={`border-t border-ink-700 ${isBest ? "bg-jade-050/40" : ""}`}
                  >
                    <td className="py-2.5 pr-4 font-bold text-bone">
                      {r.campaign === "(none)" ? (
                        <span className="text-faint">untagged</span>
                      ) : (
                        r.campaign
                      )}
                    </td>
                    <td className="py-2.5 pr-4">
                      <input
                        value={labels[keyOf(r)] ?? ""}
                        onChange={(e) => labelFor(keyOf(r), e.target.value)}
                        placeholder="name it"
                        className="w-36 rounded-lg border border-ink-600 bg-ink-850 px-2 py-1 text-[0.85rem] text-bone placeholder:text-faint focus:border-jade focus:outline-none"
                      />
                    </td>
                    <td className="py-2.5 pr-4 text-mute">{r.locale.toUpperCase()}</td>
                    <td className="metric py-2.5 pr-4 text-mute">{r.started}</td>
                    <td className="metric py-2.5 pr-4 text-mute">
                      {r.finished}
                      <span className="ml-1.5 text-[11px] text-faint">
                        {Math.round(r.finishRate * 100)}%
                      </span>
                    </td>
                    <td className="metric py-2.5 pr-4 font-bold text-jade">{r.paid}</td>
                    <td className="py-2.5 pr-4">
                      <input
                        inputMode="decimal"
                        value={spend[keyOf(r)] ?? ""}
                        onChange={(e) => setFor(keyOf(r), e.target.value)}
                        placeholder="0"
                        className="w-20 rounded-lg border border-ink-600 bg-ink-850 px-2 py-1 text-[0.85rem] text-bone placeholder:text-faint focus:border-jade focus:outline-none"
                      />
                    </td>
                    <td
                      className={`metric py-2.5 font-bold ${
                        r.costPerSale !== null ? "text-bone" : "text-faint"
                      }`}
                    >
                      {r.costPerSale !== null
                        ? `$${r.costPerSale.toFixed(2)}`
                        : r.spend > 0
                          ? "no sales yet"
                          : "—"}
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-3 text-[0.9rem] text-faint">
                    Nothing yet. Once someone clicks a tagged link they appear here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
