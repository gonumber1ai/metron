import type { Locale } from "@/lib/i18n";
import type { PatternKey } from "./quiz";

export type PatternCopy = {
  name: string;
  /** one line, appears under the big number */
  strap: string;
  whatItMeans: string[];
  whyFailed: { label: string; body: string }[];
  /** the single sentence that carries into the offer */
  bridge: string;
};

const EN: Record<PatternKey, PatternCopy> = {
  anxious: {
    name: "It Is Your Head, Not Your Body",
    strap:
      "Your body can already do this. Your head gets in the way.",
    whatItMeans: [
      "You last much longer on your own than with a partner. That one fact rules out most of what gets sold to men like you. Your body works.",
      "It is a loop. You watch yourself. Watching makes you more aroused. More aroused ends it sooner. That proves the fear right, so next time you watch harder.",
      "Every round makes it more automatic. That is why it keeps getting worse instead of better.",
    ],
    whyFailed: [
      {
        label: "Distraction",
        body: "Thinking about football takes you out of your own body. But everything you need to notice is happening inside it. You buy thirty seconds and give up something worth far more.",
      },
      {
        label: "Sprays and thick condoms",
        body: "They numb you. Your problem is not that you feel too much — it is panic. Numbing does nothing for panic, and it makes you worse at reading yourself.",
      },
      {
        label: "Just relaxing",
        body: "Nobody has ever relaxed on command. Telling yourself to calm down is one more thing to watch, and watching yourself is the problem.",
      },
    ],
    bridge:
      "You do not need a stronger product. Follow the plan the app lays out for you, day by day. If you are not lasting longer at the end of it, we refund you.",
  },

  conditioned: {
    name: "Your Body Learned To Rush",
    strap:
      "Your body learned to finish fast. It can learn the opposite.",
    whatItMeans: [
      "Alone or with a partner, you finish at about the same point. That is not nerves. That is a trained reflex.",
      "Years of rushing taught your body a fast route from aroused to finished. It got good at it, the way it gets good at anything you repeat.",
      "What was trained can be retrained. That is the whole job.",
    ],
    whyFailed: [
      {
        label: "The exercise everyone recommends",
        body: "You were doing half of it. Nobody describes the other half, and that is the half that governs control — so men do it for months, feel nothing, and decide it does not work. It does. Not like that.",
      },
      {
        label: "Delay sprays",
        body: "They numb the skin. Your problem is a reflex firing too early, not skin that feels too much. Wrong target.",
      },
      {
        label: "Trying to hold on in the moment",
        body: "Deciding to try harder tonight is not a plan. This is a trained reflex, and reflexes answer to a schedule, not to good intentions in the moment. What was missing was never your willpower.",
      },
    ],
    bridge:
      "What your body learned, it can unlearn. Follow the plan the app lays out for you, day by day. If you are not lasting longer at the end of it, we refund you.",
  },

  dependent: {
    name: "You Need Something To Perform",
    strap:
      "You are renting your performance. That is why it never sticks.",
    whatItMeans: [
      "You need a pill, a spray or a drink to feel safe. That is the first thing to fix, because it sits in front of everything else.",
      "Here is the trap. Every good night with a pill teaches you that you need the pill. So the nights you do not have one, you are scared — and scared makes you finish faster.",
      "You are not fixing anything. You are renting a result, and the rent never stops.",
    ],
    whyFailed: [
      {
        label: "Pills",
        body: "They work for one night. Next morning you are the same man. And every time you use one, you get more afraid of doing it without one — and that fear makes you finish faster. It fixes tonight and damages next month.",
      },
      {
        label: "Alcohol",
        body: "Two drinks calm your nerves for an hour. They also soften your erection, wreck your sleep and drop your testosterone. One good hour for three bad days.",
      },
      {
        label: "Herbal products",
        body: "Labs keep finding real pharmacy drugs hidden inside products sold as natural. Unknown dose, no label, nobody checking. And they teach your body nothing — stop taking them and you are exactly where you began.",
      },
    ],
    bridge:
      "Ten days without the pill. Follow the plan the app lays out for you, day by day. If you are not lasting longer at the end of it, we refund you.",
  },

  depleted: {
    name: "Running On Empty",
    strap:
      "You are trying to fix this on an empty tank.",
    whatItMeans: [
      "Your answers point at your body, not your technique. Bad sleep, little movement, a stomach that is not right.",
      "You are asking for control at eleven at night from a system that ran out at six.",
      "This is the fastest one to fix, and nobody sells it to you because it is not exciting.",
    ],
    whyFailed: [
      {
        label: "Technique on its own",
        body: "The training works. But it works on a body that sleeps and eats. You were not doing it wrong. You were doing it on empty.",
      },
      {
        label: "Stimulants and energy drinks",
        body: "They hide the tiredness for two hours and cost you the night of sleep that would have actually fixed it.",
      },
      {
        label: "Ignoring the stomach",
        body: "If your stomach hurts most days you sleep badly, you eat badly, and you have nothing left by evening. It quietly caps everything else you try.",
      },
    ],
    bridge:
      "Fill the tank and the rest moves fast. Follow the plan the app lays out for you, day by day. If you are not lasting longer at the end of it, we refund you.",
  },
};

