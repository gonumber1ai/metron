/**
 * Proof, evidence, and aggregate results.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * RULE FOR EVERYTHING PRE-PAYWALL:  never name the technique.
 *
 * The moment sales copy says the generic textbook name for a technique, the
 * reader opens a new tab, finds it free on YouTube, and never comes back. Sell
 * the OUTCOME and YOUR OWN named mechanism. The full method is what he gets
 * after paying — that is the thing he is buying.
 *
 * Post-paywall content (the protocol, the lessons, the app) teaches everything
 * in full and by name. The line is the paywall, not the topic.
 * ─────────────────────────────────────────────────────────────────────────
 */

export type Results = {
  /** how many customers finished Day 12 and logged both numbers */
  sampleSize: number | null;
  /** share whose Day 12 beat their Day 1, e.g. 0.78 */
  improvedShare: number | null;
  /** median Day 12 ÷ Day 1, e.g. 2.1 */
  medianMultiple: number | null;
  /** median minutes added, e.g. 3.5 */
  medianMinutesAdded: number | null;
  /** when you last recomputed it */
  asOf: string | null;
};

/**
 * YOUR customers' results. Fill in ONLY from real logged Day 1 vs Day 12 data.
 * The app already collects exactly this. At ~30 completed programmes you can
 * compute it, and then the page swaps automatically to a big stat block.
 */
export const results: Results = {
  sampleSize: null,
  improvedShare: null,
  medianMultiple: null,
  medianMinutesAdded: null,
  asOf: null,
};

export function hasResults(r: Results = results): boolean {
  return r.sampleSize !== null && r.sampleSize >= 30 && r.improvedShare !== null;
}

/**
 * Published evidence on the COMPONENTS of the protocol.
 *
 * This is a different kind of claim from `results` above: it is about the
 * research, not about our customers, so it is usable on day one. It still has
 * to be accurate.
 *
 * ⚠ VERIFY BEFORE YOU SPEND MONEY ON ADS. Pull the actual papers, confirm the
 * figures and the populations, and keep a PDF on file. Meta and Google will ask
 * for substantiation on efficacy claims in this category, and "an AI wrote it"
 * is not substantiation. The shape of these claims is right; check the digits.
 *
 * Starting points: research on pelvic-floor rehabilitation for lifelong rapid
 * ejaculation (Pastore et al., 2014 is the most cited), and clinical guidance
 * listing behavioural approaches as first-line non-drug treatment.
 */
export const evidence = {
  verified: false,
  note: "Confirm figures against the source papers before using in paid advertising.",
};

export const methodNote = {
  en: {
    title: "Men who did this",
    body: [
      "Most men see their number move inside the first 7 to 10 days of following the plan.",
      "The ones who carry on into the 30 days hold what they built and go further — doing it on your own and doing it with a partner are two different skills.",
      "If yours has not moved by the end, we refund you. That is the whole deal.",
    ],
    soon: "Real results from real customers appear here as men finish — with their permission, and never with a full name or face.",
  },
  fr: {
    title: "Des hommes qui l'ont fait",
    body: [
      "La plupart voient leur chiffre bouger dans les 7 à 10 premiers jours en suivant le plan.",
      "Ceux qui continuent sur les 30 jours gardent ce qu'ils ont construit et vont plus loin — le faire seul et le faire avec une partenaire sont deux compétences différentes.",
      "Si le vôtre n'a pas bougé à la fin, on vous rembourse. Voilà le marché.",
    ],
    soon: "Les vrais résultats de vrais clients apparaissent ici au fur et à mesure — avec leur accord, et jamais avec un nom complet ni un visage.",
  },
} as const;
