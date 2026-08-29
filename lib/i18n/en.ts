export const en = {
  brand: "Metron",
  tagline: "You can't fix what you don't measure.",

  nav: {
    today: "Today",
    program: "Program",
    measure: "Measure",
    progress: "Progress",
    rules: "Daily rules",
    lessons: "Lessons",
    messages: "Private",
    settings: "Settings",
    menu: "Menu",
    opening: "Opening",
    close: "Close",
    signOut: "Sign out",
  },

  cta: {
    start: "Start the 60-second check",
    continue: "Continue",
    back: "Back",
    next: "Next",
    seeResult: "See my result",
    getTest: "Start the 10-Day Reset",
    upgrade: "Get the 30-Day Sprint",
    save: "Save",
    saved: "Saved",
    done: "Mark done",
    undo: "Undo",
    readLesson: "Read the lesson",
    logIt: "Log it",
    openApp: "Open my program",
  },

  quiz: {
    kicker: "Private assessment",
    introKicker: "Private · about 60 seconds",
    introH: "First, a few quick questions",
    introP1: "To get you a plan that works and improves your duration, we need to know a little about where you are right now.",
    introP2: "9 questions. Use any name you like — we keep you anonymous so nothing here can ever be traced back to you. Your details are never shared.",
    introHonestH: "Just be straight with us",
    introHonestP: "Your plan is built from what you put here. Real numbers get you a plan that fits, the way it has for other men who have done this.",
    introHonestP2: "",
    introTime: "About 60 seconds",
    introPrivate: "Discreet. Nothing is shared with anyone.",
    introStart: "Start",
    blockNumbers: "Your numbers",
    blockPattern: "What is happening",
    blockTried: "What you have tried",
    blockHealth: "Health check",
    midH: "You are over half way",
    midP: "What you have described so far is common, and it is the kind that responds to our in-app plan rather than to anything you swallow.",
    midP2: "Four questions left. The next few decide which plan you get.",
    midCta: "Keep going",
    title: "9 questions. About 60 seconds.",
    sub: "No name required. Nothing is shared with anyone.",
    progress: "Question {n} of {total}",
    selectAll: "Select all that apply",
    required: "Pick one to continue",
    finishing: "Reading your answers…",
  },

  result: {
    kicker: "Your result",
    secWhere: "Where you are now",
    gaugeNow: "Now",
    gaugeWant: "You want",
    gaugeUnit: "min",
    gaugeGap: "The distance you have to cover",
    secCost: "The cost of waiting",
    secDo: "What to do now",
    yourType: "Your pattern",
    theGap: "Your gap",
    gapUnit: "minutes",
    gapExplain: "You're at {now}. You want {want}. That gap is trainable.",
    whatNow: "What this means",
    whyFailed: "Why what you tried didn't hold",
    redFlagTitle: "Read this first",
    offerLead: "Don't take our word for it",
    adaptTitle: "It is not standing still",
    adaptBody:
      "Every week you spend at {now} teaches your body that {now} is normal. A reflex is built by repetition — and yours is being rehearsed, several times a month. It gets more automatic every time. A year from now it will be harder to shift than it is tonight.",
    emailTitle: "Want this sent to you?",
    emailBody: "We will email your result so you can come back to it. Nothing else, and nothing that says what it is about.",
    emailPlaceholder: "Your email",
    emailSend: "Send it",
    emailSent: "Sent.",
  },

  /* The checkout. Not a sales page — the previous page already sold him.
     This page removes friction and completes a payment. */
  checkout: {
    h: "Start your 10-Day Reset",
    sub: "Complete your payment below. Your access details are sent the moment it clears.",
    steps: ["Payment", "Access", "Day 1"],
    afterH: "After payment",
    after: ["Your access details arrive by email", "Open Metron", "Take your day-one measurement"],
    guaranteeH: "10-day result guarantee",
    guaranteeShort:
      "Complete the programme and both measurements. If you are not lasting longer, contact us and we refund you.",
    privacyH: "Private by design",
    privacyShort:
      "We never need your real name. Your statement shows METRON, and the access email never says what it is about.",
    afterTenH: "What happens after the 10 days?",
    /* {sprint}, {test} and {rest} are filled from the price book. */
    afterTen:
      "If the Reset works for you, the 30-Day Stamina Sprint is {sprint}. The {test} you pay today is credited toward it, so you would pay {rest} to continue.",
    afterTenNote: "You do not need to decide that today.",
  },

  offer: {
    testName: "The 10-Day Reset",
    sprintName: "The 30-Day Stamina Sprint",
    testPitch:
      "Measure yourself before you start. Do the 10 days. Measure again at the end. If you are not lasting longer, you will know in 10 days instead of another year of guessing.",
    includes: "What's inside",
    guarantee:
      "Do all 10 days and both measurements. If you are not lasting longer, write to us and we refund you.",
    payWith: "Pay with",
    momo: "Mobile Money",
    card: "Card",
    securePrivate: "Private billing",
    descriptorNote:
      "Your statement shows METRON. Nothing else. Use any name you like — your account stays anonymous.",
    processing: "Opening secure checkout…",
    comingSoon: "Checkout is being connected",
    comingSoonBody:
      "Payment is not live yet. Leave your contact and we'll open your account the moment it is.",
  },

  privacy: {
    title: "Nobody has to know",
    b1: "Use any name you like. We keep you anonymous, so nothing is tied to you.",
    b2: "Your statement reads METRON — nothing else.",
    b3: "Notifications say \"Your session is ready.\" Never more.",
    b4: "Lock the app with a PIN.",
    b5: "Message us inside your account. No WhatsApp needed unless you want it.",
    b6: "Delete your account and your data any time.",
  },

  app: {
    greeting: "Day {day}",
    todayFocus: "Today's focus",
    dailyRules: "Every day, without exception",
    todayTasks: "Today",
    session: "Training session",
    noSession: "No training session today. Rest is part of the protocol.",
    completed: "{done} of {total} done",
    streak: "{n}-day streak",
    lockedTitle: "Not yet",
    lockedBody: "This day unlocks on Day {day}. Finish today first.",
    dayComplete: "Day {day} complete",
    nextUp: "Next up",
    gateIncomplete: "Finish today's list first — {n} left",
    gateTooSoon: "Tomorrow opens in {n}h",
    gateWhy:
      "Days are 18 hours apart on purpose. If you rush them, your Day 12 number means nothing and neither does the refund.",
    markerTooSoon: "You already logged today. Next one in {n}h.",
  },

  measure: {
    title: "Measurement",
    baseline: "Baseline",
    retest: "Retest",
    notYet: "Not recorded yet",
    minutes: "min",
    seconds: "sec",
    mode: "How did you do it?",
    modeSolo: "On my own",
    modePartner: "With a partner",
    modeLocked:
      "Day 12 must be done the same way as Day 1. Otherwise the two numbers mean nothing.",
    conditions: "Before you start",
    // The checks used to be a bare list with no reason attached, and two of
    // them were written for the retest and shown on the baseline as well —
    // asking a man on Day 1 to confirm he has not trained yet, and to time it
    // "the same way as Day 1". Both lists now say what they are for.
    condsWhy:
      "Your two numbers only mean something if both are taken the same way. This is how we make Day 1 and Day 12 a fair comparison — and it is what the refund is judged on.",
    // Day 1 — nothing to match yet, so this list SETS the method.
    baseCond1: "It has been 2 days since you last came",
    baseCond2: "No alcohol today",
    baseCond3: "You are doing it the normal way, with no technique",
    baseConfirm: "All three have to be true. If one is not, measure tomorrow instead — nothing is lost.",
    // Day 12 — this list MATCHES the method set on Day 1.
    reCond1: "It has been 2 days since you last came",
    reCond2: "No alcohol today",
    reCond3: "No training session in the last 24 hours",
    reCond4: "Same as Day 1 — same way of timing, same solo or partner",
    reConfirm: "All four have to be true. If one is not, measure tomorrow instead — nothing is lost.",
    howTo: "How to do it",
    step1: "Hit START the moment you begin.",
    step2: "Do it normally. Don't hold back. Don't use the technique.",
    step3: "Hit STOP the moment you finish.",
    step4: "That's your number. Write nothing down — the app keeps it.",
    whyNormal:
      "Do NOT try to last. A good number today makes Day 12 look worse. You want the honest one.",
    markers: "Daily markers",
    erection: "Erection quality",
    energy: "Energy",
    libido: "Libido",
    stress: "Stress",
    sleep: "Sleep",
    stomach: "Stomach comfort",
    control: "Control over arousal",
    scale: "1 = poor, 5 = excellent",
    recordBaseline: "Record your baseline",
    recordRetest: "Record your retest",
    change: "Change",
    improved: "Your number moved",
    noChange: "Your number held steady",
    down: "Your number went down",
  },

  progress: {
    title: "Progress",
    theNumber: "Your number",
    vsBaseline: "vs. baseline",
    markersTrend: "How you've been feeling",
    noData: "Record your baseline to start the chart.",
    shareTitle: "Share your result",
    shareBody:
      "Screenshot this and send it to us if you want it featured. We never publish anything without asking you first.",
  },

  lessons: {
    title: "Lessons",
    sub: "Short reads. One idea each.",
    minRead: "{n} min read",
    read: "Read",
    unread: "New",
  },

  messages: {
    sendFailed: "That did not reach us. Nothing was sent — check your connection and send it again.",
    title: "Private thread",
    sub: "Only you and your coach can see this. No name required.",
    placeholder: "Write your message…",
    send: "Send",
    empty: "Ask anything. Nothing here is shared.",
  },

  settings: {
    title: "Settings",
    language: "Language",
    pin: "App PIN lock",
    pinOn: "Require a PIN to open Metron",
    notifications: "Notification wording",
    notifNeutral: "Neutral (recommended)",
    notifNeutralHelp: "Every alert reads \"Your session is ready.\"",
    account: "Account",
    deleteAccount: "Delete my account and all data",
    deleteWarn: "This cannot be undone.",
    region: "Region",
    regionHelp: "Changes food examples to what you can actually buy.",
  },

  medical: {
    title: "This is training, not medical care",
    body:
      "Metron is education and training. It does not diagnose or treat any condition. See a doctor if this started suddenly, if you have pain, if you also have trouble getting or keeping an erection, or if it began after starting a medication.",
    seeDoctor: "See a doctor first",
  },

  common: {
    day: "Day",
    of: "of",
    minutes: "minutes",
    yes: "Yes",
    no: "No",
    optional: "Optional",
    loading: "Loading…",
  },
} as const;