const FR: Record<PatternKey, PatternCopy> = {
  anxious: {
    name: "C'est la tête, pas le corps",
    strap:
      "Votre corps en est déjà capable. C'est la tête qui bloque.",
    whatItMeans: [
      "Vous durez bien plus longtemps seul qu'avec une partenaire. Ce seul fait écarte la majorité de ce qu'on vend aux hommes comme vous. Votre corps fonctionne.",
      "C'est une boucle. Vous vous surveillez. La surveillance vous excite davantage. Plus excité, ça finit plus tôt. Ça donne raison à la peur, alors la fois d'après vous surveillez encore plus.",
      "Chaque tour rend le schéma plus automatique. C'est pour ça que ça empire au lieu de s'améliorer.",
    ],
    whyFailed: [
      {
        label: "La distraction",
        body: "Penser au football vous sort de votre propre corps. Or tout ce que vous devez remarquer s'y passe. Vous gagnez trente secondes et vous abandonnez bien plus.",
      },
      {
        label: "Sprays et préservatifs épais",
        body: "Ils vous anesthésient. Votre problème n'est pas de trop sentir — c'est la panique. Anesthésier ne fait rien contre la panique, et ça vous rend moins bon à vous lire.",
      },
      {
        label: "« Se détendre »",
        body: "Personne ne s'est jamais détendu sur commande. Se dire de se calmer, c'est une chose de plus à surveiller — et se surveiller est justement le problème.",
      },
    ],
    bridge:
      "Vous n'avez pas besoin d'un produit plus fort. Suivez le plan que l'application vous donne, jour après jour. Si vous ne durez pas plus longtemps à la fin, on vous rembourse.",
  },

  conditioned: {
    name: "Votre corps a appris à se dépêcher",
    strap:
      "Votre corps a appris à finir vite. Il peut apprendre l'inverse.",
    whatItMeans: [
      "Seul ou avec une partenaire, vous finissez à peu près au même moment. Ce n'est pas le stress. C'est un réflexe entraîné.",
      "Des années à se dépêcher ont appris à votre corps un chemin rapide entre l'excitation et la fin. Il est devenu bon à ça, comme il devient bon à tout ce qu'on répète.",
      "Ce qui a été appris peut être réappris. C'est tout le travail.",
    ],
    whyFailed: [
      {
        label: "L'exercice que tout le monde recommande",
        body: "Vous n'en faisiez que la moitié. Personne ne décrit l'autre moitié, et c'est elle qui gouverne le contrôle — alors les hommes s'y mettent pendant des mois, ne sentent rien, et concluent que ça ne marche pas. Ça marche. Pas comme ça.",
      },
      {
        label: "Les sprays retardants",
        body: "Ils anesthésient la peau. Votre problème est un réflexe qui part trop tôt, pas une peau qui sent trop. Mauvaise cible.",
      },
      {
        label: "Essayer de tenir sur le moment",
        body: "Décider de faire un effort ce soir n'est pas un plan. C'est un réflexe entraîné, et un réflexe obéit à un programme, pas à la bonne volonté sur le moment. Ce qui manquait n'a jamais été votre volonté.",
      },
    ],
    bridge:
      "Ce que votre corps a appris, il peut le désapprendre. Suivez le plan que l'application vous donne, jour après jour. Si vous ne durez pas plus longtemps à la fin, on vous rembourse.",
  },

  dependent: {
    name: "Vous avez besoin de quelque chose d'abord",
    strap:
      "Vous louez votre performance. C'est pour ça que ça ne tient jamais.",
    whatItMeans: [
      "Vous avez besoin d'un comprimé, d'un spray ou d'un verre pour vous sentir en sécurité. C'est la première chose à régler, parce qu'elle bloque tout le reste.",
      "Voici le piège. Chaque bonne nuit avec un comprimé vous apprend que vous avez besoin du comprimé. Donc les soirs où vous n'en avez pas, vous avez peur — et la peur vous fait finir plus vite.",
      "Vous ne réglez rien. Vous louez un résultat, et le loyer ne s'arrête jamais.",
    ],
    whyFailed: [
      {
        label: "Les comprimés",
        body: "Ils marchent pour une nuit. Le lendemain vous êtes le même homme. Et chaque fois que vous en prenez un, vous avez plus peur de faire sans — et cette peur vous fait finir plus vite. Ça règle ce soir et ça abîme le mois prochain.",
      },
      {
        label: "L'alcool",
        body: "Deux verres calment les nerfs pendant une heure. Ils ramollissent aussi votre érection, détruisent votre sommeil et font chuter votre testostérone. Une bonne heure contre trois mauvais jours.",
      },
      {
        label: "Les produits à base de plantes",
        body: "Les laboratoires trouvent régulièrement de vrais médicaments cachés dans des produits vendus comme naturels. Dose inconnue, aucune étiquette, aucun contrôle. Et ils n'apprennent rien à votre corps — vous arrêtez, vous êtes au point de départ.",
      },
    ],
    bridge:
      "Dix jours sans comprimé. Suivez le plan que l'application vous donne, jour après jour. Si vous ne durez pas plus longtemps à la fin, on vous rembourse.",
  },

  depleted: {
    name: "Le réservoir est vide",
    strap:
      "Vous essayez de régler ça avec le réservoir vide.",
    whatItMeans: [
      "Vos réponses pointent vers votre corps, pas vers votre technique. Mauvais sommeil, peu de mouvement, un estomac qui ne va pas.",
      "Vous demandez du contrôle à onze heures du soir à un système qui était à sec à six heures.",
      "C'est le plus rapide à réparer, et personne ne vous le vend parce que ce n'est pas excitant.",
    ],
    whyFailed: [
      {
        label: "La technique seule",
        body: "L'entraînement fonctionne, mais bien mieux sur un corps qui dort, mange et bouge. Vous ne le faisiez pas mal. Vous le faisiez à vide.",
      },
      {
        label: "Stimulants et boissons énergisantes",
        body: "Ils empruntent à demain. La dette réapparaît en mauvais sommeil, c'est-à-dire exactement ce qui alimente le problème.",
      },
      {
        label: "Ignorer l'estomac",
        body: "Si votre estomac vous fait mal presque tous les jours, ce n'est pas un détail. C'est en amont de votre sommeil, de votre appétit et de votre énergie — donc en amont de ceci.",
      },
    ],
    bridge:
      "Remplissez le réservoir et le reste suit vite. Suivez le plan que l'application vous donne, jour après jour. Si vous ne durez pas plus longtemps à la fin, on vous rembourse.",
  },
};

export function getPattern(locale: Locale | string, key: PatternKey): PatternCopy {
  return (locale === "fr" ? FR : EN)[key];
}
