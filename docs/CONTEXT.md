# Metron — what is true, and why

Everything a new session needs before touching this repo. Kept with the code
rather than in a chat, so it survives the chat.

**This project has nothing to do with RevenueStack School.** They are separate
businesses with separate repos, prices and audiences. Do not carry anything
between them.

---

## The product

Two programmes, sold at **metron.life**, English and French.

| | Price | Was | What it is |
|---|---|---|---|
| **The 10-Day Reset** | 2,500 FCFA | ~~7,500~~ | The trial. Measure, follow the plan ten days, measure again. |
| **The 30-Day Stamina Sprint** | 15,000 FCFA | ~~69,000~~ | The real programme. Holds the gain and moves it into sex with a partner. |

- **15,000 is flat.** No credit for the trial. Two products, two prices, no
  arithmetic at the moment he is entering a PIN.
- **Struck prices are real former prices only** (`Price.was` in
  `lib/payments/index.ts`). 35,000 was floated and refused — the 30-day was
  never 35,000, and inventing a "was" is the one thing this brand cannot do.
- **Card prices unchanged at $15 / $125.** The zero-conversion problem was a
  Cameroon problem; no Western traffic has been tested.

**Why 2,500.** The competition is not another programme, it is a 5,000 franc
bag of herbs that lasts a month. 32 men finished the quiz at 7,500 and none
paid. The trial now sits under the price of the thing he already buys. Owner's
call over the 3,500 argued for: buying men INTO the funnel is worth more than
the margin, because trial buyers are the only pool the 15,000 sells to. That
holds only as long as the 30-day converts.

---

## The funnel

```
ad / WhatsApp → /wellness → /start → /offer → the app
                 age gate   sales    checkout
```

`/quiz → /result → /offer` still exists and is measured separately. A man is in
one road or the other, never both.

**Ad destinations** (fresh tags so the new funnel reads from zero):

- `https://metron.life/en/wellness?c=b1` — Facebook English
- `https://metron.life/fr/wellness?c=b2` — Facebook French
- `https://metron.life/fr/wellness?c=w1` — WhatsApp French

Tags stay meaningless in the URL — Meta reads them, and so does the man before
he clicks. Their meaning is typed into the admin, in a browser only the owner
uses.

### The gate is not a cloak

Meta restricts sexual-health advertising, and a link landing straight on
explicit sales copy is what gets an account restricted rather than an ad
rejected. `/wellness` is a real adult confirmation and a plain description.
**Every visitor sees identical HTML** — reviewer, crawler and buyer. Serving
reviewers something different is what gets a business permanently banned, and
it is a lie told to a person doing their job. Never build that.

The gate is one screen and stays one screen. It is a door, not a pitch.

---

## Copy rules

These were each learned by breaking them.

- **Never name the technique.** The pages describe the SHAPE of the ten days —
  measure, train, log, measure — never what happens inside a session. A man
  must not be able to execute the sales page.
- **Never de-sell at the button.** "You do not know yet whether this works on
  you, and we have not earned it" was written when the job was talking a man
  down from 69,000 to 7,500. With one cheap price it only plants doubt. The
  guarantee is the reassurance; it does not need an apology in front of it.
- **Never compare the price to a competitor's product.** "Less than a bag of
  herbs that lasts a month" put a rival in his head at the buy moment and
  invited the one comparison we lose — theirs lasts a month, this is ten days.
  The herb price is why we priced here. It is not copy.
- **The promise is the outcome, not the instrument.** The refund condition is
  always *"if you are not lasting longer"*, never *"if your number has not
  moved"*. The number is how he checks it; lasting longer is what he came for.
- **Nobody is coached.** Men open the app and follow a plan. The results are
  from men who *followed this protocol* before the app existed.
- **The comparison is day one against day ten or thirty**, never "starting
  time", which describes nothing.
- **The 30-day is the next step, not a shelf it sits on.** "Most men go on to
  the 30-day programme" — the owner's sentence, asserted on his own customers.
  Keep whatever records back it.
- Desire before mechanics. Recognition, not misery.

### Claims that need records

1. `1.5–3×` and `2–5×` — from men coached through the protocol pre-app. Stated
   as ranges because that is what the records support. The methodology sits
   directly under the numbers on the page.
2. "Most men go on to the 30-day programme."

Both are what a refund dispute or an ad review would turn on.

---

## Proof

Three real WhatsApp reviews, in `public/reviews/`, shown on **both** language
fronts with a translation caption where the language differs. Real customers
only — the testimonials array ships empty rather than invented, and the section
does not render when empty.

Marketing renders live in `public/marketing/` (hero, 3-step, same-result), one
pair per language, imported statically so `next/image` sizes them.

---

## Measurement

Events (`app/api/track/route.ts` allowlist): `gate_view`, `gate_pass`,
`start_view`, `start_cta` (position in `detail`), `offer_view`, `pay_attempt`,
plus the quiz's own.

`pay_attempt` exists because "reached checkout" and "paid" hid two opposite
failures: a man who never pressed Pay was stopped by the form or the price; a
man who pressed it and did not pay was stopped by the rail — wrong PIN, no
balance, or Fapshi direct-pay unapproved.

**Migrations to run in order:** `009_start_funnel.sql`, `010_whatsapp.sql`,
`011_two_funnels.sql`. All re-runnable. 011 defines `direct_refs` and
`quiz_refs` once so the two funnels can never count each other's traffic.

**Admin:** Overview (both roads, counts only), Quiz funnel, Direct funnel (one
block per language, never merged). No percentage of a previous step — the road
is not a strict sequence and that division printed 300%.

---

## Payments — do not touch

Fapshi (Mobile Money, XAF) and Whop (card, USD) are wired and working. The
owner's instruction stands: **the integration is not to be changed.** Presentation
inside `PayPanel.tsx` is fair game; the charge path is not.

Email is **optional at checkout** — plenty of men here have none, and demanding
one at the moment he reaches for his PIN made him leave or invent an address,
pay, and never receive a code. He gives an email OR a WhatsApp number, stored
separately from the paying number because the handset holding the money is
often not the one he reads. The sale alert carries both and says NO EMAIL when
the code must go out by hand. Needs `ADMIN_EMAIL` set in Vercel.

---

## Outstanding

- [ ] Run 009, 010, 011
- [ ] `ADMIN_EMAIL=gonumber1ai@gmail.com` in Vercel, then redeploy
- [ ] Point the ads at `/wellness` — they still go to `/quiz`
- [ ] Watch `b2`: 10 gate views, 0 passed. Let it reach 30 before acting. If it
      is still near zero, the gate goes and ads point at `/start`.
- [ ] Monthly subscription is the right answer to the 15,000 LTV ceiling — men
      here already pay ~5,000/month for herbs. Build after the price test reads.
