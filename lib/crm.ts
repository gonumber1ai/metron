import { FUNNELS, FUNNEL_IDS, TIERS, isFunnelId, type FunnelId } from "@/lib/funnels";

/**
 * The CRM, computed.
 *
 * Every screen in the admin's CRM tab is a fold over five raw tables —
 * events, intake, leads, payments, offers — done here, in one pass, in
 * code. No views, no migration to remember, and one definition of every
 * number: the funnel card, the contact row and the timeline all read the
 * same folded record, so they cannot disagree with each other.
 *
 * ── A CONTACT IS A REF ────────────────────────────────────────────────────
 * The anonymous visitor id is the spine. A name, number or email attaches to
 * it when he gives one; a purchase attaches to it when he pays. Two devices
 * are two refs — nothing here claims to know they are one man, because
 * nothing here can. If the same number turns up on two refs the search finds
 * both, and that is the honest answer.
 *
 * ── STATUS IS DERIVED, NOT STORED ─────────────────────────────────────────
 * Computed from what actually happened, in this order: paid beats
 * everything; then whether he is inside a recovery window; then how far he
 * got. Storing a status is how a man who paid stays "recovery eligible" in a
 * report for a month.
 */

export type Ev = {
  ref: string;
  name: string;
  detail: string | null;
  campaign: string | null;
  locale: string;
  created_at: string;
  session?: string | null;
  funnel?: string | null;
  page?: string | null;
  cta?: string | null;
};
export type IntakeRow = { ref: string; name?: string | null; contact?: string | null; whatsapp?: string | null; phone?: string | null; stage?: string | null; updated_at?: string | null };
export type LeadRow = { ref: string | null; contact: string | null; name?: string | null; phone?: string | null; plan?: string | null; created_at: string };
export type PayRow = { ref: string; amount_minor: number; currency: string; plan: string; status: string; funnel?: string | null; created_at: string };
export type OfferRow = { ref: string; funnel: string; started_at: string; expires_at: string; recovery_until: string; status: string };
export type RecoveryRow = { ref: string; funnel: string; channel: string; status: string; created_at: string };

export type Status =
  | "new"
  | "engaged"
  | "lead"
  /** Brief 2: has an account, has not measured or estimated */
  | "signed_up"
  | "checkout_started"
  | "payment_pending"
  | "recovery_eligible"
  | "customer"
  | "recovered";

export type Contact = {
  ref: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  locale: string;
  funnel: FunnelId | null;
  firstFunnel: FunnelId | null;
  campaign: string | null;
  firstSeen: string;
  lastSeen: string;
  sessions: number;
  returned: number;
  status: Status;
  paidMinor: number;
  offer: OfferRow | null;
  /* Brief 2 — the Day 1 story. ISO stamps, or null. "real" wins once measured. */
  signedUpAt: string | null;
  estimatedAt: string | null;
  measuredAt: string | null;
  paidAt: string | null;
  day1: "none" | "estimate" | "real";
  /** how many recovery messages have gone out, by channel */
  recovery: { email: number; whatsapp: number; popup: number };
  lastRecoveryAt: string | null;
  events: Ev[];
};

export type FunnelStats = {
  id: FunnelId | "all";
  name: string;
  visitors: number;
  sessions: number;
  returned: number;
  saidYes: number;
  buyClicks: number;
  checkout: number;
  formShown: number;
  pushed: number;
  paid: number;
  revenue: number;
  leads: number;
  popupShown: number;
  popupClicked: number;
  recovered: number;
  recoveredRevenue: number;
  messagesSent: number;
  recoveryEligible: number;
  /** men who pressed play on a video at least once */
  videoPlays: number;
  /* Brief 2, Section 4 — signed up, didn't measure */
  signups: number;
  day1Measured: number;
  day1Estimated: number;
  reminders: number;
  paywallReal: number;
  paywallEstimate: number;
  paidReal: number;
  paidEstimate: number;
  measuredAfterPay: number;
};

const looksEmail = (v: string | null | undefined) => !!v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const digits = (v: string | null | undefined) => (v ?? "").replace(/\D/g, "");

