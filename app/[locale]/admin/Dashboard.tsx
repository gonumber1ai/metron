import { Logo } from "@/components/Logo";

export type Snapshot = {
  connected: boolean;
  funnel: { step: string; people: number; pct_of_top: number }[];
  dropoff: { reached_question: number; quit_here: number; reached: number }[];
  recent: Record<string, unknown>[];
  revenue: { currency: string; total: number; count: number }[];
};

const STEP_LABEL: Record<string, string> = {
  quiz_start: "Started the quiz",
  quiz_complete: "Finished the quiz",
  result_view: "Saw their result",
  offer_view: "Opened the offer",
  checkout_started: "Started checkout",
  paid: "Paid",
};

function pct(n: number, d: number): string {
  if (!d) return "—";
  return `${Math.round((n / d) * 1000) / 10}%`;
}

/**
 * The admin view.
 *
 * Built to answer three questions and not more: is money coming in, where in
 * the funnel are people leaving, and who is in it right now. A dashboard that
 * answers everything gets read by nobody.
 */
export function Dashboard({ snap }: { snap: Snapshot }) {
  const top = snap.funnel[0]?.people ?? 0;
  const paid = snap.funnel.find((f) => f.step === "paid")?.people ?? 0;

  return (
    <>
      <style>{`body{background:var(--color-ink-900);color:var(--color-bone)}`}</style>

      <div className="min-h-screen bg-ink-900">
        <header className="border-b border-ink-700">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
            <Logo size="sm" />
            <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-faint">
              Admin
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-5 py-8">
          {!snap.connected && (
            <p className="mb-6 rounded-xl border border-amber/50 bg-amber-050 px-4 py-3 text-[0.92rem] text-bone">
              Supabase is not connected, so there is nothing to show. Set
              NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, then run the three
              files in supabase/ in the SQL editor.
            </p>
          )}

          {/* ------------------------------------------------------ revenue */}
          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">
              Paid
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl card p-5">
                <p className="text-[11px] uppercase tracking-wide text-faint">Customers</p>
                <p className="metric mt-1 text-[2.2rem] font-bold text-jade">{paid}</p>
              </div>
              {snap.revenue.map((r) => (
                <div key={r.currency} className="rounded-2xl card p-5">
                  <p className="text-[11px] uppercase tracking-wide text-faint">{r.currency}</p>
                  <p className="metric mt-1 text-[2.2rem] font-bold text-jade">
                    {r.total.toLocaleString("fr-FR")}
                  </p>
                  <p className="mt-1 text-[12px] text-faint">{r.count} payments</p>
                </div>
              ))}
              {snap.revenue.length === 0 && (
                <div className="rounded-2xl border border-dashed border-ink-600 p-5">
                  <p className="text-[0.9rem] text-faint">No payments yet.</p>
                </div>
              )}
            </div>
          </section>

          {/* ------------------------------------------------------- funnel */}
          <section className="mt-10">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">
              Funnel
            </h2>
            <div className="mt-3 space-y-1.5">
              {snap.funnel.map((f, i) => {
                const prev = i > 0 ? snap.funnel[i - 1].people : f.people;
                const width = top ? Math.max((f.people / top) * 100, 1.5) : 1.5;
                return (
                  <div key={f.step} className="rounded-xl card px-4 py-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[0.93rem] font-medium text-bone">
                        {STEP_LABEL[f.step] ?? f.step}
                      </span>
                      <span className="metric text-[0.95rem] font-bold text-bone">
                        {f.people}
                        {i > 0 && (
                          <span className="ml-2 text-[12px] font-normal text-faint">
                            {pct(f.people, prev)} of previous
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-ink-700">
                      <div
                        className="h-full rounded-full bg-jade"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {snap.funnel.length === 0 && (
                <p className="text-[0.9rem] text-faint">No events recorded yet.</p>
              )}
            </div>
          </section>

          {/* ------------------------------------------------ quiz drop-off */}
          <section className="mt-10">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">
              Where the quiz loses people
            </h2>
            <p className="mt-1 text-[0.86rem] text-faint">
              The question they were on when they stopped. A spike on one row means that
              question is the problem, not the quiz.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[380px] text-left">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wide text-faint">
                    <th className="py-2 pr-4 font-bold">Question</th>
                    <th className="py-2 pr-4 font-bold">Reached</th>
                    <th className="py-2 pr-4 font-bold">Quit here</th>
                    <th className="py-2 font-bold">Drop</th>
                  </tr>
                </thead>
                <tbody>
                  {snap.dropoff.map((d) => (
                    <tr key={d.reached_question} className="border-t border-ink-700">
                      <td className="metric py-2.5 pr-4 font-bold">Q{d.reached_question}</td>
                      <td className="metric py-2.5 pr-4 text-mute">{d.reached}</td>
                      <td className="metric py-2.5 pr-4 text-mute">{d.quit_here}</td>
                      <td
                        className={`metric py-2.5 font-bold ${
                          d.reached && d.quit_here / d.reached > 0.25 ? "text-alert" : "text-mute"
                        }`}
                      >
                        {pct(d.quit_here, d.reached)}
                      </td>
                    </tr>
                  ))}
                  {snap.dropoff.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-3 text-[0.9rem] text-faint">
                        No quiz answers recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* ------------------------------------------------------ people */}
          <section className="mt-10">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">
              Latest
            </h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-[0.88rem]">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wide text-faint">
                    <th className="py-2 pr-4 font-bold">When</th>
                    <th className="py-2 pr-4 font-bold">Stage</th>
                    <th className="py-2 pr-4 font-bold">Name</th>
                    <th className="py-2 pr-4 font-bold">Contact</th>
                    <th className="py-2 pr-4 font-bold">Phone</th>
                    <th className="py-2 pr-4 font-bold">Now</th>
                    <th className="py-2 pr-4 font-bold">Wants</th>
                    <th className="py-2 font-bold">Code</th>
                  </tr>
                </thead>
                <tbody>
                  {snap.recent.map((r, i) => {
                    const stage = String(r.stage ?? "");
                    return (
                      <tr key={i} className="border-t border-ink-700 align-top">
                        <td className="py-2.5 pr-4 whitespace-nowrap text-faint">
                          {String(r.updated_at ?? r.created_at ?? "").slice(0, 16).replace("T", " ")}
                        </td>
                        <td className="py-2.5 pr-4">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                              stage === "paid"
                                ? "bg-jade text-ink-900"
                                : stage === "checkout_started"
                                  ? "bg-amber text-ink-900"
                                  : "bg-ink-700 text-mute"
                            }`}
                          >
                            {stage}
                          </span>
                        </td>
                        <td className="py-2.5 pr-4 text-bone">{String(r.name ?? "—")}</td>
                        <td className="py-2.5 pr-4 text-mute">{String(r.contact ?? "—")}</td>
                        <td className="metric py-2.5 pr-4 text-mute">{String(r.phone ?? "—")}</td>
                        <td className="metric py-2.5 pr-4 text-mute">
                          {r.lasts_now_min != null ? `${r.lasts_now_min}m` : "—"}
                        </td>
                        <td className="metric py-2.5 pr-4 text-mute">
                          {r.wants_min != null ? `${r.wants_min}m` : "—"}
                        </td>
                        <td className="metric py-2.5 text-faint">{String(r.ref ?? "—")}</td>
                      </tr>
                    );
                  })}
                  {snap.recent.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-3 text-[0.9rem] text-faint">
                        Nobody yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <p className="mt-10 text-[11px] leading-relaxed text-faint">
            This page holds every customer&apos;s assessment answers. It is not indexed and it
            is not linked from anywhere — treat the URL and the password as you would the
            payment keys.
          </p>
        </main>
      </div>
    </>
  );
}
