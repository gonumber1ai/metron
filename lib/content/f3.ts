/**
 * Funnel 3 — built from the two mockups in New Funnel/3rd Funnel.
 *
 * Shape taken from 1 and 2: sticky offer bar, hero, a three-question
 * qualifier, without/with, measure-train-measure, what is inside a session,
 * why it works, proof, two paths, close.
 *
 * ── WHAT THE MOCKUPS ASKED FOR AND THIS DOES NOT DO ───────────────────────
 * "Over 10,000+ men are already improving" and "Trusted by thousands of men"
 * are not here. There are a handful of customers. A number like that on a
 * page taking money is the single easiest thing to be caught inventing, and
 * on a page whose whole argument is "everyone else makes claims you cannot
 * check", it is also self-defeating.
 *
 * Frank 28 / David 31 / Mike 26 with stock headshots are not here either. The
 * real WhatsApp reviews are imported from direct.ts, so there is one source
 * of truth for them and no chance of the two pages quoting different men.
 *
 * The mockups' "7-DAY GUARANTEE" contradicts the product — the second
 * measurement is on day 12, so a seven-day window lets a man claim a refund
 * before he has finished the thing being guaranteed. The promise here is the
 * one the product can actually keep.
 *
 * "Studies show the longer you stay at a certain duration…" is stated as our
 * own observation instead, because no study is cited and inventing a citation
 * is worse than not having one.
 *
 * ── THE COUNTDOWN ─────────────────────────────────────────────────────────
 * Driven by NEXT_PUBLIC_OFFER_ENDS, a real ISO date. When it is unset the bar
 * renders without a timer rather than counting down to nothing. A clock that
 * resets for every visitor is a lie a man can catch by reopening the page,
 * and it costs more than the urgency wins.
 *
 * ── NEVER NAME THE TECHNIQUE ──────────────────────────────────────────────
 * Same rule as everywhere else. "Control techniques" and "pelvic floor" are
 * as specific as this gets. A man must not be able to execute the page.
 */

export type F3Copy = {
  /* sticky bar */
  brandLine: string;
  offerEndsLabel: string;
  barCta: string;

  /* hero */
  h1a: string;
  h1b: string;
  sub: string;
  subHighlight: string;
  benefits: { label: string; body: string }[];
  cta: string;
  microTrust: string[];

  /* qualifier */
  qualH: string;
  qualSub: string;
  quals: { q: string; options: string[] }[];
  qualPassH: string;
  qualPassBody: string;

  /* without / with */
  vsH: string;
  withoutH: string;
  withoutSub: string;
  without: string[];
  withH: string;
  withSub: string;
  with: string[];

  /* measure → train → measure */
  flowH: string;
  flowSub: string;
  flowDay1Tag: string;
  flowDay1H: string;
  flowDay1Body: string;
  flowTrainTag: string;
  flowTrainH: string;
  flowTrainPillars: string[];
  flowTrainNote: string;
  flowDay12Tag: string;
  flowDay12H: string;
  flowDay12Body: string;

  /* inside a session */
  insideH: string;
  inside: { label: string; body: string }[];

  /* why it works */
  whyH: string;
  why: string[];

  /* proof */
  proofH: string;
  proofKicker: string;
  results: { multiple: string; label: string }[];
  resultsNote: string;

  /* two paths */
  pathsH: string;
  startHere: string;
  mostContinue: string;
  tenDayLabel: string;
  thirtyDayLabel: string;
  tenDayIncludes: string[];
  thirtyDayIncludes: string[];
  tenDayCta: string;
  thirtyDayCta: string;

  /* cost of waiting */
  costH: string;
  costBody: string;
  costPunch: string;

  /* close */
  closeH: string;
  closeSub: string;
  closeCta: string;
  guaranteeNote: string;

  /* trust bar */
  trustBar: { label: string; body: string }[];
};

