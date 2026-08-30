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
 * try it for the price of a meal, and if he is not lasting longer he gets his
 * money back.
 *
 * ── THE PROMISE IS THE OUTCOME, NOT THE INSTRUMENT ────────────────────────
 * The refund condition is "if you are not lasting longer", never "if your
 * number has not moved". The number is how he checks it; lasting longer is
 * what he came for. Selling the instrument instead of the outcome is the
 * mistake this page keeps drifting back into.
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
 * The multiples come from men who followed this protocol before the app
 * existed — real people, real before-and-after numbers, just not rows in this
 * database. They were not coached: they followed the plan, which is exactly
 * what a buyer does today. Never describe them as coached — nobody is coached
 * here, and the word misdescribes the product as much as the data.
 *
 * They are stated as ranges rather than an average because a range is what
 * the records support; an average would imply a precision nobody has. And
 * they compare how long a man lasted on day one against how long he lasted at
 * the end — not "starting time", which describes nothing.
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

  /* the punch — pain, urgency, CTA, then the explanation */
  urgencyBefore: string;
  urgencyHighlight: string;
  urgencyAfter: string;
  urgencyBody: string;
  urgencyPunch: string;

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
  /* The original WhatsApp messages, cropped to the conversation. Rendered
     under the transcribed quotes: the text is what a man reads, the shots are
     what convinces him the text was not written by us. */
  shotsH: string;
  /* `caption` carries a translation when the screenshot is in the other
     language. The image is the proof that a real man wrote it; the caption is
     what makes it readable. Never a paraphrase — it says what he said. */
  shots: { src: string; alt: string; caption?: string }[];

  /* offer */
  offerKicker: string;
  fullLabel: string;
  testLabel: string;
  /* Why the price fell. An unexplained drop reads as either desperation or
     as proof the old number was invented — both cost more than the discount
     wins. The reason given is the true one and it is the same argument the
     urgency block already makes.

     ── NEVER DE-SELL AT THE BUTTON ────────────────────────────────────────
     Honest is not the same as apologetic. This block used to open with "you
     do not know yet whether this works on you, and we have not earned it",
     which was written when the job was talking a man DOWN from a 69,000
     programme to a 7,500 trial — there, the humility bought something. With
     one cheap price it buys nothing and plants doubt at the exact second he
     decides. Confidence carries the guarantee; the guarantee does not need
     an apology in front of it.

     And never compare the price to a competitor's product. "Less than a bag
     of herbs that lasts a month" put a rival in his head at the buy moment
     and invited the arithmetic we lose — theirs lasts a month, this is ten
     days. The herb price is why we priced here; it is not copy. */
  wasLabel: string;
  dropNote: string;
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

  /* alt text for the two marketing images */
  stepsAlt: string;
  sameResultAlt: string;

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
  sub: "A private 10-day training programme designed to help you last longer and build better control during sex — from your phone, at home.",
  flow: ["Measure your starting point", "Train for 10 days", "Measure again"],
  priceLine: "{test} to start",
  /* The product's real name, the one the checkout and the app both use. The
     page used to say "10-day test" here and the checkout said "10-Day Reset",
     which reads as two different things at the exact moment he commits. */
  cta: "Start the 10-Day Reset",
  ctaNote: "If you are not lasting longer, we refund you.",
  trust: ["Private by design", "Works on any phone", "Nothing to swallow", "One payment"],

  problemH: "You already know the problem.",
  problem: [
    "It ends sooner than you wanted. Again.",
    "You lie there working out how long that was. You wonder whether she was satisfied. You tell yourself next time will be different.",
    "Then next time comes, and the same thing happens.",
  ],
  problemPivot: "You have been managing this for years. You have never actually trained it.",

  urgencyBefore: "The longer you stay at ",
  urgencyHighlight: "2 or 3 minutes",
  urgencyAfter: ", the harder it is to break that pattern.",
  urgencyBody:
    "Every time you have sex and finish around the same time, you reinforce the same response.",
  urgencyPunch: "10 days can start changing that.",

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
    { step: "Step 3", label: "Measure again", body: "See whether you are lasting longer." },
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
  resultsKicker: "What men who followed this programme recorded",
  results: [
    { multiple: "1.5–3×", label: "how long they lasted on day 10, against day one" },
    { multiple: "2–5×", label: "how long they lasted on day 30, against day one" },
  ],
  resultsNote:
    "These are from men who followed this programme before the app existed. Each timed himself the same way twice — day one, then again at the end — which is exactly the comparison you will make on yourself. Stated as a range because that is what the records support; an average would imply a precision nobody has.",

  testimonialsH: "In their words",
  /* Real customers, sent to us on WhatsApp. Transcribed exactly, trimmed only
     with an ellipsis where a message ran on. Nothing here was written by us.
     Keep the originals — this is the part a refund dispute turns on. */
  testimonials: [
    {
      quote:
        "I finished the 10 day program and measured on the 12th day and I did 4:27 minutes exactly. And on day one I did 1:23 minutes. Have always been less than 2 minutes and it was stressing me out so got the 30 day plan already.",
      who: "Metron customer · 10-Day Reset",
      before: "1:23",
      after: "4:27",
    },
    {
      quote: "Under 3 minutes to over 7 minutes. Magic.",
      who: "Metron customer · 30-Day Sprint",
      before: "under 3:00",
      after: "over 7:00",
    },
    {
      quote: "Sent my results in the app already. Can only say thank you guys.",
      who: "Metron customer · 10-Day Reset",
    },
  ],

  shotsH: "The original messages",
  shots: [
    {
      src: "/reviews/review-fr-partner.webp",
      alt: "WhatsApp message in French: his partner asking what he took yesterday and when they can see each other again, forwarded with his own note about the 10 days.",
      caption:
        "In French. He forwarded what his partner had sent him \u2014 \u201cBb what did you take yesterday\u201d and \u201cwhen are we seeing each other again\u201d \u2014 then wrote: \u201c10 days\u2026 I don\u2019t even know where you got this training programme from, but it\u2019s magic.\u201d",
    },
    {
      src: "/reviews/review-en-427.webp",
      alt: "WhatsApp message: finished the 10 day program, measured 4:27 on day 12 against 1:23 on day one, and bought the 30 day plan.",
    },
    {
      src: "/reviews/review-en-magic.webp",
      alt: "WhatsApp message reading: under 3 minutes to over 7 minutes. Magic.",
    },
    {
      src: "/reviews/review-fr-9min.webp",
      alt: "WhatsApp message in French from a customer who went from 2 to 4 minutes on the 10-day programme, then past 9 minutes after the 30-day.",
      caption:
        "In French: “I went from 2 to 4 minutes when I started the 10-day programme. Then I did the 30-day one, and I finished it about 2 weeks ago. I still last more than 9 minutes every time, and probably more, because my girlfriend is already reacting a lot before I even finish.”",
    },
  ],

  wasLabel: "was",
  dropNote:
    "We lowered the price on 30 August. Every month spent finishing at the same number makes it harder to change, and what you can afford should not be the reason you wait another one.",

  offerKicker: "Try Metron for 10 days",
  fullLabel: "Full programme",
  testLabel: "10-day test",
  offerBody: [
    "The full programme costs {sprint}. You do not pay that today.",
    "Ten days, fifteen minutes a day, and two numbers taken the same way. You do not have to believe anything we say — the second number settles it.",
    "If you are not lasting longer, write to us and we send your money back. If you are, most men go on to the 30-day programme — it holds the time you gained and moves it out of your own hands into real sex, with a partner. Not a decision for today.",
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
    "Refunded if you are not lasting longer",
  ],

  guaranteeH: "Don't take our word for it. Test it.",
  guaranteeSteps: ["Measure yourself", "Train for ten days", "Measure again"],
  guarantee:
    "If you are not lasting longer, write to us and we send your money back. You will have lost ten days and nothing else — and you will know, instead of wondering for another year.",

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
      a: "You take your second measurement and you have two numbers. If you are lasting longer, most men go on to the 30-day programme — control alone and control with a partner are two different skills — and most men go on to it — it holds the time you gained and moves it into real sex, with a partner. Separate programme, 15,000 FCFA, and nothing enrols you automatically. Nobody is enrolled automatically, and nothing charges you again.",
    },
  ],

  finalH: "Stop guessing. Start measuring.",
  finalSub: "Measure yourself. Train for ten days. Measure again.",
  finalMicro: "Private. No pills. No equipment. One payment.",

  footerTag: "Private training for lasting longer and better control.",

  stepsAlt:
    "Three Metron screens: measuring your starting time on day one, a training session on day four, and your day-twelve result beside your first number.",
  sameResultAlt:
    "Four timer readings taken weeks apart, all landing around the same two minutes.",

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
  sub: "Un programme d'entraînement privé de 10 jours conçu pour vous aider à tenir plus longtemps et à mieux vous contrôler — depuis votre téléphone, chez vous.",
  flow: ["Mesurez votre point de départ", "Entraînez-vous 10 jours", "Mesurez à nouveau"],
  priceLine: "{test} pour commencer",
  cta: "Commencer le Reset de 10 jours",
  ctaNote: "Si vous ne tenez pas plus longtemps, on vous rembourse.",
  trust: ["Privé par conception", "Sur tout téléphone", "Rien à avaler", "Un seul paiement"],

  problemH: "Vous connaissez déjà le problème.",
  problem: [
    "Ça se termine plus tôt que vous ne le vouliez. Encore.",
    "Vous restez allongé à calculer combien de temps ça a duré. Vous vous demandez si elle est satisfaite. Vous vous dites que la prochaine fois sera différente.",
    "Puis la prochaine fois arrive, et la même chose se produit.",
  ],
  problemPivot:
    "Vous gérez ça depuis des années. Vous ne l'avez jamais vraiment entraîné.",

  urgencyBefore: "Plus vous restez à ",
  urgencyHighlight: "2 ou 3 minutes",
  urgencyAfter: ", plus ce schéma devient difficile à casser.",
  urgencyBody:
    "Chaque fois que vous faites l'amour et que vous finissez au même moment, vous renforcez la même réponse.",
  urgencyPunch: "10 jours peuvent commencer à changer ça.",

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
    { step: "Étape 3", label: "Mesurer à nouveau", body: "Voyez si vous tenez plus longtemps." },
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
  resultsKicker: "Ce qu'ont enregistré les hommes ayant suivi ce programme",
  results: [
    { multiple: "1,5 à 3×", label: "combien de temps ils ont tenu au jour 10, comparé au jour 1" },
    { multiple: "2 à 5×", label: "combien de temps ils ont tenu au jour 30, comparé au jour 1" },
  ],
  resultsNote:
    "Ces chiffres viennent d'hommes ayant suivi ce programme avant l'existence de l'application. Chacun s'est chronométré deux fois de la même façon — le premier jour, puis à la fin — exactement la comparaison que vous ferez sur vous-même. Donné en fourchette parce que c'est ce que les relevés permettent d'affirmer ; une moyenne laisserait croire à une précision que personne n'a.",

  testimonialsH: "Dans leurs mots",
  /* Clients réels, messages WhatsApp. Transcrits tels quels, coupés seulement
     par des points de suspension. Rien ici n'a été écrit par nous.
     NE PAS traduire les avis anglais vers le français : un avis traduit est
     un avis que le client n'a pas écrit. Chaque front montre les siens. */
  testimonials: [
    {
      quote:
        "Je suis passé de 2 à 4 minutes quand j'ai commencé le programme de 10 jours. Ensuite j'ai fait le programme de 30 jours, et ça fait environ 2 semaines que je l'ai terminé. Je tiens toujours plus de 9 minutes à chaque fois…",
      who: "Client Metron · Reset 10 jours puis Sprint 30 jours",
      before: "2:00",
      after: "9:00+",
    },
  ],

  shotsH: "Les messages d'origine",
  shots: [
    {
      src: "/reviews/review-fr-partner.webp",
      alt: "Message WhatsApp : sa partenaire demande ce qu\u2019il a pris la veille et quand ils se revoient, transf\u00e9r\u00e9 avec son propre message sur les 10 jours.",
      caption:
        "Il a transf\u00e9r\u00e9 ce que sa partenaire lui avait \u00e9crit, puis a ajout\u00e9 : \u00ab 10 jours\u2026 Je ne sais m\u00eame pas d\u2019o\u00f9 vous avez sorti ce programme d\u2019entra\u00eenement, mais c\u2019est la magie. \u00bb",
    },
    {
      src: "/reviews/review-fr-9min.webp",
      alt: "Message WhatsApp : passé de 2 à 4 minutes avec le programme de 10 jours, puis plus de 9 minutes après celui de 30 jours.",
    },
    {
      src: "/reviews/review-en-427.webp",
      alt: "Message WhatsApp en anglais : 4:27 au jour 12 contre 1:23 au premier jour, puis achat du programme de 30 jours.",
      caption:
        "En anglais : « J’ai terminé le programme de 10 jours et je me suis mesuré au 12e jour : 4:27 minutes exactement. Au premier jour, j’étais à 1:23. J’ai toujours été en dessous de 2 minutes et ça me stressait, alors j’ai déjà pris le programme de 30 jours. Merci. »",
    },
    {
      src: "/reviews/review-en-magic.webp",
      alt: "Message WhatsApp en anglais : de moins de 3 minutes à plus de 7 minutes.",
      caption:
        "En anglais : « De moins de 3 minutes à plus de 7 minutes. Magique. »",
    },
  ],

  wasLabel: "avant",
  dropNote:
    "Nous avons baissé le prix le 30 août. Chaque mois passé à finir au même chiffre rend le changement plus difficile, et ce que vous pouvez payer ne devrait pas être la raison d'attendre encore un mois.",

  offerKicker: "Essayez Metron pendant 10 jours",
  fullLabel: "Programme complet",
  testLabel: "Test de 10 jours",
  offerBody: [
    "Le programme complet coûte {sprint}. Vous ne payez pas ça aujourd'hui.",
    "Dix jours, quinze minutes par jour, et deux chiffres pris de la même façon. Vous n'avez rien à croire sur parole — c'est le deuxième chiffre qui tranche.",
    "Si vous ne tenez pas plus longtemps, écrivez-nous et on vous rembourse. Si vous tenez plus longtemps, la plupart des hommes enchaînent avec le programme de 30 jours : il consolide le temps gagné et le transpose dans un vrai rapport, avec une partenaire. Ça ne se décide pas aujourd'hui.",
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
    "Remboursé si vous ne tenez pas plus longtemps",
  ],

  guaranteeH: "Ne nous croyez pas sur parole. Testez.",
  guaranteeSteps: ["Mesurez-vous", "Entraînez-vous dix jours", "Mesurez à nouveau"],
  guarantee:
    "Si vous ne tenez pas plus longtemps, écrivez-nous et on vous rembourse. Vous aurez perdu dix jours et rien d'autre — et vous saurez, au lieu de vous poser la question encore un an.",

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
      a: "Vous prenez votre deuxième mesure et vous avez deux chiffres. Si vous tenez plus longtemps, la plupart des hommes continuent sur le programme de 30 jours — le contrôle seul et le contrôle avec une partenaire sont deux compétences différentes — et la plupart des hommes y enchaînent : il consolide le temps gagné et le transpose dans un vrai rapport, avec une partenaire. Programme séparé, 15 000 FCFA, et personne n'est inscrit automatiquement. Personne n'est inscrit automatiquement, et rien ne vous prélève à nouveau.",
    },
  ],

  finalH: "Ne devinez plus. Mesurez.",
  finalSub: "Mesurez-vous. Entraînez-vous dix jours. Mesurez à nouveau.",
  finalMicro: "Privé. Sans pilules. Sans matériel. Un seul paiement.",

  footerTag: "Entraînement privé pour tenir plus longtemps et mieux se contrôler.",

  stepsAlt:
    "Trois écrans Metron : la mesure du temps initial au jour 1, une séance au jour 5, et le résultat du jour 12 à côté du premier chiffre.",
  sameResultAlt:
    "Quatre chronos relevés à des semaines d'intervalle, tous autour des mêmes deux minutes.",

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
      ;
  /* Placeholders only. There used to be a regex here that swapped the literal
     "7,500 FCFA" and "69,000 FCFA" as a safety net, and it was worse than
     nothing: it required the " FCFA" suffix, so every bare "7,500" in a
     sentence slipped through and kept printing a price nobody charges. */

  return {
    ...c,
    priceLine: swap(c.priceLine),
    offerBody: c.offerBody.map(swap),
    includes: c.includes.map(swap),
    payTrust: c.payTrust.map(swap),
    faq: c.faq.map((f) => ({ q: f.q, a: swap(f.a) })),
  };
}
