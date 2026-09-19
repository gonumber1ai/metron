import Image from "next/image";
import { getProgram } from "@/lib/content/program";

/**
 * Daily Rules & Foundations — Section 5.12. A menu page, not a daily one.
 *
 * Essentials: exactly three, what we ask every day. Foundations: the old
 * daily rules as guidance, read once. Food examples are Cameroon's; a
 * region switch is the structure for more.
 */
const T = {
  en: { h: "Daily Rules & Foundations", ess: "Essentials — every day", found: "Foundations — read once", regional: "Cameroon" },
  fr: { h: "Règles & fondations", ess: "L'essentiel — chaque jour", found: "Fondations — à lire une fois", regional: "Cameroun" },
} as const;

export default async function RulesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = T[locale === "fr" ? "fr" : "en"];
  const p = getProgram(locale);
  return (
    <div className="relative px-5 pt-6">
      <Image src="/app/spheres.jpg" alt="" fill sizes="640px" className="pointer-events-none -z-10 object-cover object-top opacity-[.16]" />
      <h1 className="text-[1.5rem] font-bold text-bone">{t.h}</h1>

      <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.16em] text-jade">{t.ess}</p>
      <ul className="mt-2 space-y-2">
        {p.essentials.map((e) => (
          <li key={e.id} className="rounded-xl border border-jade/30 bg-jade-050/30 px-4 py-3">
            <p className="text-[0.98rem] font-bold text-bone">{e.label}</p>
            <p className="mt-1 text-[0.88rem] leading-relaxed text-white/70">{e.detail}</p>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">{t.found}</p>
      {p.foundationsIntro.map((s, i) => <p key={i} className="mt-2 text-[0.92rem] leading-relaxed text-white/65">{s}</p>)}
      <ul className="mt-4 space-y-2">
        {p.foundations.map((f) => (
          <li key={f.id} className="rounded-xl border border-white/10 bg-white/[.03] px-4 py-3">
            <p className="text-[0.98rem] font-bold text-bone">{f.label}{f.regional && <span className="ml-2 rounded-full border border-white/15 px-2 py-0.5 text-[10px] font-semibold text-white/50">{t.regional}</span>}</p>
            <p className="mt-1 text-[0.88rem] leading-relaxed text-white/70">{f.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