export function fold(input: {
  events: Ev[];
  intake: IntakeRow[];
  leads: LeadRow[];
  payments: PayRow[];
  offers: OfferRow[];
  recovery: RecoveryRow[];
  /** only refs first seen on or after this ISO date, if set */
  since?: string;
}): { contacts: Contact[]; funnels: FunnelStats[] } {
  const byRef = new Map<string, Contact>();
  const get = (ref: string, at: string, locale = "en"): Contact => {
    let c = byRef.get(ref);
    if (!c) {
      c = {
        ref, name: null, phone: null, email: null, locale,
        funnel: null, firstFunnel: null, campaign: null,
        firstSeen: at, lastSeen: at, sessions: 0, returned: 0,
        status: "new", paidMinor: 0, offer: null,
        signedUpAt: null, estimatedAt: null, measuredAt: null, paidAt: null, day1: "none",
        recovery: { email: 0, whatsapp: 0, popup: 0 }, lastRecoveryAt: null, events: [],
      };
      byRef.set(ref, c);
    }
    return c;
  };

  // events, oldest first, so first-touch is genuinely first
  const evs = [...input.events].sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
  const sessionsOf = new Map<string, Set<string>>();
  for (const e of evs) {
    const c = get(e.ref, e.created_at, e.locale);
    c.events.push(e);
    if (e.created_at < c.firstSeen) c.firstSeen = e.created_at;
    if (e.created_at > c.lastSeen) c.lastSeen = e.created_at;
    if (e.campaign && !c.campaign) c.campaign = e.campaign;
    if (isFunnelId(e.funnel)) {
      if (!c.firstFunnel) c.firstFunnel = e.funnel;
      c.funnel = e.funnel; // last touch
    }
    if (e.session) {
      const s = sessionsOf.get(e.ref) ?? new Set();
      s.add(e.session);
      sessionsOf.set(e.ref, s);
    }
    if (e.name === "visitor_returned") c.returned += 1;
    if (e.name === "signup" && !c.signedUpAt) c.signedUpAt = e.created_at;
    if (e.name === "day1_estimate" && !c.estimatedAt) c.estimatedAt = e.created_at;
    if (e.name === "day1_measured" && !c.measuredAt) c.measuredAt = e.created_at;
  }
  for (const [ref, s] of sessionsOf) {
    const c = byRef.get(ref);
    if (c) c.sessions = s.size;
  }

  // identity
  for (const r of input.intake) {
    const c = get(r.ref, r.updated_at ?? new Date().toISOString());
    if (r.name && !c.name) c.name = r.name;
    const ph = digits(r.whatsapp) || digits(r.phone);
    if (ph && !c.phone) c.phone = ph;
    if (looksEmail(r.contact) && !c.email) c.email = r.contact!;
    if (!c.phone && r.contact && !looksEmail(r.contact)) c.phone = digits(r.contact) || null;
  }
  for (const r of input.leads) {
    if (!r.ref || r.plan === "learn") continue;
    const c = get(r.ref, r.created_at);
    if (r.name && !c.name) c.name = r.name;
    if (r.phone && !c.phone) c.phone = digits(r.phone) || null;
    if (looksEmail(r.contact) && !c.email) c.email = r.contact!;
    else if (r.contact && !c.phone) c.phone = digits(r.contact) || null;
  }

  // money
  for (const p of input.payments) {
    if (p.status !== "paid" || p.currency !== "XAF") continue;
    {
      const c0 = get(p.ref, p.created_at);
      if (!c0.paidAt || p.created_at < c0.paidAt) c0.paidAt = p.created_at;
    }
    const c = get(p.ref, p.created_at);
    c.paidMinor += Number(p.amount_minor ?? 0);
    if (isFunnelId(p.funnel) && !c.funnel) c.funnel = p.funnel;
  }

  // clocks
  for (const o of input.offers) {
    const c = get(o.ref, o.started_at);
    c.offer = o;
    if (isFunnelId(o.funnel) && !c.firstFunnel) c.firstFunnel = o.funnel;
    if (isFunnelId(o.funnel) && !c.funnel) c.funnel = o.funnel;
  }

  // messages
  for (const r of input.recovery) {
    const c = byRef.get(r.ref);
    if (!c) continue;
    if (r.channel === "email") c.recovery.email += 1;
    if (r.channel === "whatsapp") c.recovery.whatsapp += 1;
    if (r.channel === "popup") c.recovery.popup += 1;
    if (!c.lastRecoveryAt || r.created_at > c.lastRecoveryAt) c.lastRecoveryAt = r.created_at;
  }

  // status
  const now = Date.now();
  for (const c of byRef.values()) {
    c.day1 = c.measuredAt ? "real" : c.estimatedAt ? "estimate" : "none";
    const has = (n: string) => c.events.some((e) => e.name === n);
    const hasCta = c.events.some((e) => e.name === "cta_clicked" || e.name === "start_cta" || e.name === "quiz_complete");
    if (c.paidMinor > 0) {
      c.status = c.offer?.status === "recovered" ? "recovered" : "customer";
    } else if (c.offer && c.offer.status !== "live" && Date.parse(c.offer.recovery_until) > now && Date.parse(c.offer.expires_at) <= now) {
      c.status = "recovery_eligible";
    } else if (has("pay_pushed")) {
      c.status = "payment_pending";
    } else if (has("offer_view") || has("checkout_form") || has("delivery_pick")) {
      c.status = "checkout_started";
    } else if (c.signedUpAt && c.day1 === "none") {
      c.status = "signed_up";
    } else if (c.phone || c.email) {
      c.status = "lead";
    } else if (hasCta) {
      c.status = "engaged";
    } else {
      c.status = "new";
    }
  }

  let contacts = [...byRef.values()];
  if (input.since) contacts = contacts.filter((c) => c.firstSeen >= input.since!);
  contacts.sort((a, b) => (a.lastSeen < b.lastSeen ? 1 : -1));

  // funnel cards
  const stat = (id: FunnelId | "all", name: string, pick: (c: Contact) => boolean): FunnelStats => {
    const cs = contacts.filter(pick);
    const cnt = (f: (c: Contact) => boolean) => cs.filter(f).length;
    const evc = (n: string, f?: (e: Ev) => boolean) => cnt((c) => c.events.some((e) => e.name === n && (!f || f(e))));
    const paidCs = cs.filter((c) => c.paidMinor > 0);
    const recCs = cs.filter((c) => c.status === "recovered");
    return {
      id, name,
      visitors: cs.length,
      sessions: cs.reduce((a, c) => a + Math.max(1, c.sessions), 0),
      returned: cnt((c) => c.returned > 0),
      saidYes: evc("quiz_complete"),
      buyClicks: cnt((c) => c.events.some((e) => (e.name === "cta_clicked" && (e.cta ?? "").startsWith("buy_")) || e.name === "start_cta")),
      checkout: evc("offer_view"),
      formShown: evc("checkout_form"),
      pushed: evc("pay_pushed"),
      paid: paidCs.length,
      revenue: paidCs.reduce((a, c) => a + c.paidMinor, 0),
      leads: cnt((c) => Boolean(c.phone || c.email)),
      popupShown: evc("last_chance_shown"),
      popupClicked: evc("last_chance_clicked"),
      recovered: recCs.length,
      recoveredRevenue: recCs.reduce((a, c) => a + c.paidMinor, 0),
      messagesSent: cs.reduce((a, c) => a + c.recovery.email + c.recovery.whatsapp, 0),
      recoveryEligible: cnt((c) => c.status === "recovery_eligible"),
      videoPlays: evc("video_play"),
      signups: cnt((c) => Boolean(c.signedUpAt)),
      day1Measured: cnt((c) => Boolean(c.measuredAt)),
      day1Estimated: cnt((c) => Boolean(c.estimatedAt)),
      reminders: evc("day1_reminder_set"),
      paywallReal: evc("paywall_view", (e) => e.detail === "real"),
      paywallEstimate: evc("paywall_view", (e) => e.detail === "estimate"),
      // paid on which path: what he had at the moment he paid
      paidReal: cnt((c) => Boolean(c.paidAt) && Boolean(c.measuredAt) && c.measuredAt! <= c.paidAt!),
      paidEstimate: cnt((c) => Boolean(c.paidAt) && !(c.measuredAt && c.measuredAt <= c.paidAt!) && Boolean(c.estimatedAt) && c.estimatedAt! <= c.paidAt!),
      measuredAfterPay: evc("day1_measured_after_pay"),
    };
  };
  const funnels: FunnelStats[] = [
    ...FUNNEL_IDS.map((id) => stat(id, FUNNELS[id].name, (c) => (c.firstFunnel ?? c.funnel) === id)),
    stat("all", "All four", (c) => Boolean(c.firstFunnel ?? c.funnel)),
  ];

  return { contacts, funnels };
}

