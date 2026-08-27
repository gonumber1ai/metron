import { getProtocol } from "@/lib/content/protocol";
import { getDict } from "@/lib/i18n";

/**
 * The daily rules, on their own page.
 *
 * They lived collapsed behind a "+" at the bottom of Today, which is where you
 * put something you do not expect anyone to read. They apply from Day 0 to the
 * end and they are the half of the programme that runs whether or not there is
 * a session that day — so they get a page, and a place in the menu, and a man
 * can check them at lunchtime without hunting.
 */
export default async function RulesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getDict(locale);
  const protocol = getProtocol(locale);

  return (
    <div className="mx-auto max-w-2xl px-5 py-7">
      <h1 className="text-[1.85rem]">{t.app.dailyRules}</h1>

      <div className="mt-4 space-y-3">
        {protocol.rulesIntro.map((p, i) => (
          <p key={i} className="text-[0.98rem] leading-relaxed text-mute">
            {p}
          </p>
        ))}
      </div>

      <ol className="mt-7 space-y-3">
        {protocol.rules.map((r, i) => (
          <li key={r.id} className="rounded-2xl card p-5">
            <div className="flex items-baseline gap-3">
              <span className="metric text-[13px] font-bold text-jade">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <p className="text-[1.02rem] font-bold leading-snug text-bone">{r.label}</p>
                <p className="mt-1.5 text-[0.93rem] leading-relaxed text-mute">{r.detail}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
