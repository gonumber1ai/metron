import type { DirectCopy, Step } from "@/lib/content/direct";

/**
 * The three visual devices the page argues through.
 *
 * Measure → train → measure again IS the brand. It is the one thing no bottle
 * on that shelf offers: every competitor makes a promise and not one of them
 * lets a man check it. So it gets drawn twice — once as the framework, once
 * inside the guarantee where it explains why the refund is safe to offer.
 *
 * Nothing here is sexual, herbal, anatomical or "alpha". The whole
 * positioning is that this is the serious option, and it has to look it.
 */

/* ── 1. The product ───────────────────────────────────────────────────────
   A page selling a phone programme showed no phone. This answers the one
   question a suspicious man actually has — "what am I buying?" — before he
   reads a word of the argument.

   Drawn in CSS rather than shipped as a screenshot: correct on day one,
   weightless on a Douala connection, and it cannot go stale against a UI
   that is still moving. A real screenshot drops into the same slot later.

   It shows a session waiting, never what happens inside one, and it invents
   no measurements. A fabricated before-and-after would break the only
   argument this page has.                                                */
export function PhoneMock({ ui }: { ui: DirectCopy["ui"] }) {
  return (
    <div
      aria-hidden
      className="relative w-[250px] rounded-[2.1rem] border border-ink-600 bg-ink-850 p-2 shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_28px_70px_-28px_rgb(0_0_0/0.95)] sm:w-[278px]"
    >
      <span className="absolute left-1/2 top-3.5 z-10 h-1.5 w-14 -translate-x-1/2 rounded-full bg-ink-700" />
      <div className="overflow-hidden rounded-[1.7rem] border border-ink-700 bg-ink-900 px-5 pb-7 pt-10">
        <p className="text-[9.5px] font-bold uppercase tracking-[0.18em] text-faint">
          {ui.today}
        </p>

        <p className="mt-4 text-[1.35rem] font-bold leading-tight text-bone">
          {ui.session}
        </p>
        <p className="metric mt-1 text-[2.5rem] font-bold leading-none text-jade">
          {ui.minutes}
        </p>

        {/* ten days, four behind him */}
        <div className="mt-6 flex gap-[3px]">
          {Array.from({ length: 10 }, (_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i < 4 ? "bg-jade" : "bg-ink-700"}`}
            />
          ))}
        </div>
        <p className="mt-2.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-faint">
          {ui.dayOf}
        </p>

        <span className="mt-6 flex w-full items-center justify-center rounded-full btn-go px-4 py-3 text-[12px] font-bold">
          {ui.startSession}
        </span>
      </div>
    </div>
  );
}

/* ── 2. The framework ─────────────────────────────────────────────────── */
export function MeasureFlow({
  steps,
  numbered = true,
}: {
  steps: Step[];
  numbered?: boolean;
}) {
  return (
    <ol className="grid gap-3.5 sm:grid-cols-3 sm:gap-5">
      {steps.map((s, i) => {
        const lit = i !== 1; // the two measurements are the point
        return (
          <li
            key={s.label}
            className={`rounded-2xl border px-5 py-5 ${
              lit ? "border-jade-700 bg-jade-050" : "border-ink-600 bg-ink-850"
            }`}
          >
            {numbered && (
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-faint">
                {s.step}
              </p>
            )}
            <h3
              className={`mt-2 text-[1.3rem] leading-tight ${
                lit ? "text-jade" : "text-bone"
              }`}
            >
              {s.label}
            </h3>
            {s.body && (
              <p className="mt-1.5 text-[0.95rem] leading-snug text-mute">{s.body}</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ── 3. The ten days ──────────────────────────────────────────────────────
   Replaces four paragraphs that described the protocol before a man had any
   reason to care about it. As a rail it reads in three seconds, which is all
   most visitors will give it, and the shape carries the argument by itself. */
export function Timeline({ steps }: { steps: Step[] }) {
  return (
    <ol className="grid gap-0">
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        return (
          <li key={s.step} className="grid grid-cols-[auto_1fr] gap-x-5">
            <div className="flex flex-col items-center">
              <span
                aria-hidden
                className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                  last
                    ? "border-jade-700 bg-jade text-[#04140C]"
                    : "border-ink-600 bg-ink-800 text-mute"
                }`}
              >
                {i + 1}
              </span>
              {!last && <span aria-hidden className="my-1 w-px flex-1 bg-ink-700" />}
            </div>

            <div className={last ? "pt-1.5" : "pb-9 pt-1.5"}>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">
                {s.step}
              </p>
              <h3
                className={`mt-1 text-[1.3rem] leading-tight md:text-[1.45rem] ${
                  last ? "text-jade" : "text-bone"
                }`}
              >
                {s.label}
              </h3>
              <p className="mt-2 max-w-xl text-[1rem] leading-[1.65] text-mute">
                {s.body}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