const EN: F3Copy = {
  brandLine: "Train your sexual performance",
  offerEndsLabel: "Special price ends in",
  barCta: "Start for 2 500 XAF",

  h1a: "Last longer.",
  h1b: "More control.",
  sub: "A 10-day training programme to help you improve your sexual performance — ",
  subHighlight: "without pills or herbs.",
  benefits: [
    { label: "Build control", body: "Over your body and your arousal." },
    { label: "Private", body: "No one has to know." },
    { label: "~15 minutes", body: "A day is all you need." },
  ],
  cta: "Start the 10-day programme",
  microTrust: ["Private", "Guided", "Track your progress"],

  qualH: "Let's not waste your time.",
  qualSub: "Answer 3 questions and we'll tell you whether Metron is right for you.",
  quals: [
    { q: "Do you often finish sooner than you'd like during sex?", options: ["Yes", "Sometimes", "No"] },
    { q: "Would you like better control without depending on pills or herbs?", options: ["Yes", "No"] },
    { q: "Can you commit around 15 minutes a day for 10 days?", options: ["Yes", "No"] },
  ],
  qualPassH: "This programme is for you.",
  qualPassBody: "Keep scrolling to see how Metron works and what the ten days look like.",

  vsH: "How your sex life could look",
  withoutH: "Without Metron",
  withoutSub: "You keep guessing. Nothing changes.",
  without: [
    "Finish too fast",
    "No control or confidence",
    "Rely on pills or herbs",
    "Overthinking in bed",
    "Partner not fully satisfied",
  ],
  withH: "With Metron",
  withSub: "Follow the programme. See real changes.",
  with: [
    "Last longer with control",
    "Stronger confidence",
    "Better connection",
    "More satisfying sex",
    "Proud of your performance",
  ],

  flowH: "Measure. Train. Measure again.",
  flowSub:
    "Day 1 you measure. You follow the 7 training sessions. Day 12 you measure again and see the difference for yourself.",
  flowDay1Tag: "Day 1",
  flowDay1H: "Measure",
  flowDay1Body: "Time how long you last today. There is a timer in your account. This is your baseline.",
  flowTrainTag: "Days 1–10",
  flowTrainH: "7 training sessions",
  flowTrainPillars: ["Exercises", "Techniques", "Foods to eat", "Habits & routines"],
  flowTrainNote: "15 minutes a day. Build control. Build stamina. Build confidence.",
  flowDay12Tag: "Day 12",
  flowDay12H: "Measure again",
  flowDay12Body: "The same measurement, the same conditions. Two numbers side by side. That is the whole test.",

  insideH: "What's inside each training session",
  inside: [
    { label: "Short lesson", body: "Learn the why and the how." },
    { label: "Practical exercises", body: "Simple exercises that build control." },
    { label: "Foods to eat", body: "Eat the right foods to support performance." },
    { label: "Daily routines", body: "Easy routines that fit into your day." },
    { label: "Track progress", body: "Follow the plan. See real results." },
  ],

  whyH: "Why Metron works",
  why: [
    "It trains control instead of masking it.",
    "Practical, simple, and done in fifteen minutes.",
    "No pills. No herbs. Nothing to swallow.",
    "You measure, so you are never guessing whether it worked.",
    "Private. No one has to know.",
  ],

  proofH: "Real men. Real results.",
  proofKicker: "What men who followed this programme recorded",
  results: [
    { multiple: "1.5–3×", label: "how long they lasted on day 12, against day one" },
    { multiple: "2–5×", label: "how long they lasted on day 30, against day one" },
  ],
  resultsNote:
    "These are from men who followed this programme. Each timed himself twice — day one, then again at the end. This is how we know it works. Stated as a range because that is what the records support; an average would imply a precision nobody has.",

  pathsH: "Choose your path",
  startHere: "Start here",
  mostContinue: "Most men continue",
  tenDayLabel: "10-day programme",
  thirtyDayLabel: "30-day programme",
  tenDayIncludes: [
    "7 training sessions",
    "Exercises, foods & routines",
    "Measure day 1 and day 12",
    "15 minutes a day",
    "Private access",
  ],
  thirtyDayIncludes: [
    "Everything in the 10-day programme",
    "More training and advanced lessons",
    "Build the habit for lasting results",
    "Ongoing improvement and support",
  ],
  tenDayCta: "Start 10-day programme",
  thirtyDayCta: "Choose 30-day programme",

  costH: "The cost of not starting today",
  costBody:
    "The longer you stay at the same time, the harder it gets to change it. Every month finishing at the same number teaches your body that this is normal.",
  costPunch: "Don't make it harder for yourself tomorrow.",

  closeH: "Start today. Measure today. Improve tomorrow.",
  closeSub: "Begin the 10-day programme now and see the difference for yourself.",
  closeCta: "Start for just 2 500 XAF",
  guaranteeNote:
    "Do the 10 days and both measurements. If you are not lasting longer, write to us and we send your money back.",

  trustBar: [
    { label: "100% private", body: "No one has to know." },
    { label: "Secure payment", body: "Safe and encrypted checkout." },
    { label: "Money back", body: "Not lasting longer? Full refund." },
    { label: "Support", body: "We're here to help you." },
  ],
};

