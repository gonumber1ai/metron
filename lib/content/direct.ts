/**
 * The direct sales page — no quiz.
 *
 * The first day of ads said the quiz was the wall: 115 men tapped Start, 52
 * answered nothing at all, and 32 more died on the first two questions. Asking
 * a man how long he lasts thirty seconds after he clicked an ad is too much,
 * too early, from a brand he has never heard of.
 *
 * So this page never asks. It states the pattern and lets him recognise
 * himself — the same admission, made privately, at no cost to him.
 *
 * ── THE ARCHITECTURE ──────────────────────────────────────────────────────
 * Problem → product → mechanism → framework → programme → proof → offer →
 * guarantee → FAQ → close.
 *
 * It used to say "listen to our explanation". It should say: here is the
 * problem, here is the product, here is how it works, here is the evidence,
 * try it for the price of a meal, and if your number does not move you get
 * your money back.
 *
 * Desire before mechanics. Recognition, not misery — the problem section is
 * short on purpose. Making a man feel worse is not the same as making him
 * feel understood, and only one of them sells.
 *
 * ── THE CENTRAL IDEA ──────────────────────────────────────────────────────
 * Measure it. Train it. Measure again. Every product on that shelf makes a
 * promise and not one of them lets you check it. This one hands him two
 * numbers and lets the result argue. That is the brand, and it is why the
 * guarantee can be as loud as it is.
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

/**
 * Real customers only.
 *
 * Empty ships an empty array and the section does not render at all — no
 * placeholder, no "coming soon", no invented man from Douala. On a page whose
 * entire argument is that everyone else makes claims you cannot check, one
 * fabricated quote costs more than the missing section does.
 *
 * `before`/`after` are optional and render as a small before → after pair.
 * Only fill them from actual logged measurements.
 */
export type Testimonial = {
  quote: string;
  who: string;
  before?: string;
  after?: string;
};

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
  problemPivot: string;

  /* mechanism */
  mechH: string;
  mech: string[];

  /* signature framework */
  frameworkH: string;
  frameworkSub: string;
  frameworkSteps: Step[];

  /* the ten days */
  timelineH: string;
  timelineSub: string;
  timeline: Step[];

  /* what you are not buying */
  notBuyingH: string;
  notBuying: string[];
  notBuyingSub: string;

  /* who it is for */
  whoForH: string;
  whoFor: string[];
  whoForNote: string;

  /* proof */
  resultsH: string;
  resultsKicker: string;
  results: { multiple: string; label: string }[];
  resultsNote: string;
  testimonialsH: string;
  testimonials: Testimonial[];

  /* offer */
  offerKicker: string;
  fullLabel: string;
  testLabel: string;
  offerBody: string[];
  includes: string[];
  payTrust: string[];

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
  finalMicro: string;

  /* footer */
  footerTag: string;

  /* labels drawn inside the phone mock */
  ui: {
    today: string;
    session: string;
    minutes: string;
    startSession: string;
    dayOf: string;
  };
};

