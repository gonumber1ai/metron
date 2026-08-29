/**
 * The direct sales page — no quiz.
 *
 * The first day of ads said the quiz was the wall: 115 men tapped Start, 52
 * answered nothing at all, and 32 more died on the first two questions. Asking
 * a man how long he lasts thirty seconds after he clicked an ad is too much,
 * too early, from a brand he has never heard of.
 *
 * So this page never asks. It states the pattern and lets him recognise
 * himself — the same admission, made privately, at no cost to him. The two
 * questions move inside the app, after he has paid, where answering them is
 * part of what he bought.
 *
 * ── THE ORDER, AND WHY ────────────────────────────────────────────────────
 * The page used to open by naming competitors ("stop the pills, stop the
 * herbs") and then spent its length explaining the PROTOCOL — seven sessions,
 * fifteen minutes, log four things. No man wakes up wanting seven sessions.
 * He wakes up wanting to stop worrying about it.
 *
 * So: outcome first, then recognition, then the reason, then the shape of the
 * ten days, then proof, then the offer, then the guarantee. Desire before
 * mechanics, every time.
 *
 * ── THE CENTRAL IDEA ──────────────────────────────────────────────────────
 * Measure it. Train it. Measure again. That is the brand, not "10 days to
 * transform your sex life", which could be a condom advert. Every competitor
 * makes a promise and none of them lets you check it. This one hands him the
 * two numbers and lets the result argue.
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
 * ── NEVER NAME THE TECHNIQUE ──────────────────────────────────────────────
 * Same rule as marketing.ts. The page describes the SHAPE of the ten days —
 * measure, train, log, measure — because that is what he is buying and it
 * makes the purchase concrete. It never describes what happens inside a
 * session. A man must not be able to execute this page.
 */

export type Step = { step: string; label: string; body: string };

export type DirectCopy = {
  /* hero */
  kicker: string;
  h: string;
  sub: string;
  flow: string[];
  priceLine: string;
  cta: string;
  ctaNote: string;
  trust: string[];

  /* recognition */
  problemH: string;
  problem: string[];

  /* mechanism */
  mechH: string;
  mech: string[];

  /* the ten days */
  timelineH: string;
  timelineSub: string;
  timeline: Step[];

  /* proof */
  resultsH: string;
  results: { multiple: string; label: string }[];
  resultsNote: string;

  /* offer */
  offerKicker: string;
  offerH: string;
  fullLabel: string;
  testLabel: string;
  offerBody: string[];
  includes: string[];

  /* guarantee */
  guaranteeH: string;
  guaranteeSteps: string[];
  guarantee: string;

  /* faq */
  faqH: string;
  faq: { q: string; a: string }[];

  /* close */
  finalH: string;
  finalSub: string;

  /* labels drawn inside diagrams — kept short, they are set small */
  ui: { measure: string; train: string; measureAgain: string; day1: string; day12: string };
};

