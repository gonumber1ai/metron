/**
 * The direct sales page — no quiz.
 *
 * The first day of ads said the quiz was the wall: 115 men tapped Start, 52
 * answered nothing at all, and 32 more died on the first two questions. Asking
 * a man how long he lasts thirty seconds after he clicked an ad is too much,
 * too early, from a brand he has never heard of.
 *
 * So this page never asks. It states the pattern and lets him recognise
 * himself — which is the same admission, made privately, at no cost to him.
 * The two questions move inside the app, after he has paid, where answering
 * them is part of what he bought.
 *
 * ── ON CLAIMS ─────────────────────────────────────────────────────────────
 * The multiples come from men the owner coached through this protocol before
 * the app existed — real people, real before-and-after numbers, just not rows
 * in this database. They are stated as ranges rather than an average because
 * a range is what the data supports and an average would imply a precision
 * nobody has.
 *
 * Keep whatever records back them up. This is the one claim on the page a
 * refund dispute or an ad review would turn on, and "we have the numbers" is
 * only a defence if the numbers can actually be produced.
 *
 * They sit BELOW the recognition section on purpose. A man has to see himself
 * in the pattern before a multiple means anything — read first, 3x is a number
 * about strangers.
 */

export type DirectCopy = {
  kicker: string;
  h: string;
  resultsH: string;
  results: { multiple: string; label: string }[];
  resultsNote: string;
  qualify: string[];
  patternH: string;
  pattern: string[];
  costH: string;
  cost: string;
  whatH: string;
  what: string[];
  honestH: string;
  honest: string;
  priceLead: string;
  guarantee: string;
  cta: string;
  ctaNote: string;
};

const FR: DirectCopy = {
  kicker: "10 jours pour transformer votre vie sexuelle",
  h: "Arrêtez les pilules. Arrêtez les plantes. Faites plutôt ceci.",

  qualify: [
    "Si vous ne tenez pas plus de quelques minutes sans prendre quelque chose avant.",
    "Si vous avez besoin d'un comprimé, d'une tisane ou de deux bières pour être sûr de vous.",
    "Si votre partenaire n'a pas fini avant vous depuis longtemps.",
  ],

  resultsH: "Ce qu'ont vu les hommes qui l'ont fait",
  results: [
    { multiple: "1,5 à 3×", label: "leur temps de départ, après les 10 jours" },
    { multiple: "2 à 5×", label: "leur temps de départ, après les 30 jours" },
  ],
  resultsNote:
    "Mesuré de la même façon les deux fois : leur chiffre du premier jour contre celui de la fin. C'est exactement la comparaison que vous ferez vous-même.",

  patternH: "Regardez votre propre chiffre",
  pattern: [
    "Sur dix rapports, huit se ressemblent. Deux minutes, trois minutes — ce que c'est chez vous, c'est presque toujours la même chose.",
    "Ce n'est pas de la malchance et ce n'est pas dans votre tête. Un chiffre qui revient dix fois sur dix, c'est quelque chose que votre corps a appris à faire.",
  ],

  costH: "Ce que ça coûte d'attendre",
  cost: "Et plus vous restez à ce chiffre, plus il devient difficile d'en sortir. Chaque mois passé à deux minutes apprend à votre corps que deux minutes, c'est normal.",

  whatH: "Ce que vous faites",
  what: [
    "Jour 1 : vous vous chronométrez. C'est votre chiffre de départ — celui que vous n'avez probablement jamais vraiment connu.",
    "Sept séances de 15 minutes, seul. Personne n'a besoin d'être là et personne n'a besoin de le savoir.",
    "30 secondes chaque soir pour noter quatre choses. Vous voyez bouger avant le Jour 12.",
    "Jour 12 : la même mesure, dans les mêmes conditions. Deux chiffres côte à côte. C'est tout le test.",
    "Rien à acheter, rien à avaler, rien à installer. Ça marche sur n'importe quel téléphone.",
  ],

  honestH: "La différence",
  honest:
    "Tous les produits de cette étagère vous promettent un résultat. Aucun ne vous laisse le vérifier. Vous, vous aurez deux chiffres pris de la même façon, et si le vôtre n'a pas bougé on vous rembourse. C'est aussi pour ça que c'est 7 500 et pas 69 000 : vous ne nous devez rien tant que vous n'avez pas vu vous-même.",

  priceLead: "Le programme complet coûte {sprint}. Ne payez pas ça aujourd'hui.",
  guarantee:
    "Faites les 10 jours et les deux mesures. Si votre chiffre n'a pas bougé, écrivez-nous et on vous rembourse. Vous aurez perdu dix jours et rien d'autre — et vous saurez, au lieu de vous poser la question encore un an.",

  cta: "Commencer — {test}",
  ctaNote: "Votre relevé affiche METRON. Utilisez le nom que vous voulez.",
};

const EN: DirectCopy = {
  kicker: "10 days to transform your sex life",
  h: "Stop the pills. Stop the herbs. Do this instead.",

  qualify: [
    "If you cannot go past a few minutes without taking something first.",
    "If you need a pill, a mixture or two beers to feel sure of yourself.",
    "If it has been a long time since she finished before you did.",
  ],

  resultsH: "What men who did this saw",
  results: [
    { multiple: "1.5–3×", label: "their starting time, after the 10 days" },
    { multiple: "2–5×", label: "their starting time, after the 30 days" },
  ],
  resultsNote:
    "Measured the same way both times: their first-day number against their last. That is exactly the comparison you will make yourself.",

  patternH: "Look at your own number",
  pattern: [
    "Out of ten times, eight look the same. Two minutes, three minutes — whatever it is for you, it is almost always the same.",
    "That is not bad luck and it is not in your head. A number that comes back eight times out of ten is something your body has learned to do.",
  ],

  costH: "What waiting costs",
  cost: "And the longer you stay at that number, the harder it gets to leave it. Every month at two minutes teaches your body that two minutes is normal.",

  whatH: "What you do",
  what: [
    "Day 1: you time yourself. That is your starting number — the one you have probably never actually known.",
    "Seven 15-minute sessions, alone. Nobody needs to be there and nobody needs to know.",
    "30 seconds each night to log four things. You see it moving before Day 12.",
    "Day 12: the same measurement, same conditions. Two numbers side by side. That is the whole test.",
    "Nothing to buy, nothing to swallow, nothing to install. Works on any phone.",
  ],

  honestH: "The difference",
  honest:
    "Every product on that shelf promises you a result. None of them lets you check it. You will have two numbers taken the same way, and if yours has not moved we refund you. That is also why it is 7,500 and not 69,000 — you owe us nothing until you have seen it for yourself.",

  priceLead: "The full programme costs {sprint}. Do not pay that today.",
  guarantee:
    "Do the 10 days and both measurements. If your number has not moved, write to us and we send your money back. You will have lost ten days and nothing else — and you will know, instead of wondering for another year.",

  cta: "Start — {test}",
  ctaNote: "Your statement shows METRON. Use any name you like.",
};

export function getDirect(locale: string): DirectCopy {
  return locale === "fr" ? FR : EN;
}

/** Fills {test} and {sprint} from the price book, same as the offer page. */
export function withDirectPrices(
  c: DirectCopy,
  prices: { test: string; sprint: string },
): DirectCopy {
  const fill = (s: string) =>
    s.split("{test}").join(prices.test).split("{sprint}").join(prices.sprint);
  return {
    ...c,
    priceLead: fill(c.priceLead),
    honest: fill(c.honest),
    cta: fill(c.cta),
    guarantee: fill(c.guarantee),
  };
}