const FR: F3Copy = {
  brandLine: "Entraînez votre performance sexuelle",
  offerEndsLabel: "Prix spécial se termine dans",
  barCta: "Commencer pour 2 500 XAF",

  h1a: "Tenez plus longtemps.",
  h1b: "Plus de contrôle.",
  sub: "Un programme d'entraînement de 10 jours pour améliorer votre performance sexuelle — ",
  subHighlight: "sans pilules ni plantes.",
  benefits: [
    { label: "Prenez le contrôle", body: "De votre corps et de votre excitation." },
    { label: "Privé", body: "Personne n'a besoin de le savoir." },
    { label: "~15 minutes", body: "Par jour, c'est tout." },
  ],
  cta: "Commencer le programme de 10 jours",
  microTrust: ["Privé", "Guidé", "Suivez vos progrès"],

  qualH: "Ne perdons pas votre temps.",
  qualSub: "Répondez à 3 questions et on vous dira si Metron est fait pour vous.",
  quals: [
    { q: "Finissez-vous souvent plus tôt que vous ne le voudriez ?", options: ["Oui", "Parfois", "Non"] },
    { q: "Voulez-vous un meilleur contrôle sans dépendre de pilules ou de plantes ?", options: ["Oui", "Non"] },
    { q: "Pouvez-vous y consacrer environ 15 minutes par jour pendant 10 jours ?", options: ["Oui", "Non"] },
  ],
  qualPassH: "Ce programme est fait pour vous.",
  qualPassBody: "Continuez à descendre pour voir comment Metron fonctionne et à quoi ressemblent les dix jours.",

  vsH: "À quoi votre vie sexuelle pourrait ressembler",
  withoutH: "Sans Metron",
  withoutSub: "Vous continuez à deviner. Rien ne change.",
  without: [
    "Vous finissez trop vite",
    "Aucun contrôle, aucune confiance",
    "Vous dépendez de pilules ou de plantes",
    "Vous réfléchissez trop au lit",
    "Votre partenaire reste sur sa faim",
  ],
  withH: "Avec Metron",
  withSub: "Suivez le programme. Voyez de vrais changements.",
  with: [
    "Vous tenez plus longtemps, avec contrôle",
    "Plus de confiance",
    "Une meilleure connexion",
    "Des rapports plus satisfaisants",
    "Fier de votre performance",
  ],

  flowH: "Mesurez. Entraînez-vous. Mesurez à nouveau.",
  flowSub:
    "Au jour 1 vous mesurez. Vous suivez les 7 séances. Au jour 12 vous mesurez à nouveau et vous voyez la différence par vous-même.",
  flowDay1Tag: "Jour 1",
  flowDay1H: "Mesurer",
  flowDay1Body: "Chronométrez combien de temps vous tenez aujourd'hui. Il y a un chrono dans votre compte. C'est votre point de départ.",
  flowTrainTag: "Jours 1–10",
  flowTrainH: "7 séances d'entraînement",
  flowTrainPillars: ["Exercices", "Techniques", "Aliments", "Habitudes et routines"],
  flowTrainNote: "15 minutes par jour. Le contrôle, l'endurance, la confiance.",
  flowDay12Tag: "Jour 12",
  flowDay12H: "Mesurer à nouveau",
  flowDay12Body: "La même mesure, dans les mêmes conditions. Deux chiffres côte à côte. C'est tout le test.",

  insideH: "Ce que contient chaque séance",
  inside: [
    { label: "Une courte leçon", body: "Le pourquoi et le comment." },
    { label: "Des exercices pratiques", body: "Des exercices simples qui construisent le contrôle." },
    { label: "Les aliments", body: "Ce qu'il faut manger pour soutenir la performance." },
    { label: "Des routines", body: "Faciles à intégrer dans votre journée." },
    { label: "Le suivi", body: "Suivez le plan. Voyez de vrais résultats." },
  ],

  whyH: "Pourquoi Metron marche",
  why: [
    "On entraîne le contrôle au lieu de le masquer.",
    "Pratique, simple, et fait en quinze minutes.",
    "Pas de pilules. Pas de plantes. Rien à avaler.",
    "Vous mesurez : vous ne devinez jamais si ça a marché.",
    "Privé. Personne n'a besoin de le savoir.",
  ],

  proofH: "De vrais hommes. De vrais résultats.",
  proofKicker: "Ce qu'ont enregistré les hommes ayant suivi ce programme",
  results: [
    { multiple: "1,5 à 3×", label: "combien de temps ils ont tenu au jour 12, comparé au jour 1" },
    { multiple: "2 à 5×", label: "combien de temps ils ont tenu au jour 30, comparé au jour 1" },
  ],
  resultsNote:
    "Ces chiffres viennent d'hommes ayant suivi ce programme. Chacun s'est chronométré deux fois — le premier jour, puis à la fin. C'est comme ça qu'on sait que ça marche. Donné en fourchette parce que c'est ce que les relevés permettent d'affirmer ; une moyenne laisserait croire à une précision que personne n'a.",

  pathsH: "Choisissez votre parcours",
  startHere: "Commencez ici",
  mostContinue: "La plupart continuent",
  tenDayLabel: "Programme de 10 jours",
  thirtyDayLabel: "Programme de 30 jours",
  tenDayIncludes: [
    "7 séances d'entraînement",
    "Exercices, aliments et routines",
    "Mesure au jour 1 et au jour 12",
    "15 minutes par jour",
    "Accès privé",
  ],
  thirtyDayIncludes: [
    "Tout le programme de 10 jours",
    "Plus d'entraînement et de leçons avancées",
    "Installer l'habitude pour des résultats durables",
    "Progression et accompagnement continus",
  ],
  tenDayCta: "Commencer les 10 jours",
  thirtyDayCta: "Choisir les 30 jours",

  costH: "Ce que ça coûte de ne pas commencer aujourd'hui",
  costBody:
    "Plus vous restez au même temps, plus il devient difficile d'en changer. Chaque mois passé à finir au même chiffre apprend à votre corps que c'est normal.",
  costPunch: "Ne rendez pas ça plus difficile pour vous demain.",

  closeH: "Commencez aujourd'hui. Mesurez aujourd'hui. Progressez demain.",
  closeSub: "Commencez le programme de 10 jours et voyez la différence par vous-même.",
  closeCta: "Commencer pour 2 500 XAF",
  guaranteeNote:
    "Faites les 10 jours et les deux mesures. Si vous ne tenez pas plus longtemps, écrivez-nous et on vous rembourse.",

  trustBar: [
    { label: "100% privé", body: "Personne n'a besoin de le savoir." },
    { label: "Paiement sécurisé", body: "Paiement chiffré et sûr." },
    { label: "Remboursé", body: "Vous ne tenez pas plus longtemps ? Remboursement." },
    { label: "Support", body: "On est là pour vous aider." },
  ],
};

export function getF3(locale: string): F3Copy {
  return locale === "fr" ? FR : EN;
}
