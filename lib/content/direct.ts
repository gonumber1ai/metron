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
 * There is no results figure anywhere on this page, because there are no
 * results yet. Nobody has finished the programme. A multiple invented here
 * would be a false efficacy claim on a page taking money, which is both the
 * thing Meta bans outright in this category and the thing a refund dispute
 * would turn on.
 *
 * What replaces it is the truth, which happens to be the stronger position in
 * a category where every competitor lies: we will not promise you a number,
 * we will give you a way to measure and your money back. Put the real multiple
 * here the day twenty men have a Day 1 and a Day 12.
 */

export type DirectCopy = {
  kicker: string;
  h: string;
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
  kicker: "10 jours",
  h: "Arrêtez les pilules. Arrêtez les plantes. Faites plutôt ceci.",

  qualify: [
    "Si vous ne tenez pas plus de quelques minutes sans prendre quelque chose avant.",
    "Si vous avez besoin d'un comprimé, d'une tisane ou de deux bières pour être sûr de vous.",
    "Si votre partenaire n'a pas fini avant vous depuis longtemps.",
  ],

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

  honestH: "Ce qu'on ne vous promettra pas",
  honest:
    "Tous les produits de cette étagère vous promettent un chiffre. Nous, non. On vous donne de quoi mesurer, dix jours, et votre argent si le chiffre ne bouge pas. C'est aussi pour ça que c'est 7 500 et pas 69 000 : vous ne nous devez rien tant que vous n'avez pas vu vous-même.",

  priceLead: "Le programme complet coûte {sprint}. Ne payez pas ça aujourd'hui.",
  guarantee:
    "Faites les 10 jours et les deux mesures. Si votre chiffre n'a pas bougé, écrivez-nous et on vous rembourse. Vous aurez perdu dix jours et rien d'autre — et vous saurez, au lieu de vous poser la question encore un an.",

  cta: "Commencer — {test}",
  ctaNote: "Votre relevé affiche METRON. Utilisez le nom que vous voulez.",
};

const EN: DirectCopy = {
  kicker: "10 days",
  h: "Stop the pills. Stop the herbs. Do this instead.",

  qualify: [
    "If you cannot go past a few minutes without taking something first.",
    "If you need a pill, a mixture or two beers to feel sure of yourself.",
    "If it has been a long time since she finished before you did.",
  ],

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

  honestH: "What we will not promise you",
  honest:
    "Every product on that shelf promises you a number. We will not. We give you a way to measure, ten days, and your money back if the number does not move. That is also why it is 7,500 and not 69,000 — you owe us nothing until you have seen it for yourself.",

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