const EN: DirectCopy = {
  kicker: "Private · 10-day programme",
  h: "Last longer. Without pills, herbs or numbing products.",
  sub: "A private 10-day training programme that helps you build real control — at home, from your phone, with nothing to swallow and nobody to face.",
  flow: ["Measure your starting point", "Train for 10 days", "Measure again"],
  priceLine: "7,500 FCFA to start",
  cta: "Start the 10-day test",
  ctaNote: "If your number does not improve, we refund you.",
  trust: [
    "Private by design",
    "Works on any phone",
    "Nothing to swallow",
    "One payment",
  ],

  problemH: "You already know the problem.",
  problem: [
    "It is over before you wanted it to be. Again.",
    "You lie there doing the maths on how long that was. She says it is fine. You are not sure she means it, and you do not ask.",
    "So next time you try to think about something else. Or you have a drink first. Or you do not start anything at all, because you already know how it ends.",
    "You have been managing this for years. You have never fixed it.",
  ],

  mechH: "There is a reason the same thing keeps happening.",
  mech: [
    "Finishing fast is a reflex, and every reflex has a threshold. Yours sits lower than you want it, or you cannot feel yourself approaching it. Usually both.",
    "It is not your size. It is not your character. In most men it is not testosterone either.",
    "It is a learned pattern sitting on a tired body — which is good news, because learned patterns can be unlearned and tired bodies can be fixed.",
    "Neither of those comes in a bottle. That is why the bottle never held.",
  ],

  timelineH: "Here is what happens over 10 days.",
  timelineSub:
    "Fifteen minutes a day, seven of the ten days. The app tells you what to do each morning, so there is nothing to work out and nothing to read.",
  timeline: [
    {
      step: "Day 1",
      label: "Measure",
      body: "You time yourself once, alone. That is your starting number — the one you have probably never actually known.",
    },
    {
      step: "Days 2–11",
      label: "Train",
      body: "Seven sessions of fifteen minutes. Open the app in the morning and it tells you exactly what today is. Nobody needs to be there.",
    },
    {
      step: "Every night",
      label: "Log",
      body: "Thirty seconds, four things. This is how you watch it moving before the test rather than hoping at the end of it.",
    },
    {
      step: "Day 12",
      label: "Measure again",
      body: "The same measurement, in the same conditions. Two numbers side by side. That is the whole test.",
    },
  ],

  resultsH: "Real numbers. Not promises.",
  results: [
    { multiple: "1.5–3×", label: "their starting time, after the 10 days" },
    { multiple: "2–5×", label: "their starting time, after the 30 days" },
  ],
  resultsNote:
    "From men coached through this protocol before the app existed. Measured the same way both times — their first-day number against their last. Stated as a range because that is what the records support; an average would imply a precision nobody has. It is also exactly the comparison you will make on yourself.",

  offerKicker: "Try it for 10 days",
  offerH: "7,500 FCFA",
  fullLabel: "Full programme",
  testLabel: "10-day test",
  offerBody: [
    "The full programme costs 69,000 FCFA. Do not pay that today.",
    "You do not know yet whether this works on you, and we have not earned it. So do ten days first, for 7,500 — less than a meal out.",
    "If it works, the 7,500 comes off the 69,000. If it does not, you tell us and we send it back.",
  ],
  includes: [
    "Fifteen minutes a day, seven of the ten days",
    "The app tells you what to do each morning — nothing to plan",
    "Your starting measurement and your day-12 measurement",
    "Nothing to buy, nothing to swallow, nothing to install",
    "Your statement shows METRON. Sign up with any name you like",
    "Refunded if your number has not moved",
  ],

  guaranteeH: "What if it does not work?",
  guaranteeSteps: [
    "Measure yourself on day one",
    "Do the ten days",
    "Measure again on day twelve",
  ],
  guarantee:
    "If your number has not moved, write to us and we send your money back. You will have lost ten days and nothing else — and you will know, instead of wondering for another year.",

  faqH: "Before you start",
  faq: [
    {
      q: "Is this private?",
      a: "Completely. You do it alone, on your own phone, and nobody needs to be told. You sign up with any name you like, and your bank statement shows METRON.",
    },
    {
      q: "Do I need equipment?",
      a: "No. Nothing to buy, nothing to swallow, nothing to install. It works on any phone.",
    },
    {
      q: "How much time does it take?",
      a: "Fifteen minutes a day, on seven of the ten days, plus thirty seconds each night to log. That is the whole time cost.",
    },
    {
      q: "What if I have already tried other things?",
      a: "Most men here have. Pills work for one night and leave you more afraid of doing it without one. Sprays numb the exact sensation you need to get better at reading. Neither teaches your body anything, which is why you are still looking. This is training, so it is yours to keep.",
    },
    {
      q: "Is this medication?",
      a: "No. Metron is education and training. There is nothing to swallow and nothing to prescribe.",
    },
    {
      q: "What happens after the 10 days?",
      a: "You will have two numbers and you will know where you stand. Most men who finish go on to the 30-day programme, because control on your own and control with a partner are two different skills — and your 7,500 comes off the price. Nobody is enrolled automatically.",
    },
  ],

  finalH: "You do not have to guess anymore.",
  finalSub: "Measure yourself. Start your ten days.",

  ui: {
    measure: "Measure",
    train: "Train",
    measureAgain: "Measure again",
    day1: "Day 1",
    day12: "Day 12",
  },
};

