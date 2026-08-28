"use client";

import { useState } from "react";

export type ActivityRow = Record<string, unknown>;

type Msg = { sender: string; body: string; created_at: string };

function fmtSecs(v: unknown): string {
  const n = typeof v === "number" ? v : NaN;
  if (!Number.isFinite(n)) return "—";
  const m = Math.floor(n / 60);
  const s = n % 60;
  return m ? `${m}:${String(s).padStart(2, "0")}` : `${s}s`;
}

function ago(iso: unknown): string {
  if (typeof iso !== "string" || !iso) return "never";
  const h = (Date.now() - new Date(iso).getTime()) / 36e5;
  if (h < 1) return "just now";
  if (h < 24) return `${Math.floor(h)}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/**
 * Paying customers, what they have done, and the thread.
 *
 * The row people actually need is the one where `last_seen` is empty: a man
 * who paid and never opened the app. He is the refund waiting to happen, and
 * one message from you is usually all it takes.
 */
export type Conversation = {
  ref: string;
  last_body: string;
  last_sender: string;
  last_at: string;
  unread: number;
  total: number;
};

export function Customers({
  rows,
  conversations = [],
}: {
  rows: ActivityRow[];
  conversations?: Conversation[];
}) {
  const [open, setOpen] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function openThread(ref: string) {
    setOpen(ref);
    setMsgs([]);
    try {
      const r = await fetch(`/api/admin/thread?ref=${encodeURIComponent(ref)}`);
      const d = (await r.json()) as { messages?: Msg[] };
      setMsgs(d.messages ?? []);
    } catch {
      /* leave it empty */
    }
  }

  async function reply(e: React.FormEvent) {
    e.preventDefault();
    if (!open || !text.trim()) return;
    setBusy(true);
    try {
      await fetch("/api/admin/thread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref: open, text: text.trim() }),
      });
      setMsgs((m) => [
        ...m,
        { sender: "coach", body: text.trim(), created_at: new Date().toISOString() },
      ]);
      setText("");
    } catch {
      /* leave the text in the box so it is not lost */
    }
    setBusy(false);
  }

  return (
    <section className="mt-6 rounded-2xl card p-5">
      <h2 className="text-[0.95rem] font-bold text-bone">Customers</h2>
      <p className="mt-0.5 mb-4 text-[12px] text-faint">
        Everyone who paid, and what they have done since. Red means they have not opened
        the app.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-[0.88rem]">
          <thead>
            <tr className="text-[11px] uppercase tracking-wide text-faint">
              <th className="pb-2 pr-4 font-bold">Name</th>
              <th className="pb-2 pr-4 font-bold">Plan</th>
              <th className="pb-2 pr-4 font-bold">Day</th>
              <th className="pb-2 pr-4 font-bold">Sessions</th>
              <th className="pb-2 pr-4 font-bold">Logs</th>
              <th className="pb-2 pr-4 font-bold">Before</th>
              <th className="pb-2 pr-4 font-bold">After</th>
              <th className="pb-2 pr-4 font-bold">Last seen</th>
              <th className="pb-2 font-bold">Message</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const ref = String(r.ref ?? "");
              const unread = Number(r.unread ?? 0);
              const cold = !r.last_seen;
              return (
                <tr key={i} className="border-t border-ink-700">
                  <td className="py-2.5 pr-4 text-bone">
                    {String(r.name ?? "—")}
                    <span className="metric ml-2 text-[11px] text-faint">{ref}</span>
                  </td>
                  <td className="py-2.5 pr-4 text-mute">{String(r.plan ?? "—")}</td>
                  <td className="metric py-2.5 pr-4 text-mute">{String(r.day ?? "—")}</td>
                  <td className="metric py-2.5 pr-4 text-mute">{String(r.sessions ?? 0)}</td>
                  <td className="metric py-2.5 pr-4 text-mute">{String(r.markers ?? 0)}</td>
                  <td className="metric py-2.5 pr-4 text-mute">{fmtSecs(r.baseline_seconds)}</td>
                  <td className="metric py-2.5 pr-4 font-bold text-jade">
                    {fmtSecs(r.retest_seconds)}
                  </td>
                  <td className={`py-2.5 pr-4 ${cold ? "font-bold text-alert" : "text-faint"}`}>
                    {ago(r.last_seen)}
                  </td>
                  <td className="py-2.5">
                    <button
                      type="button"
                      onClick={() => openThread(ref)}
                      className="rounded-full border border-ink-600 px-3 py-1 text-[12px] font-bold text-bone hover:border-jade hover:text-jade"
                    >
                      Open
                      {unread > 0 && (
                        <span className="ml-1.5 rounded-full bg-alert px-1.5 text-[10px] text-white">
                          {unread}
                        </span>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="py-3 text-[0.9rem] text-faint">
                  No customers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* -------------------------------------------- everybody who wrote */}
      {/* The table above is the `activity` view, gated on stage = 'paid'.
          Anyone who wrote in without a reconciled payment had their message
          stored and shown nowhere, which is indistinguishable from the message
          never arriving. These are the threads that table cannot see. */}
      {(() => {
        const paid = new Set(rows.map((r) => String(r.ref ?? "")));
        const others = conversations.filter((c) => !paid.has(c.ref));
        if (others.length === 0) return null;
        return (
          <div className="mt-8 border-t border-ink-700 pt-5">
            <h3 className="text-[0.9rem] font-bold text-bone">Not in the customer list</h3>
            <p className="mt-0.5 mb-3 text-[12px] text-faint">
              People who wrote in but have no reconciled payment. Worth reading — a
              man whose payment did not land still thinks he bought it.
            </p>
            <ul className="space-y-2">
              {others.map((c) => (
                <li key={c.ref}>
                  <button
                    type="button"
                    onClick={() => openThread(c.ref)}
                    className="flex w-full items-start gap-3 rounded-xl border border-ink-700 bg-ink-800 px-4 py-3 text-left hover:border-ink-500"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="metric block text-[12px] font-bold text-mute">
                        {c.ref}
                      </span>
                      <span className="mt-1 block truncate text-[0.9rem] text-bone">
                        {c.last_sender === "coach" ? "You: " : ""}
                        {c.last_body}
                      </span>
                    </span>
                    {c.unread > 0 && (
                      <span className="shrink-0 rounded-full bg-alert px-2 py-0.5 text-[10px] font-bold text-white">
                        {c.unread}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );
      })()}

      {/* ------------------------------------------------------- thread */}
      {open && (
        <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(null)}
            className="absolute inset-0 bg-black/70"
          />
          <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-2xl border border-ink-600 bg-ink-800 sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-ink-700 px-5 py-3">
              <span className="metric text-[13px] font-bold text-bone">{open}</span>
              <button
                type="button"
                onClick={() => setOpen(null)}
                className="text-[13px] text-mute hover:text-bone"
              >
                Close
              </button>
            </div>

            <div className="flex-1 space-y-2.5 overflow-y-auto px-5 py-4">
              {msgs.length === 0 && (
                <p className="text-[0.9rem] text-faint">
                  No messages yet. You can start the conversation.
                </p>
              )}
              {msgs.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[0.92rem] leading-relaxed ${
                    m.sender === "coach"
                      ? "ml-auto bg-jade text-ink-900"
                      : "bg-ink-700 text-bone"
                  }`}
                >
                  {m.body}
                </div>
              ))}
            </div>

            <form onSubmit={reply} className="flex gap-2 border-t border-ink-700 p-3">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Reply…"
                className="min-w-0 flex-1 rounded-xl border border-ink-600 bg-ink-900 px-4 py-2.5 text-[0.93rem] text-bone placeholder:text-faint focus:border-jade focus:outline-none"
              />
              <button
                type="submit"
                disabled={busy || !text.trim()}
                className="shrink-0 rounded-xl btn-go px-4 py-2.5 text-[0.9rem] font-bold disabled:opacity-40"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