/**
 * Brief 2, Section 3 — which recovery message, if any, this man is due.
 *
 * Four branches, at most two sends each, then silence. The sequence stops
 * the moment he measures or pays — except the paid-on-estimate branch,
 * which only stops when he measures. `sent` is how many WhatsApp messages
 * have already gone to him. Returns null when nothing is due, and the
 * caller checks the 22:00 rule against his clock, not ours.
 */
export type RecoveryBranch = "signed_up" | "estimated" | "paid_unmeasured";

export function recoveryDue(
  c: Pick<Contact, "signedUpAt" | "estimatedAt" | "measuredAt" | "paidAt">,
  sent: number,
  now = Date.now(),
): { branch: RecoveryBranch; step: 1 | 2; dueAt: number } | null {
  if (c.measuredAt) return null;
  if (sent >= 2) return null;
  if (c.paidAt) {
    if (!c.estimatedAt) return null;
    const due = Date.parse(c.paidAt) + 20 * 3_600_000;
    return sent === 0 && due <= now ? { branch: "paid_unmeasured", step: 1, dueAt: due } : null;
  }
  if (c.estimatedAt) {
    const due = Date.parse(c.estimatedAt) + 20 * 3_600_000;
    return sent === 0 && due <= now ? { branch: "estimated", step: 1, dueAt: due } : null;
  }
  if (c.signedUpAt) {
    const t = Date.parse(c.signedUpAt);
    if (sent === 0) return t + 20 * 3_600_000 <= now ? { branch: "signed_up", step: 1, dueAt: t + 20 * 3_600_000 } : null;
    return t + 72 * 3_600_000 <= now ? { branch: "signed_up", step: 2, dueAt: t + 72 * 3_600_000 } : null;
  }
  return null;
}

