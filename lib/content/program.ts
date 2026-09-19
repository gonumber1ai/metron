import type { Locale } from "@/lib/i18n";
import { getProtocol, type ProtocolDay, type SessionSpec } from "./protocol";
import { getLessons, type Lesson } from "./lessons";

/**
 * THE PROGRAM — what the app serves.
 *
 * The raw content sits in protocol.{en,fr}.ts and lessons.{en,fr}.ts, and a
 * copy of it as prose in content/program-source.md. Neither is served. This
 * file reads them and applies every edit in Section 6 of the build brief, in
 * code, so each one is a line that can be pointed at rather than a change
 * lost inside a 1,000-line rewrite. The voice is untouched; the claims are.
 *
 * ── THE SHAPE THE APP WANTS ───────────────────────────────────────────────
 * A day is at most three checklist items — the session (or rest), sleep,
 * markers — with the lesson folded into the session and the pelvic-floor
 * work as a secondary line, never a fourth box. Day 0 is gone. Day 11 exists
 * for the 36-hour gap but is not a row. Day 1 is the free flow and ends at
 * the paywall.
 */

export type Task = { key: "session" | "rest" | "sleep" | "markers"; label: string; detail?: string; fixed?: boolean };

export type ProgramDay = {
  day: number;
  kind: "day1" | "training" | "rest" | "retest";
  phase: string;
  /** one line, the Program tab row */
  title: string;
  /** one line, the Today header */
  focus: string;
  /** the written part, read inside the session */
  brief: string[];
  session?: SessionSpec;
  /** slug in lessons — rendered as step 1 of the session runner */
  lesson?: string;
  /** "Pelvic floor: 3 sets of 10, twice today" under the session task */
  kegels: boolean;
  tasks: Task[];
  /** Day 11 — scheduled, never shown */
  hidden?: boolean;
  /** the 30-day tab groups by this */
  group?: string;
};

export type Program = {
  days: ProgramDay[];
  lessons: Lesson[];
  /** the three we ask every day */
  essentials: { id: string; label: string; detail: string }[];
  /** read once — the old daily rules, as guidance */
  foundations: { id: string; label: string; detail: string; regional?: boolean }[];
  foundationsIntro: string[];
};

export const TEST_LAST_DAY = 12;
export const SPRINT_LAST_DAY = 30;
export const PRICE_P10 = Number(process.env.NEXT_PUBLIC_PRICE_P10 ?? 4900);
export const PRICE_P30 = Number(process.env.NEXT_PUBLIC_PRICE_P30 ?? 15000);

/* ── 6.4 final one-line day titles ─────────────────────────────────────── */
const TITLES: Record<Locale, Record<number, string>> = {
  en: {
    1: "Understand your starting point",
    2: "Recognize your arousal signals",
    3: "Build control through practice",
    4: "Hold without gripping",
    5: "Rest (and why this is a drill, not a habit)",
    6: "Longer holds",
    7: "Change the stimulation, keep the control",
    8: "Mid-point check",
    9: "Rest",
    10: "Finish on your own terms",
    12: "Measure again and review",
  },
  fr: {
    1: "Comprendre votre point de départ",
    2: "Reconnaître vos signaux d'excitation",
    3: "Construire le contrôle par la pratique",
    4: "Tenir sans serrer",
    5: "Repos (et pourquoi c'est un exercice, pas une habitude)",
    6: "Tenir plus longtemps",
    7: "Changer la stimulation, garder le contrôle",
    8: "Point d'étape",
    9: "Repos",
    10: "Finir quand vous le décidez",
    12: "Mesurer à nouveau et faire le bilan",
  },
};

/* ── 5.7 the 30-day groups ─────────────────────────────────────────────── */
const GROUPS: Record<Locale, [number, number, string][]> = {
  en: [
    [13, 15, "Find your bottleneck and release"],
    [16, 18, "Structured training begins"],
    [19, 22, "Load"],
    [23, 27, "Partner phase"],
    [28, 30, "Final measurement and maintenance"],
  ],
  fr: [
    [13, 15, "Trouver votre blocage et relâcher"],
    [16, 18, "L'entraînement structuré commence"],
    [19, 22, "Charge"],
    [23, 27, "Phase avec partenaire"],
    [28, 30, "Mesure finale et maintien"],
  ],
};

/* ── 6.2 / 6.3 string edits, EN. FR carries TODO_FR where no equivalent
   pattern exists yet; the structural edits apply to both. ────────────── */
