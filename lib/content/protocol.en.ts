import type { Protocol, ProtocolDay } from "./protocol-types";

/* ==================================================================
   THE EVERY-DAY FOUNDATION
   These run from Day 0 to the end. They are not optional and they are
   not the interesting part — they are the base everything else sits on.
   ================================================================== */

const rulesIntro = [
  "These happen every day, Day 0 to the end.",
  "This is the boring part. It is also the part most men skip, which is why most men stay where they are.",
  "It is not a diet. You are not cutting anything. You are fixing fuel, blood flow and sleep - the three things that decide what you have left at 11pm.",
];

const rules = [
  {
    id: "water",
    label: "Drink water all day",
    detail:
      "Half a litre every 4 hours, minimum. More when it is hot or you sweated a lot. After heavy sweating: a pinch of salt and a little sugar in one bottle. NO salt if you have high blood pressure, kidney or heart problems - and if you have never had your blood pressure checked, get it checked and drink plain water until you do.",
  },
  {
    id: "breakfast",
    label: "Real breakfast, 7-8am",
    detail:
      "Protein + a starch + fruit + some fat. Eggs, pap and banana. Eggs, bread and avocado. Oats with milk, fruit and groundnuts. Do not skip breakfast and then eat one big meal at 3pm - that is why you are finished by evening.",
    regional: true,
  },
  {
    id: "lunch",
    label: "Real lunch, around 12pm",
    detail:
      "Starch + protein + vegetables + fat. Rice alone is not lunch. Noodles alone is not lunch. If you eat rice or noodles, they come with eggs, fish, chicken, beef or beans, plus vegetables.",
    regional: true,
  },
  {
    id: "dinner",
    label: "Dinner, 5-6 hours before you sleep",
    detail:
      "Same as lunch. Early enough that you are not going to bed full. Sleep at 10pm, eat at 4-5pm. Sleep at midnight, 6-7pm is fine. The gap matters, not the clock.",
    regional: true,
  },
  {
    id: "snack",
    label: "2 bananas + a handful of tigernuts, 2 hours before bed",
    detail:
      "This stops hunger waking you at 3am. Tigernuts are heavy in fibre - if your stomach is already bad, start with ONE small handful a day, not four. If it makes the gas worse, stop them. They help; they are not the cure.",
    regional: true,
  },
  {
    id: "move",
    label: "Move 30-45 minutes",
    detail:
      "Walking, jogging, cycling, swimming, football. Any time of day. You are building blood flow, not destroying yourself. Walking counts. Every day.",
  },
  {
    id: "sleep",
    label: "7-8 hours, same time every night",
    detail:
      "This is the biggest one on the list and it is free. Sleep controls your testosterone, your erections, and how jumpy your nervous system is. Same bedtime. Phone down for the last 30 minutes.",
  },
  {
    id: "alcohol",
    label: "No alcohol for the 12 days",
    detail:
      "It ruins your sleep, your erections and your recovery, and it will mess up your measurement. Twelve days.",
  },
  {
    id: "screens",
    label: "No porn during the programme",
    detail:
      "Sessions are by hand, no screen. If your problem is conditioning, screens are training the exact thing you are trying to undo. This is not about morals. It is mechanical.",
  },
  {
    id: "discipline",
    label: "Only do the sessions the app gives you",
    detail:
      "At planned times. Nothing extra. No extra masturbation during the 12 days. If you have a partner, sex REPLACES a session, it does not get added on top. The goal is to stop needing this exercise. If you catch yourself looking forward to the session more than to sex, stop and message us.",
  },
  {
    id: "log",
    label: "Log your markers every night",
    detail:
      "60 seconds before bed. It is how you see progress on the days the clock has not moved yet - and those usually move first.",
  },
];

/* ==================================================================
   DAYS
   ================================================================== */

