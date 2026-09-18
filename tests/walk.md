# The walk — verifying the four funnels on production

What was tested where, and what still has to be seen on the live site
after migration 015 runs. Nothing below is claimed to work that was not
watched working.

## Verified without a database (local build)

Unit — `npx tsx --test --tsconfig tsconfig.json tests/crm.test.ts` — 8/8:

- four funnels, two tiers, the nine prices, no fifth funnel
- the price book swaps franc rows by tier and keeps the card rows
- what a man is charged: live → offer; expired → full; expired + inside
  the window + lc link → offer; expired + window + NO link → full; window
  closed → full; paid → full regardless of lc; no row → legacy price
- status derivation order: paid > recovered > recovery window > USSD sent
  > checkout started > lead > engaged > new; a live clock is not "recovery"
- a man belongs to the funnel he first landed on; a refresh is one man; a
  second session on a device counts as returned; pricing follows last touch
- payments sum per contact and land on the funnel
- the recovery message is in his language, with his tier's two prices and
  a link carrying his ref

Browser, 375px, all four routes (`scripts/smoke.mjs` + hand-walked):

- `/fr/f/1k` `/en/f/1k` `/fr/f/5k` `/en/f/5k` render; `/fr/f/9k` is 404
- no privacy copy on any of the four (grep for "besoin de le savoir",
  "No one has to know", "100% priv", "relevé", "statement shows" → none)
- the tier's price appears in the fact strip, on every buy button, and in
  the cost and close copy
- landing writes `funnel` + `firstFunnel` + `firstSeen` to state and sets
  the `metron_funnel` cookie; `?c=` lands in `campaign`
- every event carries `session`, `funnel`, `page`, `eid`; button presses
  carry a stable `cta` (`gate_yes`, `buy_bar`, `buy_good-fit`,
  `buy_training`, `buy_difference`, `buy_cost`, `buy_close`, `buy_mobile`,
  `deliver_continue`, `lc_popup`, `lc_checkout`, `lc_dismiss`)
- the offer page: delivery step → number → payment request carries
  `funnel`, `lc`, the real `phone`, `hasRealPhone: true`; returning visit
  skips the step
- `/api/offer` rejects a bad funnel and a missing ref (400);
  `/api/admin/recovery` is 404 without the admin cookie

## Needs the live database — walk these on metron.life after 015

1. **New visitor.** Open `/fr/f/1k?c=test1` in a private window. In the
   admin CRM tab: one contact, status New, funnel "Funnel 1K — FR",
   campaign test1, one session. Timeline shows `session_started`,
   `start_view`, `page_view`, `timer_started`.
2. **Every button.** Press the gate, then each buy button in turn without
   completing checkout. Timeline: `quiz_complete #gate_yes`, then one
   `cta_clicked` per button with its own id. No duplicates from refreshes.
3. **The clock does not restart.** Note the countdown. Refresh. Close the
   browser. Reopen an hour later. Same deadline every time. In Supabase,
   `offers` has one row for the ref, `started_at` from the first landing.
4. **Return visit.** Close the tab, open the link again. Timeline gains
   `session_started` (detail 2) and `visitor_returned`. CRM shows
   sessions 2, ↩1.
5. **Checkout attribution.** Continue through delivery to Fapshi's form.
   CRM status → Checkout started; `payments`/`intake` will carry the
   funnel once a payment lands. Vercel logs show
   `[momo] ref=… funnel=1k-fr price=1000 (offer)`.
6. **Expiry.** In Supabase, set the row's `expires_at` to a minute ago.
   Reload the funnel page: countdown at 00:00:00, label "OFFRE EXPIRÉE",
   buttons say 3 500 FCFA, expiry notice at the top of the revealed page.
   `events` gains exactly one `timer_expired` for the ref, however many
   times you reload. Vercel log on a checkout now says `(full)`.
7. **Last chance.** Still expired, `recovery_until` in the future. Open
   the funnel in a NEW tab-session: the popup appears once, in French, at
   1 000 FCFA, with the date it stops. `last_chance_shown` recorded.
   Press it: `last_chance_clicked`, `recovery_clicked`, and the checkout
   prices 1 000 — Vercel log says `(lastchance)`; `offers.status` →
   `recovering`. Dismiss instead: `last_chance_dismissed`, and it does not
   come back in that session.
8. **Window closed.** Set `recovery_until` to the past. No popup; the lc
   link prices 3 500 (`(full)`).
9. **Payment.** Pay 1 000 on the lc path. `payments` row has funnel
   `1k-fr`; `offers.status` → `recovered`; CRM status Recovered; the
   1K — FR card shows Recovered 1 and the revenue. Pay without lc:
   `paid`, Customer.
10. **Recovery message.** On a contact with an email and an expired,
    unpaid clock: press Email in the CRM. Message arrives in his language
    with his link. `recovery` row status sent; timeline `recovery_sent
    email`. Press again inside 24h: refused, `suppressed` row. On a paid
    contact: refused, "already paid".
11. **Duplicate webhooks.** Replay Fapshi's webhook for the same transId
    twice. One `payments` row (unique on provider+provider_txn). One
    customer.
12. **Health.** `/api/health/payments` is 200; with wrong Fapshi creds in
    a preview deployment it is 503.

## Known gaps, stated

- **WhatsApp sending is by hand.** No WhatsApp Business API on the project.
  The CRM gives a wa.me link with the message prefilled and a "mark sent".
- **No automation builder.** One automation exists — the return-visit
  last-chance popup, with its rules in `lib/offers.ts` and
  `app/api/admin/recovery/route.ts` — not a generic TRIGGER → CONDITIONS →
  ACTIONS editor. Building that before there is a second automation to
  put in it would be building a factory to make one chair.
- **No cross-device identity.** A ref is a device. A recovery link carries
  the ref so the checkout finds his clock on another phone; nothing else
  claims to know two devices are one man.
- **No consent UI.** The site sets first-party storage for its own
  measurement and no third party receives it; there is no cookie banner.
  If the audience expands to a jurisdiction that requires one, that is a
  separate piece of work.