/** The four Brief 2 templates. Never the number, never the estimate. */
export function day1Message(branch: RecoveryBranch, step: 1 | 2, lang: "en" | "fr", link: string): string {
  const en: Record<RecoveryBranch, [string, string]> = {
    signed_up: [`Your first session takes 5 minutes. ${link}`, `Your account is still open. Day 1 is 5 minutes. ${link}`],
    estimated: [`Yesterday you estimated. Day 2 is ready when you are. ${link}`, `Day 2 is ready when you are. ${link}`],
    paid_unmeasured: [`Day 2 is waiting on your Day 1 measurement. About 5 minutes. ${link}`, `Your Day 1 measurement opens Day 2. About 5 minutes. ${link}`],
  };
  const fr: Record<RecoveryBranch, [string, string]> = {
    signed_up: [`Votre première séance prend 5 minutes. ${link}`, `Votre compte est toujours ouvert. Le jour 1 prend 5 minutes. ${link}`],
    estimated: [`Hier, vous avez estimé. Le jour 2 est prêt quand vous l'êtes. ${link}`, `Le jour 2 est prêt quand vous l'êtes. ${link}`],
    paid_unmeasured: [`Le jour 2 attend votre mesure du jour 1. Environ 5 minutes. ${link}`, `Votre mesure du jour 1 ouvre le jour 2. Environ 5 minutes. ${link}`],
  };
  return (lang === "fr" ? fr : en)[branch][step - 1];
}

/**
 * The recovery message for a contact, in his language, with his link.
 *
 * A man with an account gets one of the Brief 2 messages for his branch;
 * anyone else — a visitor who reached checkout and left — gets the offer
 * message. Both go through here so the admin button, the email and the
 * wa.me link never disagree.
 */
export function recoveryMessage(c: Contact, origin: string): { subject: string; text: string; url: string } | null {
  const id = c.funnel ?? c.firstFunnel;
  const lang: "en" | "fr" = id ? FUNNELS[id].lang : c.locale === "fr" ? "fr" : "en";
  if (c.signedUpAt && !c.measuredAt) {
    const branch: RecoveryBranch = c.paidAt ? "paid_unmeasured" : c.estimatedAt ? "estimated" : "signed_up";
    if (branch === "paid_unmeasured" && !c.estimatedAt) return null;
    const step: 1 | 2 = c.recovery.whatsapp + c.recovery.email >= 1 ? 2 : 1;
    const url = `${origin}/${lang}/app/day/1`;
    return { subject: lang === "fr" ? "METRON — jour 1" : "METRON — Day 1", text: day1Message(branch, step, lang, url), url };
  }
  if (!id) return null;
  const f = FUNNELS[id];
  const t = TIERS[f.tier];
  const fcfa = (n: number) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA`;
  const url = `${origin}/${f.lang}/offer?go=1&lc=1&ref=${encodeURIComponent(c.ref)}`;
  if (f.lang === "fr") {
    return {
      subject: `Votre programme METRON — ${fcfa(t.offer)}`,
      text: `Vous êtes revenu ! Votre programme METRON est encore ouvert : les jours 2 à 10 pour ${fcfa(t.offer)}, une fois. Retrouvez-le ici : ${url}`,
      url,
    };
  }
  return {
    subject: `Your METRON programme — ${fcfa(t.offer)}`,
    text: `Welcome back! Your METRON programme is still open: Days 2–10 for ${fcfa(t.offer)}, once. Continue here: ${url}`,
    url,
  };
}
