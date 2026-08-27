"use client";

import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Customers, type ActivityRow } from "./Customers";

export type Snapshot = {
  connected: boolean;
  funnel: { step: string; people: number; pct_of_top: number }[];
  dropoff: { reached_question: number; quit_here: number; reached: number }[];
  recent: Record<string, unknown>[];
  revenue: { currency: string; total: number; count: number }[];
  activity: ActivityRow[];
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

function money(n: number, currency: string): string {
  return currency === "USD"
    ? `$${n.toLocaleString("en-US")}`
    : `${n.toLocaleString("fr-FR")} FCFA`;
}

type Tab = "overview" | "customers" | "leads";

export function Dashboard({ snap }: { snap: Snapshot }) {
  const [tab, setTab] = useState<Tab>("overview");

  const step = (name: string) => snap.funnel.find((f) => f.step === name)?.people ?? 0;
  const paid = step("paid");
  const started = step("quiz_start");
  const finished = step("quiz_complete");

  const unread = snap.activity.reduce((n, r) => n + Number(r.unread ?? 0), 0);
  const inactive = snap.activity.filter((r) => !r.last_seen).length;
  const needsAttention = unread + inactive;

  const worstQuestion = [...snap.dropoff]
    .filter((d) => d.reached >= 3)
    .sort((a, b) => b.quit_here / b.reached - a.quit_here / a.reached)[0];

  return (
    <>
      <style>{`body{background:var(--color-ink-900);color:var(--color-bone)}`}</style>

      <div className="min-h-screen">
        <header className="sticky top-0 z-20 border-b border-ink-700 bg-ink-900/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
            <span className="flex items-center gap-3">
              <Logo size="sm" />
              <span className="rounded-md bg-ink-700 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-mute">
                Admin
              </span>
            </span>
            <button
              type="button"
              onClick={async () => {
                await fetch("/api/admin/logout", { method: "POST" });
                window.location.reload();
              }}
              className="text-[13px] font-medium text-mute hover:text-bone"
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-5 py-6">
          {!snap.connected && (
            <p className="mb-5 rounded-xl border border-amber/50 bg-amber-050 px-4 py-3 text-[0.92rem] text-bone">
              Database not connected. Add the Supabase keys and run the files in
              <span className="metric"> supabase/</span>.
            </p>
          )}

          {/* ---------------------------------------------------- key numbers */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Revenue"
              value={
                snap.revenue.length
                  ? snap.revenue.map((r) => money(r.total, r.currency)).join("  ·  ")
                  : "—"
              }
              sub={`${paid} customer${paid === 1 ? "" : "s"}`}
              tone="jade"
            />
            <Stat
              label="Quizzes finished"
              value={String(finished)}
              sub={started ? `${pct(finished, started)} of ${started} started` : "none started"}
            />
            <Stat
              label="Conversion"
              value={finished ? pct(paid, finished) : "—"}
              sub="finished quiz → paid"
            />
            <Stat
              label="Needs attention"
              value={String(needsAttention)}
              sub={
                needsAttention
                  ? `${unread} unread · ${inactive} not started`
                  : "nothing waiting"
              }
              tone={needsAttention ? "alert" : undefined}
            />
          </div>

          {/* ----------------------------------------------------------- tabs */}
          <nav className="mt-7 flex gap-1 border-b border-ink-700">
            {(
              [
                ["overview", "Overview"],
                ["customers", `Customers${paid ? ` (${paid})` : ""}`],
                ["leads", `Leads${snap.recent.length ? ` (${snap.recent.length})` : ""}`],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id as Tab)}
                className={`-mb-px border-b-2 px-4 py-2.5 text-[14px] font-bold transition-colors ${
                  tab === id
                    ? "border-jade text-jade"
                    : "border-transparent text-mute hover:text-bone"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* ------------------------------------------------------- overview */}
          {tab === "overview" && (
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <Panel title="Funnel" note="How many people reached each step.">
                <div className="space-y-1.5">
                  {snap.funnel.map((f, i) => {
                    const prev = i > 0 ? snap.funnel[i - 1].people : f.people;
                    const top = snap.funnel[0]?.people ?? 0;
                    const width = top ? Math.max((f.people / top) * 100, 1.5) : 1.5;
                    const drop = i > 0 && prev > 0 && f.people / prev < 0.5;
                    return (
                      <div key={f.step}>
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-[0.9rem] text-bone">
                            {STEP_LABEL[f.step] ?? f.step}
                          </span>
                          <span className="metric text-[0.9rem] font-bold text-bone">
                            {f.people}
                            {i > 0 && (
                              <span
                                className={`ml-2 text-[12px] font-normal ${
                                  drop ? "text-alert" : "text-faint"
                                }`}
                              >
                                {pct(f.people, prev)}
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="mt-1.5 mb-2.5 h-1.5 w-full rounded-full bg-ink-700">
                          <div
                            className="h-full rounded-full bg-jade"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {snap.funnel.length === 0 && <Empty>No activity yet.</Empty>}
                </div>
              </Panel>

              <Panel
                title="Quiz drop-off"
                note={
                  worstQuestion
                    ? `Most people quit on question ${worstQuestion.reached_question}.`
                    : "Which question people quit on."
                }
              >
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wide text-faint">
                      <th className="pb-2 pr-3 font-bold">Question</th>
                      <th className="pb-2 pr-3 font-bold">Reached</th>
                      <th className="pb-2 pr-3 font-bold">Quit</th>
                      <th className="pb-2 font-bold">Drop</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snap.dropoff.map((d) => {
                      const bad = d.reached > 0 && d.quit_here / d.reached > 0.25;
                      return (
                        <tr key={d.reached_question} className="border-t border-ink-700">
                          <td className="metric py-2 pr-3 font-bold">Q{d.reached_question}</td>
                          <td className="metric py-2 pr-3 text-mute">{d.reached}</td>
                          <td className="metric py-2 pr-3 text-mute">{d.quit_here}</td>
                          <td
                            className={`metric py-2 font-bold ${
                              bad ? "text-alert" : "text-mute"
                            }`}
                          >
                            {pct(d.quit_here, d.reached)}
                          </td>
                        </tr>
                      );
                    })}
                    {snap.dropoff.length === 0 && (
                      <tr>
                        <td colSpan={4}>
                          <Empty>No answers yet.</Empty>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </Panel>
            </div>
          )}

          {/* ------------------------------------------------------ customers */}
          {tab === "customers" && <Customers rows={snap.activity} />}

          {/* ---------------------------------------------------------- leads */}
          {tab === "leads" && (
            <div className="mt-6">
              <Panel title="Everyone who finished the quiz" note="Newest first.">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-[0.88rem]">
                    <thead>
                      <tr className="text-[11px] uppercase tracking-wide text-faint">
                        <th className="pb-2 pr-4 font-bold">When</th>
                        <th className="pb-2 pr-4 font-bold">Status</th>
                        <th className="pb-2 pr-4 font-bold">Name</th>
                        <th className="pb-2 pr-4 font-bold">Email</th>
                        <th className="pb-2 pr-4 font-bold">Phone</th>
                        <th className="pb-2 pr-4 font-bold">Lasts</th>
                        <th className="pb-2 pr-4 font-bold">Wants</th>
                        <th className="pb-2 font-bold">Code</th>
                      </tr>
                    </thead>
                    <tbody>
                      {snap.recent.map((r, i) => (
                        <tr key={i} className="border-t border-ink-700">
                          <td className="py-2.5 pr-4 whitespace-nowrap text-faint">
                            {String(r.updated_at ?? r.created_at ?? "")
                              .slice(0, 16)
                              .replace("T", " ")}
                          </td>
                          <td className="py-2.5 pr-4">
                            <Badge stage={String(r.stage ?? "")} />
                          </td>
                          <td className="py-2.5 pr-4 text-bone">{String(r.name ?? "—")}</td>
                          <td className="py-2.5 pr-4 text-mute">{String(r.contact ?? "—")}</td>
                          <td className="metric py-2.5 pr-4 text-mute">
                            {String(r.phone ?? "—")}
                          </td>
                          <td className="metric py-2.5 pr-4 text-mute">
                            {r.lasts_now_min != null ? `${r.lasts_now_min} min` : "—"}
                          </td>
                          <td className="metric py-2.5 pr-4 text-mute">
                            {r.wants_min != null ? `${r.wants_min} min` : "—"}
                          </td>
                          <td className="metric py-2.5 text-faint">{String(r.ref ?? "—")}</td>
                        </tr>
                      ))}
                      {snap.recent.length === 0 && (
                        <tr>
                          <td colSpan={8}>
                            <Empty>Nobody yet.</Empty>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */

function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "jade" | "alert";
}) {
  const colour =
    tone === "jade" ? "text-jade" : tone === "alert" ? "text-alert" : "text-bone";
  return (
    <div className="rounded-2xl card p-5">
      <p className="text-[11px] font-bold uppercase tracking-wide text-faint">{label}</p>
      <p className={`metric mt-1.5 text-[1.7rem] font-bold leading-tight ${colour}`}>{value}</p>
      {sub && <p className="mt-1 text-[12px] text-faint">{sub}</p>}
    </div>
  );
}

function Panel({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl card p-5">
      <h2 className="text-[0.95rem] font-bold text-bone">{title}</h2>
      {note && <p className="mt-0.5 mb-4 text-[12px] text-faint">{note}</p>}
      {!note && <div className="mb-4" />}
      {children}
    </section>
  );
}

function Badge({ stage }: { stage: string }) {
  const map: Record<string, [string, string]> = {
    paid: ["Paid", "bg-jade text-ink-900"],
    checkout_started: ["Checkout", "bg-amber text-ink-900"],
    lead: ["Quiz only", "bg-ink-700 text-mute"],
  };
  const [label, cls] = map[stage] ?? [stage || "—", "bg-ink-700 text-mute"];
  return (
    <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold whitespace-nowrap ${cls}`}>
      {label}
    </span>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-3 text-[0.9rem] text-faint">{children}</p>;
}