const EN: DirectCopy = {
  kicker: "Private · 10-day programme",
  h: "Last longer. Without pills, herbs or numbing products.",
  sub: "A private 10-day training programme designed to help you build better control during sex — from your phone, at home.",
  flow: ["Measure your starting point", "Train for 10 days", "Measure again"],
  priceLine: "7,500 FCFA to start",
  cta: "Start the 10-day test",
  ctaNote: "If your number does not improve, we refund you.",
  trust: ["Private by design", "Works on any phone", "Nothing to swallow", "One payment"],

  problemH: "You already know the problem.",
  problem: [
    "It ends sooner than you wanted. Again.",
    "You lie there working out how long that was. You wonder whether she was satisfied. You tell yourself next time will be different.",
    "Then next time comes, and the same thing happens.",
  ],
  problemPivot: "You have been managing this for years. You have never actually trained it.",

  mechH: "There is a reason the same thing keeps happening.",
  mech: [
    "Finishing fast is a reflex, and every reflex has a threshold. Yours sits lower than you want it, or you cannot feel yourself approaching it. Usually both.",
    "It is not your size. It is not your character. In most men it is not testosterone either.",
    "It is a learned pattern on a tired body — which is good news, because learned patterns can be unlearned and tired bodies can be fixed.",
    "Neither of those comes in a bottle. That is why the bottle never held.",
  ],

  frameworkH: "Don't guess. Measure.",
  frameworkSub:
    "Every product on that shelf makes you a promise. Not one of them lets you check it. This one hands you two numbers and lets the result do the arguing.",
  frameworkSteps: [
    { step: "Step 1", label: "Measure", body: "Know your starting point." },
    { step: "Step 2", label: "Train", body: "Follow the programme for ten days." },
    { step: "Step 3", label: "Measure again", body: "See whether your number changed." },
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
      body: "Seven sessions of fifteen minutes, guided by the app. Nobody needs to be there.",
    },
    {
      step: "Every night",
      label: "Log",
      body: "Thirty seconds to record four things. This is how you watch it moving before the test, rather than hoping at the end of it.",
    },
    {
      step: "Day 12",
      label: "Measure again",
      body: "The same measurement, in the same conditions. Two numbers side by side. That is the whole test.",
    },
  ],

  notBuyingH: "What you are not buying.",
  notBuying: [
    "No pills",
    "No herbs",
    "No numbing products",
    "No equipment",
    "No clinic visits",
    "Nobody needs to know",
  ],
  notBuyingSub: "Fifteen minutes a day, on seven days of the programme. That is the whole cost in time.",

  whoForH: "Who this is for",
  whoFor: [
    "You usually finish sooner than you want to",
    "You want real control, not something to hide behind",
    "You want to do it privately",
    "You do not want pills or products",
    "You can give it fifteen minutes a day",
  ],
  whoForNote:
    "Metron is training and education. It is not designed to diagnose or treat medical conditions.",

  resultsH: "Real numbers. Not promises.",
  resultsKicker: "What previously coached participants recorded",
  results: [
    { multiple: "1.5–3×", label: "their starting time, after the 10 days" },
    { multiple: "2–5×", label: "their starting time, after the 30 days" },
  ],
  resultsNote:
    "These are from men coached through this protocol before the app existed. Each measured himself the same way twice — his first-day number against his last — which is exactly the comparison you will make on yourself. Stated as a range because that is what the records support; an average would imply a precision nobody has.",

  testimonialsH: "In their words",
  /* OWNER: real customers only. See the Testimonial type above. */
  testimonials: [],

  offerKicker: "Try Metron for 10 days",
  fullLabel: "Full programme",
  testLabel: "10-day test",
  offerBody: [
    "The full programme costs 69,000 FCFA. You do not pay that today.",
    "You do not know yet whether this works on you, and we have not earned it. So you pay 7,500 to test it — less than a meal out.",
    "If it works, the 7,500 comes off the 69,000. If it does not, you tell us and we send it back.",
  ],
  includes: [
    "The 10-day programme",
    "Seven guided sessions",
    "Your starting measurement",
    "Your day-12 measurement",
    "Nightly progress logging",
    "Private access from your phone",
    "No equipment of any kind",
    "No pills and no products",
  ],
  payTrust: [
    "Private purchase",
    "Secure payment",
    "One payment, no subscription",
    "Refunded if your number does not move",
  ],

  guaranteeH: "Don't take our word for it. Test it.",
  guaranteeSteps: ["Measure yourself", "Train for ten days", "Measure again"],
  guarantee:
    "If your number has not moved, write to us and we send your money back. You will have lost ten days and nothing else — and you will know, instead of wondering for another year.",

  faqH: "Before you start",
  faq: [
    {
      q: "Is this private?",
      a: "Yes. You do the whole programme yourself through the app. You never meet a coach, you never speak to anyone, and your bank statement shows METRON. Sign up with any name you like.",
    },
    {
      q: "Do I need equipment?",
      a: "No. It is designed to be done at home with nothing at all. It works on any phone.",
    },
    {
      q: "How much time does it take?",
      a: "Sessions take about fifteen minutes, and there are seven of them across the ten days. Plus thirty seconds each night to log.",
    },
    {
      q: "Is this medication?",
      a: "No. Metron is education and training. There is nothing to swallow and nothing to prescribe.",
    },
    {
      q: "What if I have already tried other things?",
      a: "That is exactly why this starts with a measurement. Instead of guessing whether something is working, you compare your own number before and after. Pills and sprays never told you that — which is part of why you are still looking.",
    },
    {
      q: "What happens after the 10 days?",
      a: "You take your second measurement and you have two numbers. If it moved, most men go on to the 30-day programme — control alone and control with a partner are two different skills — and your 7,500 comes off the price. Nobody is enrolled automatically, and nothing charges you again.",
    },
  ],

  finalH: "Stop guessing. Start measuring.",
  finalSub: "Measure yourself. Train for ten days. Measure again.",
  finalMicro: "Private. No pills. No equipment. One payment.",

  footerTag: "Private training for better control.",

  ui: {
    today: "Today",
    session: "Today's session",
    minutes: "15 minutes",
    startSession: "START SESSION",
    dayOf: "Day 4 of 10",
  },
};