const EDITS: [RegExp, string][] = [
  // 6.3 soften
  [/It works in seconds and requires nothing\./g, "It works fast and costs nothing."],
  [/Why pills make it worse/g, "Pills, sprays and 'herbal' products"],
  // 6.2 message us → Help & Support
  [/stop and message us/g, "stop and use Help & Support in the menu"],
  [/message us\b/g, "use Help & Support in the menu"],
  /* Population claims ("most men…", "often within the first week", the
     stomach-as-bottleneck line) STAY. The owner has the numbers behind
     them, so 6.2's "no user-population statistics" does not apply here —
     that rule was written for claims nobody could back. */
  // 6.2 the 48h rule as a gate, and abstinence
  [/2 days since you last came\. This is the one men get wrong most\. Three days of build-up before Day 12 against two hours before Day 1 will give you a shorter Day 12 and a false conclusion\. Same gap both times\./, "Note how long since you last finished. The measure screen asks; answer the same way on Day 12 as on Day 1 so the two numbers compare fairly."],
  [/ If you have a partner, sex replaces a session rather than being added to one\./, ""],
  [/This is your last ejaculation before the retest\. The 48-hour window starts the moment you finish\./, "Finish, and let the session end there."],
  [/Important: this is your LAST time before Day 12\. Your 2 clear days start the moment you finish\. Nothing tomorrow\./, "Tomorrow is a rest day. Day 12 you measure again — same way as Day 1."],
  [/Nothing today\. No session, no coming, no alcohol\./g, "Nothing today. No session."],
  [/No ejaculation from tonight\. The window opens\./, "The window opens. Rest and protect the measurement."],
  [/From tonight, no coming\. Your 2 clear days for the final measurement start now\./, "Your final measurement is in two days. Rest, sleep, and keep the foundations."],
  // 6.2 refund tied to the number
  [/ — and it is what the refund is judged on/g, ""],
  [/and neither does the refund\./g, ""],
  [/Otherwise the two numbers mean nothing\./g, "Otherwise the two numbers mean nothing."],
];

function edit(s: string): string {
  let out = s;
  for (const [re, to] of EDITS) out = out.replace(re, to);
  return out;
}
const editAll = (xs: string[]) => xs.map(edit);
function editSession(s?: SessionSpec): SessionSpec | undefined {
  if (!s) return s;
  return { ...s, steps: editAll(s.steps), ending: edit(s.ending), guard: s.guard ? edit(s.guard) : undefined, ceiling: edit(s.ceiling) };
}

/* ── 6.1 the Day 2 paragraph, and the Day 1 closing copy ───────────────── */
const DAY2_PARA: Record<Locale, string> = {
  en: "These sessions are training, not a pastime. You do them when the app schedules them, for the time it says, and you stop. Doing extra doesn't get you there faster — it does the opposite, because it trains the reaction you're trying to undo.",
  fr: "Ces séances sont un entraînement, pas un passe-temps. Vous les faites quand l'application les programme, le temps qu'elle indique, et vous arrêtez. En faire plus ne vous y amène pas plus vite — c'est l'inverse, parce que ça entraîne la réaction que vous essayez de défaire.",
};
export const DAY1_CLOSE: Record<Locale, string[]> = {
  en: [
    "Your number is decided by one thing: how late you notice you're close. Most of the end happens between 6 and 9 on this scale, and if you've never felt 6, the finish arrives with no warning.",
    "Days 2–10 teach you to feel 6. That's the whole skill.",
  ],
  fr: [
    "Votre chiffre dépend d'une seule chose : à quel point vous remarquez tard que vous êtes proche. L'essentiel de la fin se joue entre 6 et 9 sur cette échelle, et si vous n'avez jamais senti 6, la fin arrive sans prévenir.",
    "Les jours 2 à 10 vous apprennent à sentir 6. C'est toute la compétence.",
  ],
};
const DAY10_DONE: Record<Locale, string> = {
  en: "Tomorrow is a rest day. Day 12 you measure again — same way as Day 1.",
  fr: "Demain est un jour de repos. Le jour 12, vous mesurez à nouveau — de la même façon que le jour 1.",
};

