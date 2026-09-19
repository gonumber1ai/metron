import Link from "next/link";
import { PRICE_P10, PRICE_P30 } from "@/lib/content/program";

/** Terms — what is sold, for how much, and what the refund is judged on. */
export const metadata = { title: "Metron — Terms" };

const xaf = (n: number) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA`;

const T = {
  en: {
    h: "Terms",
    updated: "Last updated 19 September 2026",
    s: (p10: string, p30: string): [string, string[]][] => [
      ["What Metron is", [
        "Metron is a training programme: daily sessions, lessons and a way to measure your own progress. It is education and self-training, not medical care. It does not diagnose or treat any condition. If you have pain, bleeding, or a condition you are being treated for, see a doctor before starting.",
        "You must be 18 or older to use it.",
      ]],
      ["Your account", [
        "An account is a WhatsApp number and a password. You are responsible for keeping the password to yourself. One account per person.",
      ]],
      ["What you pay", [
        `Day 1 is free. Days 2–10 (the 10-Day Program, which includes the Day 12 measurement) cost ${p10}, paid once by Mobile Money. The 30-Day Program costs ${p30}, paid once. Prices are in CFA francs and include everything; there is no subscription and nothing renews.`,
        "Payments are processed by Fapshi. A payment is complete when the provider confirms it; the programme opens at that moment.",
      ]],
      ["Refund", [
        "The 10-Day Program carries a result guarantee: complete all ten days and both measurements — Day 1 and Day 12, taken the same way — and if you are not lasting longer, write to Help & Support and we refund the full amount. Days are 18 hours apart by design; a Day 12 taken early does not count. Requests must arrive within 14 days of the Day 12 measurement.",
        "The 30-Day Program is refundable in the same way against the Day 30 measurement.",
      ]],
      ["Content", [
        "The lessons and sessions are ours. They are for your own use; do not copy or resell them.",
      ]],
      ["Changes", [
        "We may change the programme or these terms. A change of price never applies to something you have already paid for.",
      ]],
      ["Contact", [
        "Help & Support, inside the app.",
      ]],
    ],
    back: "← Back",
  },
  fr: {
    h: "Conditions",
    updated: "Dernière mise à jour : 19 septembre 2026",
    s: (p10: string, p30: string): [string, string[]][] => [
      ["Ce qu'est Metron", [
        "Metron est un programme d'entraînement : des séances quotidiennes, des leçons et un moyen de mesurer vos propres progrès. C'est de l'éducation et de l'auto-entraînement, pas des soins médicaux. Il ne diagnostique ni ne traite aucune maladie. En cas de douleur, de saignement ou d'un problème pour lequel vous êtes suivi, consultez un médecin avant de commencer.",
        "Il faut avoir 18 ans ou plus pour l'utiliser.",
      ]],
      ["Votre compte", [
        "Un compte, c'est un numéro WhatsApp et un mot de passe. Vous êtes responsable de garder le mot de passe pour vous. Un compte par personne.",
      ]],
      ["Ce que vous payez", [
        `Le jour 1 est gratuit. Les jours 2 à 10 (le programme de 10 jours, qui comprend la mesure du jour 12) coûtent ${p10}, payés une fois par Mobile Money. Le programme de 30 jours coûte ${p30}, payé une fois. Les prix sont en francs CFA et comprennent tout ; il n'y a pas d'abonnement et rien ne se renouvelle.`,
        "Les paiements sont traités par Fapshi. Un paiement est terminé quand le prestataire le confirme ; le programme s'ouvre à ce moment-là.",
      ]],
      ["Remboursement", [
        "Le programme de 10 jours est garanti sur le résultat : faites les dix jours et les deux mesures — jour 1 et jour 12, prises de la même façon — et si vous ne tenez pas plus longtemps, écrivez à Aide & support et nous remboursons le montant complet. Les jours sont espacés de 18 heures exprès ; un jour 12 pris en avance ne compte pas. La demande doit arriver dans les 14 jours suivant la mesure du jour 12.",
        "Le programme de 30 jours est remboursable de la même façon, sur la mesure du jour 30.",
      ]],
      ["Contenu", [
        "Les leçons et les séances nous appartiennent. Elles sont pour votre usage personnel ; ne les copiez pas et ne les revendez pas.",
      ]],
      ["Modifications", [
        "Nous pouvons modifier le programme ou ces conditions. Un changement de prix ne s'applique jamais à ce que vous avez déjà payé.",
      ]],
      ["Contact", [
        "Aide & support, dans l'application.",
      ]],
    ],
    back: "← Retour",
  },
} as const;

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = T[locale === "fr" ? "fr" : "en"];
  return (
    <>
      <style>{`body{background:#070D0F;color:#fff}body::before{display:none}`}</style>
      <main className="mx-auto max-w-xl px-5 py-10">
        <Link href={`/${locale}/app`} className="text-[13px] text-white/50">{t.back}</Link>
        <p className="mt-6 text-[12px] font-bold uppercase tracking-[0.18em] text-jade">METRON</p>
        <h1 className="mt-1 text-[1.6rem] font-bold text-bone">{t.h}</h1>
        <p className="mt-1 text-[12px] text-white/40">{t.updated}</p>
        {t.s(xaf(PRICE_P10), xaf(PRICE_P30)).map(([h, ps]) => (
          <section key={h} className="mt-8">
            <h2 className="text-[1rem] font-bold text-bone">{h}</h2>
            {ps.map((p) => <p key={p} className="mt-2 text-[0.95rem] leading-relaxed text-white/75">{p}</p>)}
          </section>
        ))}
      </main>
    </>
  );
}
