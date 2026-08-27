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
      "You last meaningfully longer on your own than you do with a partner. That single fact rules out most of what gets sold to men like you — there is nothing wrong with your equipment, and a numbing spray is treating a problem you do not have.",
      "What happens instead is a loop. You start monitoring yourself. Monitoring raises arousal and tightens everything up. The higher arousal brings the finish closer, which confirms the fear, which makes you monitor harder next time.",
      "Every round of that loop makes the pattern more automatic. That is why it has been getting worse rather than better.",
    ],
    whyFailed: [
      {
        label: "Distraction",
        body: "Thinking about football takes you out of your body. But you have to be IN your body to feel it coming. You buy thirty seconds and lose the skill.",
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
      "You do not need a stronger product. You need ten days and fifteen minutes a day. If you are not lasting longer at the end, we refund you.",
  },

  conditioned: {
    name: "Your Body Learned To Rush",
    strap:
      "Your body learned to finish fast. It can learn the opposite.",
    whatItMeans: [
      "You finish at roughly the same point whether you are alone or with a partner. That points away from nerves and toward conditioning — your body has learned a fast route from arousal to finish, and it now takes that route automatically.",
      "Most men train this accidentally. Years of rushing, of finishing quickly and quietly, of high-intensity stimulation — the nervous system is very good at learning whatever you practise, and you have been practising speed.",
      "The good news is that a learned response is the most changeable kind there is. You are not fighting your anatomy. You are overwriting a habit.",
    ],
    whyFailed: [
      {
        label: "The exercise everyone recommends",
        body: "You were doing half of it. The half that actually matters is not the one people describe — and if you are already tight down there, the half you were doing made it worse.",
      },
      {
        label: "Delay sprays",
        body: "They numb the skin. Your problem is a reflex firing too early, not skin that feels too much. Wrong target.",
      },
      {
        label: "Stopping and starting occasionally",
        body: "Doing it now and then does nothing. This is a skill. Three times a month builds nothing — it has to be most days, for a short block.",
      },
    ],
    bridge:
      "What your body learned, it can unlearn. Ten days, fifteen minutes a day. If you are not lasting longer at the end, we refund you.",
  },

  dependent: {
    name: "You Need Something First",
    strap:
      "You are renting your performance. That is why it never sticks.",
    whatItMeans: [
      "You are relying on something — a pill, a spray, a drink — to perform. That is the bottleneck, and it sits in front of everything else we could work on.",
      "Not because these things are evil, but because of what they teach you. Every night that goes well with a pill is a night that proves to you that you need one. The belief is the trap, and the belief is what shortens you when the pill is not there.",
      "There is a second problem specific to the products sold as natural. Health regulators around the world have repeatedly found undeclared pharmaceutical drugs — the same compounds as prescription pills — inside supplements marketed as herbal. You may already be taking the drug you thought you were avoiding, at an unknown dose, with no label.",
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
      "Ten days without the pill. Fifteen minutes a day. If you are not lasting longer at the end, we refund you — and you will finally know where you actually stand.",
  },

  depleted: {
    name: "Running On Empty",
    strap:
      "You are trying to fix this on an empty tank.",
    whatItMeans: [
      "Your answers point at the physical base rather than the technique — poor sleep, little movement, ongoing stomach trouble, or all three.",
      "This matters more than most men think. Sleep drives testosterone, erection quality and how reactive your nervous system is. Persistent gastric trouble drags on sleep, appetite and energy at the same time. Sitting all day reduces the circulation the whole system depends on.",
      "Train ejaculatory control on top of that base and you get a fraction of the result. Fix the base first and some of the problem resolves without any technique at all.",
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
      "Fill the tank and the rest moves fast. Ten days, fifteen minutes a day. If you are not lasting longer at the end, we refund you.",
  },
};

const FR: Record<PatternKey, PatternCopy> = {
  anxious: {
    name: "C'est la tête, pas le corps",
    strap:
      "Votre corps en est déjà capable. C'est la tête qui bloque.",
    whatItMeans: [
      "Vous durez nettement plus longtemps seul qu'avec une partenaire. Ce seul fait écarte la majorité de ce qu'on vend aux hommes comme vous : votre corps fonctionne, et un spray anesthésiant traite un problème que vous n'avez pas.",
      "Ce qui se passe, c'est une boucle. Vous commencez à vous surveiller. Cette surveillance augmente l'excitation et crispe tout. L'excitation plus haute rapproche la fin, ce qui confirme la peur, ce qui vous fait surveiller encore plus la fois suivante.",
      "Chaque tour de cette boucle rend le schéma plus automatique. C'est pour cela que la situation empire au lieu de s'améliorer.",
    ],
    whyFailed: [
      {
        label: "La distraction",
        body: "Penser au football vous sort de votre corps. Or il faut être DANS son corps pour sentir la fin arriver. Vous gagnez trente secondes et vous perdez la compétence.",
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
      "Vous n'avez pas besoin d'un produit plus fort. Vous avez besoin de dix jours et de quinze minutes par jour. Si vous ne durez pas plus longtemps à la fin, on vous rembourse.",
  },

  conditioned: {
    name: "Votre corps a appris à se dépêcher",
    strap:
      "Votre corps a appris à finir vite. Il peut apprendre l'inverse.",
    whatItMeans: [
      "Vous finissez à peu près au même moment, seul ou accompagné. Cela oriente non pas vers le stress mais vers le conditionnement : votre corps a appris un chemin rapide entre l'excitation et la fin, et il l'emprunte désormais tout seul.",
      "La plupart des hommes s'entraînent à cela sans le vouloir. Des années à se dépêcher, à finir vite et discrètement, avec une stimulation très intense — le système nerveux apprend très bien ce qu'on répète, et vous avez répété la vitesse.",
      "La bonne nouvelle : une réponse apprise est ce qu'il y a de plus modifiable. Vous ne luttez pas contre votre anatomie. Vous réécrivez une habitude.",
    ],
    whyFailed: [
      {
        label: "L'exercice que tout le monde recommande",
        body: "Vous n'en faisiez que la moitié. La moitié qui compte vraiment n'est pas celle qu'on décrit — et si vous êtes déjà crispé, celle que vous faisiez aggravait les choses.",
      },
      {
        label: "Les sprays retardants",
        body: "Ils anesthésient la peau. Votre problème est un réflexe qui part trop tôt, pas une peau qui sent trop. Mauvaise cible.",
      },
      {
        label: "Le stop-and-go de temps en temps",
        body: "De temps en temps, ça ne donne rien. C'est une compétence. Trois fois par mois ne construit rien — il faut presque tous les jours, sur une courte période.",
      },
    ],
    bridge:
      "Ce que votre corps a appris, il peut le désapprendre. Dix jours, quinze minutes par jour. Si vous ne durez pas plus longtemps à la fin, on vous rembourse.",
  },

  dependent: {
    name: "Vous avez besoin de quelque chose d'abord",
    strap:
      "Vous louez votre performance. C'est pour ça que ça ne tient jamais.",
    whatItMeans: [
      "Vous dépendez de quelque chose — comprimé, spray, alcool — pour assurer. C'est le goulot d'étranglement, et il se place avant tout le reste.",
      "Non pas parce que ces produits seraient diaboliques, mais à cause de ce qu'ils vous enseignent. Chaque bonne soirée avec un comprimé est une soirée qui vous prouve qu'il vous en faut un. La croyance est le piège, et c'est elle qui vous raccourcit quand le comprimé n'est pas là.",
      "Il y a un second problème, propre aux produits vendus comme naturels. Des autorités sanitaires du monde entier ont trouvé à plusieurs reprises des médicaments non déclarés — les mêmes molécules que les comprimés sur ordonnance — dans des compléments présentés comme à base de plantes. Vous prenez peut-être déjà la molécule que vous pensiez éviter, à dose inconnue, sans étiquette.",
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
      "Dix jours sans comprimé. Quinze minutes par jour. Si vous ne durez pas plus longtemps à la fin, on vous rembourse — et vous saurez enfin où vous en êtes vraiment.",
  },

  depleted: {
    name: "Le réservoir est vide",
    strap:
      "Vous essayez de régler ça avec le réservoir vide.",
    whatItMeans: [
      "Vos réponses pointent vers la base physique plutôt que vers la technique — mauvais sommeil, peu de mouvement, troubles digestifs persistants, ou les trois.",
      "Cela compte plus que la plupart des hommes ne le pensent. Le sommeil gouverne la testostérone, la qualité de l'érection et la réactivité de votre système nerveux. Des troubles gastriques persistants pèsent en même temps sur le sommeil, l'appétit et l'énergie. Rester assis toute la journée réduit la circulation dont tout le système dépend.",
      "Entraîner le contrôle éjaculatoire sur cette base-là ne donne qu'une fraction du résultat. Réparez la base d'abord et une partie du problème se règle sans aucune technique.",
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
      "Remplissez le réservoir et le reste suit vite. Dix jours, quinze minutes par jour. Si vous ne durez pas plus longtemps à la fin, on vous rembourse.",
  },
};

export function getPattern(locale: Locale | string, key: PatternKey): PatternCopy {
  return (locale === "fr" ? FR : EN)[key];
}
