"use client";

import { useState } from "react";
import { Spinner, useAction } from "@/components/Pending";

type Audience = "all" | "paid" | "leads" | "inactive";

const GROUPS: { id: Audience; label: string; note: string }[] = [
  { id: "paid", label: "Customers", note: "Everyone who paid" },
  { id: "inactive", label: "Paid, never opened", note: "The refunds waiting to happen" },
  { id: "leads", label: "Quiz only", note: "Finished the quiz, did not pay" },
  { id: "all", label: "Everyone", note: "Customers and leads" },
];

type Result = { matched: number; recipients: number; emailed: number; failed: number };

/**
 * Write to a group of people at once.
 *
 * The two channels are deliberately separate choices rather than one "send"
 * button, because they are not equally private. The in-app copy sits behind
 * his login and shows as a badge; nobody standing next to him learns anything.
 * The email carries the text, and its SUBJECT lands on a lock screen where
 * somebody else may read it — which for this product is the one failure that
 * loses a customer permanently. Hence the warning next to the subject field
 * and nowhere else.
 */
export function Broadcast() {
  const [audience, setAudience] = useState<Audience>("paid");
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const [viaApp, setViaApp] = useState(true);
  const [viaEmail, setViaEmail] = useState(false);
  const [locale, setLocale] = useState<"en" | "fr">("en");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [confirming, setConfirming] = useState(false);

  const group = GROUPS.find((g) => g.id === audience)!;

  const [sending, send] = useAction(async () => {
    setError(null);
    try {
      const r = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audience, subject, text, viaApp, viaEmail, locale }),
      });
      const d = (await r.json()) as Result & { ok: boolean; error?: string };
      if (!r.ok || !d.ok) {
        setError(d.error ?? "That did not send. Try again.");
        return;
      }
      setResult(d);
      setConfirming(false);
      setText("");
      setSubject("");
    } catch {
      setError("That did not send. Check your connection and try again.");
    }
  });

  return (
    <section className="mt-6 rounded-2xl card p-5">
      <h2 className="text-[0.95rem] font-bold text-bone">Write to people</h2>
      <p className="mt-0.5 mb-5 text-[12px] text-faint">
        One message to a whole group, in the app or by email.
      </p>

      {/* ------------------------------------------------------- audience */}
      <p className="text-[11px] font-bold uppercase tracking-wide text-faint">Who gets it</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {GROUPS.map((g) => {
          const on = audience === g.id;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => {
                setAudience(g.id);
                setConfirming(false);
              }}
              className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                on ? "border-jade bg-jade-050" : "border-ink-700 bg-ink-800 hover:border-ink-500"
              }`}
            >
              <span className={`block text-[13.5px] font-bold ${on ? "text-jade" : "text-bone"}`}>
                {g.label}
              </span>
              <span className="mt-0.5 block text-[11.5px] text-faint">{g.note}</span>
            </button>
          );
        })}
      </div>

      {/* -------------------------------------------------------- channels */}
      <p className="mt-6 text-[11px] font-bold uppercase tracking-wide text-faint">How it goes</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Toggle on={viaApp} onClick={() => setViaApp(!viaApp)} label="In the app" />
        <Toggle on={viaEmail} onClick={() => setViaEmail(!viaEmail)} label="By email" />
        <span className="ml-auto flex gap-1 rounded-lg border border-ink-700 bg-ink-800 p-1">
          {(["en", "fr"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLocale(l)}
              className={`rounded-md px-3 py-1 text-[12px] font-bold uppercase ${
                locale === l ? "bg-jade text-ink-900" : "text-mute hover:text-bone"
              }`}
            >
              {l}
            </button>
          ))}
        </span>
      </div>

      {/* --------------------------------------------------------- message */}
      {viaEmail && (
        <div className="mt-5">
          <label className="text-[11px] font-bold uppercase tracking-wide text-faint">
            Subject line
          </label>
          <input
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              setConfirming(false);
            }}
            placeholder="Your programme"
            className="mt-2 w-full rounded-xl border border-ink-600 bg-ink-850 px-4 py-3 text-[0.95rem] text-bone placeholder:text-faint focus:border-jade focus:outline-none"
          />
          <p className="mt-2 rounded-lg border-l-2 border-amber bg-amber-050 px-3 py-2 text-[12px] leading-relaxed text-bone">
            This shows on his lock screen. Keep it plain — nothing about sex,
            stamina or lasting longer. Someone else may be looking at the phone.
          </p>
        </div>
      )}

      <div className="mt-5">
        <label className="text-[11px] font-bold uppercase tracking-wide text-faint">Message</label>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setConfirming(false);
          }}
          rows={6}
          maxLength={4000}
          placeholder="Write it the way you would say it to one man."
          className="mt-2 w-full resize-y rounded-xl border border-ink-600 bg-ink-850 px-4 py-3 text-[0.95rem] leading-relaxed text-bone placeholder:text-faint focus:border-jade focus:outline-none"
        />
        <p className="mt-1 text-right text-[11px] text-faint">{text.length}/4000</p>
      </div>

      {error && (
        <p className="mt-3 rounded-lg border border-alert/40 bg-alert/10 px-3 py-2 text-[13px] text-bone">
          {error}
        </p>
      )}

      {result && (
        <p className="mt-3 rounded-lg border border-jade/40 bg-jade-050 px-3 py-2 text-[13px] leading-relaxed text-bone">
          Sent to {result.matched} {result.matched === 1 ? "person" : "people"}.
          {result.recipients > 0 && ` ${result.recipients} in the app.`}
          {result.emailed > 0 && ` ${result.emailed} emailed.`}
          {result.failed > 0 && ` ${result.failed} email${result.failed === 1 ? "" : "s"} failed.`}
        </p>
      )}

      {/* ----------------------------------------------------------- send */}
      {/* Two steps on purpose. This button writes to every customer at once
          and there is no recall — the confirm is the only undo there is. */}
      <div className="mt-5 flex items-center gap-3">
        {confirming ? (
          <>
            <button
              type="button"
              onClick={() => void send()}
              disabled={sending}
              className="flex items-center justify-center gap-2 rounded-full btn-go px-6 py-3 text-[14.5px] font-bold disabled:opacity-50"
            >
              {sending && <Spinner />}
              {sending ? "Sending…" : `Yes — send to ${group.label.toLowerCase()}`}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={sending}
              className="text-[13.5px] text-mute hover:text-bone"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => {
              setResult(null);
              setConfirming(true);
            }}
            disabled={!text.trim() || (!viaApp && !viaEmail)}
            className="rounded-full btn-go px-6 py-3 text-[14.5px] font-bold disabled:opacity-40"
          >
            Send
          </button>
        )}
      </div>
    </section>
  );
}

function Toggle({
  on,
  onClick,
  label,
}: {
  on: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-bold transition-colors ${
        on ? "border-jade bg-jade-050 text-jade" : "border-ink-700 bg-ink-800 text-mute"
      }`}
    >
      <span
        aria-hidden
        className={`grid h-[18px] w-[18px] place-items-center rounded-[5px] border-2 ${
          on ? "border-jade bg-jade" : "border-ink-500"
        }`}
      >
        {on && (
          <svg viewBox="0 0 12 12" className="h-3 w-3 text-ink-900" fill="none">
            <path
              d="M2.5 6.2 4.8 8.5 9.5 3.8"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      {label}
    </button>
  );
}
