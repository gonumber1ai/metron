import { getReviews } from "@/lib/content/reviews";
import { results, hasResults, methodNote } from "@/lib/content/results";

/**
 * Proof.
 *
 * Three states, in order of strength:
 *
 *   1. Real aggregate numbers from real customers, once results.ts is filled in
 *      from actual Day 1 vs Day 12 data.
 *   2. Real reviews, once reviews.ts has any.
 *   3. Before either exists: the method's own credibility. It is 70 years old
 *      and it is what sex therapists actually teach — which is a strong claim,
 *      and true, and does not depend on having customers yet.
 *
 * What this never does is lead with what is missing. An earlier version opened
 * with "we do not have testimonials yet" and read like an apology. Nobody buys
 * from someone apologising.
 */
export function Proof({ locale, tone = "light" }: { locale: string; tone?: "light" | "dark" }) {
  const reviews = getReviews(locale);
  const fr = locale === "fr";
  const note = fr ? methodNote.fr : methodNote.en;

  const card = tone === "light" ? "border-rule bg-paper-2" : "border-ink-600 bg-ink-850";
  const heading = tone === "light" ? "text-graphite" : "text-bone";
  const body = tone === "light" ? "text-graphite-2" : "text-mute";
  const faint = tone === "light" ? "text-graphite-2/70" : "text-faint";
  const wrap = tone === "light" ? "border-b border-rule py-10 md:py-14" : "py-8";

  return (
    <section className={wrap}>
      {/* ---- real numbers, once they exist ---- */}
      {hasResults() && (
        <div className="mb-8">
          <p className="metric text-[3.4rem] font-bold leading-none text-jade md:text-[4.2rem]">
            {Math.round((results.improvedShare ?? 0) * 10)}/10
          </p>
          <p className={`mt-3 text-[1.05rem] leading-relaxed ${heading}`}>
            {fr
              ? `des hommes qui ont terminé les 12 jours ont vu leur chiffre monter. Gain médian : ${results.medianMinutesAdded} minutes.`
              : `of men who finished the 12 days saw their number go up. Median gain: ${results.medianMinutesAdded} minutes.`}
          </p>
          <p className={`mt-2 text-[0.85rem] ${faint}`}>
            {fr ? "Sur " : "Based on "}
            {results.sampleSize}
            {fr ? " programmes terminés · " : " completed programmes · "}
            {results.asOf}
          </p>
        </div>
      )}

      {/* ---- the method's own credibility ---- */}
      <h2
        className={`font-serif text-[1.6rem] leading-tight tracking-tight md:text-[2rem] ${heading}`}
      >
        {note.title}
      </h2>
      <div className={`mt-5 space-y-4 text-[1.02rem] leading-[1.75] ${body}`}>
        {note.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {/* ---- reviews, once they exist ---- */}
      {reviews.length > 0 ? (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {reviews.map((r) => (
            <li key={r.id} className={`rounded-xl border p-5 ${card}`}>
              {r.numbers && (
                <p className="mb-3 flex items-center gap-2">
                  <span className={`metric text-[1.05rem] font-bold ${faint}`}>
                    {r.numbers.day1}
                  </span>
                  <span aria-hidden className={faint}>
                    →
                  </span>
                  <span className="metric text-[1.4rem] font-bold text-jade">
                    {r.numbers.day12}
                  </span>
                </p>
              )}
              <p className={`text-[0.95rem] leading-relaxed ${body}`}>{r.text}</p>
              <p className={`mt-3 text-[0.82rem] ${faint}`}>{r.who}</p>
              {r.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.image}
                  alt=""
                  loading="lazy"
                  className="mt-3 w-full rounded-lg border border-black/10"
                />
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className={`mt-6 text-[0.9rem] ${faint}`}>{note.soon}</p>
      )}
    </section>
  );
}
