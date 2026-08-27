"use client";

import { useEffect, useRef, useState } from "react";
import { formatDuration, type SessionLog } from "@/lib/store";

type Phase = "idle" | "running" | "resting" | "done";

/**
 * The session timer.
 *
 * He starts it, and every time he hits STOP it records how long that cycle
 * lasted. Those cycle times are the number that moves first — the climb from 5
 * to 7 gets slower a week before the bedroom clock changes — so this is the
 * feedback that keeps him in the programme while he waits for the real result.
 *
 * Deliberately huge buttons and one decision at a time. He is using this in the
 * dark, one-handed, and not in a state to read instructions.
 */
export function SessionTimer({
  locale,
  day,
  targetCycles,
  onSave,
}: {
  locale: string;
  day: number;
  targetCycles: number;
  onSave: (log: Omit<SessionLog, "id">) => void;
}) {
  const fr = locale === "fr";
  const [phase, setPhase] = useState<Phase>("idle");
  const [cycles, setCycles] = useState<number[]>([]);
  const [tick, setTick] = useState(0);

  const cycleStart = useRef<number | null>(null);
  const sessionStart = useRef<number | null>(null);
  const restStart = useRef<number | null>(null);

  // One interval for the whole component; re-renders once a second.
  useEffect(() => {
    if (phase !== "running" && phase !== "resting") return;
    const id = window.setInterval(() => setTick((t) => t + 1), 250);
    return () => window.clearInterval(id);
  }, [phase]);

  const now = Date.now();
  const cycleElapsed =
    phase === "running" && cycleStart.current
      ? Math.floor((now - cycleStart.current) / 1000)
      : 0;
  const restElapsed =
    phase === "resting" && restStart.current
      ? Math.floor((now - restStart.current) / 1000)
      : 0;
  const totalElapsed = sessionStart.current
    ? Math.floor((now - sessionStart.current) / 1000)
    : 0;

  function start() {
    const t = Date.now();
    sessionStart.current = t;
    cycleStart.current = t;
    setPhase("running");
  }

  function stop() {
    if (!cycleStart.current) return;
    const secs = Math.floor((Date.now() - cycleStart.current) / 1000);
    setCycles((prev) => [...prev, secs]);
    restStart.current = Date.now();
    cycleStart.current = null;
    setPhase("resting");
  }

  function resume() {
    cycleStart.current = Date.now();
    restStart.current = null;
    setPhase("running");
  }

  function finish(finished: boolean) {
    // A cycle still running when he ends the session still counts.
    let all = cycles;
    if (phase === "running" && cycleStart.current) {
      all = [...cycles, Math.floor((Date.now() - cycleStart.current) / 1000)];
      setCycles(all);
    }
    onSave({
      day,
      startedAt: new Date(sessionStart.current ?? Date.now()).toISOString(),
      cycles: all,
      totalSeconds: totalElapsed,
      finished,
    });
    setPhase("done");
  }

  const best = cycles.length ? Math.max(...cycles) : 0;
  // Below a minute he almost certainly has not come back down to 3 yet.
  const restReady = restElapsed >= 60;

  /* ------------------------------------------------------------- idle */
  if (phase === "idle") {
    return (
      <div className="rounded-2xl card p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-jade">
          {fr ? "Chronomètre de séance" : "Session timer"}
        </p>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-mute">
          {fr
            ? `Appuyez sur DÉMARRER quand vous commencez. Appuyez sur STOP à 6 ou 7 sur 10. ${targetCycles} cycles aujourd'hui.`
            : `Hit START when you begin. Hit STOP at 6 or 7 out of 10. ${targetCycles} cycles today.`}
        </p>
        <button
          type="button"
          onClick={start}
          className="mt-5 w-full rounded-2xl btn-go py-5 text-[1.15rem] font-bold tracking-wide"
        >
          {fr ? "DÉMARRER" : "START"}
        </button>
      </div>
    );
  }

  /* ------------------------------------------------------------- done */
  if (phase === "done") {
    return (
      <div className="rounded-2xl border border-jade/40 bg-jade-050 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-jade">
          {fr ? "Séance enregistrée" : "Session saved"}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            [fr ? "Cycles" : "Cycles", String(cycles.length)],
            [fr ? "Meilleur" : "Longest", formatDuration(best, locale)],
            [fr ? "Total" : "Total", formatDuration(totalElapsed, locale)],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-ink-900/60 px-3 py-3 text-center">
              <p className="text-[10px] uppercase tracking-wide text-faint">{k}</p>
              <p className="metric mt-1 text-[1.25rem] font-bold text-jade">{v}</p>
            </div>
          ))}
        </div>

        <ol className="mt-4 space-y-1.5">
          {cycles.map((c, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-lg bg-ink-900/40 px-3 py-2 text-[0.92rem]"
            >
              <span className="text-mute">
                {fr ? "Cycle" : "Cycle"} {i + 1}
              </span>
              <span className="metric font-semibold text-bone">
                {formatDuration(c, locale)}
              </span>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  /* -------------------------------------------------- running / resting */
  const isRun = phase === "running";

  return (
    <div
      className={`rounded-2xl border p-5 transition-colors ${
        isRun ? "border-jade bg-jade-050" : "border-amber/50 bg-amber-050"
      }`}
    >
      <div className="flex items-center justify-between">
        <p
          className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
            isRun ? "text-jade" : "text-amber"
          }`}
        >
          {isRun
            ? `${fr ? "Cycle" : "Cycle"} ${cycles.length + 1} ${fr ? "sur" : "of"} ${targetCycles}`
            : fr
              ? "Repos — laissez redescendre à 3"
              : "Rest — let it drop to 3"}
        </p>
        <span className="metric text-[12px] text-faint">
          {fr ? "Total" : "Total"} {formatDuration(totalElapsed, locale)}
        </span>
      </div>

      {/* the big number */}
      <p
        className={`metric mt-3 text-center text-[4.5rem] font-bold leading-none ${
          isRun ? "text-jade" : "text-amber"
        }`}
      >
        {formatDuration(isRun ? cycleElapsed : restElapsed, locale)}
      </p>

      <p className="mt-2 text-center text-[0.9rem] text-mute">
        {isRun
          ? fr
            ? "Nommez votre chiffre. Arrêtez à 6 ou 7."
            : "Name your number. Stop at 6 or 7."
          : restReady
            ? fr
              ? "La traction a disparu ? Repartez. Sinon, attendez encore."
              : "Pulling feeling gone? Go again. If not, wait longer."
            : fr
              ? "Respirez. Relâchez. Ne serrez pas. Visez 60 à 120 secondes."
              : "Breathe out. Let go. Don't squeeze. Aim for 60-120 seconds."}
      </p>

      {isRun ? (
        <button
          type="button"
          onClick={stop}
          className="mt-5 w-full rounded-2xl btn-stop py-5 text-[1.15rem] font-bold tracking-wide"
        >
          {fr ? "STOP — JE SUIS À 6" : "STOP — I'M AT 6"}
        </button>
      ) : (
        <button
          type="button"
          onClick={resume}
          className={`mt-5 w-full rounded-2xl py-5 text-[1.15rem] font-bold tracking-wide transition-opacity ${
            restReady ? "btn-go" : "btn-go opacity-50"
          }`}
        >
          {fr ? "REPRENDRE" : "GO AGAIN"}
        </button>
      )}

      {/* cycles so far */}
      {cycles.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {cycles.map((c, i) => (
            <span
              key={i}
              className="metric rounded-lg bg-ink-900/50 px-2.5 py-1 text-[0.85rem] text-bone"
            >
              {i + 1}: {formatDuration(c, locale)}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => finish(false)}
          className="flex-1 rounded-xl border border-ink-600 py-3 text-[0.9rem] font-medium text-mute"
        >
          {fr ? "Terminer sans finir" : "End without finishing"}
        </button>
        <button
          type="button"
          onClick={() => finish(true)}
          className="flex-1 rounded-xl border border-ink-600 py-3 text-[0.9rem] font-medium text-mute"
        >
          {fr ? "J'ai fini" : "I finished"}
        </button>
      </div>
    </div>
  );
}