const FR: DirectCopy = {
  kicker: "Privé · programme de 10 jours",
  h: "Tenez plus longtemps. Sans pilules, sans plantes, sans produits anesthésiants.",
  sub: "Un programme d'entraînement privé de 10 jours qui vous aide à construire un vrai contrôle — chez vous, depuis votre téléphone, sans rien avaler et sans voir personne.",
  flow: ["Mesurez votre point de départ", "Entraînez-vous 10 jours", "Mesurez à nouveau"],
  priceLine: "7 500 FCFA pour commencer",
  cta: "Commencer le test de 10 jours",
  ctaNote: "Si votre chiffre ne bouge pas, on vous rembourse.",
  trust: [
    "Privé par conception",
    "Marche sur tout téléphone",
    "Rien à avaler",
    "Un seul paiement",
  ],

  problemH: "Vous connaissez déjà le problème.",
  problem: [
    "C'est fini avant que vous ne le vouliez. Encore.",
    "Vous restez allongé à calculer combien de temps ça a duré. Elle dit que ce n'est pas grave. Vous n'êtes pas sûr qu'elle le pense, et vous ne demandez pas.",
    "Alors la fois suivante vous essayez de penser à autre chose. Ou vous prenez un verre avant. Ou vous ne commencez rien du tout, parce que vous savez déjà comment ça finit.",
    "Vous gérez ça depuis des années. Vous ne l'avez jamais réglé.",
  ],

  mechH: "Il y a une raison pour laquelle la même chose se répète.",
  mech: [
    "Finir vite est un réflexe, et tout réflexe a un seuil. Le vôtre est plus bas que vous ne le voudriez, ou vous ne sentez pas que vous en approchez. Le plus souvent les deux.",
    "Ce n'est pas votre taille. Ce n'est pas votre caractère. Chez la plupart des hommes, ce n'est pas non plus la testostérone.",
    "C'est un schéma appris posé sur un corps fatigué — et c'est une bonne nouvelle, parce qu'un schéma appris se désapprend et un corps fatigué se répare.",
    "Ni l'un ni l'autre ne se trouve dans un flacon. C'est pour ça que le flacon n'a jamais tenu.",
  ],

  timelineH: "Voici ce qui se passe en 10 jours.",
  timelineSub:
    "Quinze minutes par jour, sept des dix jours. L'application vous dit quoi faire chaque matin : rien à chercher, rien à lire.",
  timeline: [
    {
      step: "Jour 1",
      label: "Mesurer",
      body: "Vous vous chronométrez une fois, seul. C'est votre chiffre de départ — celui que vous n'avez probablement jamais vraiment connu.",
    },
    {
      step: "Jours 2–11",
      label: "S'entraîner",
      body: "Sept séances de quinze minutes. Vous ouvrez l'application le matin et elle vous dit exactement ce qu'est la journée. Personne n'a besoin d'être là.",
    },
    {
      step: "Chaque soir",
      label: "Noter",
      body: "Trente secondes, quatre choses. C'est comme ça que vous le voyez bouger avant le test, au lieu d'espérer à la fin.",
    },
    {
      step: "Jour 12",
      label: "Mesurer à nouveau",
      body: "La même mesure, dans les mêmes conditions. Deux chiffres côte à côte. C'est tout le test.",
    },
  ],

  resultsH: "De vrais chiffres. Pas des promesses.",
  results: [
    { multiple: "1,5 à 3×", label: "leur temps de départ, après les 10 jours" },
    { multiple: "2 à 5×", label: "leur temps de départ, après les 30 jours" },
  ],
  resultsNote:
    "Chiffres d'hommes accompagnés sur ce protocole avant l'existence de l'application. Mesurés de la même façon les deux fois — leur chiffre du premier jour contre celui de la fin. Donné en fourchette parce que c'est ce que les relevés permettent d'affirmer ; une moyenne laisserait croire à une précision que personne n'a. C'est aussi exactement la comparaison que vous ferez sur vous-même.",

  offerKicker: "Essayez pendant 10 jours",
  offerH: "7 500 FCFA",
  fullLabel: "Programme complet",
  testLabel: "Test de 10 jours",
  offerBody: [
    "Le programme complet coûte 69 000 FCFA. Ne payez pas ça aujourd'hui.",
    "Vous ne savez pas encore si ça marche sur vous, et nous ne l'avons pas mérité. Alors faites d'abord dix jours, pour 7 500 — moins qu'un repas dehors.",
    "Si ça marche, les 7 500 sont déduits des 69 000. Sinon, vous nous écrivez et on vous rembourse.",
  ],
  includes: [
    "Quinze minutes par jour, sept des dix jours",
    "L'application vous dit quoi faire chaque matin — rien à planifier",
    "Votre mesure de départ et votre mesure du jour 12",
    "Rien à acheter, rien à avaler, rien à installer",
    "Votre relevé affiche METRON. Inscrivez-vous sous le nom que vous voulez",
    "Remboursé si votre chiffre n'a pas bougé",
  ],

  guaranteeH: "Et si ça ne marche pas ?",
  guaranteeSteps: [
    "Mesurez-vous le premier jour",
    "Faites les dix jours",
    "Mesurez à nouveau le douzième",
  ],
  guarantee:
    "Si votre chiffre n'a pas bougé, écrivez-nous et on vous rembourse. Vous aurez perdu dix jours et rien d'autre — et vous saurez, au lieu de vous poser la question encore un an.",

  faqH: "Avant de commencer",
  faq: [
    {
      q: "Est-ce que c'est privé ?",
      a: "Totalement. Vous le faites seul, sur votre propre téléphone, et personne n'a besoin d'être au courant. Vous vous inscrivez sous le nom que vous voulez, et votre relevé bancaire affiche METRON.",
    },
    {
      q: "Faut-il du matériel ?",
      a: "Non. Rien à acheter, rien à avaler, rien à installer. Ça marche sur n'importe quel téléphone.",
    },
    {
      q: "Combien de temps ça prend ?",
      a: "Quinze minutes par jour, sur sept des dix jours, plus trente secondes chaque soir pour noter. C'est tout le coût en temps.",
    },
    {
      q: "Et si j'ai déjà essayé autre chose ?",
      a: "C'est le cas de la plupart des hommes ici. Les pilules marchent une nuit et vous laissent plus inquiet à l'idée de faire sans. Les sprays anesthésient exactement la sensation que vous devez apprendre à lire. Aucun des deux n'apprend quoi que ce soit à votre corps — c'est pour ça que vous cherchez encore. Ici c'est de l'entraînement, donc ça vous reste.",
    },
    {
      q: "Est-ce un médicament ?",
      a: "Non. Metron, c'est de l'éducation et de l'entraînement. Il n'y a rien à avaler et rien à prescrire.",
    },
    {
      q: "Que se passe-t-il après les 10 jours ?",
      a: "Vous aurez deux chiffres et vous saurez où vous en êtes. La plupart des hommes qui terminent continuent sur le programme de 30 jours, parce que le contrôle seul et le contrôle avec une partenaire sont deux compétences différentes — et vos 7 500 sont déduits du prix. Personne n'est inscrit automatiquement.",
    },
  ],

  finalH: "Vous n'avez plus besoin de deviner.",
  finalSub: "Mesurez-vous. Commencez vos dix jours.",

  ui: {
    measure: "Mesurer",
    train: "S'entraîner",
    measureAgain: "Mesurer à nouveau",
    day1: "Jour 1",
    day12: "Jour 12",
  },
};

export function getDirect(locale: string): DirectCopy {
  return locale === "fr" ? FR : EN;
}

/**
 * Fills {test} and {sprint} from the price book.
 *
 * The prices are written into the copy above as literal francs because that is
 * how the page reads in its home market, but a man in London sees dollars.
 * Anywhere the price book disagrees with the literal, the price book wins.
 */
export function withDirectPrices(
  c: DirectCopy,
  prices: { test: string; sprint: string },
): DirectCopy {
  const swap = (s: string) =>
    s
      .split("{test}")
      .join(prices.test)
      .split("{sprint}")
      .join(prices.sprint)
      .replace(/7[  ]?500 FCFA/g, prices.test)
      .replace(/69[  ]?000 FCFA/g, prices.sprint);

  return {
    ...c,
    priceLine: swap(c.priceLine),
    offerH: prices.test,
    offerBody: c.offerBody.map(swap),
    includes: c.includes.map(swap),
    faq: c.faq.map((f) => ({ q: f.q, a: swap(f.a) })),
  };
}
