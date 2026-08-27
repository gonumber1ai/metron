import type { Locale } from "@/lib/i18n";
import type { QuizResult } from "./quiz";

/**
 * The result page, assembled from what he actually answered.
 *
 * The old page picked one of four written-out "patterns" and printed it. This
 * builds his page line by line from his own answers instead, so a man who said
 * "two minutes, five years, tried pills, she has said something" reads a page
 * that names all four of those things back to him.
 *
 * Every line follows the same rule: say the thing he told us, then say what it
 * means for him, then stop. No explanation of mechanisms, no teaching. He is
 * thirty seconds from a buy button and the page has one job.
 *
 * NOTHING HERE MAY NAME THE METHOD. This page is pre-purchase.
 */

export type Verdict = {
  headline: string;
  gap: string;
  lines: string[];
  urgency: string;
  closeLead: string;
  closeRefund: string;
  closeHonest: string;
};

/* ------------------------------------------------------------------ */
/* fragments                                                           */
/* ------------------------------------------------------------------ */

type Frag = { en: string; fr: string };

const HOW_LONG: Record<string, Frag> = {
  u6m: {
    en: "This started recently, which is the easiest kind to shift — and the kind most worth having a doctor rule out first.",
    fr: "C'est récent, donc le plus facile à corriger — et le cas où il vaut le plus la peine de faire écarter une cause physique par un médecin.",
  },
  "6m2y": {
    en: "A year or two in, your body has learned it. Learned things come undone.",
    fr: "Un an ou deux, et votre corps l'a appris. Ce qui s'apprend se désapprend.",
  },
  "2y5y": {
    en: "After years of it, it runs on its own. That is the reason to start now, not a reason to wait.",
    fr: "Après des années, ça tourne tout seul. C'est une raison de commencer maintenant, pas d'attendre.",
  },
  always: {
    en: "It has been this way from the start, so you have never known different. That does not make it permanent.",
    fr: "C'est comme ça depuis le début, donc vous n'avez jamais connu autre chose. Ça ne veut pas dire que c'est définitif.",
  },
};

/** One line per thing he ticked. Each kills that specific objection. */
const TRIED: Record<string, Frag> = {
  pills: {
    en: "You have tried pills. They work for one night — the next morning you are the same man, and a little more afraid of doing it without one.",
    fr: "Vous avez essayé les comprimés. Ils marchent une nuit — le lendemain vous êtes le même homme, et un peu plus inquiet de faire sans.",
  },
  herbs: {
    en: "You have tried products sold as natural. Labs keep finding real pharmacy drugs inside them — unknown dose, no label. You may already be taking what you were trying to avoid.",
    fr: "Vous avez essayé des produits vendus comme naturels. Les laboratoires y trouvent régulièrement de vrais médicaments — dose inconnue, aucune étiquette. Vous prenez peut-être déjà ce que vous vouliez éviter.",
  },
  sprays: {
    en: "You have tried sprays. They numb you, and feeling what is happening is exactly what you need to get better at.",
    fr: "Vous avez essayé les sprays. Ils vous anesthésient, alors que sentir ce qui se passe est justement ce qu'il faut développer.",
  },
  condoms: {
    en: "Thick condoms only dull it. Nothing about you changed, so the night you use a normal one you are back where you started.",
    fr: "Les préservatifs épais ne font qu'atténuer. Rien n'a changé en vous, donc le soir où vous en mettez un normal, vous repartez de zéro.",
  },
  distract: {
    en: "Distracting yourself takes you out of your own body — and being out of it is why you never feel the end coming.",
    fr: "Vous distraire vous sort de votre propre corps — et c'est pour ça que vous ne sentez jamais la fin arriver.",
  },
  alcohol: {
    en: "Alcohol buys one calm hour and costs you your sleep, your erection and your recovery.",
    fr: "L'alcool vous achète une heure de calme et vous coûte votre sommeil, votre érection et votre récupération.",
  },
  kegels: {
    en: "You have tried kegels. On their own they move the clock very little — and done the way almost everyone does them, they can make it worse.",
    fr: "Vous avez essayé les Kegels. Seuls, ils changent très peu le chrono — et faits comme presque tout le monde les fait, ils peuvent aggraver les choses.",
  },
  nothing: {
    en: "You have not tried anything yet. That is genuinely a good place to start from — nothing to undo first.",
    fr: "Vous n'avez encore rien essayé. C'est franchement un bon point de départ — rien à défaire d'abord.",
  },
};