const days: ProtocolDay[] = [
  /* ---------------------------------------------------------- DAY 0 */
  {
    day: 0,
    kind: "reset",
    phase: "Foundation",
    title: "Reset",
    focus: "Clean the system. No training today.",
    lesson: "why-you-finish-fast",
    brief: [
      "Today you do nothing. No training.",
      "Tomorrow you get your number. That number decides everything, so tonight has to be clean.",
      "No alcohol. No drugs. Eat properly. Sleep a full night. And do not come tonight.",
      "The clock runs from the last time you finished, not from today. You need 48 clear hours before you measure, and today only gives you 24 of them. So if you finished today or yesterday, take the baseline a day later than planned.",
      "Nothing is lost by waiting. Day 1 is whenever your number is honest, and every day after it counts from there — there is no calendar here, only your days.",
      "One more job: watch your stomach today. Burning, gas, reflux, pain, no appetite. Note what you feel. It matters more than you think.",
    ],
    tasks: [
      { id: "d0-alcohol", kind: "foundation", label: "No alcohol, no recreational drugs today" },
      {
        id: "d0-abstain",
        kind: "foundation",
        label: "No ejaculation from now until you have measured",
        detail: "The baseline needs 48 clear hours behind it. Today gives you 24, so if you finished today or yesterday, wait one more day before you measure.",
      },
      { id: "d0-meals", kind: "foundation", label: "Three real meals, water through the day" },
      { id: "d0-sleep", kind: "foundation", label: "A full night of sleep, at a fixed time" },
      {
        id: "d0-stomach",
        kind: "foundation",
        label: "Note any stomach symptoms",
        detail: "Burning, reflux, nausea, bloating, poor appetite, recurring discomfort.",
      },
      { id: "d0-bp", kind: "medical", label: "Get your blood pressure checked this week if you never have" },
      { id: "d0-lesson", kind: "lesson", label: "Read: Why you finish fast" },
    ],
  },

  /* ---------------------------------------------------------- DAY 1 */
  {
    day: 1,
    kind: "baseline",
    phase: "Foundation",
    title: "Baseline",
    focus: "Get your number. Do not try to be impressive.",
    lesson: "how-to-measure",
    brief: [
      "Today you get your number.",
      "Do it normally. Do NOT try to last. Do not use any technique. A good number today only makes Day 12 look worse.",
      "Go to Measure. Tick the 4 checks. Hit START when you begin, STOP when you finish. The app keeps the number.",
      "If you cannot tick all four honestly, do not measure today — come back tomorrow. A number taken in the wrong conditions is worse than no number, because Day 12 gets compared against it.",
      "Most men do this alone. That is fine and that is what we expect. Just make sure Day 12 is done the same way.",
      "Then start your kegels tonight — 3 sets of 10, twice. Squeeze 5 seconds, let go 5 seconds. Letting go matters more than squeezing.",
    ],
    tasks: [
      {
        id: "d1-conditions",
        kind: "measure",
        label: "Confirm the three test conditions",
        detail: "2 days since you last came, no alcohol today, done the normal way with no technique. These are what make Day 12 comparable — the app explains why on the Measure screen.",
      },
      { id: "d1-mode", kind: "measure", label: "Choose your mode — solo or with a partner" },
      { id: "d1-measure", kind: "measure", label: "Take the baseline and record it" },
      {
        id: "d1-kegel",
        kind: "session",
        label: "Pelvic floor: 3 sets of 10, twice today",
        detail:
          "Contract 5 seconds, release 5 seconds. The release matters more than the squeeze. Sitting, lying or standing — nobody can tell you are doing it.",
      },
      { id: "d1-foundation", kind: "foundation", label: "Full foundation: meals, water, movement, sleep" },
      { id: "d1-log", kind: "measure", label: "Log tonight's markers" },
    ],
  },

  /* ---------------------------------------------------------- DAY 2 */
  {
    day: 2,
    kind: "training",
    phase: "Foundation",
    title: "First session",
    focus: "Learn the scale. Stop at 6.",
    lesson: "the-6-10-method",
    session: {
      title: "Stop-start — session 1",
      duration: "15 minutes",
      ceiling: "Stop at 6 out of 10. Never higher today.",
      cycles: "3 cycles",
      steps: [
        "Two minutes of slow breathing before you start. In through the nose for four, out through the mouth for six. You are lowering the level your nervous system begins from.",
        "Begin stimulation by hand. No screen, no phone.",
        "As arousal builds, name the number to yourself. Three. Four. Five. Say it, even silently — naming it is the skill you are building.",
        "At 6, stop completely. Hands off. Breathe out slowly and let the pelvic floor go soft. Do not squeeze to hold on — squeezing is the wrong pattern and it is the one that made this worse.",
        "Wait until it drops to about 3. From 6 that is usually 60 to 90 seconds. From 7 it is closer to 2 minutes. Do not watch the clock — go again only when the pulling feeling has completely gone.",
        "Three cycles, then end the session.",
      ],
      ending: "End without finishing today. This first session is about the scale, not release.",
      guard:
        "If you cross the point of no return by accident, that is information, not failure — your 6 was actually an 8. Aim lower next time.",
    },
    brief: [
      "Training starts today. This first session is not about lasting.",
      "It is about learning a number.",
      "Most men cannot feel the difference between 6 and 10. That is why the end arrives with no warning.",
      "So: 1 is nothing. 5 is turned on and comfortable. 6 is when it starts running by itself. 8 is hard work. 9 is too late.",
      "Today you live at 5 and 6. You never go near 9. Read the lesson first — it is short.",
    ],
    tasks: [
      { id: "d2-lesson", kind: "lesson", label: "Read: The 6/10 Method" },
      { id: "d2-session", kind: "session", label: "Stop-start session 1 — 15 minutes, 3 cycles, ceiling 6" },
      { id: "d2-kegel", kind: "session", label: "Pelvic floor: 3 sets of 10, twice" },
      { id: "d2-foundation", kind: "foundation", label: "Full foundation" },
      { id: "d2-log", kind: "measure", label: "Log tonight's markers" },
    ],
  },

  /* ---------------------------------------------------------- DAY 3 */
  {
    day: 3,
    kind: "training",
    phase: "Foundation",
    title: "Second session",
    focus: "Find the signals that come before the number.",
    lesson: "pelvic-floor",
    session: {
      title: "Stop-start — session 2",
      duration: "15 – 20 minutes",
      ceiling: "Stop at 6 or 7. Not 8.",
      cycles: "4 cycles",
      steps: [
        "Two minutes of breathing first, as yesterday.",
        "Hand only. Name the numbers on the way up.",
        "This session, notice what your body does just before each number. Breathing gets shallower. The pelvic floor tightens on its own. The stomach draws in. Toes curl. Everyone has a signature — find yours.",
        "Stop at 6 or 7. Release the pelvic floor deliberately, long exhale.",
        "Let it fall to 3, then restart. Four cycles.",
      ],
      ending: "End without finishing.",
      guard: "If your pelvic floor aches afterwards, you are gripping to hold on. Release harder, squeeze less.",
    },
    brief: [
      "Yesterday you learned the numbers. Today you learn the warning signs.",
      "Just before each number your body does something: breathing gets short, you tighten up down there without meaning to, your stomach pulls in, your toes curl.",
      "Find yours. Those signs arrive before the number does, and they buy you extra seconds.",
      "Today's lesson covers kegels properly. If you get aching down there, or you feel tight all the time, read it carefully — you need the opposite exercise.",
    ],
    tasks: [
      { id: "d3-lesson", kind: "lesson", label: "Read: The pelvic floor — contract and release" },
      { id: "d3-session", kind: "session", label: "Stop-start session 2 — 4 cycles, ceiling 6-7" },
      { id: "d3-kegel", kind: "session", label: "Pelvic floor: 3 sets of 10, twice" },
      { id: "d3-foundation", kind: "foundation", label: "Full foundation" },
      { id: "d3-log", kind: "measure", label: "Log tonight's markers" },
    ],
  },

  /* ---------------------------------------------------------- DAY 4 */
  {
    day: 4,
    kind: "training",
    phase: "Foundation",
    title: "Third session",
    focus: "Hold at 7 without gripping.",
    lesson: "breathing",
    session: {
      title: "Stop-start — session 3",
      duration: "20 minutes",
      ceiling: "7 out of 10.",
      cycles: "4 cycles, and hold at the top of each",
      steps: [
        "Breathing first. Two minutes.",
        "Build to 7, then instead of stopping dead, slow right down and stay at 7 for about ten seconds before stopping entirely.",
        "During those ten seconds: long exhale, pelvic floor completely soft, shoulders down. You are proving to yourself that high arousal does not have to mean losing control.",
        "Then stop, let it fall to 3, restart. Four cycles.",
      ],
      ending: "End without finishing.",
      guard:
        "If you cannot stay at 7 without clenching, you are at 8. Drop back to a clean stop at 6 for this session and try the hold again on Day 6.",
    },
    brief: [
      "Today you add the hold.",
      "Stopping dead teaches you to run away. Staying at 7 for 10 seconds teaches you to stay — which is what you actually need during sex.",
      "You stay there by relaxing, NOT by squeezing. If you are clamping down to survive it, you are training the wrong thing.",
      "Long breath out. Let everything go soft. Shoulders down.",
      "If you cannot do that, you are past 7. Drop back to 6.",
    ],
    tasks: [
      { id: "d4-lesson", kind: "lesson", label: "Read: Breathing and the nervous system" },
      { id: "d4-session", kind: "session", label: "Stop-start session 3 — 4 cycles with a 10-second hold at 7" },
      { id: "d4-kegel", kind: "session", label: "Pelvic floor: 3 sets of 10, twice" },
      { id: "d4-foundation", kind: "foundation", label: "Full foundation" },
      { id: "d4-log", kind: "measure", label: "Log tonight's markers" },
    ],
  },

  /* ---------------------------------------------------------- DAY 5 */
  {
    day: 5,
    kind: "rest",
    phase: "Foundation",
    title: "Rest",
    focus: "No session. Foundation only.",
    lesson: "why-pills-fail",
    brief: [
      "No session today. This is on purpose.",
      "Your body builds the skill on the rest days, not the training days. Men who train every single day get tight, go numb, and stall by week two.",
      "Everything else carries on: food, water, walking, sleep, kegels, and your markers tonight.",
      "Read today's lesson. If you use pills, sprays or alcohol, read it twice.",
    ],
    tasks: [
      { id: "d5-lesson", kind: "lesson", label: "Read: Why pills make it worse" },
      { id: "d5-norest", kind: "rest", label: "No stop-start session today" },
      { id: "d5-kegel", kind: "session", label: "Pelvic floor: 3 sets of 10, twice" },
      { id: "d5-foundation", kind: "foundation", label: "Full foundation" },
      { id: "d5-log", kind: "measure", label: "Log tonight's markers" },
    ],
  },

  /* ---------------------------------------------------------- DAY 6 */
  {
    day: 6,
    kind: "training",
    phase: "Foundation",
    title: "Fourth session",
    focus: "Longer holds. The scale should be getting automatic.",
    lesson: "sleep-and-food",
    session: {
      title: "Stop-start — session 4",
      duration: "20 minutes",
      ceiling: "7 out of 10.",
      cycles: "4 cycles, 20-second holds",
      steps: [
        "Breathing first.",
        "Build to 7. Hold for twenty seconds this time, slowed right down, floor soft.",
        "Stop, fall to 3, restart. Four cycles.",
        "On the last cycle, notice how long it takes to get from 5 to 7. Compare it to Day 2 — for most men it is already slower.",
      ],
      ending: "End without finishing.",
    },
    brief: [
      "Halfway. Holds get longer today — 20 seconds instead of 10.",
      "By now the numbers should be arriving on their own, without you working for it. That is the point.",
      "Watch one thing today: how long it takes you to get from 5 to 7. Compare it to Day 2. For most men it is already slower.",
      "That is your reflex changing. It usually shows up before the bedroom clock does.",
    ],
    tasks: [
      { id: "d6-lesson", kind: "lesson", label: "Read: Sleep, food and erection quality" },
      { id: "d6-session", kind: "session", label: "Stop-start session 4 — 4 cycles, 20-second holds" },
      { id: "d6-kegel", kind: "session", label: "Pelvic floor: 3 sets of 10, twice" },
      { id: "d6-foundation", kind: "foundation", label: "Full foundation" },
      { id: "d6-log", kind: "measure", label: "Log tonight's markers" },
    ],
  },

  /* ---------------------------------------------------------- DAY 7 */
  {
    day: 7,
    kind: "training",
    phase: "Foundation",
    title: "Fifth session",
    focus: "Change the stimulation. Keep the control.",
    lesson: "the-stomach-connection",
    session: {
      title: "Stop-start — session 5",
      duration: "20 minutes",
      ceiling: "7 out of 10.",
      cycles: "4 cycles, varied",
      steps: [
        "Breathing first.",
        "This session, vary the stimulation between cycles — change grip, change speed, change pressure. Control that only works with one exact technique is not control.",
        "Build to 7, hold twenty seconds, stop, fall to 3, restart.",
        "Four cycles.",
      ],
      ending: "End without finishing.",
      guard: "Varying the stimulation will make it harder. That is the point. Drop your ceiling to 6 if you need to.",
    },
    brief: [
      "Control that only works one way is not control.",
      "So today you change things on purpose — different grip, different speed, different pressure between cycles.",
      "It will be harder than yesterday. You may need to drop your ceiling to 6. That is not going backwards.",
      "Today's lesson is about your stomach. Strange topic, but for some men it is the whole problem.",
    ],
    tasks: [
      { id: "d7-lesson", kind: "lesson", label: "Read: The stomach connection" },
      { id: "d7-session", kind: "session", label: "Stop-start session 5 — 4 cycles, varied stimulation" },
      { id: "d7-kegel", kind: "session", label: "Pelvic floor: 3 sets of 10, twice" },
      { id: "d7-foundation", kind: "foundation", label: "Full foundation" },
      { id: "d7-log", kind: "measure", label: "Log tonight's markers" },
    ],
  },

  /* ---------------------------------------------------------- DAY 8 */
  {
    day: 8,
    kind: "training",
    phase: "Foundation",
    title: "Sixth session and the mid-point check",
    focus: "Look at your markers. Something has usually moved.",
    session: {
      title: "Stop-start — session 6",
      duration: "20 minutes",
      ceiling: "7, and one cycle to 8 if it is genuinely controlled.",
      cycles: "5 cycles",
      steps: [
        "Breathing first.",
        "Four cycles as on Day 7 — build to 7, hold twenty seconds, stop, fall to 3.",
        "On the fifth cycle only, if and only if 7 feels genuinely comfortable, allow yourself to touch 8 and then bring it straight back down.",
        "If 8 feels anything like a scramble, do not go there. Stay at 7. There is no prize for rushing this.",
      ],
      ending: "End without finishing.",
    },
    brief: [
      "Before you train today, open Progress and look at your markers.",
      "The clock is usually the LAST thing to move. Energy, sleep, morning erections, and how much control you feel — those move first, often by day 6 or 7.",
      "If those lines are going up, it is working. Keep going.",
      "If absolutely nothing has moved, message us. It is usually one of three things: you are skipping the food and sleep, you are training too high, or something physical needs a doctor.",
    ],
    tasks: [
      { id: "d8-review", kind: "measure", label: "Open Progress and look at your markers since Day 1" },
      { id: "d8-session", kind: "session", label: "Stop-start session 6 — 5 cycles" },
      { id: "d8-kegel", kind: "session", label: "Pelvic floor: 3 sets of 10, twice" },
      { id: "d8-foundation", kind: "foundation", label: "Full foundation" },
      { id: "d8-log", kind: "measure", label: "Log tonight's markers" },
    ],
  },

  /* ---------------------------------------------------------- DAY 9 */
  {
    day: 9,
    kind: "rest",
    phase: "Foundation",
    title: "Rest",
    focus: "No session. Let it consolidate.",
    lesson: "not-a-habit",
    brief: [
      "Second rest day. No session.",
      "Food, water, walking, sleep, kegels and markers carry on as normal.",
      "Read today's lesson. It is short. It is about not letting this exercise turn into a habit of its own.",
    ],
    tasks: [
      { id: "d9-lesson", kind: "lesson", label: "Read: This is a drill, not a habit" },
      { id: "d9-norest", kind: "rest", label: "No stop-start session today" },
      { id: "d9-kegel", kind: "session", label: "Pelvic floor: 3 sets of 10, twice" },
      { id: "d9-foundation", kind: "foundation", label: "Full foundation" },
      { id: "d9-log", kind: "measure", label: "Log tonight's markers" },
    ],
  },

  /* --------------------------------------------------------- DAY 10 */
  {
    day: 10,
    kind: "training",
    phase: "Foundation",
    title: "Final session",
    focus: "Finish on your own terms, deliberately.",
    session: {
      title: "Stop-start — session 7, the last of the sprint",
      duration: "20 minutes",
      ceiling: "7, then a deliberate finish.",
      cycles: "4 cycles, then choose the moment",
      steps: [
        "Breathing first.",
        "Four full cycles — build to 7, hold, stop, fall to 3.",
        "After the fourth cycle, finish deliberately. Not by accident, not by losing control — you decide the moment and then you go there.",
        "This is the half of the skill you will actually use with a partner: not avoiding the finish forever, but choosing when it happens.",
      ],
      ending: "Finish, deliberately and on your own timing.",
      guard: "This is your last ejaculation before the retest. The 48-hour window starts the moment you finish.",
    },
    brief: [
      "Last session of the sprint. This one ends differently.",
      "Every session so far ended without finishing. Today you finish on purpose — you pick the moment, then you go.",
      "That is the half you will actually use with a partner. A man who can only avoid it has not fixed anything.",
      "Important: this is your LAST time before Day 12. Your 2 clear days start the moment you finish. Nothing tomorrow.",
    ],
    tasks: [
      { id: "d10-session", kind: "session", label: "Stop-start session 7 — 4 cycles, then a deliberate finish" },
      { id: "d10-kegel", kind: "session", label: "Pelvic floor: 3 sets of 10, twice" },
      { id: "d10-foundation", kind: "foundation", label: "Full foundation" },
      { id: "d10-log", kind: "measure", label: "Log tonight's markers" },
    ],
  },

  /* --------------------------------------------------------- DAY 11 */
  {
    day: 11,
    kind: "rest",
    phase: "Foundation",
    title: "Rest before the retest",
    focus: "Nothing today. Protect the measurement.",
    brief: [
      "Nothing today. No session, no coming, no alcohol.",
      "This day exists to keep tomorrow's number honest.",
      "Keep eating, drinking water and walking. Sleep properly tonight — that alone changes tomorrow's result.",
      "Tomorrow: same way you did Day 1. Same 4 checks. Do not change the method to make the number look better.",
    ],
    tasks: [
      { id: "d11-nothing", kind: "rest", label: "No session, no ejaculation, no alcohol" },
      { id: "d11-kegel", kind: "session", label: "Pelvic floor: 3 sets of 10, twice" },
      { id: "d11-foundation", kind: "foundation", label: "Full foundation" },
      { id: "d11-sleep", kind: "foundation", label: "Protect tonight's sleep especially" },
      { id: "d11-log", kind: "measure", label: "Log tonight's markers" },
    ],
  },

  /* --------------------------------------------------------- DAY 12 */
  {
    day: 12,
    kind: "retest",
    phase: "Foundation",
    title: "Retest",
    focus: "Same conditions. Same mode. Get the number.",
    lesson: "reading-your-result",
    brief: [
      "Today you measure again.",
      "Same way as Day 1. Same 4 checks. Same solo or partner — do not switch.",
      "Do NOT use the technique during the test. No stopping and starting. You are measuring what your body does by itself now.",
      "Hit START when you begin, STOP when you finish. Then look at the two numbers.",
      "Read the lesson after, whatever happened. There are 4 possible results and 3 of them are good news.",
    ],
    tasks: [
      { id: "d12-conditions", kind: "measure", label: "Confirm the four test conditions — same as Day 1" },
      { id: "d12-measure", kind: "measure", label: "Take the retest and record it" },
      { id: "d12-compare", kind: "measure", label: "Look at your two numbers side by side" },
      { id: "d12-lesson", kind: "lesson", label: "Read: How to read your result" },
      { id: "d12-log", kind: "measure", label: "Log tonight's markers" },
    ],
  },

  /* ================================================================
     THE 30-DAY SPRINT — days 13 to 30
     ================================================================ */

  /* --------------------------------------------------------- DAY 13 */
  {
    day: 13,
    kind: "review",
    phase: "Find the bottleneck",
    title: "Where you actually are",
    focus: "Decide what is limiting you before you train harder.",
    lesson: "finding-the-bottleneck",
    brief: [
      "Second half. It is not just more of the same.",
      "The first 12 days built control on your own. The next 18 do two things that block does not: heavier loading, and moving it into real sex with a partner.",
      "Before that, today you find out what is holding you back. Look at your two numbers and your markers.",
      "Number moved + markers up? You just need more of the same. Straight into loading tomorrow.",
      "Markers up but clock barely moved? Your base is fixing, the reflex is behind. Same route, slower.",
      "Nothing moved at all? Stop. Go get the blood tests below before another session.",
    ],
    tasks: [
      { id: "d13-review", kind: "measure", label: "Review both numbers and every marker trend" },
      { id: "d13-lesson", kind: "lesson", label: "Read: Finding your bottleneck" },
      {
        id: "d13-labs",
        kind: "medical",
        label: "If nothing moved: book bloodwork this week",
        detail:
          "Blood pressure, fasting glucose or HbA1c, full blood count, ferritin, vitamin D, B12, thyroid function, and testosterone if your symptoms warrant it. Take this list with you.",
      },
      {
        id: "d13-gastric",
        kind: "medical",
        label: "If your stomach never settled: raise it with a doctor",
        detail:
          "Persistent burning, reflux or bloating deserves proper assessment rather than another protocol.",
      },
      { id: "d13-foundation", kind: "foundation", label: "Full foundation continues" },
      { id: "d13-log", kind: "measure", label: "Log tonight's markers" },
    ],
  },

  /* --------------------------------------------------------- DAY 14 */
  {
    day: 14,
    kind: "training",
    phase: "Find the bottleneck",
    title: "Release work",
    focus: "Undo the tension the first twelve days may have built.",
    lesson: "reverse-kegels",
    session: {
      title: "Release session",
      duration: "15 minutes",
      ceiling: "No arousal work today.",
      cycles: "Breathing and release only",
      steps: [
        "Lie on your back, knees bent, one hand on your belly.",
        "Breathe into the hand — the belly rises, the chest stays still. Ten slow breaths.",
        "Reverse kegel: on each exhale, gently push down and out rather than pulling up. It is the sensation of the pelvic floor lengthening, not tightening. Ten repetitions.",
        "Then ten cycles of a five-second contraction followed by a fifteen-second release. Three times as long letting go as holding on.",
        "Finish with two minutes of breathing and nothing else.",
      ],
      ending: "No arousal, no finish. This is maintenance.",
    },
    brief: [
      "No arousal work today. Today you let go instead of holding on.",
      "Two weeks of kegels builds strength. It also builds tightness — and tightness is what makes a lot of men finish fast in the first place.",
      "Breathing, reverse kegels, long releases. 15 minutes.",
      "If you have had any aching, any tightness, or discomfort after sitting a long time, this is the most useful session in the whole programme for you. Do it every 3rd day from now.",
    ],
    tasks: [
      { id: "d14-lesson", kind: "lesson", label: "Read: Reverse kegels and letting go" },
      { id: "d14-session", kind: "session", label: "Release session — 15 minutes" },
      { id: "d14-foundation", kind: "foundation", label: "Full foundation" },
      { id: "d14-log", kind: "measure", label: "Log tonight's markers" },
    ],
  },

  /* --------------------------------------------------------- DAY 15 */
  {
    day: 15,
    kind: "training",
    phase: "Find the bottleneck",
    title: "Structured training begins",
    focus: "Add strength work. Circulation is the quiet variable.",
    lesson: "the-training-week",
    session: {
      title: "Stop-start — loading session 1",
      duration: "20 minutes",
      ceiling: "7 out of 10.",
      cycles: "5 cycles, 30-second holds",
      steps: [
        "Breathing first.",
        "Five cycles now rather than four. Build to 7, hold thirty seconds, stop, fall to 3.",
        "Vary the stimulation between every cycle, as on Day 7.",
      ],
      ending: "End without finishing.",
    },
    brief: [
      "The physical side gets serious today.",
      "Walking every day was right for two weeks. It is not enough for a month.",
      "New week: 3 strength sessions, 2-3 cardio, walking on the other days, 1 rest day.",
      "Strength matters here for a real reason — it does more for your erections over a month than anything you can buy in a bottle.",
      "No gym needed. Squats, press-ups, lunges, planks, hip bridges. 30 minutes, 3 times a week.",
    ],
    tasks: [
      { id: "d15-lesson", kind: "lesson", label: "Read: Structuring the training week" },
      { id: "d15-session", kind: "session", label: "Loading session 1 — 5 cycles, 30-second holds" },
      { id: "d15-strength", kind: "foundation", label: "Strength session — 30 minutes" },
      { id: "d15-kegel", kind: "session", label: "Pelvic floor: 3 sets of 10, twice" },
      { id: "d15-foundation", kind: "foundation", label: "Full foundation" },
      { id: "d15-log", kind: "measure", label: "Log tonight's markers" },
    ],
  },

  /* --------------------------------------------------------- DAY 16 */
  {
    day: 16,
    kind: "rest",
    phase: "Find the bottleneck",
    title: "Rest and eat properly",
    focus: "The meal rotation replaces guesswork.",
    lesson: "meal-rotations",
    brief: [
      "No arousal session. Cardio or a long walk instead.",
      "And today you get a real food plan, not just 'eat well'.",
      "A 7-day rotation for breakfast, lunch and dinner, built from food you can actually buy. Run it on repeat. Do not overthink it.",
      "It is in Lessons so you can open it in the market.",
    ],
    tasks: [
      { id: "d16-lesson", kind: "lesson", label: "Read: The seven-day meal rotation" },
      { id: "d16-norest", kind: "rest", label: "No arousal session today" },
      { id: "d16-cardio", kind: "foundation", label: "Cardio or a long walk — 40 minutes" },
      { id: "d16-kegel", kind: "session", label: "Pelvic floor: 3 sets of 10, twice" },
      { id: "d16-foundation", kind: "foundation", label: "Full foundation" },
      { id: "d16-log", kind: "measure", label: "Log tonight's markers" },
    ],
  },

  /* ------------------------------------------------- DAYS 17 – 22 */
  {
    day: 17,
    kind: "training",
    phase: "Load",
    title: "Loading — ceiling 8",
    focus: "Raise the ceiling now that the floor is stable.",
    session: {
      title: "Loading session 2",
      duration: "25 minutes",
      ceiling: "8 out of 10 — but only cleanly.",
      cycles: "5 cycles, 30-second holds",
      steps: [
        "Breathing first.",
        "Build to 8 rather than 7. Hold thirty seconds at 8, slowed right down, floor completely soft.",
        "If you cannot hold 8 without gripping, you are at 9. Drop to 7 for the whole session and try again on Day 19.",
        "Five cycles.",
      ],
      ending: "End without finishing.",
      guard: "8 is the highest you will ever train at. 9 is the point of no return and you never go there deliberately.",
    },
    brief: [
      "The ceiling goes up today. This is the only time it does.",
      "8 out of 10 instead of 7.",
      "The test is simple and honest: if holding 8 makes you squeeze, you are not at 8, you are at 9. Go back to 7 for the whole session.",
      "You will never train above 8. Ever. 9 is too late and practising panic is not a skill.",
    ],
    tasks: [
      { id: "d17-session", kind: "session", label: "Loading session 2 — ceiling 8, 5 cycles" },
      { id: "d17-strength", kind: "foundation", label: "Strength session — 30 minutes" },
      { id: "d17-kegel", kind: "session", label: "Pelvic floor: 3 sets of 10, twice" },
      { id: "d17-foundation", kind: "foundation", label: "Full foundation" },
      { id: "d17-log", kind: "measure", label: "Log tonight's markers" },
    ],
  },
  {
    day: 18,
    kind: "rest",
    phase: "Load",
    title: "Release and recover",
    focus: "Repeat the release session.",
    brief: [
      "No arousal work. Repeat the release session from Day 14 in full.",
      "Every 3rd day you let go instead of holding on. This is fixed now.",
      "Men who skip these stall in week three with a body that will not relax.",
      "Cardio or a long walk as well.",
    ],
    tasks: [
      { id: "d18-session", kind: "session", label: "Release session — 15 minutes" },
      { id: "d18-cardio", kind: "foundation", label: "Cardio or long walk — 40 minutes" },
      { id: "d18-foundation", kind: "foundation", label: "Full foundation" },
      { id: "d18-log", kind: "measure", label: "Log tonight's markers" },
    ],
  },
  {
    day: 19,
    kind: "training",
    phase: "Load",
    title: "Loading — longer holds",
    focus: "Sixty seconds at the ceiling.",
    session: {
      title: "Loading session 3",
      duration: "25 minutes",
      ceiling: "8, or 7 if 8 was not clean on Day 17.",
      cycles: "4 cycles, 60-second holds",
      steps: [
        "Breathing first.",
        "Fewer cycles, much longer holds. Build to your ceiling and stay there for a full minute.",
        "Slow the stimulation right down rather than stopping it. Keep breathing out long. Keep the floor soft.",
        "Four cycles.",
      ],
      ending: "End without finishing.",
    },
    brief: [
      "Fewer cycles, much longer holds. A full minute at your ceiling.",
      "And this time you do not stop — you slow right down and keep going.",
      "A minute at your ceiling with stimulation continuing is much closer to real sex than a clean stop ever was.",
      "This is where it starts to look like the real thing.",
    ],
    tasks: [
      { id: "d19-session", kind: "session", label: "Loading session 3 — 4 cycles, 60-second holds" },
      { id: "d19-strength", kind: "foundation", label: "Strength session — 30 minutes" },
      { id: "d19-kegel", kind: "session", label: "Pelvic floor: 3 sets of 10, twice" },
      { id: "d19-foundation", kind: "foundation", label: "Full foundation" },
      { id: "d19-log", kind: "measure", label: "Log tonight's markers" },
    ],
  },
  {
    day: 20,
    kind: "training",
    phase: "Load",
    title: "Loading — no hands off",
    focus: "Control without ever stopping.",
    session: {
      title: "Loading session 4",
      duration: "25 minutes",
      ceiling: "7 – 8, continuous.",
      cycles: "Continuous, no full stops",
      steps: [
        "Breathing first.",
        "This session you never take your hands off. Instead you regulate by slowing down, changing pressure, and breathing out.",
        "Ride between 5 and 7 for as long as you can — twenty minutes if possible. Let it drift up, bring it down, let it drift up again.",
        "If you hit 8, slow to almost nothing but keep contact.",
      ],
      ending: "End without finishing.",
      guard: "This is the hardest session in the programme. Ending early is not failure — record how long you held and beat it next time.",
    },
    brief: [
      "Hardest session in the programme. And the closest to real sex.",
      "You never take your hands off. You control it by slowing down, changing pressure, and breathing out.",
      "Ride between 5 and 7 for as long as you can. 20 minutes if you get there.",
      "Most men cannot do the full 20 first time. Note how long you managed and beat it next time.",
    ],
    tasks: [
      { id: "d20-session", kind: "session", label: "Loading session 4 — continuous, no hands off" },
      { id: "d20-cardio", kind: "foundation", label: "Cardio or long walk — 40 minutes" },
      { id: "d20-kegel", kind: "session", label: "Pelvic floor: 3 sets of 10, twice" },
      { id: "d20-foundation", kind: "foundation", label: "Full foundation" },
      { id: "d20-log", kind: "measure", label: "Log tonight's markers" },
    ],
  },
  {
    day: 21,
    kind: "rest",
    phase: "Load",
    title: "Release and prepare",
    focus: "Rest, and read before the partner phase.",
    lesson: "the-conversation",
    brief: [
      "Release session and rest from arousal work.",
      "Read today's lesson properly. The phase starting in two days is the one men get wrong most — and it is not the technique, it is the conversation.",
      "If you start pausing and changing position with no explanation, she will fill in the blank herself. It is almost never the true answer.",
      "Ten seconds of honesty removes the whole problem. The lesson gives you the words.",
    ],
    tasks: [
      { id: "d21-lesson", kind: "lesson", label: "Read: The conversation to have first" },
      { id: "d21-session", kind: "session", label: "Release session — 15 minutes" },
      { id: "d21-strength", kind: "foundation", label: "Strength session — 30 minutes" },
      { id: "d21-foundation", kind: "foundation", label: "Full foundation" },
      { id: "d21-log", kind: "measure", label: "Log tonight's markers" },
    ],
  },
  {
    day: 22,
    kind: "training",
    phase: "Load",
    title: "Last solo loading session",
    focus: "Consolidate before the transfer.",
    session: {
      title: "Loading session 5",
      duration: "25 minutes",
      ceiling: "8, controlled.",
      cycles: "4 cycles, 60-second holds, varied stimulation",
      steps: [
        "Breathing first.",
        "Four cycles to 8, holding a full minute each, varying stimulation between cycles.",
        "Finish deliberately on the last cycle — you choose the moment.",
      ],
      ending: "Deliberate finish, on your timing.",
    },
    brief: [
      "Last solo session. From here it moves to real sex, where it belongs.",
      "Finish this one on purpose, like Day 10 — you pick the moment.",
      "You are going to need that under a lot more pressure from tomorrow.",
    ],
    tasks: [
      { id: "d22-session", kind: "session", label: "Loading session 5 — then a deliberate finish" },
      { id: "d22-cardio", kind: "foundation", label: "Cardio or long walk — 40 minutes" },
      { id: "d22-kegel", kind: "session", label: "Pelvic floor: 3 sets of 10, twice" },
      { id: "d22-foundation", kind: "foundation", label: "Full foundation" },
      { id: "d22-log", kind: "measure", label: "Log tonight's markers" },
    ],
  },

  /* ------------------------------------------------- DAYS 23 – 28 */
  {
    day: 23,
    kind: "training",
    phase: "Transfer",
    title: "Partner phase — reading the scale together",
    focus: "The same scale, with someone else in the room.",
    lesson: "partner-stop-start",
    session: {
      title: "Partner session 1 — no penetration",
      duration: "As long as it takes",
      ceiling: "6 out of 10.",
      cycles: "3 cycles",
      steps: [
        "Have the conversation first. Do not skip this and do not improvise it.",
        "No penetration tonight. Manual stimulation from your partner only.",
        "Same scale, same rules — name the number to yourself, stop at 6, release the floor, breathe out.",
        "Three cycles, then stop. You can finish or not, your choice.",
      ],
      ending: "Your choice.",
      guard:
        "If you have no partner right now, repeat the Day 20 continuous session instead and come back to this phase when you do. Nothing is lost.",
    },
    brief: [
      "This is the phase that separates men who improve alone from men who improve where it counts.",
      "Control on your own does NOT automatically transfer. A partner adds surprise, pressure and more arousal.",
      "Men who hold 7 easily alone often hit 9 within 90 seconds of being touched. That is normal. It is a harder version of the same skill.",
      "So you rebuild it from the bottom. Tonight: no penetration at all. Hands only. Ceiling of 6. Three cycles.",
      "Have the conversation BEFORE you start. Do not skip it.",
    ],
    tasks: [
      { id: "d23-lesson", kind: "lesson", label: "Read: Partner-assisted stop-start" },
      { id: "d23-talk", kind: "partner", label: "Have the conversation before you start" },
      { id: "d23-session", kind: "partner", label: "Partner session 1 — manual only, ceiling 6" },
      { id: "d23-foundation", kind: "foundation", label: "Full foundation" },
      { id: "d23-log", kind: "measure", label: "Log tonight's markers" },
    ],
  },
  {
    day: 24,
    kind: "rest",
    phase: "Transfer",
    title: "Rest and release",
    focus: "Recover between partner sessions.",
    brief: [
      "No arousal work. Release session, cardio, food, sleep.",
      "Partner sessions take more out of you than solo ones. Every other day through this phase.",
    ],
    tasks: [
      { id: "d24-session", kind: "session", label: "Release session — 15 minutes" },
      { id: "d24-cardio", kind: "foundation", label: "Cardio or long walk — 40 minutes" },
      { id: "d24-foundation", kind: "foundation", label: "Full foundation" },
      { id: "d24-log", kind: "measure", label: "Log tonight's markers" },
    ],
  },
  {
    day: 25,
    kind: "training",
    phase: "Transfer",
    title: "Partner phase — entry and pause",
    focus: "Penetration, then stillness.",
    lesson: "pause-and-stay",
    session: {
      title: "Partner session 2 — enter and hold",
      duration: "As long as it takes",
      ceiling: "6 – 7.",
      cycles: "3 entries",
      steps: [
        "Warm up as normal. Do not rush to penetration.",
        "Enter, then stay completely still. No movement at all for thirty seconds. Breathe out long. Let the pelvic floor go soft.",
        "Entry is the single highest-arousal moment for most men who finish fast, and stillness is how you survive it without withdrawing.",
        "If you reach 7, stay still for longer. If you reach 8, withdraw, wait, and re-enter.",
        "Three entries, then move as normal if you are comfortable.",
      ],
      ending: "Your choice.",
    },
    brief: [
      "Going in is where most men lose it. The jump from 5 to 9 happens in seconds.",
      "So tonight you separate going in from moving.",
      "Go in, then stop dead. No movement at all for 30 seconds. Breathe out long. Let everything go soft.",
      "Most men find the first 10 seconds hard and the next 20 surprisingly easy.",
      "Three times. Then move normally if you are comfortable.",
    ],
    tasks: [
      { id: "d25-lesson", kind: "lesson", label: "Read: Pause and stay in" },
      { id: "d25-session", kind: "partner", label: "Partner session 2 — enter and hold still" },
      { id: "d25-strength", kind: "foundation", label: "Strength session — 30 minutes" },
      { id: "d25-foundation", kind: "foundation", label: "Full foundation" },
      { id: "d25-log", kind: "measure", label: "Log tonight's markers" },
    ],
  },
  {
    day: 26,
    kind: "rest",
    phase: "Transfer",
    title: "Rest and release",
    focus: "Recover.",
    brief: [
      "Release session, cardio, foundation. No arousal work.",
    ],
    tasks: [
      { id: "d26-session", kind: "session", label: "Release session — 15 minutes" },
      { id: "d26-cardio", kind: "foundation", label: "Cardio or long walk — 40 minutes" },
      { id: "d26-foundation", kind: "foundation", label: "Full foundation" },
      { id: "d26-log", kind: "measure", label: "Log tonight's markers" },
    ],
  },
  {
    day: 27,
    kind: "training",
    phase: "Transfer",
    title: "Partner phase — movement and position",
    focus: "Add movement. Use position as a control.",
    lesson: "positions",
    session: {
      title: "Partner session 3 — movement with control",
      duration: "As long as it takes",
      ceiling: "7.",
      cycles: "Continuous, with pauses as needed",
      steps: [
        "Enter and hold still for thirty seconds, as on Day 25.",
        "Begin moving slowly. Shallow rather than deep. Name your number to yourself as you go.",
        "At 7, stop moving and stay in. Thirty seconds of stillness, long exhale, floor soft. Then resume.",
        "Use position deliberately: positions where she is on top or where you are on your side give you far less stimulation than you kneeling. Change position as a control, not as a rescue.",
      ],
      ending: "Your choice.",
    },
    brief: [
      "Movement goes in today, plus the last tool: position.",
      "Different positions give you very different amounts of stimulation. Her on top gives you far less than you on top. On your side, less again. Shallow is much less than deep.",
      "So position is a dial. Turn it EARLY, before you need it.",
      "Men who succeed change position at 6, out of habit. Men who struggle change at 9, to rescue it. By then it is decided.",
    ],
    tasks: [
      { id: "d27-lesson", kind: "lesson", label: "Read: Position as a control" },
      { id: "d27-session", kind: "partner", label: "Partner session 3 — movement with pauses" },
      { id: "d27-strength", kind: "foundation", label: "Strength session — 30 minutes" },
      { id: "d27-foundation", kind: "foundation", label: "Full foundation" },
      { id: "d27-log", kind: "measure", label: "Log tonight's markers" },
    ],
  },
  {
    day: 28,
    kind: "rest",
    phase: "Transfer",
    title: "Rest before the final measurement",
    focus: "No ejaculation from tonight. The window opens.",
    brief: [
      "Release session and foundation. No arousal work.",
      "From tonight, no coming. Your 2 clear days for the final measurement start now.",
      "Same as Day 11: protect your sleep, no alcohol, do not change the method.",
    ],
    tasks: [
      { id: "d28-session", kind: "session", label: "Release session — 15 minutes" },
      { id: "d28-window", kind: "rest", label: "No ejaculation — the 48-hour window starts now" },
      { id: "d28-foundation", kind: "foundation", label: "Full foundation" },
      { id: "d28-log", kind: "measure", label: "Log tonight's markers" },
    ],
  },

  /* --------------------------------------------------- DAYS 29 – 30 */
  {
    day: 29,
    kind: "rest",
    phase: "Consolidate",
    title: "Rest",
    focus: "Protect tomorrow's measurement.",
    brief: [
      "Nothing today. No session, no coming, no alcohol.",
      "Sleep properly. Tomorrow is your final number, same way as Day 1 and Day 12.",
    ],
    tasks: [
      { id: "d29-nothing", kind: "rest", label: "No session, no ejaculation, no alcohol" },
      { id: "d29-foundation", kind: "foundation", label: "Full foundation" },
      { id: "d29-sleep", kind: "foundation", label: "Protect tonight's sleep" },
      { id: "d29-log", kind: "measure", label: "Log tonight's markers" },
    ],
  },
  {
    day: 30,
    kind: "retest",
    phase: "Consolidate",
    title: "Final measurement and what comes next",
    focus: "Three numbers. Then a plan you can keep.",
    lesson: "maintenance",
    brief: [
      "Final measurement. Same 4 checks, same way you have done it since Day 1.",
      "Then look at all three numbers together — Day 1, Day 12, Day 30 — next to 30 days of markers.",
      "That is the honest account of what happened, and it is yours.",
      "Last lesson is about keeping it. What you built fades if you stop — not overnight, but over a couple of months.",
      "Maintenance is small on purpose: 2 sessions a week, kegels 3 times a week, the food and sleep, and one measurement a month.",
      "And retire the solo drill. It was scaffolding. If you find you prefer it to sex, stop and message us.",
    ],
    tasks: [
      { id: "d30-conditions", kind: "measure", label: "Confirm the four test conditions" },
      { id: "d30-measure", kind: "measure", label: "Take the final measurement and record it" },
      { id: "d30-review", kind: "measure", label: "Review all three numbers and your marker trends" },
      { id: "d30-lesson", kind: "lesson", label: "Read: Maintenance — holding what you built" },
      { id: "d30-log", kind: "measure", label: "Log tonight's markers" },
    ],
  },
];

export const protocolEn: Protocol = { rules, rulesIntro, days };