const T = {
  en: {
    session: "Training session",
    sessionD1: "Today's session (~10 min)",
    sessionD1d: "Breathing, measurement, and why you finish when you do",
    rest: "No training session today. Rest is part of the protocol.",
    sleep: "Get good sleep",
    sleepD: "7–8 hours tonight",
    markers: "Log your daily markers",
    markersD: "1 minute before bed",
    kegels: "Pelvic floor: 3 sets of 10, twice today",
    read: "Read",
    retest: "Measure again",
    retestD: "Same way as Day 1",
    d1title: "Understand your starting point",
    d1focus: "A short session to measure, and set the foundation for your progress.",
    d12focus: "Same way as Day 1. Then read the two numbers side by side.",
    ess: [
      { id: "sleep", label: "Get good sleep", detail: "7–8 hours, same time every night. Sleep controls your testosterone, your erections, and how jumpy your nervous system is. Phone down for the last 30 minutes." },
      { id: "markers", label: "Log your markers", detail: "60 seconds before bed. It's how you see progress on the days the clock hasn't moved yet." },
      { id: "alcohol", label: "No alcohol on measurement days", detail: "Day 1, Day 12 and Day 30. It changes the number. The rest of the time it's your call; it does ruin sleep." },
    ],
    stomach: { id: "stomach", label: "Watch your stomach", detail: "Burning, reflux, bloating, nausea, appetite that comes and goes — persistent gut symptoms wreck sleep and energy. Track it in the weekly markers. If it does not settle in a couple of weeks, see a doctor." },
    fIntro: ["Read this once. It is the base everything else sits on, and it is the part most often skipped.", "It is not a diet. You are not cutting anything. You are fixing fuel, blood flow and sleep — the three things that decide what you have left at 11pm."],
  },
  fr: {
    session: "Séance d'entraînement",
    sessionD1: "La séance du jour (~10 min)",
    sessionD1d: "Respiration, mesure, et pourquoi vous finissez quand vous finissez",
    rest: "Pas de séance aujourd'hui. Le repos fait partie du protocole.",
    sleep: "Bien dormir",
    sleepD: "7–8 heures cette nuit",
    markers: "Noter vos marqueurs du jour",
    markersD: "1 minute avant de dormir",
    kegels: "Plancher pelvien : 3 séries de 10, deux fois aujourd'hui",
    read: "Lire",
    retest: "Mesurer à nouveau",
    retestD: "De la même façon que le jour 1",
    d1title: "Comprendre votre point de départ",
    d1focus: "Une courte séance pour mesurer, et poser la base de votre progression.",
    d12focus: "Comme le jour 1. Puis lisez les deux chiffres côte à côte.",
    ess: [
      { id: "sleep", label: "Bien dormir", detail: "7–8 heures, à la même heure chaque nuit. Le sommeil commande votre testostérone, vos érections et la nervosité de votre système nerveux. Téléphone posé les 30 dernières minutes." },
      { id: "markers", label: "Noter vos marqueurs", detail: "60 secondes avant de dormir. C'est comme ça que vous voyez les progrès les jours où le chrono n'a pas encore bougé." },
      { id: "alcohol", label: "Pas d'alcool les jours de mesure", detail: "Jour 1, jour 12 et jour 30. Ça change le chiffre. Le reste du temps, c'est vous qui voyez ; ça abîme le sommeil." },
    ],
    stomach: { id: "stomach", label: "Surveillez votre estomac", detail: "Brûlures, reflux, ballonnements, nausées, appétit qui va et vient — des symptômes digestifs persistants ruinent le sommeil et l'énergie. Suivez-les dans les marqueurs hebdomadaires. Si ça ne se calme pas en deux semaines, consultez un médecin." },
    fIntro: ["À lire une fois. C'est la base sur laquelle tout le reste repose, et c'est la partie la plus souvent sautée.", "Ce n'est pas un régime. Vous ne supprimez rien. Vous réparez le carburant, la circulation et le sommeil — les trois choses qui décident de ce qu'il vous reste à 23h."],
  },
};
type Strings = (typeof T)["en"];

function tasksFor(kind: ProgramDay["kind"], t: Strings, sessionLabel: string, sessionDetail?: string): Task[] {
  const first: Task =
    kind === "rest"
      ? { key: "rest", label: t.rest, fixed: true }
      : kind === "day1"
        ? { key: "session", label: t.sessionD1, detail: t.sessionD1d }
        : kind === "retest"
          ? { key: "session", label: t.retest, detail: t.retestD }
          : { key: "session", label: sessionLabel, detail: sessionDetail };
  return [first, { key: "sleep", label: t.sleep, detail: t.sleepD }, { key: "markers", label: t.markers, detail: t.markersD }];
}

