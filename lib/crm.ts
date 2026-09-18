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
    };
  };
  const funnels: FunnelStats[] = [
    ...FUNNEL_IDS.map((id) => stat(id, FUNNELS[id].name, (c) => (c.firstFunnel ?? c.funnel) === id)),
    stat("all", "All four", (c) => Boolean(c.firstFunnel ?? c.funnel)),
  ];

  return { contacts, funnels };
}

/** The recovery message for a contact, in his language, with his link. */
export function recoveryMessage(c: Contact, origin: string): { subject: string; text: string; url: string } | null {
  const id = c.funnel ?? c.firstFunnel;
  if (!id) return null;
  const f = FUNNELS[id];
  const t = TIERS[f.tier];
  const fcfa = (n: number) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA`;
  const url = `${origin}/${f.lang}/offer?go=1&lc=1&ref=${encodeURIComponent(c.ref)}`;
  if (f.lang === "fr") {
    return {
      subject: `Votre programme METRON — ${fcfa(t.offer)}`,
      text: `Vous êtes revenu ! Votre offre METRON est encore ouverte : le Défi 10 jours à ${fcfa(t.offer)} au lieu de ${fcfa(t.full)}, une dernière fois. Retrouvez votre programme ici : ${url}`,
      url,
    };
  }
  return {
    subject: `Your METRON programme — ${fcfa(t.offer)}`,
    text: `Welcome back! Your METRON offer is still open: the 10-Day Challenge at ${fcfa(t.offer)} instead of ${fcfa(t.full)}, one last time. Continue to your programme here: ${url}`,
    url,
  };
}