const FR: DirectCopy = {
  kicker: "Privé · programme de 10 jours",
  h: "Tenez plus longtemps. Sans pilules, sans plantes, sans anesthésiants.",
  sub: "Un programme d'entraînement privé de 10 jours conçu pour vous aider à construire un meilleur contrôle — depuis votre téléphone, chez vous.",
  flow: ["Mesurez votre point de départ", "Entraînez-vous 10 jours", "Mesurez à nouveau"],
  priceLine: "7 500 FCFA pour commencer",
  cta: "Commencer le test de 10 jours",
  ctaNote: "Si votre chiffre ne bouge pas, on vous rembourse.",
  trust: ["Privé par conception", "Sur tout téléphone", "Rien à avaler", "Un seul paiement"],

  problemH: "Vous connaissez déjà le problème.",
  problem: [
    "Ça se termine plus tôt que vous ne le vouliez. Encore.",
    "Vous restez allongé à calculer combien de temps ça a duré. Vous vous demandez si elle est satisfaite. Vous vous dites que la prochaine fois sera différente.",
    "Puis la prochaine fois arrive, et la même chose se produit.",
  ],
  problemPivot:
    "Vous gérez ça depuis des années. Vous ne l'avez jamais vraiment entraîné.",

  mechH: "Il y a une raison pour laquelle la même chose se répète.",
  mech: [
    "Finir vite est un réflexe, et tout réflexe a un seuil. Le vôtre est plus bas que vous ne le voudriez, ou vous ne sentez pas que vous en approchez. Le plus souvent les deux.",
    "Ce n'est pas votre taille. Ce n'est pas votre caractère. Chez la plupart des hommes, ce n'est pas non plus la testostérone.",
    "C'est un schéma appris sur un corps fatigué — et c'est une bonne nouvelle, parce qu'un schéma appris se désapprend et un corps fatigué se répare.",
    "Ni l'un ni l'autre ne se trouve dans un flacon. C'est pour ça que le flacon n'a jamais tenu.",
  ],

  frameworkH: "Ne devinez pas. Mesurez.",
  frameworkSub:
    "Tous les produits de cette étagère vous font une promesse. Aucun ne vous laisse la vérifier. Celui-ci vous donne deux chiffres et laisse le résultat parler.",
  frameworkSteps: [
    { step: "Étape 1", label: "Mesurer", body: "Connaissez votre point de départ." },
    { step: "Étape 2", label: "S'entraîner", body: "Suivez le programme pendant dix jours." },
    { step: "Étape 3", label: "Mesurer à nouveau", body: "Voyez si votre chiffre a bougé." },
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
      body: "Sept séances de quinze minutes, guidées par l'application. Personne n'a besoin d'être là.",
    },
    {
      step: "Chaque soir",
      label: "Noter",
      body: "Trente secondes pour noter quatre choses. C'est comme ça que vous le voyez bouger avant le test, au lieu d'espérer à la fin.",
    },
    {
      step: "Jour 12",
      label: "Mesurer à nouveau",
      body: "La même mesure, dans les mêmes conditions. Deux chiffres côte à côte. C'est tout le test.",
    },
  ],

  notBuyingH: "Ce que vous n'achetez pas.",
  notBuying: [
    "Pas de pilules",
    "Pas de plantes",
    "Pas d'anesthésiants",
    "Pas de matériel",
    "Aucune visite en clinique",
    "Personne n'a besoin de le savoir",
  ],
  notBuyingSub:
    "Quinze minutes par jour, sur sept jours du programme. C'est tout le coût en temps.",

  whoForH: "Pour qui c'est fait",
  whoFor: [
    "Vous finissez généralement plus tôt que vous ne le voudriez",
    "Vous voulez un vrai contrôle, pas quelque chose derrière quoi vous cacher",
    "Vous voulez le faire en privé",
    "Vous ne voulez ni pilules ni produits",
    "Vous pouvez y consacrer quinze minutes par jour",
  ],
  whoForNote:
    "Metron, c'est de l'entraînement et de l'éducation. Ce n'est pas conçu pour diagnostiquer ou traiter une condition médicale.",

  resultsH: "De vrais chiffres. Pas des promesses.",
  resultsKicker: "Ce qu'ont enregistré les participants accompagnés",
  results: [
    { multiple: "1,5 à 3×", label: "leur temps de départ, après les 10 jours" },
    { multiple: "2 à 5×", label: "leur temps de départ, après les 30 jours" },
  ],
  resultsNote:
    "Ces chiffres viennent d'hommes accompagnés sur ce protocole avant l'existence de l'application. Chacun s'est mesuré deux fois de la même façon — son chiffre du premier jour contre celui de la fin — exactement la comparaison que vous ferez sur vous-même. Donné en fourchette parce que c'est ce que les relevés permettent d'affirmer ; une moyenne laisserait croire à une précision que personne n'a.",

  testimonialsH: "Dans leurs mots",
  testimonials: [],

  offerKicker: "Essayez Metron pendant 10 jours",
  fullLabel: "Programme complet",
  testLabel: "Test de 10 jours",
  offerBody: [
    "Le programme complet coûte 69 000 FCFA. Vous ne payez pas ça aujourd'hui.",
    "Vous ne savez pas encore si ça marche sur vous, et nous ne l'avons pas mérité. Alors vous payez 7 500 pour le tester — moins qu'un repas dehors.",
    "Si ça marche, les 7 500 sont déduits des 69 000. Sinon, vous nous écrivez et on vous rembourse.",
  ],
  includes: [
    "Le programme de 10 jours",
    "Sept séances guidées",
    "Votre mesure de départ",
    "Votre mesure du jour 12",
    "Le suivi chaque soir",
    "Un accès privé depuis votre téléphone",
    "Aucun matériel",
    "Ni pilules ni produits",
  ],
  payTrust: [
    "Achat privé",
    "Paiement sécurisé",
    "Un seul paiement, pas d'abonnement",
    "Remboursé si votre chiffre ne bouge pas",
  ],

  guaranteeH: "Ne nous croyez pas sur parole. Testez.",
  guaranteeSteps: ["Mesurez-vous", "Entraînez-vous dix jours", "Mesurez à nouveau"],
  guarantee:
    "Si votre chiffre n'a pas bougé, écrivez-nous et on vous rembourse. Vous aurez perdu dix jours et rien d'autre — et vous saurez, au lieu de vous poser la question encore un an.",

  faqH: "Avant de commencer",
  faq: [
    {
      q: "Est-ce que c'est privé ?",
      a: "Oui. Vous faites tout le programme vous-même dans l'application. Vous ne rencontrez aucun coach, vous ne parlez à personne, et votre relevé bancaire affiche METRON. Inscrivez-vous sous le nom que vous voulez.",
    },
    {
      q: "Faut-il du matériel ?",
      a: "Non. C'est conçu pour être fait chez vous sans rien du tout. Ça marche sur n'importe quel téléphone.",
    },
    {
      q: "Combien de temps ça prend ?",
      a: "Les séances durent environ quinze minutes, et il y en a sept sur les dix jours. Plus trente secondes chaque soir pour noter.",
    },
    {
      q: "Est-ce un médicament ?",
      a: "Non. Metron, c'est de l'éducation et de l'entraînement. Il n'y a rien à avaler et rien à prescrire.",
    },
    {
      q: "Et si j'ai déjà essayé autre chose ?",
      a: "C'est exactement pour ça que ça commence par une mesure. Au lieu de deviner si quelque chose marche, vous comparez votre propre chiffre avant et après. Les pilules et les sprays ne vous ont jamais dit ça — c'est en partie pour ça que vous cherchez encore.",
    },
    {
      q: "Que se passe-t-il après les 10 jours ?",
      a: "Vous prenez votre deuxième mesure et vous avez deux chiffres. Si ça a bougé, la plupart des hommes continuent sur le programme de 30 jours — le contrôle seul et le contrôle avec une partenaire sont deux compétences différentes — et vos 7 500 sont déduits du prix. Personne n'est inscrit automatiquement, et rien ne vous prélève à nouveau.",
    },
  ],

  finalH: "Ne devinez plus. Mesurez.",
  finalSub: "Mesurez-vous. Entraînez-vous dix jours. Mesurez à nouveau.",
  finalMicro: "Privé. Sans pilules. Sans matériel. Un seul paiement.",

  footerTag: "Entraînement privé pour un meilleur contrôle.",

  ui: {
    today: "Aujourd'hui",
    session: "Séance du jour",
    minutes: "15 minutes",
    startSession: "COMMENCER",
    dayOf: "Jour 4 sur 10",
  },
};

export function getDirect(locale: string): DirectCopy {
  return locale === "fr" ? FR : EN;
}

/**
 * Fills the price book through the copy.
 *
 * The prices are written above as literal francs because that is how the page
 * reads in its home market, but a man in London sees dollars. Wherever the
 * price book disagrees with the literal, the price book wins.
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
    offerBody: c.offerBody.map(swap),
    includes: c.includes.map(swap),
    payTrust: c.payTrust.map(swap),
    faq: c.faq.map((f) => ({ q: f.q, a: swap(f.a) })),
  };
}
