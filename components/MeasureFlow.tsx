import type { DirectCopy } from "@/lib/content/direct";

/**
 * The two diagrams the page argues through.
 *
 * Measure → train → measure again IS the brand. It is the one thing no
 * competitor on that shelf offers: every bottle makes a promise and not one
 * of them lets a man check it. So the idea gets drawn twice — once under the
 * headline where it explains what he is buying, and once inside the
 * guarantee where it explains why the refund is safe to offer.
 *
 * Deliberately plain. No phone frames, no screenshots, no invented seconds in
 * the slots — a fabricated before-and-after would break the only argument
 * this page has. The diagrams show the SHAPE of the ten days and nothing that
 * happens inside a session.
 */

/** The three-beat mechanism. Horizontal on desktop, stacked on a phone. */
export function MeasureFlow({
  ui,
  labels,
  tone = "solid",
}: {
  ui: DirectCopy["ui"];
  /** Three strings, in order. The hero passes sentences, the guarantee verbs. */
  labels: string[];
  tone?: "solid" | "quiet";
}) {
  const beats = [
    { n: "1", text: labels[0], lit: true },
    { n: "2", text: labels[1], lit: false },
    { n: "3", text: labels[2], lit: true },
  ];

  return (
    <ol className="grid gap-3 sm:grid-cols-3 sm:gap-4">
      {beats.map((b) => (
        <li
          key={b.n}
          className={`flex items-center gap-3.5 rounded-xl border px-4 py-3.5 sm:flex-col sm:items-start sm:gap-3 sm:px-5 sm:py-5 ${
            b.lit && tone === "solid"
              ? "border-jade-700 bg-jade-050"
              : "border-ink-600 bg-ink-850"
          }`}
        >
          <span
            aria-hidden
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
              b.lit && tone === "solid"
                ? "bg-jade text-[#04140C]"
                : "bg-ink-700 text-mute"
            }`}
          >
            {b.n}
          </span>
          <span
            className={`text-[0.95rem] font-bold leading-snug ${
              b.lit && tone === "solid" ? "text-bone" : "text-mute"
            }`}
          >
            {b.text}
          </span>
        </li>
      ))}
    </ol>
  );
}

/**
 * The ten days as a rail.
 *
 * This replaces four paragraphs of prose that described the protocol before a
 * man had any reason to care about it. As a rail it can be skimmed in three
 * seconds, which is all most visitors will give it, and the shape — measure,
 * train, log, measure — carries the whole argument on its own.
 */
export function Timeline({ steps }: { steps: DirectCopy["timeline"] }) {
  return (
    <ol className="relative grid gap-0">
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        return (
          <li key={s.step} className="relative grid grid-cols-[auto_1fr] gap-x-5">
            {/* rail */}
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

            <div className={last ? "pt-1.5" : "pb-8 pt-1.5"}>
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
