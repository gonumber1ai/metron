import { Resend } from "resend";
import { wrap, h1, p, button, callout, type Locale } from "./layout";

/**
 * Outbound email, via Resend.
 *
 * ── THE RULE THAT OVERRIDES EVERYTHING ───────────────────────────────────
 * Sender name is "Metron". Never anything more descriptive.
 * Subject lines must survive being read over his shoulder on a lock screen.
 *
 * The explicit content goes inside the email where only he sees it. One
 * careless subject line — "Last longer starting today!" sitting on a
 * notification — breaks the single promise the product is sold on, for that
 * customer, permanently. There is no undo.
 *
 * ── FAILURE POLICY ───────────────────────────────────────────────────────
 * Sending never throws. A man who has paid must reach his programme even if
 * Resend is down, so every caller treats email as fire-and-forget and the
 * failure is logged rather than surfaced.
 */

const FROM = process.env.EMAIL_FROM ?? "Metron <noreply@metron.life>";

function client(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

export function isConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

async function send(opts: {
  to: string;
  subject: string;
  html: string;
  /** Plain-text fallback. Some clients and most spam filters want one. */
  text: string;
}): Promise<boolean> {
  const resend = client();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping", opts.subject);
    return false;
  }
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      // He cannot reply here, and the footer says so — but setting this stops
      // some clients inventing a reply address of their own.
      replyTo: process.env.EMAIL_REPLY_TO ?? undefined,
    });
    if (error) {
      console.error("[email] send failed", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] threw", err);
    return false;
  }
}

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://metron.life";
}

/** Strips tags for the plain-text part. Crude, and adequate. */
function toText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/* ------------------------------------------------------------------ */
/* Purchase confirmation                                               */
/* ------------------------------------------------------------------ */

const PURCHASE = {
  en: {
    subject: "Your account is open",
    preheader: "Everything you need to start tonight.",
    h: "You're in.",
    p1: "Your account is open and Day 0 is waiting for you.",
    call:
      "Start tonight, not tomorrow. Day 0 is a preparation day — there is no training, and it takes about ten minutes.",
    p2: "Tomorrow you record your first number. That one measurement is what everything else is compared against, so the app will walk you through the four conditions before you take it.",
    cta: "Open my programme",
    p3: "One thing worth saying now: if this started suddenly with no history, if you have pain, if you also struggle to get or keep an erection, or if it began after starting a medication — see a doctor before you go further. No programme gets around a physical cause.",
  },
  fr: {
    subject: "Votre compte est ouvert",
    preheader: "Tout ce qu'il faut pour commencer ce soir.",
    h: "C'est bon.",
    p1: "Votre compte est ouvert et le Jour 0 vous attend.",
    call:
      "Commencez ce soir, pas demain. Le Jour 0 est une journée de préparation — aucun entraînement, une dizaine de minutes.",
    p2: "Demain vous enregistrez votre premier chiffre. C'est la mesure à laquelle tout le reste sera comparé, donc l'application vous guidera sur les quatre conditions avant que vous la preniez.",
    cta: "Ouvrir mon programme",
    p3: "Une chose à dire tout de suite : si le problème est apparu soudainement, si vous avez des douleurs, si vous avez aussi du mal à obtenir ou garder une érection, ou si cela a commencé après un médicament — consultez un médecin avant d'aller plus loin. Aucun programme ne contourne une cause physique.",
  },
};

export async function sendPurchaseConfirmation(opts: {
  to: string;
  locale: Locale;
}): Promise<boolean> {
  const c = PURCHASE[opts.locale];
  const url = appUrl();
  const html = wrap({
    locale: opts.locale,
    preheader: c.preheader,
    appUrl: url,
    body: [
      h1(c.h),
      p(c.p1),
      callout(c.call),
      p(c.p2),
      `<p style="margin:8px 0 24px;">${button(c.cta, `${url}/${opts.locale}/app`)}</p>`,
      p(c.p3),
    ].join(""),
  });
  return send({ to: opts.to, subject: c.subject, html, text: toText(html) });
}

/* ------------------------------------------------------------------ */
/* Lead captured — payment not available yet                           */
/* ------------------------------------------------------------------ */

const LEAD = {
  en: {
    subject: "We have your details",
    preheader: "We will write the moment it opens.",
    h: "We have your details.",
    p1: "Checkout is not live in your market yet. The moment it is, we will write to you — and you will be first, before anything is advertised.",
    p2: "In the meantime, your assessment result is saved and waiting for you.",
    cta: "See my result again",
  },
  fr: {
    subject: "Nous avons vos coordonnées",
    preheader: "Nous vous écrivons dès l'ouverture.",
    h: "Nous avons vos coordonnées.",
    p1: "Le paiement n'est pas encore actif dans votre pays. Dès qu'il l'est, nous vous écrivons — et vous serez prévenu avant toute publicité.",
    p2: "En attendant, le résultat de votre bilan est enregistré et vous attend.",
    cta: "Revoir mon résultat",
  },
};

export async function sendLeadAck(opts: { to: string; locale: Locale }): Promise<boolean> {
  const c = LEAD[opts.locale];
  const url = appUrl();
  const html = wrap({
    locale: opts.locale,
    preheader: c.preheader,
    appUrl: url,
    body: [
      h1(c.h),
      p(c.p1),
      p(c.p2),
      `<p style="margin:8px 0 8px;">${button(c.cta, `${url}/${opts.locale}/result`)}</p>`,
    ].join(""),
  });
  return send({ to: opts.to, subject: c.subject, html, text: toText(html) });
}

/** Only send to something that looks like an email — leads may be phone numbers. */
export function looksLikeEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}
