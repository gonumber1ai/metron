import type { Locale } from "@/lib/i18n";

export type PatternKey = "anxious" | "conditioned" | "dependent" | "depleted";

export type Flag = "medical" | "compulsive";

export type Option = {
  id: string;
  label: string;
  /** minutes — used by Q1 / Q2 to compute the gap */
  value?: number;
  score?: Partial<Record<PatternKey, number>>;
  flag?: Flag;
};

export type Question = {
  id: string;
  kind: "single" | "multi";
  q: string;
  help?: string;
  /** shown after answering — this is where the agitation lives */
  echo?: Record<string, string>;
  options: Option[];
};

/* ------------------------------------------------------------------ */
/* ENGLISH                                                             */
/* ------------------------------------------------------------------ */

const EN: Question[] = [
  {
    id: "now",
    kind: "single",
    q: "How long do you last right now, from penetration?",
    help: "Be honest. Nobody sees this but you.",
    options: [
      { id: "u1", label: "Under 1 minute", value: 0.5, score: { conditioned: 2 } },
      { id: "1_3", label: "1 – 3 minutes", value: 2, score: { conditioned: 2 } },
      { id: "3_5", label: "3 – 5 minutes", value: 4, score: { anxious: 1 } },
      { id: "5_10", label: "5 – 10 minutes", value: 7, score: { anxious: 1 } },
      { id: "10p", label: "Over 10 minutes", value: 12 },
    ],
  },
  {
    id: "want",
    kind: "single",
    q: "How long do you want to last?",
    options: [
      { id: "10", label: "10 minutes", value: 10 },
      { id: "15", label: "15 minutes", value: 15 },
      { id: "20", label: "20 minutes", value: 20 },
      { id: "30", label: "30 minutes or more", value: 30 },
    ],
  },
  {
    id: "duration",
    kind: "single",
    q: "How long has this been going on?",
    echo: {
      u6m: "Recent onset matters. Sometimes there is a physical or medication cause worth ruling out first — we will flag that at the end.",
      "2y5y":
        "The longer a pattern runs, the more automatic it becomes. This is a learned response — which is exactly why it can be unlearned. But it does not resolve on its own.",
      always:
        "The longer a pattern runs, the more automatic it becomes. This is a learned response — which is exactly why it can be unlearned. But it does not resolve on its own.",
    },
    options: [
      { id: "u6m", label: "Less than 6 months", flag: "medical" },
      { id: "6m2y", label: "6 months – 2 years", score: { conditioned: 1 } },
      { id: "2y5y", label: "2 – 5 years", score: { conditioned: 2 } },
      { id: "always", label: "As long as I have been sexually active", score: { conditioned: 3 } },
    ],
  },
  {
    id: "solo",
    kind: "single",
    q: "Alone versus with a partner — is there a difference?",
    help: "This one tells us the most.",
    echo: {
      much: "That gap is the clearest sign there is. Your body can do it. Under pressure, your nervous system overrides it.",
      same: "No difference points to conditioning and sensitivity rather than nerves. Different cause, different fix.",
    },
    options: [
      { id: "much", label: "Much longer alone", score: { anxious: 3 } },
      { id: "little", label: "A little longer alone", score: { anxious: 1, conditioned: 1 } },
      { id: "same", label: "No real difference", score: { conditioned: 3 } },
      { id: "na", label: "I do not have a partner right now", score: { anxious: 1 } },
    ],
  },
  {
    id: "head",
    kind: "single",
    q: "What goes through your head right before?",
    echo: {
      panic:
        "That thought is part of the mechanism. Watching yourself raises arousal — the fear of finishing fast is one of the reasons you finish fast.",
      avoid:
        "Avoidance is the most expensive coping strategy there is. It protects you from one bad night and costs you every good one.",
    },
    options: [
      { id: "panic", label: "I panic about finishing too fast", score: { anxious: 3 } },
      { id: "distract", label: "I try to distract myself", score: { anxious: 2 } },
      { id: "avoid", label: "I avoid starting anything at all", score: { anxious: 3 } },
      { id: "fine", label: "Nothing — I am fine mentally", score: { conditioned: 2 } },
    ],
  },
  {
    id: "impact",
    kind: "single",
    q: "Has it affected your relationship or your dating life?",
    options: [
      { id: "said", label: "She has said something about it" },
      { id: "sense", label: "She has not, but I can tell" },
      { id: "avoid", label: "I avoid new partners because of it" },
      { id: "lost", label: "I have lost a relationship over it" },
      { id: "no", label: "Not really" },
    ],
  },
  {
    id: "tried",
    kind: "multi",
    q: "What have you already tried?",
    echo: {
      herbs:
        "Labs keep finding real pharmacy drugs hidden inside products sold as natural. Unknown dose, no label, nobody checking. And they teach your body nothing — stop taking them and you are exactly where you started.",
      pills:
        "They work for one night. Next morning you are the same man. And every time you use one you get more afraid of doing it without one — and that fear makes you finish faster. It fixes tonight and damages next month.",
      sprays:
        "They numb you. But feeling what is happening is exactly what you need to get better at. Numb yourself and you get worse at it. When it wears off you are behind where you started.",
      alcohol:
        "Two drinks calm your nerves for an hour. They also soften your erection, wreck your sleep and drop your testosterone. One good hour for three bad days.",
    },
    options: [
      { id: "pills", label: "Pills", score: { dependent: 2 } },
      { id: "sprays", label: "Delay sprays or creams", score: { conditioned: 1 } },
      { id: "condoms", label: "Thick condoms", score: { conditioned: 1 } },
      { id: "distract", label: "Distracting myself during sex", score: { anxious: 2 } },
      { id: "alcohol", label: "Alcohol before sex", score: { dependent: 2, depleted: 1 } },
      { id: "kegels", label: "Kegels", score: { conditioned: 1 } },
      { id: "herbs", label: "Herbal or natural products", score: { dependent: 1 } },
      { id: "nothing", label: "Nothing yet" },
    ],
  },
  {
    id: "depend",
    kind: "single",
    q: "Do you currently need something — a pill, a spray, a drink — to perform?",
    echo: {
      always:
        "Then you are renting it. The night you do not have it you are back to the start — and now you are scared without it too. That fear makes you finish faster, so it costs you twice.",
      sometimes:
        "Sometimes becomes every time. And on the night you have not got it, you are worse than before — because now you know you were relying on it.",
    },
    options: [
      { id: "always", label: "Every time", score: { dependent: 3 } },
      { id: "sometimes", label: "Sometimes", score: { dependent: 2 } },
      { id: "no", label: "No" },
    ],
  },
  {
    id: "health",
    kind: "multi",
    q: "Last one — do any of these apply to you?",
    help: "Select all that apply. This is the part that protects you.",
    options: [
      { id: "sudden", label: "It started suddenly, with no history before", flag: "medical" },
      { id: "pain", label: "Pain during or after sex", flag: "medical" },
      { id: "erection", label: "I also struggle to get or keep an erection", flag: "medical" },
      { id: "meds", label: "It began after starting a medication", flag: "medical" },
      { id: "stomach", label: "Ongoing stomach pain, reflux or bloating", score: { depleted: 3 } },
      { id: "sleep", label: "I sleep badly most nights", score: { depleted: 2 } },
      { id: "sedentary", label: "I rarely exercise", score: { depleted: 2 } },
      {
        id: "daily",
        label: "I masturbate most days or more",
        flag: "compulsive",
        score: { conditioned: 2 },
      },
      { id: "none", label: "None of these" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* FRANCAIS                                                            */
/* ------------------------------------------------------------------ */

const FR: Question[] = [
  {
    id: "now",
    kind: "single",
    q: "Combien de temps durez-vous actuellement, à partir de la pénétration ?",
    help: "Soyez honnête. Personne d'autre que vous ne voit ceci.",
    options: [
      { id: "u1", label: "Moins d'une minute", value: 0.5, score: { conditioned: 2 } },
      { id: "1_3", label: "1 à 3 minutes", value: 2, score: { conditioned: 2 } },
      { id: "3_5", label: "3 à 5 minutes", value: 4, score: { anxious: 1 } },
      { id: "5_10", label: "5 à 10 minutes", value: 7, score: { anxious: 1 } },
      { id: "10p", label: "Plus de 10 minutes", value: 12 },
    ],
  },
  {
    id: "want",
    kind: "single",
    q: "Combien de temps voulez-vous durer ?",
    options: [
      { id: "10", label: "10 minutes", value: 10 },
      { id: "15", label: "15 minutes", value: 15 },
      { id: "20", label: "20 minutes", value: 20 },
      { id: "30", label: "30 minutes ou plus", value: 30 },
    ],
  },
  {
    id: "duration",
    kind: "single",
    q: "Depuis combien de temps cela dure-t-il ?",
    echo: {
      u6m: "Une apparition récente compte. Il y a parfois une cause physique ou médicamenteuse à écarter d'abord — nous vous le signalerons à la fin.",
      "2y5y":
        "Plus un schéma dure, plus il devient automatique. C'est une réponse apprise — et c'est précisément pour cela qu'elle peut être désapprise. Mais elle ne disparaît pas toute seule.",
      always:
        "Plus un schéma dure, plus il devient automatique. C'est une réponse apprise — et c'est précisément pour cela qu'elle peut être désapprise. Mais elle ne disparaît pas toute seule.",
    },
    options: [
      { id: "u6m", label: "Moins de 6 mois", flag: "medical" },
      { id: "6m2y", label: "6 mois à 2 ans", score: { conditioned: 1 } },
      { id: "2y5y", label: "2 à 5 ans", score: { conditioned: 2 } },
      { id: "always", label: "Depuis toujours", score: { conditioned: 3 } },
    ],
  },
  {
    id: "solo",
    kind: "single",
    q: "Seul ou avec une partenaire — y a-t-il une différence ?",
    help: "Cette question est la plus révélatrice.",
    echo: {
      much: "Cet écart est le signe le plus clair qui soit. Votre corps en est capable. Sous pression, votre système nerveux prend le dessus.",
      same: "Aucune différence oriente vers un conditionnement et une sensibilité, pas vers le stress. Cause différente, solution différente.",
    },
    options: [
      { id: "much", label: "Beaucoup plus longtemps seul", score: { anxious: 3 } },
      { id: "little", label: "Un peu plus longtemps seul", score: { anxious: 1, conditioned: 1 } },
      { id: "same", label: "Aucune différence réelle", score: { conditioned: 3 } },
      { id: "na", label: "Je n'ai pas de partenaire actuellement", score: { anxious: 1 } },
    ],
  },
  {
    id: "head",
    kind: "single",
    q: "Qu'est-ce qui vous passe par la tête juste avant ?",
    echo: {
      panic:
        "Cette pensée fait partie du mécanisme. S'observer soi-même augmente l'excitation — la peur de finir vite est l'une des raisons pour lesquelles vous finissez vite.",
      avoid:
        "L'évitement est la stratégie la plus coûteuse qui soit. Elle vous protège d'une mauvaise soirée et vous prive de toutes les bonnes.",
    },
    options: [
      { id: "panic", label: "Je panique à l'idée de finir trop vite", score: { anxious: 3 } },
      { id: "distract", label: "J'essaie de me distraire", score: { anxious: 2 } },
      { id: "avoid", label: "J'évite carrément d'initier", score: { anxious: 3 } },
      { id: "fine", label: "Rien — mentalement je vais bien", score: { conditioned: 2 } },
    ],
  },
  {
    id: "impact",
    kind: "single",
    q: "Cela a-t-il affecté votre couple ou votre vie amoureuse ?",
    options: [
      { id: "said", label: "Elle m'en a parlé" },
      { id: "sense", label: "Elle n'a rien dit, mais je le sens" },
      { id: "avoid", label: "J'évite de nouvelles partenaires à cause de ça" },
      { id: "lost", label: "J'ai perdu une relation à cause de ça" },
      { id: "no", label: "Pas vraiment" },
    ],
  },
  {
    id: "tried",
    kind: "multi",
    q: "Qu'avez-vous déjà essayé ?",
    echo: {
      herbs:
        "Les laboratoires trouvent régulièrement de vrais médicaments cachés dans des produits vendus comme naturels. Dose inconnue, aucune étiquette, aucun contrôle. Et ils n'apprennent rien à votre corps — vous arrêtez, vous êtes exactement au point de départ.",
      pills:
        "Ils marchent pour une nuit. Le lendemain vous êtes le même homme. Et chaque fois que vous en prenez un, vous avez plus peur de faire sans — et cette peur vous fait finir plus vite. Ça règle ce soir et ça abîme le mois prochain.",
      sprays:
        "Ils vous anesthésient. Or sentir ce qui se passe est exactement ce que vous devez apprendre. Vous anesthésier vous rend moins bon. Quand l'effet passe, vous êtes en dessous de votre point de départ.",
      alcohol:
        "Deux verres calment les nerfs pendant une heure. Ils ramollissent aussi votre érection, détruisent votre sommeil et font chuter votre testostérone. Une bonne heure contre trois mauvais jours.",
    },
    options: [
      { id: "pills", label: "Des comprimés", score: { dependent: 2 } },
      { id: "sprays", label: "Sprays ou crèmes retardants", score: { conditioned: 1 } },
      { id: "condoms", label: "Préservatifs épais", score: { conditioned: 1 } },
      { id: "distract", label: "Me distraire pendant l'acte", score: { anxious: 2 } },
      { id: "alcohol", label: "L'alcool avant les rapports", score: { dependent: 2, depleted: 1 } },
      { id: "kegels", label: "Les exercices de Kegel", score: { conditioned: 1 } },
      { id: "herbs", label: "Produits naturels ou à base de plantes", score: { dependent: 1 } },
      { id: "nothing", label: "Rien pour l'instant" },
    ],
  },
  {
    id: "depend",
    kind: "single",
    q: "Avez-vous besoin de quelque chose — comprimé, spray, alcool — pour assurer ?",
    echo: {
      always:
        "Alors vous le louez. Le soir où vous ne l'avez pas, vous repartez de zéro — et en plus vous avez peur sans. Cette peur vous fait finir plus vite, donc ça vous coûte deux fois.",
      sometimes:
        "« Parfois » devient « à chaque fois ». Et le soir où vous ne l'avez pas, c'est pire qu'avant — parce que maintenant vous savez que vous comptiez dessus.",
    },
    options: [
      { id: "always", label: "À chaque fois", score: { dependent: 3 } },
      { id: "sometimes", label: "Parfois", score: { dependent: 2 } },
      { id: "no", label: "Non" },
    ],
  },
  {
    id: "health",
    kind: "multi",
    q: "Dernière question — l'un de ces points vous concerne-t-il ?",
    help: "Cochez tout ce qui s'applique. C'est la partie qui vous protège.",
    options: [
      { id: "sudden", label: "C'est apparu soudainement, sans antécédent", flag: "medical" },
      { id: "pain", label: "Douleurs pendant ou après les rapports", flag: "medical" },
      {
        id: "erection",
        label: "J'ai aussi du mal à obtenir ou garder une érection",
        flag: "medical",
      },
      { id: "meds", label: "Cela a commencé après la prise d'un médicament", flag: "medical" },
      {
        id: "stomach",
        label: "Douleurs d'estomac, reflux ou ballonnements réguliers",
        score: { depleted: 3 },
      },
      { id: "sleep", label: "Je dors mal la plupart des nuits", score: { depleted: 2 } },
      { id: "sedentary", label: "Je fais rarement du sport", score: { depleted: 2 } },
      {
        id: "daily",
        label: "Je me masturbe presque tous les jours ou plus",
        flag: "compulsive",
        score: { conditioned: 2 },
      },
      { id: "none", label: "Aucun de ces points" },
    ],
  },
];

export function getQuiz(locale: Locale | string): Question[] {
  return locale === "fr" ? FR : EN;
}

/* ------------------------------------------------------------------ */
/* SCORING                                                             */
/* ------------------------------------------------------------------ */

export type Answers = Record<string, string[]>;

export type QuizResult = {
  pattern: PatternKey;
  scores: Record<PatternKey, number>;
  now: number;
  want: number;
  gap: number;
  flags: Flag[];
  answers: Answers;
};

export function scoreQuiz(locale: Locale | string, answers: Answers): QuizResult {
  const qs = getQuiz(locale);
  const scores: Record<PatternKey, number> = {
    anxious: 0,
    conditioned: 0,
    dependent: 0,
    depleted: 0,
  };
  const flags = new Set<Flag>();
  let now = 0;
  let want = 0;

  for (const q of qs) {
    const picked = answers[q.id] ?? [];
    for (const optId of picked) {
      const opt = q.options.find((o) => o.id === optId);
      if (!opt) continue;
      if (opt.score) {
        for (const [k, v] of Object.entries(opt.score)) {
          scores[k as PatternKey] += v as number;
        }
      }
      if (opt.flag) flags.add(opt.flag);
      if (q.id === "now" && opt.value != null) now = opt.value;
      if (q.id === "want" && opt.value != null) want = opt.value;
    }
  }

  // Dependence outranks the rest: it is the bottleneck that blocks everything else.
  let pattern: PatternKey;
  if (scores.dependent >= 3) {
    pattern = "dependent";
  } else {
    pattern = (Object.entries(scores) as [PatternKey, number][]).sort(
      (a, b) => b[1] - a[1],
    )[0][0];
  }

  return {
    pattern,
    scores,
    now,
    want,
    gap: Math.max(0, Math.round((want - now) * 10) / 10),
    flags: [...flags],
    answers,
  };
}

export function formatMins(v: number, locale: Locale | string): string {
  if (v < 1) return locale === "fr" ? "moins d'1 min" : "under 1 min";
  return `${v} min`;
}
