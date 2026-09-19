"use client";

import { useState } from "react";

/**
 * Users — brief §9. Per-user measurements, markers, day progress and payment
 * status. This is how the owner verifies the program works and finds real
 * results to ask consent for. Phones masked to the last four in the list;
 * the full number is on the open row.
 */

export type UserView = {
  id: string;
  phone: string;
  lang: string;
  createdAt: string;
  plan: "free" | "p10" | "p30";
  paidMinor: number;
  day: number;
  baseline: number | null;
  day12: number | null;
  day30: number | null;
  markersCount: number;
  lastMarkers: string | null;
  markers: { at: string; erection: number; energy: number; sleep: number; control: number; libido?: number; stress?: number; stomach?: number }[];
  daysDone: number[];
};

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const when = (iso: string | null) => (iso ? iso.replace("T", " ").slice(5, 16) : "—");
const mask = (p: string) => `…${p.slice(-4)}`;
const fcfa = (n: number) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA`;

export function Users({ users, ready }: { users: UserView[]; ready: boolean }) {
  const [open, setOpen] = useState<string | null>(null);
  const [q, setQ] = useState("");
  if (!ready) {
    return (
      <section className="mt-6 rounded-2xl card p-5">
        <p className="text-[11px] font-bold uppercase tracking-wide text-faint">Users</p>
        <p className="mt-2 text-[1.05rem] leading-relaxed text-mute">
          Migration <span className="metric">supabase/017_users.sql</span> has not been run. Nobody can create an account until it has.
        </p>
      </section>
    );
  }
  const rows = users.filter((u) => !q || u.phone.includes(q.replace(/\D/g, "")) || u.id.startsWith(q));
  const n = (k: "free" | "p10" | "p30") => users.filter((u) => u.plan === k).length;

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-2xl card p-5">
        <p className="text-[11px] font-bold uppercase tracking-wide text-faint">Users</p>
        <p className="mt-2 text-[1.25rem] font-bold text-bone">
          {users.length} accounts · {users.filter((u) => u.baseline !== null).length} measured Day 1 · {n("p10") + n("p30")} paid · {users.filter((u) => u.day12 !== null).length} measured Day 12
        </p>
      </section>

      <section className="rounded-2xl card p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-[0.95rem] font-bold text-bone">Every account</h2>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Last digits or id" className="w-48 rounded-xl border border-ink-600 bg-ink-900 px-3 py-2 text-[13px] text-bone placeholder:text-faint focus:border-jade focus:outline-none" />
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-[0.86rem]">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-faint">
                {["Joined", "Phone", "Plan", "Day", "Day 1", "Day 12", "Day 30", "Markers", "Last log", "Paid"].map((h) => <th key={h} className="pb-2 pr-3 font-bold">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => {
                const isOpen = open === u.id;
                return (
                  <FragmentRow key={u.id}>
                    <tr className="cursor-pointer border-t border-ink-700 hover:bg-ink-850" onClick={() => setOpen(isOpen ? null : u.id)}>
                      <td className="metric py-2.5 pr-3 text-[12px] text-faint">{when(u.createdAt)}</td>
                      <td className="metric py-2.5 pr-3 text-bone">{isOpen ? u.phone : mask(u.phone)}</td>
                      <td className={`py-2.5 pr-3 font-bold ${u.plan === "free" ? "text-faint" : "text-jade"}`}>{u.plan}</td>
                      <td className="metric py-2.5 pr-3 text-bone">{u.day}</td>
                      <td className="metric py-2.5 pr-3 text-bone">{u.baseline !== null ? fmt(u.baseline) : "—"}</td>
                      <td className="metric py-2.5 pr-3 text-jade">{u.day12 !== null ? fmt(u.day12) : "—"}</td>
                      <td className="metric py-2.5 pr-3 text-jade">{u.day30 !== null ? fmt(u.day30) : "—"}</td>
                      <td className="metric py-2.5 pr-3 text-bone">{u.markersCount}</td>
                      <td className="metric py-2.5 pr-3 text-[12px] text-faint">{when(u.lastMarkers)}</td>
                      <td className="metric py-2.5 pr-3 text-jade">{u.paidMinor ? fcfa(u.paidMinor) : "—"}</td>
                    </tr>
                    {isOpen && (
                      <tr className="border-t border-ink-700 bg-ink-900/60">
                        <td colSpan={10} className="px-3 py-3">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-faint">
                            id {u.id} · {u.lang} · days done: {u.daysDone.length ? u.daysDone.join(", ") : "none"}
                          </p>
                          {u.markers.length > 0 && (
                            <table className="mt-2 text-[12px]">
                              <thead><tr className="text-faint">{["When", "Erection", "Energy", "Sleep", "Control", "Libido", "Stress", "Stomach"].map((h) => <th key={h} className="pr-3 text-left font-bold">{h}</th>)}</tr></thead>
                              <tbody>
                                {[...u.markers].reverse().slice(0, 30).map((m, i) => (
                                  <tr key={i} className="metric text-mute">
                                    <td className="pr-3">{when(m.at)}</td>
                                    {[m.erection, m.energy, m.sleep, m.control, m.libido, m.stress, m.stomach].map((v, j) => <td key={j} className="pr-3">{v ?? "·"}</td>)}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </td>
                      </tr>
                    )}
                  </FragmentRow>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function FragmentRow({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
