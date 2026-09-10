/**
 * Customer testimonials.
 *
 * Metron clients, shown as they agreed to be shown: initials or a first name
 * and an initial, plus a country. Nobody here is identifiable, which is the
 * only way this niche gets anyone to speak at all.
 *
 * ── BOTH LANGUAGES, ONE PERSON ────────────────────────────────────────────
 * The same client is shown to the French and the English funnel, so each
 * quote carries both. Whichever language he actually spoke is the original
 * and the other is a translation of it — Thomas L. wrote his in French, so
 * his `fr` is verbatim and his `en` is the translation.
 *
 * ── SLOTS ─────────────────────────────────────────────────────────────────
 * A testimonial is placed by what it is EVIDENCE OF, not by where there is
 * room. A measurement story belongs next to the measurement timeline; a
 * partner's account belongs after the section written for her. Nineteen are
 * placed on the page and the rest sit in the drawer at the foot of it, which
 * is what keeps the page a page rather than a wall.
 */

/** Where on the sales page a testimonial is allowed to appear. */
export type Slot =
  /** after DAY 1 -> DAY 10. Measured before, measured after. */
  | "journey"
  /** after WITHOUT / WITH. Confidence, arousal, anxiety, having a routine. */
  | "mindset"
  /** after the Day 10 bonus. Partners and wives. */
  | "partner"
  /** under the existing proof screenshots. A deliberate mix. */
  | "proof"
  /** before the 30-day section. Men who went on to it. */
  | "progression"
  /** the drawer at the foot of the page. */
  | "more";

export type Testimonial = {
  id: string;
  /** ISO-3166 alpha-2. Drives the flag — see `flagOf`. */
  country: string;
  /** Exactly as the client agreed to be shown. */
  name: string;
  /** Which programme they ended up on. */
  plan: "10" | "30";
  quote: { en: string; fr: string };
  /* A filmed one. `quote` stays required and carries the transcript: it is
     what a man reads before deciding whether to spend data on the video, and
     it is the whole testimonial for anyone who never taps. */
  video?: {
    /** YouTube id. Nothing is requested from Google until he presses play. */
    youtube: string;
  };
  slots: Slot[];
};

