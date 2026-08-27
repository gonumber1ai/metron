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
    title: "Five things. In this order.",
    body: [
      "Everything you have tried was one thing. A pill. A spray. A thicker condom. One lever, pulled on its own, on a body that was not ready — which is why none of it held.",
      "Metron is five, layered in a specific order, because they compound.",
      "There is a signal your body gives you roughly thirty seconds before the end. Almost no man has ever noticed it, which is why the finish seems to arrive from nowhere. Learning to catch it is the first layer, and it is the one that changes the most, the fastest.",
      "There is a muscle you have probably been told to train. You have almost certainly been training half of it — and for a large group of men, that half is the half making things worse. We test which group you are in on Day 3.",
      "Then there is the part nobody in this market wants to sell you, because it is not exciting: what you eat, what you drink, how you move and how you sleep decide how much your body has left to give at eleven at night. Men doing the technique on four hours of sleep and one meal wonder why it is not working.",
      "There is a fourth thing, in your gut, that a lot of men have and nobody checks. When it is present it quietly caps everything else.",
      "And the fifth is the number. One before you start, one at the end, taken the same way both times — so you finish looking at evidence instead of at somebody's promise.",
      "In published trials, just ONE of those five — tested on its own, on men who had been finishing fast their entire lives — took men from under a minute to several minutes. You are getting all five.",
      "That is why we can make this offer: do the 10 days, and if your number has not moved, we refund you.",
    ],
    soon: "Customer results appear here as men finish the programme — with their permission, and never with a full name or face.",
  },
  fr: {
    title: "Cinq choses. Dans cet ordre.",
    body: [
      "Tout ce que vous avez essayé, c'était une seule chose. Un comprimé. Un spray. Un préservatif plus épais. Un seul levier, tiré tout seul, sur un corps qui n'était pas prêt — et c'est pour ça que rien n'a tenu.",
      "Metron, c'est cinq choses, superposées dans un ordre précis, parce qu'elles se renforcent entre elles.",
      "Il y a un signal que votre corps vous envoie environ trente secondes avant la fin. Presque aucun homme ne l'a jamais remarqué, et c'est pour ça que la fin semble arriver de nulle part. Apprendre à l'attraper est la première couche, et c'est celle qui change le plus, le plus vite.",
      "Il y a un muscle qu'on vous a sûrement dit de travailler. Vous n'en travaillez presque certainement que la moitié — et pour beaucoup d'hommes, c'est justement cette moitié qui aggrave les choses. On teste dans quel groupe vous êtes au Jour 3.",
      "Ensuite il y a la partie que personne dans ce marché ne veut vous vendre, parce qu'elle n'est pas excitante : ce que vous mangez, ce que vous buvez, comment vous bougez et comment vous dormez décident de ce qu'il vous reste à onze heures du soir. Des hommes appliquent la technique avec quatre heures de sommeil et un repas par jour, puis se demandent pourquoi ça ne marche pas.",
      "Il y a une quatrième chose, dans votre ventre, que beaucoup d'hommes ont et que personne ne vérifie. Quand elle est là, elle plafonne discrètement tout le reste.",
      "Et la cinquième, c'est le chiffre. Un avant de commencer, un à la fin, pris de la même façon les deux fois — pour qu'à la fin vous regardiez une preuve et non la promesse de quelqu'un.",
      "Dans des études publiées, UNE SEULE de ces cinq choses — testée seule, sur des hommes qui finissaient vite depuis toujours — les a fait passer de moins d'une minute à plusieurs minutes. Vous, vous avez les cinq.",
      "C'est pour ça qu'on peut vous faire cette offre : faites les 10 jours, et si votre chiffre n'a pas bougé, on vous rembourse.",
    ],
    soon: "Les résultats des clients apparaissent ici au fur et à mesure — avec leur accord, et jamais avec un nom complet ni un visage.",
  },
} as const;
