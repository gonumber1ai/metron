import Link from "next/link";

/**
 * Privacy — the factual record of what the app stores and why. Not
 * reassurance copy (Section 13): a man who opens this wants to know what
 * exists, who processes it, and how to delete it. Nothing else.
 */
export const metadata = { title: "Metron — Privacy" };

const T = {
  en: {
    h: "Privacy",
    updated: "Last updated 19 September 2026",
    s: [
      ["What we store", [
        "Your WhatsApp number and a password (stored as a hash, never in clear).",
        "What you do in the app: your measurements, the daily markers you log, which days you completed, which lessons you read, and Help & Support requests you send.",
        "Payment records: the amount, the date, the plan, and the transaction reference from the payment provider. We never see your Mobile Money PIN.",
        "Usage events: which pages you opened and which buttons you pressed, tied to an anonymous device id and, once you have an account, to that account.",
      ]],
      ["Why", [
        "The number and the password are your account. The measurements and markers are the programme — there is nothing to show you without them. Usage events tell us where men get stuck so we can fix the screen, not the man.",
      ]],
      ["Who processes it", [
        "Supabase (database hosting), Vercel (the site), Fapshi (Mobile Money payments), Resend (email, where you gave one), and Meta (the ad pixel — a purchase or a lead is reported so the ads can be measured; no measurement or marker ever leaves the app).",
        "We do not sell data and we do not share it with anyone else.",
      ]],
      ["Messages", [
        "If you set a reminder or leave Day 1 unfinished, you may receive at most two WhatsApp messages from us. They never contain your number or your estimate. Reply STOP or write to Help & Support to end them.",
      ]],
      ["Deleting your account", [
        "Write to Help & Support from inside the app, or send a WhatsApp message from the number on the account. The account, its measurements and markers are deleted within 7 days. Payment records are kept for as long as the law requires.",
      ]],
    ],
    back: "← Back",
  },
  fr: {
    h: "Confidentialité",
    updated: "Dernière mise à jour : 19 septembre 2026",
    s: [
      ["Ce que nous conservons", [
        "Votre numéro WhatsApp et un mot de passe (conservé sous forme de hachage, jamais en clair).",
        "Ce que vous faites dans l'application : vos mesures, les marqueurs que vous notez chaque jour, les jours terminés, les leçons lues, et les demandes envoyées à Aide & support.",
        "Les paiements : le montant, la date, le programme et la référence de transaction du prestataire. Nous ne voyons jamais votre code Mobile Money.",
        "Les événements d'utilisation : les pages ouvertes et les boutons pressés, liés à un identifiant anonyme d'appareil puis, une fois le compte créé, à ce compte.",
      ]],
      ["Pourquoi", [
        "Le numéro et le mot de passe sont votre compte. Les mesures et les marqueurs sont le programme — sans eux, il n'y a rien à vous montrer. Les événements d'utilisation nous disent où les hommes bloquent, pour corriger l'écran, pas l'homme.",
      ]],
      ["Qui les traite", [
        "Supabase (hébergement de la base), Vercel (le site), Fapshi (paiements Mobile Money), Resend (e-mail, si vous en avez donné un), et Meta (le pixel publicitaire — un achat ou un contact est signalé pour mesurer les publicités ; aucune mesure ni aucun marqueur ne quitte l'application).",
        "Nous ne vendons pas de données et ne les partageons avec personne d'autre.",
      ]],
      ["Messages", [
        "Si vous programmez un rappel ou laissez le jour 1 inachevé, vous pouvez recevoir au maximum deux messages WhatsApp de notre part. Ils ne contiennent jamais votre chiffre ni votre estimation. Répondez STOP ou écrivez à Aide & support pour y mettre fin.",
      ]],
      ["Supprimer votre compte", [
        "Écrivez à Aide & support depuis l'application, ou envoyez un message WhatsApp depuis le numéro du compte. Le compte, ses mesures et ses marqueurs sont supprimés sous 7 jours. Les enregistrements de paiement sont conservés le temps exigé par la loi.",
      ]],
    ],
    back: "← Retour",
  },
} as const;

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
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
        {t.s.map(([h, ps]) => (
          <section key={h} className="mt-8">
            <h2 className="text-[1rem] font-bold text-bone">{h}</h2>
            {ps.map((p) => <p key={p} className="mt-2 text-[0.95rem] leading-relaxed text-white/75">{p}</p>)}
          </section>
        ))}
      </main>
    </>
  );
}
