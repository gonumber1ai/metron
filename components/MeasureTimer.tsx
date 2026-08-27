"use client";

import { useEffect, useRef, useState } from "react";
import { formatDuration } from "@/lib/store";

/**
 * The measurement timer for Day 1, 12 and 30.
 *
 * One job: start when he starts, stop when he finishes, hand back the seconds.
 * He can also type the number in if he timed it on his phone clock instead —
 * some men will not want to touch an app mid-act, and forcing them to would
 * corrupt the very measurement we are trying to protect.
 */
export function MeasureTimer({
  locale,
  onDone,
}: {
  locale: string;
  onDone: (seconds: number) => void;
}) {
  const fr = locale === "fr";
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [manual, setManual] = useState(false);
  const [mins, setMins] = useState("");
  const [secs, setSecs] = useState("");
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      if (startedAt.current) {
        setElapsed(Math.floor((Date.now() - startedAt.current) / 1000));
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [running]);

  const typed = (parseInt(mins || "0", 10) || 0) * 60 + (parseInt(secs || "0", 10) || 0);

  if (manual) {
    return (
      <div className="rounded-2xl card p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
          {fr ? "Entrer le temps à la main" : "Type the time in"}
        </p>

        <div className="mt-4 flex items-end gap-3">
          <label className="flex-1">
            <span className="block text-[11px] uppercase tracking-wide text-faint">
              {fr ? "Minutes" : "Minutes"}
            </span>
            <input
              type="number"
              min={0}
              max={120}
              inputMode="numeric"
              value={mins}
              onChange={(e) => setMins(e.target.value)}
              placeholder="0"
              className="metric mt-1 w-full rounded-xl border border-ink-600 bg-ink-900 px-4 py-3 text-[1.8rem] font-bold text-bone focus:border-jade focus:outline-none"
            />
          </label>
          <span className="pb-4 text-[1.5rem] text-faint">:</span>
          <label className="flex-1">
            <span className="block text-[11px] uppercase tracking-wide text-faint">
              {fr ? "Secondes" : "Seconds"}
            </span>
            <input
              type="number"
              min={0}
              max={59}
              inputMode="numeric"
              value={secs}
              onChange={(e) => setSecs(e.target.value)}
              placeholder="00"
              className="metric mt-1 w-full rounded-xl border border-ink-600 bg-ink-900 px-4 py-3 text-[1.8rem] font-bold text-bone focus:border-jade focus:outline-none"
            />
          </label>
        </div>

        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            onClick={() => setManual(false)}
            className="rounded-xl border border-ink-600 px-4 py-3 text-[0.9rem] text-mute"
          >
            {fr ? "Chronomètre" : "Use timer"}
          </button>
          <button
            type="button"
            disabled={typed <= 0}
            onClick={() => onDone(typed)}
            className="flex-1 rounded-xl btn-go py-3 text-[1rem] font-bold disabled:opacity-30"
          >
            {fr ? "ENREGISTRER" : "SAVE"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border p-5 transition-colors ${
        running ? "border-jade bg-jade-050" : "border-ink-600 bg-ink-800"
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-jade">
        {fr ? "Chronomètre" : "Timer"}
      </p>

      <p
        className={`metric mt-3 text-center text-[4.5rem] font-bold leading-none ${
          running ? "text-jade" : "text-faint"
        }`}
      >
        {formatDuration(elapsed, locale)}
      </p>

      <p className="mt-2 text-center text-[0.9rem] text-mute">
        {running
          ? fr
            ? "Appuyez sur STOP dès que vous finissez."
            : "Hit STOP the moment you finish."
          : fr
            ? "Appuyez sur DÉMARRER quand vous commencez."
            : "Hit START when you begin."}
      </p>

      {!running ? (
        <button
          type="button"
          onClick={() => {
            startedAt.current = Date.now();
            setElapsed(0);
            setRunning(true);
          }}
          className="mt-5 w-full rounded-2xl btn-go py-5 text-[1.15rem] font-bold tracking-wide"
        >
          {fr ? "DÉMARRER" : "START"}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            setRunning(false);
            onDone(Math.max(1, Math.floor((Date.now() - (startedAt.current ?? Date.now())) / 1000)));
          }}
          className="mt-5 w-full rounded-2xl btn-stop py-5 text-[1.15rem] font-bold tracking-wide"
        >
          {fr ? "STOP" : "STOP"}
        </button>
      )}

      <button
        type="button"
        onClick={() => setManual(true)}
        className="mt-3 w-full text-center text-[0.86rem] text-faint underline underline-offset-4"
      >
        {fr ? "Je l'ai chronométré ailleurs — entrer à la main" : "I timed it elsewhere — type it in"}
      </button>
    </div>
  );
}
