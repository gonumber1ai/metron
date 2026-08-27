import type { Locale } from "@/lib/i18n";

export type Section = { h: string; p: string[] };

/**
 * ─────────────────────────────────────────────────────────────────────────
 * PRE-PAYWALL COPY. NEVER NAME THE TECHNIQUE HERE.
 *
 * If this page prints the textbook name of a technique, the reader googles it,
 * finds it free, and leaves. Everything on this page sells the OUTCOME, the
 * five-layer stack, and the guarantee. The how is what he pays for.
 *
 * The layers are described honestly — every one is really in the programme —
 * but as curiosity gaps, not as instructions. A man cannot execute this page.
 * ─────────────────────────────────────────────────────────────────────────
 */
export type Marketing = {
  hero: { kicker: string; h1: string; sub: string; cta: string; note: string };
  sections: Section[];
  offerIntro: { h: string; p: string[] };
  sprintPitch: string;
  includes: string[];
  sprintIncludes: string[];
  faq: { q: string; a: string }[];
  disclaimer: string;
};

const EN: Marketing = {
  hero: {
    kicker: "Private · 60 seconds · no name needed",
    h1: "Last longer in 10 days, or pay nothing.",
    sub: "15 minutes a day. The app tells you exactly what to do each morning. If you are not lasting longer after 10 days, we send your money back.",
    cta: "Start the 60-second check",
    note: "9 quick questions first, so we know what is causing yours. Nobody sees your answers.",
  },

  sections: [
    {
      h: "If this is you, you already know the pattern",
      p: [
        "It is over before you wanted it to be. Again.",
        "You lie there doing the maths on how long that was. She says it is fine. You are not sure she means it, and you do not ask.",
        "Next time you try to think about something else. Or you have a drink first. Or you do not start anything at all, because you already know how it ends.",
        "You have been managing this for years. You have never fixed it.",
      ],
    },
    {
      h: "Why nothing you tried held",
      p: [
        "PILLS — They work for one night. Next morning you are the same man. And every time you use one you get more afraid of doing it without one, and that fear makes you finish faster. It fixes tonight and damages next month.",
        "SPRAYS AND CREAMS — They numb you. But feeling what is happening is the exact thing you need to get better at. Numb yourself and you get worse at it. When it wears off you are behind where you started.",
        "ALCOHOL — Two drinks calm your nerves for an hour. They also soften your erection, wreck your sleep and drop your testosterone. One good hour for three bad days.",
        "THICK CONDOMS AND THINKING ABOUT FOOTBALL — Both are the same idea: leave your own body. But being absent from your body is why you cannot feel it coming.",
        "\"NATURAL\" PRODUCTS — Labs keep finding real pharmacy drugs hidden inside products sold as herbal. Unknown dose, no label. And they teach your body nothing.",
        "Every one of these is rented. Stop paying and it stops working, because none of them changed anything about you.",
      ],
    },
    {
      h: "What is actually happening",
      p: [
        "Finishing fast is a reflex with a threshold. Yours sits lower than you want it, or you cannot feel yourself approaching it. Usually both.",
        "It is not your size. It is not your character. In most men it is not testosterone either.",
        "It is a learned pattern sitting on a tired body. Which is very good news, because learned patterns can be unlearned and tired bodies can be fixed.",
        "Neither of those things comes in a bottle.",
      ],
    },
  ],



  offerIntro: {
    h: "The full programme costs 69,000 FCFA. Do not pay that today.",
    p: [
      "You do not know yet whether this works on you, and we have not earned it.",
      "So do 10 days first, for 7,500 FCFA. Less than a meal out.",
      "If you are not lasting longer at the end of it, tell us and we send your money back. You will have lost nothing but ten days, and you will know for certain instead of wondering for another year.",
      "If it does work, the 7,500 comes off the 69,000.",
    ],
  },

  sprintPitch:
    "Most men who finish the 10 days go on to the 30-Day Sprint, because control on your own and control with a partner are two different skills. The second one is harder, and it is the one you actually want. Your 7,500 comes off the price if you upgrade within 72 hours.",

  includes: [
    "15 minutes a day. Seven of the ten days. That is the whole time cost.",
    "Open the app in the morning, it tells you exactly what to do today. Nothing to work out, nothing to read.",
    "No equipment. Nothing to buy. Nothing to swallow. Works on any phone.",
    "You will know in 10 days, not in six months.",
    "Nobody finds out. Your statement says METRON. You sign up with a username, not your name.",
    "Not lasting longer after 10 days? We refund you.",
  ],

  sprintIncludes: [
    "Everything in the 10-Day Reset, continued and loaded heavier",
    "The partner phase — moving it out of your own hands and into real sex",
    "What to say to her, so it does not feel like a clinic",
    "The exact blood tests to ask for, and what the results actually mean",
    "A 7-day meal rotation and a 3-day strength plan",
    "Direct access to us for the full 30 days",
  ],

  faq: [
    {
      q: "Is this pills or supplements?",
      a: "No. Nothing to swallow, nothing to buy again, nothing that stops working when you run out. This is training.",
    },
    {
      q: "Do I need a partner?",
      a: "No. Almost everyone does the 10-Day Reset on their own, and that is exactly what we expect. Just take your before and after measurement the same way as each other.",
    },
    {
      q: "Will anyone find out?",
      a: "Your statement reads METRON and nothing else. You open the account with a username — no real name. Notifications only ever say your session is ready. You can lock the app with a PIN and delete everything whenever you want.",
    },
    {
      q: "How much time each day?",
      a: "About 15 to 20 minutes on session days. Seven of the twelve days have one. The rest is food, water, walking and sleep, which you were doing anyway, just badly.",
    },
    {
      q: "What if it does not work?",
      a: "Do all 10 days, log both numbers, and write to us. We refund you. And if your number did not move, we will tell you honestly what to do next — which is usually a doctor, not another purchase.",
    },
    {
      q: "How do I pay?",
      a: "Mobile Money or card. Both go through a secure checkout and both show as METRON.",
    },
  ],

  disclaimer:
    "Metron is education and training. It does not diagnose or treat any medical condition. See a doctor if this started suddenly, if you have pain, if you also struggle to get or keep an erection, or if it began after starting a medication.",
};

