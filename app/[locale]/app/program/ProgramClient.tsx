"use client";

import Link from "next/link";
import { getDict } from "@/lib/i18n";
import { daysFor, totalDays, TEST_LAST_DAY } from "@/lib/content/protocol";
import { useMetron } from "@/components/useMetron";
import { improved, retest } from "@/lib/store";
import { tasksDone } from "@/lib/store";
import { getPrices } from "@/lib/payments";

export function ProgramClient({ locale }: { locale: string }) {
  const t = getDict(locale);
  const { state, ready } = useMetron(locale);
  const plan = state.plan ?? "test";
  const didRetest = !!retest(state);
  const wonIt = improved(state);
  /* The trial price, from the price book. It used to be typed into this file
     as "7,500" in four places, which meant a price change on the sales page
     left the in-app upsell and the refund promise quoting a number nobody had
     been charged. Country is unknown in here, so this is the home market
     figure — the same one the buyer saw at checkout. */
  const testPrice =
    getPrices("CM").find((p) => p.plan === "test")?.display ?? "";

  const days = daysFor(locale, plan);
  const last = totalDays(plan);

  if (!ready) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <p className="text-mute">{t.common.loading}</p>
      </div>
    );
  }

  // Group by phase so the 30-day view reads as a progression, not a list of 31.
  const phases: { name: string; days: typeof days }[] = [];
  for (const d of days) {
    const name = d.phase ?? "";
    const bucket = phases.find((p) => p.name === name);
    if (bucket) bucket.days.push(d);
    else phases.push({ name, days: [d] });
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-6 md:py-10">
      <h1 className="text-[1.7rem] font-semibold tracking-tight">{t.nav.program}</h1>
      <p className="mt-1.5 text-[0.95rem] text-mute">
        {plan === "test" ? t.offer.testName : t.offer.sprintName} · {last} {t.common.day.toLowerCase()}s
      </p>

      {phases.map((phase) => (
        <section key={phase.name} className="mt-8">
          {phase.name && (
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
              {phase.name}
            </h2>
          )}

          <ul className="space-y-2">
            {phase.days.map((d) => {
              const reached = d.day <= state.day;
              const done = tasksDone(state, d.day);
              const complete = d.tasks.length > 0 && done.length === d.tasks.length;
              const current = d.day === state.day;

              const inner = (
                <div
                  className={`flex items-center gap-4 rounded-xl border px-4 py-3.5 transition-colors ${
                    current
                      ? "border-jade bg-jade-050"
                      : reached
                        ? "border-ink-600 bg-ink-800 hover:border-ink-500"
                        : "border-ink-700 bg-ink-800/40"
                  }`}
                >
                  <span
                    className={`metric grid h-10 w-10 shrink-0 place-items-center rounded-lg text-[15px] font-semibold ${
                      complete
                        ? "bg-jade text-ink-900"
                        : current
                          ? "bg-jade-050 text-jade ring-1 ring-jade"
                          : reached
                            ? "bg-ink-700 text-mute"
                            : "bg-ink-800 text-faint"
                    }`}
                  >
                    {d.day}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-[0.96rem] font-medium leading-snug ${
                        reached ? "text-bone" : "text-faint"
                      }`}
                    >
                      {d.title}
                    </span>
                    <span className="mt-0.5 block truncate text-[0.85rem] text-faint">
                      {d.focus}
                    </span>
                  </span>

                  {d.session && reached && (
                    <span className="shrink-0 rounded-full border border-ink-600 px-2 py-0.5 text-[10px] uppercase tracking-wide text-jade">
                      {locale === "fr" ? "Séance" : "Session"}
                    </span>
                  )}
                  {!reached && (
                    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-faint" fill="none" aria-hidden>
                      <path
                        d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6v-9Z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              );

              return (
                <li key={d.day}>
                  {reached ? (
                    <Link href={`/${locale}/app/program/${d.day}`}>{inner}</Link>
                  ) : (
                    <div
                      title={t.app.lockedBody.replace("{day}", String(d.day))}
                      aria-disabled="true"
                    >
                      {inner}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {/* The 30-day is offered ONLY to men whose Day 12 actually beat Day 1.
          Two reasons. Selling more to a man it did not work for is how you earn
          a chargeback — and if he buys anyway, he has every reason to sandbag
          his Day 30 number to get the bigger refund. Non-improvers get sent to
          the refund and to a doctor instead. */}
      {plan === "test" && didRetest && (
        <section
          className={`mt-10 rounded-2xl border p-5 ${
            wonIt ? "border-jade bg-jade-050" : "border-amber/50 bg-amber-050"
          }`}
        >
          {wonIt ? (
            <>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-jade">
                {locale === "fr" ? "Ça a marché" : "It worked"}
              </p>
              <h2 className="mt-2 text-[1.15rem] font-bold leading-snug">
                {locale === "fr" ? "Maintenant, rendez-le permanent." : "Now make it stick."}
              </h2>
              <div className="mt-3 space-y-2.5 text-[0.95rem] leading-relaxed text-bone">
                {locale === "fr" ? (
                  <>
                    <p>
                      Les 10 jours ont prouvé que votre corps répond. Mais vous l'avez fait
                      tout seul — et tout seul, c'est la version facile.
                    </p>
                    <p>
                      Les 30 jours prennent ce que vous venez de construire et le transfèrent
                      dans un vrai rapport, avec une partenaire. C'est ça que vous vouliez
                      depuis le début.
                    </p>
                    <p className="font-semibold">
                      Vos {testPrice} sont déduits si vous continuez dans les 72 heures.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      The 10 days proved your body responds. But you did it on your own, and
                      on your own is the easy version.
                    </p>
                    <p>
                      The 30 days take what you just built and move it into real sex, with a
                      partner. That is the part you actually wanted.
                    </p>
                    <p className="font-semibold">
                      Your {testPrice} comes off the price if you continue within 72 hours.
                    </p>
                  </>
                )}
              </div>
              <Link
                href={`/${locale}/offer`}
                className="mt-4 inline-flex rounded-full btn-go px-5 py-3 text-[14.5px] font-bold"
              >
                {t.cta.upgrade}
              </Link>
            </>
          ) : (
            <>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-amber">
                {locale === "fr" ? "Votre chiffre n'a pas bougé" : "Your number did not move"}
              </p>
              <div className="mt-3 space-y-2.5 text-[0.95rem] leading-relaxed text-bone">
                {locale === "fr" ? (
                  <>
                    <p className="font-semibold">
                      N'achetez rien d'autre. Écrivez-nous et on vous rembourse vos {testPrice}.
                    </p>
                    <p>
                      Ensuite allez voir un médecin. Demandez : tension, glycémie, thyroïde,
                      testostérone. Quand la base et l'entraînement ne donnent rien en 12
                      jours, il y a en général une raison physique — et aucun programme ne
                      la contourne.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold">
                      Do not buy anything else. Message us and we refund your {testPrice}.
                    </p>
                    <p>
                      Then go and see a doctor. Ask for blood pressure, blood sugar, thyroid
                      and testosterone. When the foundation work and the training both do
                      nothing in 12 days, there is usually a physical reason — and no
                      programme gets around one.
                    </p>
                  </>
                )}
              </div>
              <Link
                href={`/${locale}/app/messages`}
                className="mt-4 inline-flex rounded-full border border-ink-500 px-5 py-3 text-[14.5px] font-bold text-bone"
              >
                {locale === "fr" ? "Demander le remboursement" : "Ask for the refund"}
              </Link>
            </>
          )}
        </section>
      )}
    </div>
  );
}
