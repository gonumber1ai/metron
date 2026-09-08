/**
 * The 10-Day Challenge funnel — /[locale]/c
 *
 * Built to the flyers in New Funnel/3rd Funnel/use this. Ten screens, the
 * owner's copy, the flyer's design language: lime on near-black, heavy
 * uppercase headlines with the payload word in lime, outlined icon circles,
 * handwritten notes in the margins.
 *
 * ── WHAT THE FLYERS ASK FOR AND THIS DOES NOT DO ──────────────────────────
 * The six testimonials on flyer 03_51_14 — T.N. 28 Cameroon, A.K. 31 Nigeria,
 * M.D. 26 Senegal and the rest, each with a stock photo — are invented. Real
 * ones exist, sent in on WhatsApp, and they are imported from direct.ts so
 * both funnels quote the same men and a new one is added in one place.
 *
 * "30-Day Satisfaction" on the same flyer contradicts the product: the second
 * measurement is on day 10, and a 30-day window invites a refund from a man
 * who never opened the app. The promise here is the one the product keeps.
 *
 * "Studies have shown…" is stated as our own observation. No study is cited
 * and inventing a citation is worse than not having one.
 *
 * ── NEVER NAME THE TECHNIQUE ──────────────────────────────────────────────
 * The owner's copy names breathing, pelvic-floor and arousal management, and
 * those stay: they describe what a man trains, not how a session runs. What is
 * never written down is the sequence inside a session. He must not be able to
 * execute this page.
 */

export type Challenge = {
  /* chrome */
  tagline: string;
  taglineLast: string;
  timerLabel: string;
  hrs: string;
  mins: string;
  secs: string;
  barCta: string;
  barNote: string;

  /* 1 — hero + qualifier */
  h1a: string;
  h1lime: string;
  h1b: string;
  heroSub: string;
  heroBadges: { label: string; body: string }[];
  heroScript: string;
  qOf: string;
  quals: { q: string; options: string[] }[];
  qNext: string;
  qPrivate: string;

  /* 2 — good fit */
  fitEyebrow: string;
  fitA: string;
  fitLime: string;
  fitSub: string;
  fitScript: string;
  gymA: string;
  gymLime: string;
  gymBody: string;
  gymScript: string;
  fitCta: string;
  fitCards: { label: string; body: string }[];
  scrollHow: string;

  /* 3 — how it works */
  worksEyebrow: string;
  worksA: string;
  worksLime: string;
  worksSub: string;
  worksSubLime: string;
  pillars: { n: string; label: string; body: string; note: string }[];
  bonusTag: string;
  bonusWord: string;
  bonusH: string;
  bonusBody: string;
  bonusNote: string;
  worksScript: string;

  /* 4 — the plan */
  planEyebrow: string;
  planA: string;
  planLime: string;
  planSub: string;
  planBody: string;
  planIcons: { label: string; body: string }[];
  journeyH: string;
  journeySub: string;
  journey: { tag: string; label: string; body: string; pills?: string[] }[];
  planScript: string;

  /* 5 — without / with */
  diffEyebrow: string;
  diffA: string;
  diffLime: string;
  diffSub: string;
  withoutH: string;
  without: string[];
  withoutScript: string;
  withH: string;
  with: string[];
  withScript: string;

  /* 6 — proof */
  proofEyebrow: string;
  proofA: string;
  proofLime: string;
  proofSub: string;
  proofPoints: string[];
  resultsKicker: string;
  results: { multiple: string; label: string }[];
  resultsNote: string;
  shotsH: string;

  /* 7 — cost of not starting */
  costEyebrow: string;
  costA: string;
  costRed: string;
  costB: string;
  costSub: string;
  costCards: { label: string; body: string }[];
  costScript: string;
  worthA: string;
  worthLime: string;
  worthBody: string;

  /* 8 — what you get */
  getA: string;
  getLime: string;
  getB: string;
  getSub: string;
  getBadges: { label: string }[];
  getH: string;
  getCards: { label: string; body: string }[];
  getScript: string;

  /* 9 — the offer */
  readyH: string;
  readySub: string;
  offerCta: string;
  refundNote: string;

  /* 10 — trust + footer */
  trust: { label: string; body: string }[];
  footerLine: string;
};