const FR: Marketing = {
  hero: {
    kicker: "Privé · 60 secondes · aucun nom requis",
    h1: "Durez plus longtemps en 10 jours, ou vous ne payez rien.",
    sub: "15 minutes par jour. L'application vous dit exactement quoi faire chaque matin. Si vous ne durez pas plus longtemps après 10 jours, on vous rembourse.",
    cta: "Faire le bilan de 60 secondes",
    note: "9 questions rapides d'abord, pour savoir ce qui cause le vôtre. Personne ne voit vos réponses.",
  },

  sections: [
    {
      h: "Si c'est vous, vous connaissez déjà le schéma",
      p: [
        "C'est fini avant que vous ne le vouliez. Encore.",
        "Vous restez allongé à calculer combien de temps ça a duré. Elle dit que ce n'est pas grave. Vous n'êtes pas sûr qu'elle le pense, et vous ne demandez pas.",
        "La fois suivante vous essayez de penser à autre chose. Ou vous buvez un verre avant. Ou vous n'initiez rien du tout, parce que vous savez déjà comment ça finit.",
        "Vous gérez ça depuis des années. Vous ne l'avez jamais réglé.",
      ],
    },
    {
      h: "Pourquoi rien n'a tenu",
      p: [
        "LES COMPRIMÉS — Ils marchent pour une nuit. Le lendemain vous êtes le même homme. Et chaque fois que vous en prenez un, vous avez plus peur de faire sans, et cette peur vous fait finir plus vite. Ça règle ce soir et ça abîme le mois prochain.",
        "LES SPRAYS ET CRÈMES — Ils vous anesthésient. Or sentir ce qui se passe est exactement ce que vous devez apprendre. Vous anesthésier vous rend moins bon. Quand l'effet passe, vous êtes en dessous de votre point de départ.",
        "L'ALCOOL — Deux verres calment les nerfs pendant une heure. Ils ramollissent aussi votre érection, détruisent votre sommeil et font chuter votre testostérone. Une bonne heure contre trois mauvais jours.",
        "PRÉSERVATIFS ÉPAIS ET PENSER AU FOOTBALL — Même idée : quitter son corps. Mais être absent de son corps est justement pourquoi vous ne sentez rien venir.",
        "LES PRODUITS « NATURELS » — Les laboratoires trouvent régulièrement de vrais médicaments cachés dans des produits vendus comme naturels. Dose inconnue, aucune étiquette. Et ils n'apprennent rien à votre corps.",
        "Tout ça se loue. Vous arrêtez de payer, ça arrête de marcher, parce que rien n'a changé en vous.",
      ],
    },
    {
      h: "Ce qui se passe réellement",
      p: [
        "Finir vite est un réflexe avec un seuil. Le vôtre est plus bas que vous ne le voudriez, ou vous ne sentez pas que vous en approchez. En général les deux.",
        "Ce n'est pas votre taille. Ce n'est pas votre caractère. Chez la plupart des hommes ce n'est pas non plus la testostérone.",
        "C'est un schéma appris posé sur un corps fatigué. Et c'est une très bonne nouvelle, parce qu'un schéma appris se désapprend et un corps fatigué se répare.",
        "Ni l'un ni l'autre ne se vend en flacon.",
      ],
    },
  ],



  offerIntro: {
    h: "Le programme complet coûte 69 000 FCFA. Ne payez pas ça aujourd'hui.",
    p: [
      "Vous ne savez pas encore si ça marche sur vous, et nous ne l'avons pas mérité.",
      "Alors faites 10 jours d'abord, pour 7 500 FCFA. Moins cher qu'un repas dehors.",
      "Si vous ne durez pas plus longtemps à la fin, dites-le-nous et on vous renvoie votre argent. Vous n'aurez rien perdu que dix jours, et vous saurez avec certitude au lieu de vous demander encore un an.",
      "Et si ça marche, les 7 500 sont déduits des 69 000.",
    ],
  },

  sprintPitch:
    "La plupart des hommes qui terminent les 10 jours passent au Sprint de 30 jours, parce que le contrôle tout seul et le contrôle avec une partenaire sont deux compétences différentes. La seconde est plus difficile, et c'est celle que vous voulez vraiment. Vos 7 500 sont déduits si vous passez à la suite dans les 72 heures.",

  includes: [
    "15 minutes par jour. Sept jours sur dix. C'est tout le temps que ça prend.",
    "Vous ouvrez l'application le matin, elle vous dit exactement quoi faire aujourd'hui. Rien à deviner, rien à lire.",
    "Aucun matériel. Rien à acheter. Rien à avaler. Marche sur n'importe quel téléphone.",
    "Vous saurez en 10 jours, pas en six mois.",
    "Personne ne le saura. Votre relevé affiche METRON. Vous vous inscrivez avec un pseudo, pas votre nom.",
    "Vous ne durez pas plus longtemps après 10 jours ? On vous rembourse.",
  ],

  sprintIncludes: [
    "Tout le Reset de 10 jours, poursuivi et chargé plus lourd",
    "La phase partenaire — passer de vos mains à un vrai rapport",
    "Quoi lui dire, pour que ça ne ressemble pas à une consultation",
    "Les analyses de sang précises à demander, et ce que les résultats veulent dire",
    "Une rotation de repas sur 7 jours et un plan de renforcement sur 3 jours",
    "Un accès direct à nous pendant les 30 jours",
  ],

  faq: [
    {
      q: "Est-ce que ce sont des comprimés ou des compléments ?",
      a: "Non. Rien à avaler, rien à racheter, rien qui s'arrête de marcher quand le flacon est vide. C'est de l'entraînement.",
    },
    {
      q: "Ai-je besoin d'une partenaire ?",
      a: "Non. Presque tout le monde fait le Reset de 10 jours tout seul, et c'est exactement ce qu'on attend. Prenez simplement votre mesure du début et celle de la fin de la même façon.",
    },
    {
      q: "Est-ce que quelqu'un peut le découvrir ?",
      a: "Votre relevé affiche METRON et rien d'autre. Vous ouvrez le compte avec un pseudo — pas de vrai nom. Les notifications disent uniquement que votre séance est prête. Vous pouvez verrouiller l'application par code PIN et tout supprimer quand vous voulez.",
    },
    {
      q: "Combien de temps par jour ?",
      a: "Environ 15 à 20 minutes les jours de séance. Sept jours sur douze en ont une. Le reste, c'est manger, boire, marcher et dormir — ce que vous faisiez déjà, mais mal.",
    },
    {
      q: "Et si ça ne marche pas ?",
      a: "Faites les 10 jours, enregistrez les deux chiffres, et écrivez-nous. On vous rembourse. Et si votre chiffre n'a pas bougé, on vous dira honnêtement quoi faire ensuite — en général un médecin, pas un autre achat.",
    },
    {
      q: "Comment payer ?",
      a: "Mobile Money ou carte. Les deux passent par un paiement sécurisé et les deux affichent METRON.",
    },
  ],

  disclaimer:
    "Metron est un programme d'éducation et d'entraînement. Il ne diagnostique ni ne traite aucune maladie. Consultez un médecin si le problème est apparu soudainement, si vous avez des douleurs, si vous avez aussi du mal à obtenir ou garder une érection, ou si cela a commencé après la prise d'un médicament.",
};

export function getMarketing(locale: Locale | string): Marketing {
  return locale === "fr" ? FR : EN;
}