const IMPACT: Record<string, Frag> = {
  said: {
    en: "She has said something about it. Most men never even get told — you at least know where you stand.",
    fr: "Elle vous en a parlé. La plupart des hommes ne l'entendent jamais — vous, au moins, vous savez où vous en êtes.",
  },
  sense: {
    en: "She has not said it, but you can tell. That silence costs more than the minutes do.",
    fr: "Elle n'a rien dit, mais vous le sentez. Ce silence coûte plus cher que les minutes.",
  },
  avoid: {
    en: "You are avoiding new partners because of it. That is the real price, and it is far bigger than the number.",
    fr: "Vous évitez de nouvelles partenaires à cause de ça. C'est le vrai prix, et il est bien plus lourd que le chiffre.",
  },
  lost: {
    en: "It has already cost you a relationship. That is a heavy thing to carry, and it is not a life sentence.",
    fr: "Ça vous a déjà coûté une relation. C'est lourd à porter, et ce n'est pas une condamnation à vie.",
  },
  no: {
    en: "It has not cost you anything yet. Fix it while that is still true.",
    fr: "Ça ne vous a encore rien coûté. Réglez-le pendant que c'est encore vrai.",
  },
};

const DEPEND: Record<string, Frag> = {
  always: {
    en: "And you need something every time. That is the first thing to break, because it is in front of everything else.",
    fr: "Et vous avez besoin de quelque chose à chaque fois. C'est la première chose à casser, parce qu'elle bloque tout le reste.",
  },
  sometimes: {
    en: "You need help to perform sometimes. That habit only grows.",
    fr: "Vous avez parfois besoin d'aide pour assurer. Cette habitude ne fait que grandir.",
  },
};

/** Order matters: the most damaging objection is answered first. */
const TRIED_ORDER = ["pills", "herbs", "sprays", "alcohol", "kegels", "condoms", "distract", "nothing"];

function pick(f: Frag | undefined, locale: string): string | null {
  if (!f) return null;
  return locale === "fr" ? f.fr : f.en;
}

function fmt(v: number, locale: string): string {
  if (v < 1) return locale === "fr" ? "moins d'une minute" : "under a minute";
  return locale === "fr" ? `${v} minutes` : `${v} minutes`;
}

export function buildVerdict(
  locale: Locale | string,
  quiz: QuizResult,
  prices: { test: string; sprint: string },
): Verdict {
  const fr = locale === "fr";
  const a = quiz.answers;
  const one = (k: string) => a[k]?.[0];

  const now = fmt(quiz.now, locale);
  const want = fmt(quiz.want, locale);

  const lines: string[] = [];

  const howLong = pick(HOW_LONG[one("duration") ?? ""], locale);
  if (howLong) lines.push(howLong);

  // Every box he ticked gets answered, most damaging first.
  const tried = a.tried ?? [];
  for (const key of TRIED_ORDER) {
    if (tried.includes(key)) {
      const line = pick(TRIED[key], locale);
      if (line) lines.push(line);
    }
  }

  const dep = pick(DEPEND[one("depend") ?? ""], locale);
  if (dep) lines.push(dep);

  const impact = pick(IMPACT[one("impact") ?? ""], locale);
  if (impact) lines.push(impact);

  return {
    headline: fr
      ? `Vous êtes à ${now}. Vous voulez ${want}.`
      : `You are at ${now}. You want ${want}.`,

    gap: fr
      ? "C'est un écart normal, et il se travaille. Ce n'est pas de la magie et ce n'est pas hors de portée."
      : "That is a normal gap and it is a workable one. Not magic, and not out of reach.",

    lines,

    urgency: fr
      ? `Et ça ne s'arrange pas tout seul. Chaque mois passé à ${now} apprend à votre corps que ${now} est la normale — et plus vous y restez, plus c'est difficile d'en sortir.`
      : `And it does not sit still. Every month you spend at ${now} teaches your body that ${now} is normal — and the longer you stay there, the harder it gets to move.`,

    closeLead: fr
      ? `Notre programme de 30 jours coûte ${prices.sprint}. Ne le prenez pas maintenant. Commencez par le Reset de 10 jours à ${prices.test}.`
      : `Our 30-day programme is ${prices.sprint}. Don't take that yet. Start with the 10-Day Reset at ${prices.test}.`,

    closeRefund: fr
      ? "Si vous ne durez pas plus longtemps à la fin, on vous rembourse."
      : "If you are not lasting longer at the end of it, we refund you.",

    closeHonest: fr
      ? "On ne promet pas de miracle. Mais la plupart des hommes qui suivent le plan voient une vraie différence sur leur durée."
      : "We are not promising magic. But most men who follow the plan see a real difference in how long they last.",
  };
}