const EN: Challenge = {
  tagline: "Train. Control.",
  taglineLast: "Satisfy.",
  timerLabel: "Special offer ends in",
  hrs: "hrs",
  mins: "mins",
  secs: "secs",
  barCta: "Start 10-day challenge",
  barNote: "100% private & secure",

  h1a: "Can you train yourself",
  h1lime: "to last longer",
  h1b: "and consistently?",
  heroSub: "Answer 3 quick questions and we'll tell you if this program is right for you.",
  heroBadges: [
    { label: "Private.", body: "No one has to know." },
    { label: "No pills.", body: "No herbs." },
    { label: "Just 15 minutes", body: "a day." },
    { label: "Real results.", body: "Naturally." },
  ],
  heroScript: "A Better You in Bed",
  qOf: "Question {n} of {total}",
  quals: [
    {
      q: "Do you often finish sooner than you'd like during sex?",
      options: ["Yes", "Sometimes", "No"],
    },
    {
      q: "Would you like better control without relying on pills, herbs, or supplements?",
      options: ["Yes", "No"],
    },
    {
      q: "Can you commit about 15 minutes a day for the next 10 days?",
      options: ["Yes", "No"],
    },
  ],
  qNext: "Next question",
  qPrivate: "Your answers are 100% private.",

  fitEyebrow: "Based on your answers",
  fitA: "You're a",
  fitLime: "good fit",
  fitSub:
    "You don't need pills or complicated routines. METRON can help you build real control — naturally.",
  fitScript: "Better Sex.\nA Happier You",
  gymA: "Metron is like a gym",
  gymLime: "for your sexual performance.",
  gymBody:
    "You build the skills. You get better. No heavy lifting. No 2-hour sessions. Just a simple, step-by-step system you can do in ~15 minutes a day.",
  gymScript: "Train\nImprove\nPerform",
  fitCta: "Let's get started",
  fitCards: [
    { label: "Private", body: "No one has to know." },
    { label: "Natural", body: "No pills. No herbs." },
    { label: "Flexible", body: "Works on any device." },
  ],
  scrollHow: "Scroll to see how it works",

  worksEyebrow: "How Metron works",
  worksA: "Real training",
  worksLime: "for real results.",
  worksSub:
    "You don't build physical control by wishing for it. You train it. Your program combines 5 key elements — ",
  worksSubLime: "naturally.",
  pillars: [
    {
      n: "01",
      label: "Awareness",
      body: "Measure how long you last on day 1, so you know where you are and can track your progress.",
      note: "Know your starting point.",
    },
    {
      n: "02",
      label: "Breathing",
      body: "Like every form of exercise, how you breathe has a direct impact on your stamina and your control.",
      note: "Breathe better. Last longer.",
    },
    {
      n: "03",
      label: "Pelvic-floor control",
      body: "Most men are controlled by these muscles rather than controlling them, which is why they finish sooner than they wanted.",
      note: "A stronger foundation.",
    },
    {
      n: "04",
      label: "Arousal management",
      body: "Learn to recognise when you are close, and train your body to hold that point for longer.",
      note: "Be aware. Stay in control.",
    },
    {
      n: "05",
      label: "Practical exercises",
      body: "Simple exercises that combine everything above. No more than 15 minutes a day.",
      note: "Simple. Effective. ~15 minutes.",
    },
  ],
  bonusTag: "Day 10",
  bonusWord: "Bonus",
  bonusH: "How to make her come first",
  bonusBody:
    "Learn how to identify her arousal point and what to do with it — for a more satisfying experience for both of you.",
  bonusNote: "Included in your 10-day program.",
  worksScript: "A Happier You.\nA More\nSatisfied Her.",

  planEyebrow: "The 10-day challenge",
  planA: "A simple plan.",
  planLime: "Real results.",
  planSub: "Just 10 days. ~15 minutes a day.",
  planBody: "Follow the plan, put in the work, and see the difference for yourself.",
  planIcons: [
    { label: "Measure", body: "See where you are." },
    { label: "Train", body: "Build control." },
    { label: "Track", body: "See progress." },
    { label: "Enjoy", body: "A better sex life." },
  ],
  journeyH: "Your 10-day journey",
  journeySub: "Small daily steps. A big difference.",
  journey: [
    {
      tag: "Day 1",
      label: "Measure",
      body: "Complete your baseline measurement. Know where you are so you can track your progress.",
    },
    {
      tag: "Days 2–9",
      label: "Follow your daily training",
      body: "~15 minutes a day. Simple. Effective. Private.",
      pills: ["Breathing", "Pelvic-floor control", "Arousal management", "Practical exercises"],
    },
    {
      tag: "Day 10",
      label: "Measure again",
      body: "Repeat the measurement. See what changed, for yourself.",
    },
  ],
  planScript: "More Control.\nMore Pleasure.\nTogether.",

  diffEyebrow: "The difference",
  diffA: "Same you.",
  diffLime: "A better experience.",
  diffSub: "It's not about being someone else. It's about getting better at what matters.",
  withoutH: "Without Metron",
  without: [
    "Guessing what to do",
    "Inconsistent control",
    "Frustration",
    "Relying on quick fixes",
    "Wondering if things will improve",
  ],
  withoutScript: "Same\nProblems?",
  withH: "With Metron",
  with: [
    "A structured daily routine",
    "Practical control techniques",
    "Better awareness",
    "Increased confidence",
    "Measurable progress",
  ],
  withScript: "A More\nSatisfied You.",

  proofEyebrow: "Real men. Real results.",
  proofA: "More control.",
  proofLime: "Happier moments.",
  proofSub: "See what men who followed this program are experiencing.",
  proofPoints: ["Last longer", "More satisfying sex", "More confidence"],
  resultsKicker: "What men who followed this program recorded",
  results: [
    { multiple: "1.5–3×", label: "how long they lasted on day 10, against day one" },
    { multiple: "2–5×", label: "how long they lasted on day 30, against day one" },
  ],
  resultsNote:
    "Each man timed himself the same way twice — day one, then again at the end. Stated as a range because that is what the records support; an average would imply a precision nobody has.",
  shotsH: "The original messages",

  costEyebrow: "The cost of",
  costA: "Not starting",
  costRed: "is higher",
  costB: "than you think.",
  costSub:
    "The longer you stay at a particular duration, the harder it gets to change it. It is not just a few minutes — it affects your confidence, your relationship and your happiness.",
  costCards: [
    {
      label: "Missed moments",
      body: "More frustration. More excuses. More missed opportunities to connect.",
    },
    {
      label: "Lower confidence",
      body: "You overthink. You feel insecure. It affects how you show up in and out of the bedroom.",
    },
    {
      label: "Relationship tension",
      body: "She feels unsatisfied. You feel the distance. Little things turn into bigger problems.",
    },
    {
      label: "The regret later",
      body: "You keep saying “I'll start later.” But later turns into months, or years. And nothing changes.",
    },
  ],
  costScript: "Don't Let This\nBe A Missed\nOpportunity.",
  worthA: "A better you",
  worthLime: "is worth it.",
  worthBody:
    "If you're unhappy with your sexual performance, waiting another month doesn't make you last longer. Training does. {test} shouldn't be the reason you spend another month unhappy with your sex life.",

  getA: "10 days to a",
  getLime: "longer lasting you",
  getB: "and a happier sex life.",
  getSub:
    "A simple, private, step-by-step program to help you last longer, feel more in control, and give your partner the pleasure they deserve.",
  getBadges: [
    { label: "Last longer" },
    { label: "More satisfying sex" },
    { label: "A more confident you" },
  ],
  getH: "What you get in 10 days",
  getCards: [
    { label: "Daily lessons", body: "Short and easy to follow." },
    { label: "Practical guides", body: "Apply what you learn right away." },
    { label: "Progress tracker", body: "Stay consistent and see real results." },
    { label: "Lifetime access", body: "Go at your own pace. Revisit anytime." },
  ],
  getScript: "Same Bedroom.\nA Better You.",

  readyH: "Ready for your results?",
  readySub: "Start your 10-day challenge now for only {test}.",
  offerCta: "Start 10-day challenge for {test}",
  refundNote:
    "You can either keep wondering if you can improve — or spend the next 10 days finding out. If you're not lasting longer, write to us and we send your money back.",

  trust: [
    { label: "100% private", body: "No one has to know." },
    { label: "No pills. No herbs.", body: "Just proven training." },
    { label: "Works on any device", body: "Train from your phone." },
    { label: "Secure payment", body: "Your information is protected." },
  ],
  footerLine: "Better sex. A brighter you.",
};

