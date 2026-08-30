"use client";

import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Customers, type ActivityRow } from "./Customers";
import { Broadcast } from "./Broadcast";
import { Ads, type CampaignRow } from "./Ads";
import { StartFunnel, type StartRow, type CtaRow } from "./StartFunnel";

export type Snapshot = {
  connected: boolean;
  funnel: { step: string; people: number; pct_of_top: number }[];
  dropoff: { reached_question: number; quit_here: number; reached: number; continued: number }[];
  recent: Record<string, unknown>[];
  revenue: { currency: string; total: number; count: number }[];
  activity: ActivityRow[];
  /** every thread, paid or not — see allConversations() */
  campaigns: CampaignRow[];
  startRows: StartRow[];
  ctaRows: CtaRow[];
  conversations: {
    ref: string;
    last_body: string;
    last_sender: string;
    last_at: string;
    unread: number;
    total: number;
  }[];
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

type Tab = "overview" | "ads" | "start" | "customers" | "leads" | "write";

export function Dashboard({ snap }: { snap: Snapshot }) {
  const [tab, setTab] = useState<Tab>("overview");

  const step = (name: string) => snap.funnel.find((f) => f.step === name)?.people ?? 0;

  /* Customers come from the payments themselves, not from a funnel step.
     The step counted quiz buyers only, so a sale made on the direct page put
     money in the revenue tile and left "0 customers" beside it. */
  const paid = snap.revenue.reduce((n, r) => n + r.count, 0);

  const sumBy = <T,>(rows: T[], k: keyof T) =>
    rows.reduce((n, r) => n + (Number(r[k]) || 0), 0);

  /* One summary per road. Both are counted from their own view, which 011
     keeps disjoint, so no man is in both. */
  const quiz = {
    arrived: sumBy(snap.campaigns, "started"),
    middle: sumBy(snap.campaigns, "finished"),
    middleLabel: "finished the quiz",
    checkout: sumBy(snap.campaigns, "saw_offer"),
    paid: sumBy(snap.campaigns, "paid"),
  };
  const direct = {
    arrived: Math.max(
      sumBy(snap.startRows, "gate_views"),
      sumBy(snap.startRows, "page_views"),
    ),
    middle: sumBy(snap.startRows, "clicked"),
    middleLabel: "pressed a buy button",
    checkout: sumBy(snap.startRows, "saw_checkout"),
    paid: sumBy(snap.startRows, "paid"),
  };

  // From conversations, not from activity: activity only covers paid
  // customers, so an unanswered message from anybody else never raised the
  // count that is supposed to tell you something is waiting.
  const unread = snap.conversations.reduce((n, c) => n + c.unread, 0);
  const inactive = snap.activity.filter((r) => !r.last_seen).length;
  const needsAttention = unread + inactive;

  // The worst question is the one that loses the largest SHARE of the men who
  // reached it, not the one with the most quitters — late questions are seen
  // by fewer people and would never win a raw count.
  const worstQuestion = [...snap.dropoff]
    .filter((d) => d.reached >= 5)
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
              label="People reached"
              value={String(quiz.arrived + direct.arrived)}
              sub={`${direct.arrived} direct · ${quiz.arrived} quiz`}
            />
            <Stat
              label="Bought"
              value={paid ? pct(paid, quiz.arrived + direct.arrived) : "—"}
              sub="of everyone who arrived"
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
                /* One tab per funnel, named after the road rather than
                   after the channel. Both are fed by ads; what separates them
                   is whether the man answered nine questions or read a page. */
                ["ads", "Quiz funnel"],
                ["start", "Direct funnel"],
                ["customers", `Customers${paid ? ` (${paid})` : ""}`],
                ["leads", `Leads${snap.recent.length ? ` (${snap.recent.length})` : ""}`],
                ["write", "Write to people"],
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
          {/* Both roads, side by side, in counts. No percentage of a previous
              step: the steps are not a strict sequence — traffic that predates
              the gate enters at the page — and dividing by the wrong
              denominator produced "300%", which teaches a reader to distrust
              the whole screen. */}
          {tab === "overview" && (
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <FunnelCard
                title="Direct funnel"
                note="Ad → wellness page → sales page → checkout"
                f={direct}
              />
              <FunnelCard
                title="Quiz funnel"
                note="Ad → quiz → result → checkout"
                f={quiz}
              />
            </div>
          )}

          {/* ------------------------------------------------------ customers */}
          {tab === "customers" && (
            <Customers rows={snap.activity} conversations={snap.conversations} />
          )}

          {/* ---------------------------------------------------------- ads */}
          {tab === "ads" && (
            <div className="mt-6 space-y-6">
              <Ads rows={snap.campaigns} />
              <Panel
                title="Where the quiz loses them"
                note={
                  worstQuestion
                    ? `Question ${worstQuestion.reached_question} is the worst — ${Math.round(
                        (worstQuestion.quit_here / worstQuestion.reached) * 100,
                      )}% of the men who reach it stop there.`
                    : "Which question people quit on."
                }
              >
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wide text-faint">
                      <th className="pb-2 pr-3 font-bold">Question</th>
                      <th className="pb-2 pr-3 font-bold">Got here</th>
                      <th className="pb-2 pr-3 font-bold">Quit here</th>
                      <th className="pb-2 font-bold">Lost</th>
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
                          <td className={`metric py-2 font-bold ${bad ? "text-alert" : "text-mute"}`}>
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

          {tab === "start" && (
            <StartFunnel rows={snap.startRows} cta={snap.ctaRows} />
          )}

          {/* ---------------------------------------------------- broadcast */}
          {tab === "write" && <Broadcast />}

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

/**
 * One road, in four counts and one sentence.
 *
 * Written for someone who does not read dashboards. Four numbers, each with a
 * plain label, and underneath them the single fact worth acting on: the step
 * that lost the most men. No ratios between steps — the steps are not a strict
 * sequence and the wrong denominator was printing 300%.
 */
function FunnelCard({
  title,
  note,
  f,
}: {
  title: string;
  note: string;
  f: {
    arrived: number;
    middle: number;
    middleLabel: string;
    checkout: number;
    paid: number;
  };
}) {
  const rows: [string, number][] = [
    ["Arrived", f.arrived],
    [f.middleLabel.charAt(0).toUpperCase() + f.middleLabel.slice(1), f.middle],
    ["Reached checkout", f.checkout],
    ["Paid", f.paid],
  ];

  /* The biggest fall between two consecutive counts. A step is only judged
     when the one before it actually has people in it, so a stage nobody has
     reached yet cannot be reported as the problem. */
  let worst: { from: string; to: string; lost: number } | null = null;
  for (let i = 1; i < rows.length; i++) {
    const [fromLabel, a] = rows[i - 1];
    const [toLabel, b] = rows[i];
    if (a <= 0 || b > a) continue;
    const lost = a - b;
    if (lost > 0 && (!worst || lost > worst.lost)) {
      worst = { from: fromLabel, to: toLabel, lost };
    }
  }

  return (
    <div className="rounded-2xl card p-6">
      <h2 className="text-[1.1rem] font-bold text-bone">{title}</h2>
      <p className="mt-1 text-[0.85rem] text-faint">{note}</p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {rows.map(([label, n], i) => (
          <div
            key={label}
            className={`rounded-xl border px-4 py-3.5 ${
              i === rows.length - 1
                ? "border-jade-700 bg-jade-050"
                : "border-ink-600 bg-ink-850"
            }`}
          >
            <p
              className={`metric text-[1.8rem] font-bold leading-none ${
                i === rows.length - 1 ? "text-jade" : "text-bone"
              }`}
            >
              {n}
            </p>
            <p className="mt-1.5 text-[0.78rem] leading-snug text-mute">{label}</p>
          </div>
        ))}
      </div>

      <p className="mt-5 border-t border-ink-700 pt-4 text-[0.95rem] leading-relaxed text-bone">
        {f.arrived === 0 ? (
          <span className="text-mute">Nobody has come down this road yet.</span>
        ) : worst ? (
          <>
            Biggest loss:{" "}
            <span className="font-bold">
              {worst.lost} {worst.lost === 1 ? "man" : "men"}
            </span>{" "}
            <span className="text-mute">
              stopped between &ldquo;{worst.from}&rdquo; and &ldquo;{worst.to}&rdquo;.
            </span>
          </>
        ) : (
          <span className="text-mute">Nobody has dropped out yet.</span>
        )}
      </p>
    </div>
  );
}

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
