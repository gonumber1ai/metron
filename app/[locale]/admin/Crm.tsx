"use client";

import { useMemo, useState } from "react";
import type { Contact, FunnelStats, Status } from "@/lib/crm";
import { FUNNELS, TIERS, isFunnelId } from "@/lib/funnels";

/**
 * The CRM tab: the four funnels side by side, then every contact, then any
 * one contact's whole timeline.
 *
 * Numbers are people unless the column says otherwise — a man who reloaded
 * five times is one man. Shares are of the column to their left where the
 * steps genuinely follow one another, and of Visitors where they do not.
 */

const STATUS_LABEL: Record<Status, string> = {
  new: "New",
  engaged: "Engaged",
  lead: "Lead",
  checkout_started: "Checkout started",
  payment_pending: "USSD sent",
  recovery_eligible: "Recovery window",
  customer: "Customer",
  recovered: "Recovered",
};
const STATUS_TONE: Record<Status, string> = {
  new: "text-faint",
  engaged: "text-mute",
  lead: "text-bone",
  checkout_started: "text-bone",
  payment_pending: "text-amber",
  recovery_eligible: "text-alert",
  customer: "text-jade",
  recovered: "text-jade",
};

const fcfa = (n: number) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA`;
const pct = (n: number, d: number) => (d > 0 ? `${Math.round((n / d) * 100)}%` : "—");
const when = (iso: string) => (iso ? iso.replace("T", " ").slice(5, 16) : "—");

export function Crm({
  contacts,
  funnels,
  ready,
}: {
  contacts: Contact[];
  funnels: FunnelStats[];
  /** false until migration 015 has been run — the columns the CRM reads do not exist yet */
  ready: boolean;
}) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<Status | "all">("all");
  const [funnel, setFunnel] = useState<string>("all");
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return contacts.filter((c) => {
      if (status !== "all" && c.status !== status) return false;
      if (funnel !== "all" && (c.firstFunnel ?? c.funnel) !== funnel) return false;
      if (!needle) return true;
      return [c.ref, c.name, c.phone, c.email, c.campaign].some((v) => (v ?? "").toLowerCase().includes(needle));
    });
  }, [contacts, q, status, funnel]);

  async function send(c: Contact, channel: "email" | "whatsapp") {
    setBusy(c.ref + channel);
    setNote(null);
    try {
      const res = await fetch("/api/admin/recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref: c.ref, channel, email: c.email, funnel: c.funnel ?? c.firstFunnel }),
      });
      const j = await res.json();
      setNote(j.ok ? `${channel === "email" ? "Email sent" : "Marked sent"} — ${c.ref.slice(0, 8)}` : `Not sent: ${j.error}`);
    } catch {
      setNote("Not sent: network error");
    } finally {
      setBusy(null);
    }
  }

  function waLink(c: Contact): string | null {
    const id = c.funnel ?? c.firstFunnel;
    if (!c.phone || !id) return null;
    const f = FUNNELS[id];
    const t = TIERS[f.tier];
    const url = `${typeof location !== "undefined" ? location.origin : ""}/${f.lang}/offer?go=1&lc=1&ref=${c.ref}`;
    const text =
      f.lang === "fr"
        ? `Vous êtes revenu ! Votre offre METRON est encore ouverte : le Défi 10 jours à ${fcfa(t.offer)} au lieu de ${fcfa(t.full)}, une dernière fois. Retrouvez votre programme ici : ${url}`
        : `Welcome back! Your METRON offer is still open: the 10-Day Challenge at ${fcfa(t.offer)} instead of ${fcfa(t.full)}, one last time. Continue here: ${url}`;
    return `https://wa.me/237${c.phone}?text=${encodeURIComponent(text)}`;
  }

  if (!ready) {
    return (
      <section className="mt-6 rounded-2xl card p-5">
        <p className="text-[11px] font-bold uppercase tracking-wide text-faint">CRM</p>
        <p className="mt-2 text-[1.05rem] leading-relaxed text-mute">
          Migration <span className="metric">supabase/015_crm.sql</span> has not been run. Until it is, events have no
          session, funnel or button id, there is no server-side clock, and this tab has nothing to fold. Paste it into the
          Supabase SQL editor once; it is idempotent.
        </p>
      </section>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      {/* ------------------------------------------------------- funnels */}
      <section className="rounded-2xl card p-5">
        <h2 className="text-[0.95rem] font-bold text-bone">The four funnels</h2>
        <p className="mt-0.5 mb-4 text-[12px] text-faint">
          People, not taps. A man belongs to the funnel he FIRST landed on. Shares are of the column to the left where the
          steps follow one another, and of Visitors where they do not.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-left text-[0.86rem]">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-faint">
                {["Funnel", "Visitors", "Sessions", "Returned", "Said yes", "Buy click", "Checkout", "Form", "USSD", "Paid", "Revenue", "Leads", "Popup", "Popup→click", "Recovered", "Msgs"].map((h) => (
                  <th key={h} className="pb-2 pr-3 font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {funnels.map((f) => {
                const all = f.id === "all";
                const cell = (v: number, d?: number, tone = "text-bone") => (
                  <td className="metric py-2.5 pr-3">
                    <span className={tone}>{v}</span>
                    {d !== undefined && <span className="ml-1 text-[11px] text-faint">{pct(v, d)}</span>}
                  </td>
                );
                return (
                  <tr key={f.id} className={`border-t border-ink-700 ${all ? "border-t-2 border-ink-600 font-bold" : ""}`}>
                    <td className="py-2.5 pr-3 text-bone">{f.name}</td>
                    {cell(f.visitors)}
                    {cell(f.sessions)}
                    {cell(f.returned, f.visitors)}
                    {cell(f.saidYes, f.visitors)}
                    {cell(f.buyClicks, f.visitors)}
                    {cell(f.checkout, f.buyClicks)}
                    {cell(f.formShown, f.checkout)}
                    {cell(f.pushed, f.formShown)}
                    {cell(f.paid, f.pushed, "text-jade font-bold")}
                    <td className="metric py-2.5 pr-3 text-jade">{f.revenue ? fcfa(f.revenue) : "—"}</td>
                    {cell(f.leads, f.visitors)}
                    {cell(f.popupShown)}
                    {cell(f.popupClicked, f.popupShown)}
                    <td className="metric py-2.5 pr-3">
                      <span className="text-jade">{f.recovered}</span>
                      {f.recoveredRevenue > 0 && <span className="ml-1 text-[11px] text-faint">{fcfa(f.recoveredRevenue)}</span>}
                    </td>
                    {cell(f.messagesSent)}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ------------------------------------------------------ contacts */}
      <section className="rounded-2xl card p-5">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <h2 className="text-[0.95rem] font-bold text-bone">Contacts</h2>
            <p className="mt-0.5 text-[12px] text-faint">{rows.length} of {contacts.length}. Newest activity first.</p>
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, number, email, ref, tag"
            className="ml-auto w-full max-w-xs rounded-xl border border-ink-600 bg-ink-900 px-3 py-2 text-[13px] text-bone placeholder:text-faint focus:border-jade focus:outline-none"
          />
          <select value={status} onChange={(e) => setStatus(e.target.value as Status | "all")} className="rounded-xl border border-ink-600 bg-ink-900 px-3 py-2 text-[13px] text-bone">
            <option value="all">Any status</option>
            {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
          <select value={funnel} onChange={(e) => setFunnel(e.target.value)} className="rounded-xl border border-ink-600 bg-ink-900 px-3 py-2 text-[13px] text-bone">
            <option value="all">Any funnel</option>
            {Object.values(FUNNELS).map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>

        {note && <p className="mt-3 rounded-xl border border-ink-600 bg-ink-850 px-3 py-2 text-[13px] text-bone">{note}</p>}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-[0.86rem]">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-faint">
                {["Last seen", "Who", "Funnel", "Status", "Sessions", "Clock", "Paid", "Recovery"].map((h) => (
                  <th key={h} className="pb-2 pr-3 font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 300).map((c) => {
                const fid = c.firstFunnel ?? c.funnel;
                const isOpen = open === c.ref;
                const wa = waLink(c);
                return (
                  <FragmentRow key={c.ref}>
                    <tr className="cursor-pointer border-t border-ink-700 hover:bg-ink-850" onClick={() => setOpen(isOpen ? null : c.ref)}>
                      <td className="metric py-2.5 pr-3 text-[12px] text-faint">{when(c.lastSeen)}</td>
                      <td className="py-2.5 pr-3">
                        <span className="block font-bold text-bone">{c.name ?? c.phone ?? c.email ?? "anonymous"}</span>
                        <span className="metric block text-[11px] text-faint">
                          {[c.phone, c.email, c.ref.slice(0, 8), c.campaign].filter(Boolean).join(" · ")}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-[12px] text-mute">{fid && isFunnelId(fid) ? FUNNELS[fid].name : "—"}</td>
                      <td className={`py-2.5 pr-3 font-bold ${STATUS_TONE[c.status]}`}>{STATUS_LABEL[c.status]}</td>
                      <td className="metric py-2.5 pr-3 text-bone">
                        {c.sessions || 1}
                        {c.returned > 0 && <span className="ml-1 text-[11px] text-faint">↩{c.returned}</span>}
                      </td>
                      <td className="py-2.5 pr-3 text-[12px] text-mute">
                        {c.offer ? `${c.offer.status} · ${when(c.offer.expires_at)}` : "—"}
                      </td>
                      <td className="metric py-2.5 pr-3 text-jade">{c.paidMinor ? fcfa(c.paidMinor) : "—"}</td>
                      <td className="py-2.5 pr-3 text-[12px]" onClick={(e) => e.stopPropagation()}>
                        {c.paidMinor > 0 ? (
                          <span className="text-faint">paid</span>
                        ) : (
                          <span className="flex flex-wrap items-center gap-2">
                            {c.email && (
                              <button
                                type="button"
                                disabled={busy === c.ref + "email"}
                                onClick={() => send(c, "email")}
                                className="rounded-full border border-ink-600 px-2.5 py-1 text-[11px] font-bold text-bone hover:border-jade hover:text-jade disabled:opacity-50"
                              >
                                Email{c.recovery.email > 0 ? ` (${c.recovery.email})` : ""}
                              </button>
                            )}
                            {wa && (
                              <>
                                <a href={wa} target="_blank" rel="noreferrer" className="rounded-full border border-ink-600 px-2.5 py-1 text-[11px] font-bold text-bone hover:border-jade hover:text-jade">
                                  WhatsApp
                                </a>
                                <button
                                  type="button"
                                  disabled={busy === c.ref + "whatsapp"}
                                  onClick={() => send(c, "whatsapp")}
                                  className="text-[11px] text-faint underline underline-offset-4 hover:text-bone disabled:opacity-50"
                                >
                                  mark sent{c.recovery.whatsapp > 0 ? ` (${c.recovery.whatsapp})` : ""}
                                </button>
                              </>
                            )}
                            {!c.email && !wa && <span className="text-faint">no contact</span>}
                          </span>
                        )}
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="border-t border-ink-700 bg-ink-900/60">
                        <td colSpan={8} className="px-3 py-3">
                          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-faint">
                            Timeline · {c.events.length} events · first seen {when(c.firstSeen)}
                          </p>
                          <ol className="max-h-72 space-y-1 overflow-y-auto text-[12px]">
                            {[...c.events].reverse().map((e, i) => (
                              <li key={i} className="flex gap-3">
                                <span className="metric w-24 shrink-0 text-faint">{when(e.created_at)}</span>
                                <span className="w-40 shrink-0 font-bold text-bone">{e.name}</span>
                                <span className="text-mute">
                                  {[e.cta && `#${e.cta}`, e.detail, e.page, e.session && `s:${e.session.slice(0, 6)}`].filter(Boolean).join(" · ")}
                                </span>
                              </li>
                            ))}
                          </ol>
                        </td>
                      </tr>
                    )}
                  </FragmentRow>
                );
              })}
            </tbody>
          </table>
        </div>
        {rows.length > 300 && <p className="mt-3 text-[12px] text-faint">Showing the first 300. Narrow the search to see the rest.</p>}
      </section>
    </div>
  );
}

/** React needs a single child per map iteration; a fragment does that without a wrapper element in the table. */
function FragmentRow({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
