/**
 * Email shell.
 *
 * ── WHY THIS IS LIGHT WHEN THE APP IS DARK ───────────────────────────────
 * The app is dark because he opens it at night, sometimes beside his partner —
 * a bright screen is conspicuous. An inbox is not that situation. Dark-
 * background HTML email renders badly across clients, gets flagged more often
 * by spam filters, and looks less legitimate. So email is light and clean, and
 * privacy is handled where it actually matters: the sender name and the
 * subject line.
 *
 * ── EMAIL HTML RULES ─────────────────────────────────────────────────────
 * Tables, not divs. Inline styles, not classes — Gmail strips <style> blocks.
 * No flexbox, no grid, no web fonts, no background images. 600px max width.
 * Every one of those is a client that would otherwise render this as a mess.
 */

export const BRAND = {
  jade: "#109B78",
  jadeLight: "#E8F5F0",
  ink: "#16191B",
  body: "#4A5257",
  faint: "#8A9298",
  rule: "#E4E1DA",
  paper: "#FBFAF7",
  white: "#FFFFFF",
};

export const SUPPORT = {
  whatsapp: "+1 208 905 4119",
  whatsappUrl: "https://wa.me/12089054119",
};

export type Locale = "en" | "fr";

const COPY = {
  en: {
    supportTitle: "Need anything?",
    inApp: "Message us inside your account",
    inAppNote: "Private. Nobody else can see it.",
    orWhatsApp: "Or WhatsApp",
    noreply: "This address is not monitored — use one of the two above and a human will answer.",
    unsub: "Unsubscribe",
    disclaimer:
      "Metron is education and training. It does not diagnose or treat any medical condition. See a doctor if this started suddenly, if you have pain, if you also struggle to get or keep an erection, or if it began after starting a medication.",
  },
  fr: {
    supportTitle: "Besoin de quelque chose ?",
    inApp: "Écrivez-nous depuis votre compte",
    inAppNote: "Privé. Personne d'autre ne le voit.",
    orWhatsApp: "Ou sur WhatsApp",
    noreply:
      "Cette adresse n'est pas surveillée — passez par l'une des deux options ci-dessus et une vraie personne vous répondra.",
    unsub: "Se désabonner",
    disclaimer:
      "Metron est un programme d'éducation et d'entraînement. Il ne diagnostique ni ne traite aucune maladie. Consultez un médecin si le problème est apparu soudainement, si vous avez des douleurs, si vous avez aussi du mal à obtenir ou garder une érection, ou si cela a commencé après la prise d'un médicament.",
  },
};

export function button(label: string, href: string): string {
  // Padded anchor rather than a table button: renders acceptably everywhere
  // including Outlook, without VML.
  return `<a href="${href}" style="display:inline-block;background:${BRAND.jade};color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;line-height:1;padding:16px 28px;border-radius:10px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">${label}</a>`;
}

export function p(text: string): string {
  return `<p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:${BRAND.body};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">${text}</p>`;
}

export function h1(text: string): string {
  return `<h1 style="margin:0 0 20px;font-size:26px;line-height:1.25;font-weight:700;color:${BRAND.ink};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">${text}</h1>`;
}

/** A boxed callout for the one thing that matters most in the email. */
export function callout(text: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;"><tr><td style="background:${BRAND.jadeLight};border-left:3px solid ${BRAND.jade};padding:16px 18px;border-radius:6px;font-size:16px;line-height:1.6;color:${BRAND.ink};font-weight:600;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">${text}</td></tr></table>`;
}

export function wrap(opts: {
  locale: Locale;
  preheader: string;
  body: string;
  appUrl: string;
  showSupport?: boolean;
  showDisclaimer?: boolean;
  unsubUrl?: string;
}): string {
  const t = COPY[opts.locale];
  const font =
    "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

  const support =
    opts.showSupport === false
      ? ""
      : `
      <tr><td style="padding:0 32px;"><hr style="border:none;border-top:1px solid ${BRAND.rule};margin:8px 0 24px;"></td></tr>
      <tr><td style="padding:0 32px 8px;">
        <p style="margin:0 0 12px;font-size:13px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${BRAND.faint};font-family:${font};">${t.supportTitle}</p>
        <p style="margin:0 0 6px;font-size:15px;line-height:1.6;color:${BRAND.body};font-family:${font};">
          <a href="${opts.appUrl}/app/messages" style="color:${BRAND.jade};font-weight:600;text-decoration:none;">${t.inApp}</a>
          &nbsp;<span style="color:${BRAND.faint};font-size:13px;">${t.inAppNote}</span>
        </p>
        <p style="margin:0;font-size:15px;line-height:1.6;color:${BRAND.body};font-family:${font};">
          ${t.orWhatsApp}: <a href="${SUPPORT.whatsappUrl}" style="color:${BRAND.jade};font-weight:600;text-decoration:none;">${SUPPORT.whatsapp}</a>
        </p>
      </td></tr>`;

  const disclaimer =
    opts.showDisclaimer === false
      ? ""
      : `<p style="margin:0 0 10px;font-size:11px;line-height:1.6;color:${BRAND.faint};font-family:${font};">${t.disclaimer}</p>`;

  return `<!doctype html>
<html lang="${opts.locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>Metron</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.paper};-webkit-font-smoothing:antialiased;">

<!-- Preheader: the grey line the inbox shows next to the subject. Must survive
     being read over his shoulder, same rule as the subject itself. -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${opts.preheader}</div>
<div style="display:none;max-height:0;overflow:hidden;">&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.paper};">
<tr><td align="center" style="padding:32px 12px;">

  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:${BRAND.white};border:1px solid ${BRAND.rule};border-radius:14px;overflow:hidden;">

    <tr><td style="padding:28px 32px 4px;">
      <span style="font-size:19px;font-weight:700;letter-spacing:-0.01em;color:${BRAND.ink};font-family:${font};">Metron</span>
    </td></tr>

    <tr><td style="padding:20px 32px 8px;">
      ${opts.body}
    </td></tr>

    ${support}

    <tr><td style="padding:24px 32px 28px;">
      <hr style="border:none;border-top:1px solid ${BRAND.rule};margin:0 0 16px;">
      ${disclaimer}
      <p style="margin:0;font-size:11px;line-height:1.6;color:${BRAND.faint};font-family:${font};">
        ${t.noreply}${opts.unsubUrl ? ` &nbsp;·&nbsp; <a href="${opts.unsubUrl}" style="color:${BRAND.faint};text-decoration:underline;">${t.unsub}</a>` : ""}
      </p>
    </td></tr>

  </table>

</td></tr>
</table>
</body>
</html>`;
}