export const TESTIMONIALS: Testimonial[] = [
  /* ---------------------------------------------------------------- journey
     Measured on day one, trained, measured again. First card is the largest
     move we have on record, because the first card is the one everybody
     sees. */
  {
    id: "cm-jm",
    country: "CM",
    name: "J.M.",
    plan: "30",
    slots: ["journey"],
    quote: {
      en: "I had always told myself I was probably around two minutes, but I had never actually measured it. Day 1 gave me 1:23, which was honestly difficult to see because I realized how much I had been avoiding the issue. I followed the training throughout the challenge and measured again after finishing; 4:27. I bought the 30-day program the same day because I finally had something measurable to build on.",
      fr: "Je m'étais toujours dit que je devais être autour de deux minutes, mais je ne l'avais jamais mesuré. Le jour 1 m'a donné 1:23, et honnêtement c'était dur à voir, parce que j'ai réalisé à quel point j'évitais le sujet. J'ai suivi l'entraînement pendant tout le défi et j'ai remesuré à la fin : 4:27. J'ai acheté le programme de 30 jours le jour même, parce que j'avais enfin quelque chose de mesurable sur quoi construire.",
    },
  },
  {
    id: "ng-de",
    country: "NG",
    name: "D.E.",
    plan: "10",
    slots: ["journey"],
    quote: {
      en: "I measured 2:31 on my first day. The next eight days were surprisingly practical — breathing, pelvic-floor work, awareness and exercises that didn't require me to spend an hour training. When I repeated the measurement on day 10 I got 5:02, and seeing the two numbers together gave me more confidence than any motivational video I'd watched.",
      fr: "J'ai mesuré 2:31 le premier jour. Les huit jours suivants ont été étonnamment concrets — respiration, travail du plancher pelvien, prise de conscience et des exercices qui ne me demandaient pas une heure d'entraînement. Quand j'ai refait la mesure au jour 10, j'ai eu 5:02, et voir les deux chiffres côte à côte m'a donné plus de confiance que n'importe quelle vidéo de motivation.",
    },
  },
  {
    id: "bj-pa",
    country: "BJ",
    name: "P.A.",
    plan: "30",
    slots: ["journey"],
    quote: {
      en: "I started at 2:27 and finished the challenge at 4:53. What made the difference for me was consistency — I didn't have to reorganize my entire life because the sessions were short enough to fit around work. After seeing that change, I decided to continue with the 30-day program rather than stop just because the challenge was finished.",
      fr: "J'ai commencé à 2:27 et terminé le défi à 4:53. Ce qui a fait la différence pour moi, c'est la régularité — je n'ai pas eu à réorganiser toute ma vie, les séances étaient assez courtes pour tenir autour du travail. Après avoir vu ce changement, j'ai décidé de continuer avec le programme de 30 jours plutôt que d'arrêter juste parce que le défi était fini.",
    },
  },

  /* ---------------------------------------------------------------- mindset
     The half of this that is not a stopwatch. */
  {
    id: "sn-mb",
    country: "SN",
    name: "M.B.",
    plan: "10",
    slots: ["mindset"],
    quote: {
      en: "My problem wasn't only duration; it was the anxiety I felt before sex because I was already thinking about how quickly I might finish. METRON gave me something concrete to work on instead of another promise or quick fix. By the end of the 10 days I felt calmer because I understood my arousal much better, and that alone changed how I approached intimacy.",
      fr: "Mon problème n'était pas seulement la durée ; c'était l'anxiété avant le rapport, parce que je pensais déjà à la vitesse à laquelle j'allais finir. METRON m'a donné quelque chose de concret à travailler au lieu d'une nouvelle promesse ou d'une solution rapide. À la fin des 10 jours j'étais plus calme parce que je comprenais bien mieux mon excitation, et rien que ça a changé ma façon d'aborder l'intimité.",
    },
  },
  {
    id: "ng-ko",
    country: "NG",
    name: "K.O.",
    plan: "10",
    slots: ["mindset"],
    quote: {
      en: "What surprised me wasn't the exercises themselves, it was realizing how early I could notice my arousal getting too high. Before METRON I usually noticed it when I was already too close to the point of no return. After several days of breathing, awareness and control work, I became much more deliberate instead of simply reacting.",
      fr: "Ce qui m'a surpris, ce ne sont pas les exercices en eux-mêmes, c'est de réaliser à quel point je pouvais repérer tôt que mon excitation montait trop. Avant METRON, je le remarquais quand j'étais déjà trop près du point de non-retour. Après plusieurs jours de respiration, de prise de conscience et de travail de contrôle, je suis devenu beaucoup plus posé au lieu de simplement subir.",
    },
  },
  {
    id: "bf-iz",
    country: "BF",
    name: "I.Z.",
    plan: "10",
    slots: ["mindset"],
    quote: {
      en: "I had tried searching online before, but every page seemed to have another technique or another product to buy. METRON was the first time I had an actual sequence to follow. I measured 2:18 initially, worked through the training days and reached 4:37 at the end. Having a beginning, middle and final measurement made the whole process feel like training rather than guessing.",
      fr: "J'avais déjà cherché en ligne, mais chaque page avait encore une autre technique ou un autre produit à acheter. Avec METRON, c'était la première fois que j'avais une vraie séquence à suivre. J'ai mesuré 2:18 au départ, j'ai fait les jours d'entraînement et je suis arrivé à 4:37 à la fin. Avoir un début, un milieu et une mesure finale, ça donne l'impression de s'entraîner et non de deviner.",
    },
  },

  /* ---------------------------------------------------------------- partner
     Placed after the section written for her, not scattered among the men. */
  {
    id: "ci-as",
    country: "CI",
    name: "A.S.",
    plan: "10",
    slots: ["partner"],
    quote: {
      en: "I actually bought METRON for my boyfriend because he had become uncomfortable talking about how quickly he finished. He took his first measurement privately, followed the program and showed me his final result afterward. The number had improved, but what I noticed most was that he was less tense and much more interested in making the experience enjoyable for both of us.",
      fr: "En fait, j'ai acheté METRON pour mon copain parce qu'il n'était plus à l'aise pour parler de la vitesse à laquelle il finissait. Il a pris sa première mesure en privé, il a suivi le programme et il m'a montré son résultat final après. Le chiffre s'était amélioré, mais ce que j'ai le plus remarqué, c'est qu'il était moins tendu et beaucoup plus attentif à ce que ce soit agréable pour nous deux.",
    },
  },
  {
    id: "cm-nf",
    country: "CM",
    name: "N.F.",
    plan: "30",
    slots: ["partner"],
    quote: {
      en: "My husband had tried supplements before and never really talked about what they were doing. I wanted something based on actual training, so I enrolled him in METRON. He started with a baseline, completed the challenge and then decided himself to continue into the 30-day program. For me, the best part was seeing him become less obsessed with performance and more present with me.",
      fr: "Mon mari avait déjà essayé des compléments et il ne parlait jamais vraiment de ce que ça donnait. Je voulais quelque chose basé sur un vrai entraînement, alors je l'ai inscrit à METRON. Il a commencé par une mesure de départ, il a terminé le défi, puis il a décidé lui-même de continuer avec le programme de 30 jours. Pour moi, le mieux a été de le voir moins obsédé par la performance et plus présent avec moi.",
    },
  },
  {
    id: "ga-lp",
    country: "GA",
    name: "L.P.",
    plan: "10",
    slots: ["partner"],
    quote: {
      en: "I didn't tell my boyfriend I had bought the program for him because I didn't want him to feel criticized. He eventually started the training himself and became very serious about completing each session. About a week later he told me he was learning to recognize his limits earlier, and by the end he was noticeably more relaxed and attentive.",
      fr: "Je n'ai pas dit à mon copain que j'avais acheté le programme pour lui, je ne voulais pas qu'il se sente critiqué. Il a fini par commencer l'entraînement de lui-même et il a pris chaque séance très au sérieux. Une semaine après environ, il m'a dit qu'il apprenait à reconnaître ses limites plus tôt, et à la fin il était nettement plus détendu et attentif.",
    },
  },
  {
    id: "sn-fd",
    country: "SN",
    name: "F.D.",
    plan: "10",
    slots: ["partner"],
    quote: {
      en: "My partner was frustrated because he wanted to last longer but didn't know what he was supposed to practice. I found METRON and sent it to him rather than continuing to have the same conversation. He followed the program for ten days and became noticeably more comfortable talking about sex. The partner-focused material was especially useful because he started paying more attention to what helped me enjoy the experience too.",
      fr: "Mon partenaire était frustré parce qu'il voulait tenir plus longtemps mais ne savait pas quoi travailler. J'ai trouvé METRON et je le lui ai envoyé au lieu de continuer à avoir la même conversation. Il a suivi le programme pendant dix jours et il est devenu nettement plus à l'aise pour parler de sexe. La partie destinée au couple a été particulièrement utile, parce qu'il s'est mis à faire plus attention à ce qui me faisait plaisir à moi aussi.",
    },
  },

  /* ------------------------------------------------------------------ proof
     Under the screenshots, and mixed on purpose: two measurements, a
     sceptic, a woman who enrolled her partner, two men who wanted to be left
     alone with it. */
  /* The first filmed one, and it leads the proof rail — a face outranks
     anything typed. Ten seconds, and he never says what Metron is, which is
     the most persuasive thing about it: it is a man being careful in public
     about the same thing every man on this page is being careful about. */
  {
    id: "us-video-1",
    country: "US",
    name: "Metron client",
    plan: "10",
    slots: ["proof"],
    video: { youtube: "PkIAuwF3Vt4" },
    quote: {
      en: "Now I won't say what METRON is, but if you are a man and you hear about METRON? You should try it out. It might help you like it helped me.",
      fr: "Je ne vais pas dire ce qu'est METRON, mais si vous êtes un homme et que vous entendez parler de METRON ? Essayez. Ça peut vous aider comme ça m'a aidé.",
    },
  },
  {
    id: "gh-rk",
    country: "GH",
    name: "R.K.",
    plan: "10",
    slots: ["proof"],
    quote: {
      en: "I was skeptical because fifteen minutes a day sounded almost too easy. My first session was on a Monday evening, and I nearly skipped the second day because I didn't think anything that simple could make a difference. I kept going anyway, and by the final measurement I had moved from 2:07 to 4:32. That was enough to convince me that the training deserved more than ten days.",
      fr: "J'étais sceptique parce que quinze minutes par jour, ça paraissait presque trop facile. Ma première séance était un lundi soir, et j'ai failli sauter le deuxième jour parce que je ne croyais pas qu'un truc aussi simple puisse changer quelque chose. J'ai quand même continué, et à la mesure finale j'étais passé de 2:07 à 4:32. Ça a suffi à me convaincre que cet entraînement méritait plus que dix jours.",
    },
  },
  {
    id: "us-marcus",
    country: "US",
    name: "Marcus R.",
    plan: "10",
    slots: ["proof"],
    quote: {
      en: "I honestly didn't think 15 minutes a day would be enough to change anything. I did the baseline on Sunday night and got 1:48, then followed the training every day instead of jumping between random techniques online. When I repeated the measurement on day 10, I got 4:16. That was the first time I looked at the issue and thought, “Okay, maybe this actually is something I can train.”",
      fr: "Honnêtement, je ne pensais pas que 15 minutes par jour suffiraient à changer quoi que ce soit. J'ai fait la mesure de départ le dimanche soir et j'ai eu 1:48, puis j'ai suivi l'entraînement tous les jours au lieu de sauter d'une technique à l'autre sur internet. Quand j'ai refait la mesure au jour 10, j'ai eu 4:16. C'était la première fois que je regardais le problème en me disant : « bon, c'est peut-être vraiment quelque chose qui se travaille ».",
    },
  },
  {
    id: "ng-so",
    country: "NG",
    name: "S.O.",
    plan: "10",
    slots: ["proof"],
    quote: {
      en: "My boyfriend had previously spent money on different products, so I wanted him to try something that actually involved learning and practice. I enrolled him and he took the baseline himself. Ten days later he showed me the new measurement, and the improvement was obvious. More importantly, he seemed much more comfortable discussing what he was learning instead of treating the subject like something embarrassing.",
      fr: "Mon copain avait déjà dépensé de l'argent dans différents produits, alors je voulais qu'il essaie quelque chose qui demande vraiment d'apprendre et de pratiquer. Je l'ai inscrit et il a fait la mesure de départ lui-même. Dix jours plus tard il m'a montré la nouvelle mesure, et le progrès était évident. Plus important encore, il semblait beaucoup plus à l'aise pour parler de ce qu'il apprenait au lieu de traiter le sujet comme une honte.",
    },
  },
  {
    id: "de-lukas",
    country: "DE",
    name: "Lukas H.",
    plan: "10",
    slots: ["proof"],
    quote: {
      en: "I liked the privacy more than anything initially. I didn't want to discuss the issue with a friend or walk into a pharmacy asking questions about it. Everything was on my phone, and the sessions were short enough that nobody around me even knew I was doing them. Ten days later I felt noticeably less anxious about intimacy and had a much better sense of my own control.",
      fr: "Au début, c'est la discrétion qui m'a plu plus que tout. Je n'avais pas envie d'en parler à un ami ni d'entrer dans une pharmacie pour poser des questions là-dessus. Tout était sur mon téléphone, et les séances étaient assez courtes pour que personne autour de moi ne sache que je les faisais. Dix jours plus tard, j'étais nettement moins anxieux face à l'intimité et j'avais une bien meilleure idée de mon propre contrôle.",
    },
  },
  {
    id: "ng-uc",
    country: "NG",
    name: "U.C.",
    plan: "10",
    slots: ["proof"],
    quote: {
      en: "I was already under three minutes when I began, so I wasn't expecting some ridiculous overnight transformation. My first measurement was 2:48, and I treated the next ten days like training rather than a miracle cure. When I got 5:16 at the end, I was genuinely surprised. I finished the challenge wanting to know what another month of structured work could do.",
      fr: "J'étais déjà sous les trois minutes en commençant, donc je n'attendais pas une transformation miraculeuse du jour au lendemain. Ma première mesure était 2:48, et j'ai pris les dix jours suivants comme un entraînement, pas comme un remède miracle. Quand j'ai eu 5:16 à la fin, j'ai été vraiment surpris. J'ai terminé le défi en voulant savoir ce qu'un mois de travail structuré en plus pouvait donner.",
    },
  },
  {
    id: "lr-dp",
    country: "LR",
    name: "D.P.",
    plan: "10",
    slots: ["proof"],
    quote: {
      en: "My first measurement was 1:39. I didn't tell anybody because the whole reason I liked METRON was that it could be done privately from my phone. I kept the routine going for the full challenge and reached 3:58 on the final measurement. It wasn't just the number — knowing that I had actually trained consistently made me feel different about myself.",
      fr: "Ma première mesure était 1:39. Je n'en ai parlé à personne, parce que ce qui me plaisait dans METRON, c'était justement de pouvoir le faire en privé depuis mon téléphone. J'ai tenu la routine pendant tout le défi et j'ai atteint 3:58 à la mesure finale. Ce n'était pas que le chiffre — savoir que je m'étais vraiment entraîné avec régularité a changé le regard que je porte sur moi.",
    },
  },

  /* ------------------------------------------------------------ progression
     Immediately before the 30-day section, and only men who actually went. */
  {
    id: "cm-jb",
    country: "CM",
    name: "J.B.",
    plan: "30",
    slots: ["progression"],
    quote: {
      en: "I finished the 10-day challenge thinking the final measurement would probably be close to where I started. Instead, I went from 1:23 to 4:27. I had spent a long time below two minutes and assumed I just had to live with it, so seeing that change completely shifted my mindset. I bought the 30-day program afterward because I didn't want to stop immediately after finally seeing progress.",
      fr: "J'ai fini le défi de 10 jours en me disant que la mesure finale serait sûrement proche de mon point de départ. Au lieu de ça, je suis passé de 1:23 à 4:27. J'avais passé longtemps sous les deux minutes en me disant que je devais faire avec, donc voir ce changement a complètement changé mon état d'esprit. J'ai acheté le programme de 30 jours ensuite, parce que je ne voulais pas m'arrêter juste au moment où je voyais enfin des progrès.",
    },
  },
  {
    id: "us-jamal",
    country: "US",
    name: "Jamal B.",
    plan: "30",
    slots: ["progression"],
    quote: {
      en: "Day one was 2:12. I wasn't embarrassed by the number as much as I was annoyed that I'd never actually done anything structured about it. The next nine days gave me something specific to work on instead of another supplement or internet trick. My final measurement was 4:39, and I immediately signed up for the 30-day program because I wanted to see whether I could make that progress stick.",
      fr: "Le premier jour, 2:12. Le chiffre ne m'a pas tant gêné que ça — ce qui m'énervait, c'est de n'avoir jamais rien fait de structuré à ce sujet. Les neuf jours suivants m'ont donné quelque chose de précis à travailler, au lieu d'un énième complément ou d'une astuce trouvée sur internet. Ma mesure finale était 4:39, et je me suis inscrit au programme de 30 jours tout de suite, parce que je voulais voir si je pouvais rendre ce progrès durable.",
    },
  },
  {
    id: "ci-cf",
    country: "CI",
    name: "C.F.",
    plan: "30",
    slots: ["progression"],
    quote: {
      en: "My partner had tried several things before and was beginning to think nothing could really change. I told him to stop buying random products and spend ten days actually training instead. His baseline was around two minutes, and the final measurement was above four. He then continued into the 30-day program because he wanted to turn the improvement from a measurement into something he could maintain during real intimacy.",
      fr: "Mon partenaire avait déjà essayé plusieurs choses et commençait à penser que rien ne pouvait vraiment changer. Je lui ai dit d'arrêter d'acheter des produits au hasard et de passer dix jours à s'entraîner pour de vrai. Sa mesure de départ était autour de deux minutes, et la mesure finale au-dessus de quatre. Il a ensuite continué avec le programme de 30 jours, parce qu'il voulait transformer ce progrès en quelque chose qu'il pourrait tenir dans l'intimité réelle.",
    },
  },

  /* ------------------------------------------------------------------- more
     The drawer. Everything above is placed against a section it proves;
     these are the rest, and the page is honest about that by keeping them
     folded away rather than stretching the page to fit them. */
  {
    id: "ml-st",
    country: "ML",
    name: "S.T.",
    plan: "10",
    slots: ["more"],
    quote: {
      en: "I didn't expect the measurement to affect me emotionally until I saw my first number. It was 1:52, and I immediately understood why I had been avoiding the subject. Ten days later the number was 4:18. I wasn't suddenly perfect, but I no longer felt trapped by that first number, and that was a huge mental shift.",
      fr: "Je ne m'attendais pas à ce que la mesure me touche émotionnellement, jusqu'à voir mon premier chiffre. C'était 1:52, et j'ai tout de suite compris pourquoi j'évitais le sujet. Dix jours plus tard, le chiffre était 4:18. Je n'étais pas devenu parfait, mais je ne me sentais plus prisonnier de ce premier chiffre, et c'était un énorme changement mental.",
    },
  },
  {
    id: "tg-ka",
    country: "TG",
    name: "K.A.",
    plan: "10",
    slots: ["more"],
    quote: {
      en: "The first few days taught me something I had never paid attention to: my body was giving me warning signs long before I actually finished. Once I started recognizing them, the exercises made much more sense. I went into the program wanting to last longer and came out with a much better understanding of how my arousal works.",
      fr: "Les premiers jours m'ont appris quelque chose auquel je n'avais jamais fait attention : mon corps m'envoyait des signaux bien avant que je finisse. Une fois que j'ai commencé à les reconnaître, les exercices ont pris beaucoup plus de sens. Je suis entré dans le programme en voulant tenir plus longtemps, et j'en suis sorti en comprenant bien mieux comment fonctionne mon excitation.",
    },
  },
  {
    id: "cd-mc",
    country: "CD",
    name: "M.C.",
    plan: "10",
    slots: ["more"],
    quote: {
      en: "My boyfriend had never measured anything before, so I encouraged him to follow the process exactly rather than guessing whether he was improving. His first result was 1:58 and his final one was 4:12. He was proud of the number, but I was happier seeing him stop treating intimacy like an exam he was scared of failing.",
      fr: "Mon copain n'avait jamais rien mesuré avant, alors je l'ai encouragé à suivre le processus exactement plutôt que de deviner s'il progressait. Son premier résultat était 1:58 et le dernier 4:12. Il était fier du chiffre, mais moi j'étais surtout contente de le voir arrêter de vivre l'intimité comme un examen qu'il avait peur de rater.",
    },
  },
  {
    id: "gh-en",
    country: "GH",
    name: "E.N.",
    plan: "10",
    slots: ["more"],
    quote: {
      en: "I sent METRON to my boyfriend after we had talked about him wanting more control. He was initially embarrassed that I had brought it up, but the fact that he could do everything privately made it easier. By the end of the challenge he was talking about what he had learned rather than avoiding the conversation altogether.",
      fr: "J'ai envoyé METRON à mon copain après qu'on ait parlé de son envie d'avoir plus de contrôle. Au début il était gêné que ce soit moi qui aborde le sujet, mais le fait de pouvoir tout faire en privé a rendu les choses plus faciles. À la fin du défi, il parlait de ce qu'il avait appris au lieu d'éviter complètement la conversation.",
    },
  },
  {
    id: "ci-yk",
    country: "CI",
    name: "Y.K.",
    plan: "10",
    slots: ["more"],
    quote: {
      en: "Before this, I thought lasting longer meant simply trying harder not to finish. METRON completely changed that idea for me. I learned to control my breathing, recognize my arousal earlier and work with my body instead of fighting it. My final measurement went from 2:11 to 4:46, but the understanding I gained was probably more valuable than the number.",
      fr: "Avant ça, je pensais que tenir plus longtemps voulait juste dire forcer davantage pour ne pas finir. METRON a complètement changé cette idée. J'ai appris à contrôler ma respiration, à repérer mon excitation plus tôt et à travailler avec mon corps au lieu de lutter contre lui. Ma mesure est passée de 2:11 à 4:46, mais ce que j'ai compris vaut sans doute plus que le chiffre.",
    },
  },
  {
    id: "cm-be",
    country: "CM",
    name: "B.E.",
    plan: "10",
    slots: ["more"],
    quote: {
      en: "I had never tracked my sexual performance before, so Day 1 was basically the first time I had an honest baseline. I got 1:45. After the training period I measured again and reached 4:09. Seeing the improvement made me realize that I had spent years assuming something was permanent when I had never actually tried training it properly.",
      fr: "Je n'avais jamais suivi ma performance sexuelle, donc le jour 1 a été la première fois que j'avais une base honnête. J'ai eu 1:45. Après la période d'entraînement, j'ai remesuré et je suis arrivé à 4:09. Voir cette progression m'a fait réaliser que j'avais passé des années à croire que c'était définitif, alors que je n'avais jamais vraiment essayé de l'entraîner correctement.",
    },
  },
  {
    id: "ga-mr",
    country: "GA",
    name: "M.R.",
    plan: "10",
    slots: ["more"],
    quote: {
      en: "The biggest change happened before I even took the final measurement. Around the middle of the program I noticed that I could tell when I was getting too close instead of realizing it at the last second. That made me feel more in control during intimacy. My final measurement moved from 1:56 to 4:21, which gave me something objective to compare with how I felt.",
      fr: "Le plus grand changement a eu lieu avant même la mesure finale. Vers le milieu du programme, j'ai remarqué que je sentais quand je m'approchais trop, au lieu de m'en rendre compte à la dernière seconde. Ça m'a donné plus de contrôle pendant l'intimité. Ma mesure est passée de 1:56 à 4:21, ce qui m'a donné quelque chose d'objectif à comparer avec ce que je ressentais.",
    },
  },
  {
    id: "cg-sb",
    country: "CG",
    name: "S.B.",
    plan: "10",
    slots: ["more"],
    quote: {
      en: "I bought the program for my husband because I knew the subject was bothering him even though he rarely admitted it. He did the first measurement alone, followed the training and repeated it at the end. His result improved, but the biggest difference for me was his attitude — he became less anxious and more willing to focus on what both of us actually wanted from intimacy.",
      fr: "J'ai acheté le programme pour mon mari parce que je savais que le sujet le travaillait, même s'il l'admettait rarement. Il a fait la première mesure seul, il a suivi l'entraînement et il l'a refaite à la fin. Son résultat s'est amélioré, mais pour moi la plus grande différence a été son attitude — il est devenu moins anxieux et plus disposé à s'occuper de ce qu'on voulait vraiment tous les deux.",
    },
  },
  {
    id: "cm-rn",
    country: "CM",
    name: "R.N.",
    plan: "10",
    slots: ["more"],
    quote: {
      en: "My biggest problem was confidence. Even before anything happened, I was already worrying about finishing too quickly, which obviously didn't help. I started at 1:31 and finished at 3:52 after completing the challenge. The number mattered, but the bigger win was no longer walking into intimacy already convinced that I was going to disappoint my partner.",
      fr: "Mon plus gros problème, c'était la confiance. Avant même que quoi que ce soit se passe, je m'inquiétais déjà de finir trop vite, ce qui n'aidait évidemment pas. J'ai commencé à 1:31 et fini à 3:52 après avoir terminé le défi. Le chiffre comptait, mais la vraie victoire, c'est de ne plus arriver dans l'intimité déjà convaincu que j'allais décevoir ma partenaire.",
    },
  },
  {
    id: "tg-sk",
    country: "TG",
    name: "S.K.",
    plan: "10",
    slots: ["more"],
    quote: {
      en: "I nearly stopped around day four because I was waiting for some dramatic feeling that told me the training was working. Then I realized the whole point was repetition and awareness, not a sensation during the exercise. I finished the ten days, compared my measurements and went from 1:48 to 4:03. That was when I understood why the program makes you track the process instead of relying on how you feel.",
      fr: "J'ai failli arrêter vers le quatrième jour parce que j'attendais une sensation forte qui me dise que l'entraînement marchait. Puis j'ai compris que tout reposait sur la répétition et la prise de conscience, pas sur une sensation pendant l'exercice. J'ai fini les dix jours, j'ai comparé mes mesures et je suis passé de 1:48 à 4:03. C'est là que j'ai compris pourquoi le programme fait suivre le processus plutôt que se fier au ressenti.",
    },
  },
  {
    id: "ml-at",
    country: "ML",
    name: "A.T.",
    plan: "10",
    slots: ["more"],
    quote: {
      en: "My husband was hesitant because he thought anything about sexual performance would involve medication or something complicated. I showed him METRON because it was short and private, and he agreed to give it ten days. He started around two minutes and improved his final measurement significantly. What I appreciated most was that the program didn't make the whole subject feel clinical or embarrassing.",
      fr: "Mon mari hésitait parce qu'il pensait que tout ce qui touche à la performance sexuelle impliquait des médicaments ou quelque chose de compliqué. Je lui ai montré METRON parce que c'était court et discret, et il a accepté d'y consacrer dix jours. Il a commencé autour de deux minutes et a nettement amélioré sa mesure finale. Ce que j'ai le plus apprécié, c'est que le programme n'a rendu le sujet ni clinique ni gênant.",
    },
  },
  {
    id: "gh-no",
    country: "GH",
    name: "N.O.",
    plan: "10",
    slots: ["more"],
    quote: {
      en: "Day 1 was 2:36. By the final measurement I was at 5:08, but the journey between those two numbers is what made the difference for me. I learned that I was rushing through the early stages of arousal without even noticing it. Once I started slowing down, breathing properly and paying attention to the signals, control became something I could actually practice.",
      fr: "Le jour 1, c'était 2:36. À la mesure finale j'étais à 5:08, mais c'est le chemin entre ces deux chiffres qui a fait la différence pour moi. J'ai appris que je traversais les premières phases de l'excitation à toute vitesse sans même m'en rendre compte. Une fois que j'ai ralenti, que j'ai bien respiré et fait attention aux signaux, le contrôle est devenu quelque chose que je pouvais vraiment travailler.",
    },
  },
  {
    id: "sn-ml",
    country: "SN",
    name: "M.L.",
    plan: "10",
    slots: ["more"],
    quote: {
      en: "I took my first measurement privately at home and got 1:57. I didn't tell my girlfriend because I wanted to complete the program without putting pressure on myself. Ten days later I measured 4:25 and finally told her what I had been doing. Her reaction was supportive, but what mattered most was that I wasn't carrying the same embarrassment into the bedroom anymore.",
      fr: "J'ai pris ma première mesure chez moi, en privé, et j'ai eu 1:57. Je ne l'ai pas dit à ma copine parce que je voulais finir le programme sans me mettre la pression. Dix jours plus tard j'ai mesuré 4:25 et je lui ai enfin dit ce que je faisais. Elle a bien réagi, mais le plus important, c'est que je n'emportais plus la même gêne avec moi dans la chambre.",
    },
  },
  {
    id: "cm-dm",
    country: "CM",
    name: "D.M.",
    plan: "10",
    slots: ["more"],
    quote: {
      en: "I got 1:42 on my first measurement, and honestly I wasn't happy seeing it written down. The training helped me understand that I was often waiting until the last possible moment before trying to regain control. After ten days my measurement was 4:14. I came out of the program feeling like I understood my body rather than simply being frustrated by it.",
      fr: "J'ai eu 1:42 à ma première mesure, et honnêtement ça ne m'a pas fait plaisir de le voir écrit. L'entraînement m'a fait comprendre que j'attendais souvent le dernier moment possible avant d'essayer de reprendre le contrôle. Après dix jours, ma mesure était 4:14. Je suis sorti du programme avec l'impression de comprendre mon corps, au lieu d'en être simplement frustré.",
    },
  },
  {
    id: "ng-po",
    country: "NG",
    name: "P.O.",
    plan: "30",
    slots: ["more"],
    quote: {
      en: "I had spent years saying I was probably around two or three minutes, but I had never tested myself properly. METRON made me actually establish the baseline: 2:41. After completing the training and taking the final measurement, I got 5:03. I didn't consider the 10-day challenge the finish line; I moved into the 30-day program because I wanted to take that new level of control into actual sex.",
      fr: "J'ai passé des années à dire que je devais être autour de deux ou trois minutes, sans jamais me tester correctement. METRON m'a obligé à établir une vraie base : 2:41. Après l'entraînement et la mesure finale, j'ai eu 5:03. Je n'ai pas considéré le défi de 10 jours comme la ligne d'arrivée ; je suis passé au programme de 30 jours parce que je voulais emmener ce nouveau contrôle dans les vrais rapports.",
    },
  },
  {
    id: "ga-ny",
    country: "GA",
    name: "N.Y.",
    plan: "10",
    slots: ["more"],
    quote: {
      en: "My husband wasn't interested when I first showed him METRON because he assumed it would be another generic program. I left it alone and he eventually looked at it himself. After completing the challenge, he told me the biggest thing he had learned was how much earlier he could recognize when he was approaching the point where control became difficult. His confidence afterward was noticeable.",
      fr: "Mon mari n'était pas intéressé quand je lui ai montré METRON, il pensait que ce serait encore un programme générique. J'ai laissé tomber et il a fini par le regarder de lui-même. Après avoir terminé le défi, il m'a dit que ce qu'il avait le plus appris, c'était de reconnaître bien plus tôt le moment où le contrôle devenait difficile. Sa confiance après ça se voyait.",
    },
  },
  {
    id: "bj-gh",
    country: "BJ",
    name: "G.H.",
    plan: "30",
    slots: ["more"],
    quote: {
      en: "My first result was 2:22, but what bothered me more was how little I understood about why I was finishing when I did. The training gave me separate things to work on — breathing, pelvic-floor control, awareness and arousal management — rather than one vague instruction. I finished at 4:48 and decided to continue because I wanted those skills to become automatic instead of something I only practiced during the challenge.",
      fr: "Mon premier résultat était 2:22, mais ce qui me gênait le plus, c'était de si mal comprendre pourquoi je finissais à ce moment-là. L'entraînement m'a donné des choses distinctes à travailler — respiration, contrôle du plancher pelvien, prise de conscience et gestion de l'excitation — au lieu d'une consigne vague. J'ai fini à 4:48 et j'ai décidé de continuer, parce que je voulais que ces réflexes deviennent automatiques au lieu d'être pratiqués seulement pendant le défi.",
    },
  },
  {
    id: "cm-sp",
    country: "CM",
    name: "S.P.",
    plan: "10",
    slots: ["more"],
    quote: {
      en: "I went into METRON expecting the usual advice: relax, think about something else and try not to finish. Instead, the first thing I had to do was actually measure myself. I got 1:36, completed the training and reached 4:02 on the final measurement. For me the biggest surprise was realizing how much of the problem came from not understanding my own arousal.",
      fr: "J'ai abordé METRON en m'attendant aux conseils habituels : se détendre, penser à autre chose et essayer de ne pas finir. Au lieu de ça, la première chose à faire a été de me mesurer. J'ai eu 1:36, j'ai fait l'entraînement et j'ai atteint 4:02 à la mesure finale. La plus grande surprise pour moi a été de réaliser à quel point le problème venait de ne pas comprendre ma propre excitation.",
    },
  },
  {
    id: "ng-fi",
    country: "NG",
    name: "F.I.",
    plan: "30",
    slots: ["more"],
    quote: {
      en: "I enrolled my boyfriend because I could see that the issue was affecting his confidence even when he didn't say anything. He completed the ten days, took his final measurement and was genuinely proud of the progress. He then decided to continue with the 30-day program, and I think that was the first time I saw him treat sexual control as a skill he could develop rather than something he should feel ashamed about.",
      fr: "J'ai inscrit mon copain parce que je voyais que ça touchait sa confiance, même quand il ne disait rien. Il a fait les dix jours, pris sa mesure finale et il était vraiment fier de sa progression. Il a ensuite décidé de continuer avec le programme de 30 jours, et je crois que c'était la première fois que je le voyais traiter le contrôle sexuel comme une compétence à développer plutôt que comme une honte.",
    },
  },
  {
    id: "uk-daniel",
    country: "GB",
    name: "Daniel T.",
    plan: "30",
    slots: ["more"],
    quote: {
      en: "The biggest thing for me was learning to recognize the point where I was getting too close before it was too late. I'd spent years thinking control meant simply trying to hold everything back. The breathing and awareness work completely changed how I approached it. I finished the 10 days feeling much more in control, and I've continued with the longer program.",
      fr: "Le plus important pour moi a été d'apprendre à repérer le moment où je m'approchais trop, avant qu'il soit trop tard. J'avais passé des années à croire que le contrôle consistait juste à tout retenir. Le travail de respiration et de prise de conscience a complètement changé ma façon de l'aborder. J'ai fini les 10 jours en me sentant bien plus maître de moi, et j'ai continué avec le programme plus long.",
    },
  },
  {
    id: "ca-sophie",
    country: "CA",
    name: "Sophie M.",
    plan: "10",
    slots: ["more"],
    quote: {
      en: "I bought METRON for my boyfriend because he was clearly frustrated but didn't really want to talk about it. He did the first measurement privately and followed the program without me reminding him. By the end, he was noticeably more relaxed about sex and much more focused on my experience too. That was a bigger improvement to me than any number.",
      fr: "J'ai acheté METRON pour mon copain parce qu'il était clairement frustré mais n'avait pas vraiment envie d'en parler. Il a fait la première mesure en privé et il a suivi le programme sans que j'aie à le lui rappeler. À la fin, il était nettement plus détendu par rapport au sexe et beaucoup plus attentif à mon plaisir aussi. Pour moi, c'était un progrès plus grand que n'importe quel chiffre.",
    },
  },
  {
    id: "au-liam",
    country: "AU",
    name: "Liam C.",
    plan: "10",
    slots: ["more"],
    quote: {
      en: "I nearly didn't buy it because the whole “15 minutes a day” thing sounded too simple. But I figured I'd spent more money on things that did absolutely nothing, so I gave it ten days. The first measurement was 1:56 and the final one was 4:11. What impressed me wasn't just the increase — I actually understood what was happening in my body by the end.",
      fr: "J'ai failli ne pas l'acheter parce que ce truc de « 15 minutes par jour » me paraissait trop simple. Mais je me suis dit que j'avais dépensé plus pour des choses qui n'avaient absolument rien donné, alors je lui ai accordé dix jours. La première mesure était 1:56 et la dernière 4:11. Ce qui m'a impressionné, ce n'est pas seulement l'écart — à la fin, je comprenais vraiment ce qui se passait dans mon corps.",
    },
  },
  {
    id: "uk-amelia",
    country: "GB",
    name: "Amelia W.",
    plan: "10",
    slots: ["more"],
    quote: {
      en: "My partner had become quite anxious about finishing before either of us really got into the moment. I sent him METRON because I thought having something structured would be easier than another awkward conversation. He completed the challenge and started paying much more attention to the things that helped me get aroused first. Our conversations around sex became much easier afterward.",
      fr: "Mon partenaire était devenu assez anxieux à l'idée de finir avant qu'on soit vraiment dans le moment ni l'un ni l'autre. Je lui ai envoyé METRON en me disant qu'avoir quelque chose de structuré serait plus simple qu'une nouvelle conversation gênante. Il a terminé le défi et s'est mis à faire beaucoup plus attention à ce qui m'excitait en premier. Nos conversations autour du sexe sont devenues bien plus faciles ensuite.",
    },
  },
  {
    id: "us-chris",
    country: "US",
    name: "Chris D.",
    plan: "10",
    slots: ["more"],
    quote: {
      en: "I've tried supplements, watched videos and read enough Reddit threads to know there are a million opinions about this. METRON was different because it actually made me measure where I was starting from and then train specific skills. I went from 2:34 on my baseline to 5:01 on the final measurement. I didn't need another theory after that — I wanted to keep training.",
      fr: "J'ai essayé des compléments, regardé des vidéos et lu assez de discussions en ligne pour savoir qu'il existe un million d'avis là-dessus. METRON était différent parce qu'il m'a vraiment fait mesurer mon point de départ, puis travailler des compétences précises. Je suis passé de 2:34 à la mesure de départ à 5:01 à la mesure finale. Après ça, je n'avais plus besoin d'une théorie de plus — je voulais continuer à m'entraîner.",
    },
  },
  {
    id: "ca-alyssa",
    country: "CA",
    name: "Alyssa P.",
    plan: "10",
    slots: ["more"],
    quote: {
      en: "I enrolled my husband after he mentioned wanting to improve his stamina. He was skeptical at first and assumed I'd bought him another “fix.” Instead, the program had him actually track where he started and work on the underlying habits. By the end he was talking about arousal, breathing and control like things he could understand rather than something he was embarrassed about.",
      fr: "J'ai inscrit mon mari après qu'il ait dit vouloir améliorer son endurance. Il était sceptique au début et pensait que je lui avais acheté un énième « remède ». Au lieu de ça, le programme lui a fait noter son point de départ et travailler les habitudes de fond. À la fin, il parlait d'excitation, de respiration et de contrôle comme de choses qu'il pouvait comprendre, et non comme d'une gêne.",
    },
  },
  {
    id: "us-andre",
    country: "US",
    name: "Andre W.",
    plan: "30",
    slots: ["more"],
    quote: {
      en: "My first measurement was 1:31, and I wasn't thrilled about seeing it written down. The funny thing is that knowing the number actually made me less anxious because I finally had a starting point instead of just telling myself I was bad at sex. I completed the 10 days, got 3:57 on the second measurement and decided to continue with the 30-day program.",
      fr: "Ma première mesure était 1:31, et ça ne m'a pas enchanté de la voir écrite. Le plus drôle, c'est que connaître le chiffre m'a rendu moins anxieux, parce que j'avais enfin un point de départ au lieu de me répéter que j'étais mauvais au lit. J'ai fait les 10 jours, obtenu 3:57 à la deuxième mesure et décidé de continuer avec le programme de 30 jours.",
    },
  },
  {
    id: "fr-thomas",
    country: "FR",
    name: "Thomas L.",
    plan: "10",
    slots: ["more"],
    quote: {
      // Written in French. The English is the translation, not the other way
      // round.
      en: "I mostly thought I needed a quick fix, but METRON made me understand that control is something you work on. I started at around two minutes and, after the ten days, I was past four on my new measurement. The most important thing for me is the confidence I got back, and understanding my own arousal better.",
      fr: "Je pensais surtout avoir besoin d'une solution rapide, mais METRON m'a fait comprendre que le contrôle se travaille. J'ai commencé autour de deux minutes et, après les dix jours, j'étais à plus de quatre minutes lors de ma nouvelle mesure. Le plus important pour moi reste la confiance que j'ai retrouvée et le fait de mieux comprendre mon excitation.",
    },
  },
  {
    id: "nl-sophie",
    country: "NL",
    name: "Sophie V.",
    plan: "10",
    slots: ["more"],
    quote: {
      en: "I didn't buy this because my boyfriend was terrible in bed. I bought it because he wanted to feel more confident and I wanted something that could help him work on it without pressure. The partner section was actually my favorite part because it shifted the focus from simply “lasting longer” to making the whole experience better for both people.",
      fr: "Je n'ai pas acheté ça parce que mon copain était mauvais au lit. Je l'ai acheté parce qu'il voulait se sentir plus sûr de lui et que je voulais quelque chose qui l'aide à y travailler sans pression. La partie destinée au couple a été ma préférée, parce qu'elle déplace l'objectif : il ne s'agit plus seulement de « tenir plus longtemps » mais de rendre l'expérience meilleure pour les deux.",
    },
  },
  {
    id: "us-kevin",
    country: "US",
    name: "Kevin M.",
    plan: "10",
    slots: ["more"],
    quote: {
      en: "I started METRON after realizing I was spending more time worrying about how long I'd last than actually enjoying sex. My baseline was 2:05. I followed the daily exercises, learned to catch my arousal earlier and stopped treating every moment of intensity like an emergency. By day 10 I was at 4:44, but the confidence I gained was worth more than the stopwatch.",
      fr: "J'ai commencé METRON après avoir réalisé que je passais plus de temps à m'inquiéter de ma durée qu'à profiter du sexe. Ma mesure de départ était 2:05. J'ai suivi les exercices quotidiens, appris à repérer mon excitation plus tôt et arrêté de traiter chaque moment d'intensité comme une urgence. Au jour 10 j'étais à 4:44, mais la confiance que j'ai gagnée vaut plus que le chronomètre.",
    },
  },
  {
    id: "uk-james",
    country: "GB",
    name: "James P.",
    plan: "10",
    slots: ["more"],
    quote: {
      en: "I didn't tell my girlfriend I was doing the program. I wanted to see whether I could make changes without turning sex into some kind of performance project between us. After ten days I noticed I was calmer and more aware of what was happening instead of rushing through everything. She actually commented that I seemed different before I ever told her about METRON.",
      fr: "Je n'ai pas dit à ma copine que je faisais le programme. Je voulais voir si je pouvais changer des choses sans transformer le sexe en projet de performance entre nous. Après dix jours, j'ai remarqué que j'étais plus calme et plus conscient de ce qui se passait, au lieu de tout précipiter. Elle m'a d'ailleurs fait remarquer que j'étais différent avant même que je lui parle de METRON.",
    },
  },
  {
    id: "ca-ryan",
    country: "CA",
    name: "Ryan K.",
    plan: "30",
    slots: ["more"],
    quote: {
      en: "I finished the 10-day challenge and thought that would be enough. Then I looked at my baseline — 1:44 — beside my final measurement of 4:08 and realized I didn't want to lose that progress. I bought the 30-day program two days later because I wanted to move from practicing control on my own to being able to use it naturally with my partner.",
      fr: "J'ai fini le défi de 10 jours en pensant que ça suffirait. Puis j'ai regardé ma mesure de départ — 1:44 — à côté de ma mesure finale de 4:08 et j'ai compris que je ne voulais pas perdre ce progrès. J'ai acheté le programme de 30 jours deux jours plus tard, parce que je voulais passer du contrôle travaillé seul à un contrôle naturel avec ma partenaire.",
    },
  },
  {
    id: "us-monica",
    country: "US",
    name: "Monica J.",
    plan: "10",
    slots: ["more"],
    quote: {
      en: "My husband had always been uncomfortable talking about finishing too quickly, so I didn't want to make it feel like I was criticizing him. METRON gave him something private he could work through on his own. After the challenge he told me his measurement had improved significantly, but what I noticed was his confidence — he seemed much less worried about disappointing me and much more interested in making sure we both enjoyed ourselves.",
      fr: "Mon mari a toujours été mal à l'aise pour parler du fait de finir trop vite, donc je ne voulais pas que ça ressemble à une critique. METRON lui a donné quelque chose de privé, qu'il pouvait faire seul. Après le défi, il m'a dit que sa mesure s'était nettement améliorée, mais ce que j'ai remarqué, c'est sa confiance — il avait beaucoup moins peur de me décevoir et bien plus envie qu'on y prenne du plaisir tous les deux.",
    },
  },
  {
    id: "au-nathan",
    country: "AU",
    name: "Nathan S.",
    plan: "10",
    slots: ["more"],
    quote: {
      en: "The first time I measured, I got 2:18. Ten days later I was at 4:52, but the number isn't the only reason I recommend the training. Somewhere around the middle of the program I stopped thinking of control as something I either had or didn't have. I started seeing it as a skill I could practice, improve and eventually carry into real sex.",
      fr: "La première fois que j'ai mesuré, j'ai eu 2:18. Dix jours plus tard j'étais à 4:52, mais le chiffre n'est pas la seule raison pour laquelle je recommande cet entraînement. Vers le milieu du programme, j'ai arrêté de voir le contrôle comme quelque chose qu'on a ou qu'on n'a pas. J'ai commencé à le voir comme une compétence qu'on peut travailler, améliorer et finir par emmener dans les vrais rapports.",
    },
  },
];

/** Everything cleared for one position on the page, in order. */
export function getTestimonials(locale: string, slot: Slot) {
  const lang = locale === "fr" ? "fr" : "en";
  return TESTIMONIALS.filter((t) => t.slots.includes(slot)).map((t) => ({
    id: t.id,
    country: t.country,
    name: t.name,
    plan: t.plan,
    quote: t.quote[lang],
    video: t.video,
  }));
}

/**
 * A country's flag from its code, built out of regional indicator letters —
 * so there is no image to ship, no sprite sheet to keep in step, and no
 * request to make. CM -> the two letters at U+1F1E6 + offset.
 */
export function flagOf(country: string): string {
  const cc = country.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return "";
  return String.fromCodePoint(
    ...[...cc].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65),
  );
}