const FR: Challenge = {
  tagline: "Entraînez. Contrôlez.",
  taglineLast: "Satisfaites.",
  timerLabel: "Offre spéciale se termine dans",
  hrs: "h",
  mins: "min",
  secs: "sec",
  barCta: "Commencer le défi 10 jours",
  barNote: "100% privé et sécurisé",

  h1a: "Pouvez-vous vous entraîner",
  h1lime: "à tenir plus longtemps",
  h1b: "et de façon constante ?",
  heroSub:
    "Répondez à 3 questions rapides et on vous dira si ce programme est fait pour vous.",
  heroBadges: [
    { label: "Privé.", body: "Personne n'a besoin de le savoir." },
    { label: "Pas de pilules.", body: "Pas de plantes." },
    { label: "Juste 15 minutes", body: "par jour." },
    { label: "De vrais résultats.", body: "Naturellement." },
  ],
  heroScript: "Un Meilleur Vous au Lit",
  qOf: "Question {n} sur {total}",
  quals: [
    {
      q: "Finissez-vous souvent plus tôt que vous ne le voudriez pendant les rapports ?",
      options: ["Oui", "Parfois", "Non"],
    },
    {
      q: "Aimeriez-vous un meilleur contrôle sans dépendre de pilules, de plantes ou de compléments ?",
      options: ["Oui", "Non"],
    },
    {
      q: "Pouvez-vous consacrer environ 15 minutes par jour pendant les 10 prochains jours ?",
      options: ["Oui", "Non"],
    },
  ],
  qNext: "Question suivante",
  qPrivate: "Vos réponses sont 100% privées.",

  fitEyebrow: "D'après vos réponses",
  fitA: "Vous êtes",
  fitLime: "un bon profil",
  fitSub:
    "Vous n'avez besoin ni de pilules ni de routines compliquées. METRON peut vous aider à construire un vrai contrôle — naturellement.",
  fitScript: "Meilleur Sexe.\nUn Vous Plus Heureux",
  gymA: "Metron, c'est comme une salle de sport",
  gymLime: "pour votre performance sexuelle.",
  gymBody:
    "Vous construisez les compétences. Vous progressez. Pas de charges lourdes. Pas de séances de 2 heures. Juste un système simple, étape par étape, en ~15 minutes par jour.",
  gymScript: "Entraîner\nProgresser\nPerformer",
  fitCta: "C'est parti",
  fitCards: [
    { label: "Privé", body: "Personne n'a besoin de le savoir." },
    { label: "Naturel", body: "Pas de pilules. Pas de plantes." },
    { label: "Flexible", body: "Sur n'importe quel appareil." },
  ],
  scrollHow: "Descendez pour voir comment ça marche",

  worksEyebrow: "Comment Metron fonctionne",
  worksA: "Un vrai entraînement",
  worksLime: "pour de vrais résultats.",
  worksSub:
    "On ne construit pas le contrôle physique en le souhaitant. On l'entraîne. Votre programme combine 5 éléments clés — ",
  worksSubLime: "naturellement.",
  pillars: [
    {
      n: "01",
      label: "La conscience",
      body: "Mesurez combien de temps vous tenez au jour 1, pour savoir où vous en êtes et suivre vos progrès.",
      note: "Connaissez votre point de départ.",
    },
    {
      n: "02",
      label: "La respiration",
      body: "Comme dans toute forme d'exercice, votre façon de respirer a un impact direct sur votre endurance et votre contrôle.",
      note: "Mieux respirer. Tenir plus longtemps.",
    },
    {
      n: "03",
      label: "Le plancher pelvien",
      body: "La plupart des hommes sont contrôlés par ces muscles au lieu de les contrôler — c'est pour ça qu'ils finissent plus tôt qu'ils ne le voulaient.",
      note: "Une base plus solide.",
    },
    {
      n: "04",
      label: "La gestion de l'excitation",
      body: "Apprenez à reconnaître quand vous approchez, et entraînez votre corps à tenir ce point plus longtemps.",
      note: "Être conscient. Rester maître.",
    },
    {
      n: "05",
      label: "Les exercices pratiques",
      body: "Des exercices simples qui combinent tout ce qui précède. Pas plus de 15 minutes par jour.",
      note: "Simple. Efficace. ~15 minutes.",
    },
  ],
  bonusTag: "Jour 10",
  bonusWord: "Bonus",
  bonusH: "Comment la faire jouir en premier",
  bonusBody:
    "Apprenez à identifier son point d'excitation et quoi en faire — pour une expérience plus satisfaisante pour vous deux.",
  bonusNote: "Inclus dans votre programme de 10 jours.",
  worksScript: "Un Vous Plus Heureux.\nUne Elle Plus\nSatisfaite.",

  planEyebrow: "Le défi de 10 jours",
  planA: "Un plan simple.",
  planLime: "De vrais résultats.",
  planSub: "Juste 10 jours. ~15 minutes par jour.",
  planBody: "Suivez le plan, faites le travail, et voyez la différence par vous-même.",
  planIcons: [
    { label: "Mesurer", body: "Voir où vous en êtes." },
    { label: "S'entraîner", body: "Construire le contrôle." },
    { label: "Suivre", body: "Voir les progrès." },
    { label: "Profiter", body: "Une meilleure vie sexuelle." },
  ],
  journeyH: "Votre parcours de 10 jours",
  journeySub: "De petits pas chaque jour. Une grande différence.",
  journey: [
    {
      tag: "Jour 1",
      label: "Mesurer",
      body: "Faites votre mesure de départ. Sachez où vous en êtes pour pouvoir suivre vos progrès.",
    },
    {
      tag: "Jours 2–9",
      label: "Suivez votre entraînement quotidien",
      body: "~15 minutes par jour. Simple. Efficace. Privé.",
      pills: [
        "Respiration",
        "Plancher pelvien",
        "Gestion de l'excitation",
        "Exercices pratiques",
      ],
    },
    {
      tag: "Jour 10",
      label: "Mesurer à nouveau",
      body: "Refaites la mesure. Voyez ce qui a changé, par vous-même.",
    },
  ],
  planScript: "Plus de Contrôle.\nPlus de Plaisir.\nEnsemble.",

  diffEyebrow: "La différence",
  diffA: "Le même vous.",
  diffLime: "Une meilleure expérience.",
  diffSub:
    "Il ne s'agit pas de devenir quelqu'un d'autre. Il s'agit de progresser là où ça compte.",
  withoutH: "Sans Metron",
  without: [
    "Vous devinez quoi faire",
    "Un contrôle irrégulier",
    "De la frustration",
    "Vous comptez sur des solutions rapides",
    "Vous vous demandez si ça s'améliorera",
  ],
  withoutScript: "Les Mêmes\nProblèmes ?",
  withH: "Avec Metron",
  with: [
    "Une routine quotidienne structurée",
    "Des techniques de contrôle concrètes",
    "Une meilleure conscience",
    "Plus de confiance",
    "Des progrès mesurables",
  ],
  withScript: "Un Vous Plus\nSatisfait.",

  proofEyebrow: "De vrais hommes. De vrais résultats.",
  proofA: "Plus de contrôle.",
  proofLime: "Des moments plus heureux.",
  proofSub: "Voyez ce que vivent les hommes qui ont suivi ce programme.",
  proofPoints: ["Tenir plus longtemps", "Des rapports plus satisfaisants", "Plus de confiance"],
  resultsKicker: "Ce qu'ont enregistré les hommes ayant suivi ce programme",
  results: [
    { multiple: "1,5 à 3×", label: "combien de temps ils ont tenu au jour 10, comparé au jour 1" },
    { multiple: "2 à 5×", label: "combien de temps ils ont tenu au jour 30, comparé au jour 1" },
  ],
  resultsNote:
    "Chacun s'est chronométré deux fois de la même façon — le premier jour, puis à la fin. Donné en fourchette parce que c'est ce que les relevés permettent d'affirmer ; une moyenne laisserait croire à une précision que personne n'a.",
  shotsH: "Les messages d'origine",

  costEyebrow: "Ce que coûte",
  costA: "De ne pas commencer",
  costRed: "coûte plus cher",
  costB: "que vous ne le pensez.",
  costSub:
    "Plus vous restez à une certaine durée, plus il devient difficile de la changer. Ce n'est pas juste quelques minutes — ça touche votre confiance, votre couple et votre bonheur.",
  costCards: [
    {
      label: "Des moments manqués",
      body: "Plus de frustration. Plus d'excuses. Plus d'occasions manquées de vous rapprocher.",
    },
    {
      label: "Moins de confiance",
      body: "Vous réfléchissez trop. Vous vous sentez peu sûr de vous. Ça se voit au lit et en dehors.",
    },
    {
      label: "Des tensions dans le couple",
      body: "Elle reste sur sa faim. Vous sentez la distance. Les petites choses deviennent de gros problèmes.",
    },
    {
      label: "Le regret plus tard",
      body: "Vous répétez « je commencerai plus tard ». Mais plus tard devient des mois, ou des années. Et rien ne change.",
    },
  ],
  costScript: "Ne Laissez Pas\nPasser Cette\nOccasion.",
  worthA: "Un meilleur vous",
  worthLime: "ça vaut le coup.",
  worthBody:
    "Si vous n'êtes pas satisfait de votre performance sexuelle, attendre un mois de plus ne vous fera pas tenir plus longtemps. L'entraînement, oui. {test} ne devrait pas être la raison pour laquelle vous passez encore un mois insatisfait de votre vie sexuelle.",

  getA: "10 jours pour",
  getLime: "tenir plus longtemps",
  getB: "et une vie sexuelle plus heureuse.",
  getSub:
    "Un programme simple, privé, étape par étape, pour vous aider à tenir plus longtemps, à vous sentir plus maître de vous, et à donner à votre partenaire le plaisir qu'elle mérite.",
  getBadges: [
    { label: "Tenir plus longtemps" },
    { label: "Des rapports plus satisfaisants" },
    { label: "Un vous plus confiant" },
  ],
  getH: "Ce que vous obtenez en 10 jours",
  getCards: [
    { label: "Leçons quotidiennes", body: "Courtes et faciles à suivre." },
    { label: "Guides pratiques", body: "Appliquez ce que vous apprenez tout de suite." },
    { label: "Suivi de progression", body: "Restez régulier et voyez de vrais résultats." },
    { label: "Accès à vie", body: "Allez à votre rythme. Revenez quand vous voulez." },
  ],
  getScript: "Même Chambre.\nUn Meilleur Vous.",

  readyH: "Prêt pour vos résultats ?",
  readySub: "Commencez votre défi de 10 jours maintenant pour seulement {test}.",
  offerCta: "Commencer le défi 10 jours pour {test}",
  refundNote:
    "Vous pouvez continuer à vous demander si vous pouvez progresser — ou passer les 10 prochains jours à le découvrir. Si vous ne tenez pas plus longtemps, écrivez-nous et on vous rembourse.",

  trust: [
    { label: "100% privé", body: "Personne n'a besoin de le savoir." },
    { label: "Pas de pilules. Pas de plantes.", body: "Juste un entraînement éprouvé." },
    { label: "Sur tout appareil", body: "Entraînez-vous depuis votre téléphone." },
    { label: "Paiement sécurisé", body: "Vos informations sont protégées." },
  ],
  footerLine: "Meilleur sexe. Un vous plus lumineux.",
};

export function getChallenge(locale: string): Challenge {
  return locale === "fr" ? FR : EN;
}

/** Fills {test} from the price book, same as every other sales page. */
export function withChallengePrice(c: Challenge, test: string): Challenge {
  const f = (s: string) => s.split("{test}").join(test);
  return {
    ...c,
    barCta: f(c.barCta),
    readySub: f(c.readySub),
    offerCta: f(c.offerCta),
    worthBody: f(c.worthBody),
  };
}