export function getProgram(locale: Locale | string): Program {
  const loc: Locale = locale === "fr" ? "fr" : "en";
  const t: Strings = T[loc];
  const src = getProtocol(loc);
  const titles = TITLES[loc];
  const groups = GROUPS[loc];
  const groupOf = (d: number) => groups.find(([a, b]) => d >= a && d <= b)?.[2];

  const days: ProgramDay[] = [];
  for (const d of src.days as ProtocolDay[]) {
    if (d.day === 0) continue; // 6.1 — deleted; its lesson and stomach note move
    const isRest = d.kind === "rest";

    if (d.day === 1) {
      days.push({
        day: 1, kind: "day1", phase: d.phase ?? "", title: t.d1title, focus: t.d1focus,
        brief: [], lesson: "the-6-10-method", kegels: false, // 6.1 — the free flow; kegels start Day 3
        tasks: tasksFor("day1", t, ""),
      });
      continue;
    }
    if (d.day === 11) {
      days.push({ day: 11, kind: "rest", phase: d.phase ?? "", title: "", focus: "", brief: [], kegels: true, tasks: tasksFor("rest", t, ""), hidden: true });
      continue;
    }
    if (d.day === 12) {
      days.push({
        day: 12, kind: "retest", phase: d.phase ?? "", title: titles[12], focus: t.d12focus,
        brief: editAll(d.brief.filter((s) => !/4 checks|four test conditions/i.test(s))), lesson: "reading-your-result", kegels: true,
        tasks: tasksFor("retest", t, ""),
      });
      continue;
    }

    // 6.1 lesson moves: not-a-habit Day 9 → Day 5; Day 9 none; Day 2 recap only
    let lesson = d.lesson;
    if (d.day === 5) lesson = "not-a-habit";
    if (d.day === 9) lesson = undefined;
    if (d.day === 2) lesson = undefined;
    // the pills lesson used to be Day 5; it stays in the library from Day 5

    let brief = editAll(d.brief);
    if (d.day === 2) brief = [DAY2_PARA[loc], ...brief];
    if (d.day === 10) brief = brief.map((s) => (/Tomorrow is a rest day/.test(s) ? DAY10_DONE[loc] : s));

    const session = editSession(d.session);
    const sessionLabel = session ? `${t.session} — ${session.title} (~${session.duration.replace(/ minutes?/, " min")})` : t.session;

    days.push({
      day: d.day,
      kind: isRest ? "rest" : "training",
      phase: d.phase ?? "",
      title: titles[d.day] ?? d.title,
      focus: edit(d.focus),
      brief,
      session,
      lesson,
      kegels: d.day >= 3, // 6.1 — kegels start Day 3
      tasks: tasksFor(isRest ? "rest" : "training", t, sessionLabel),
      group: d.day >= 13 ? groupOf(d.day) : undefined,
    });
  }

  // lessons: edits applied, pills renamed, why-you-finish-fast open from Day 1
  const lessons = getLessons(loc).map((l) => {
    const body = editAll(l.body);
    let title = edit(l.title);
    let unlockDay = l.unlockDay;
    if (l.slug === "why-you-finish-fast") unlockDay = 1;
    if (l.slug === "the-6-10-method") unlockDay = 1;
    if (l.slug === "not-a-habit") unlockDay = 5;
    if (l.slug === "why-pills-fail") {
      // 6.3 — the prescribed-medication exception moves to the top
      const i = body.findIndex((p) => /prescri/i.test(p));
      if (i > 0) body.unshift(...body.splice(i, 1));
    }
    return { ...l, title, body, unlockDay };
  });

  // 5.12 — Essentials (three) and Foundations (the old rules as guidance)
  const dropped = new Set(["alcohol", "screens", "discipline", "log", "sleep"]);
  const foundations = src.rules
    .filter((r) => !dropped.has(r.id))
    .map((r) => ({ id: r.id, label: edit(r.label), detail: edit(r.detail), regional: r.regional }));
  foundations.push({ ...t.stomach, regional: undefined });

  return { days, lessons, essentials: [...t.ess], foundations, foundationsIntro: [...t.fIntro] };
}

export function getProgramDay(locale: Locale | string, day: number): ProgramDay | undefined {
  return getProgram(locale).days.find((d) => d.day === day);
}

/** Rows for the Program tab: Days 1–10 and Day 12. Day 11 is never a row. */
export function visibleDays(locale: Locale | string, plan: "p10" | "p30"): ProgramDay[] {
  return getProgram(locale).days.filter((d) => !d.hidden && (plan === "p30" || d.day <= TEST_LAST_DAY));
}
