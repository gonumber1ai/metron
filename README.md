# Metron

Funnel + programme app for a measured, training-based approach to ejaculatory control.
English and French. Dark app, light editorial funnel. Built for phones on expensive mobile data.

**Brand stack**

| Layer | Name |
|---|---|
| Brand / app / billing descriptor / notifications | **Metron** |
| Mechanism | **The 6/10 Method** |
| Trial | **The 10-Day Test** — 7 500 FCFA / $15 |
| Core | **The 30-Day Stamina Sprint** — 175 000 FCFA / $350 |

The word "stamina" appears only in things he reads **before** buying. It never appears in the
app label, a notification, an email subject, or a card statement. That rule is the privacy
promise, and it is what the whole product is differentiated on.

---

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:3000 — you are redirected to `/en` or `/fr` based on your browser.

## The funnel

```
ad  →  /[locale]            advertorial (light, article-like, clears ad review)
       /[locale]/quiz       9 questions → opt-in gate → scoring
       /[locale]/result     personalised by pattern, medical flag branch
       /[locale]/offer      both rails, both plans, lead-capture fallback
       /[locale]/app        the programme
```

**The quiz is the conversion engine.** Nine questions, one per screen, buttons only. Certain
answers reflect a line back at him before moving on — that is where the assessment stops
feeling like a form. Scoring produces one of four patterns (`anxious`, `conditioned`,
`dependent`, `depleted`) plus two flags (`medical`, `compulsive`), which drive every downstream
page. Edit questions and weights in `lib/content/quiz.ts`, result copy in `lib/content/patterns.ts`.

**The gate** (`app/[locale]/quiz/Gate.tsx`) sits between the last question and the result. This
is where a non-buyer becomes reachable. It has a quiet skip link on purpose — in a category
built on privacy, a hard wall reads as bait-and-switch and costs more trust than it captures.

## The app

Bottom tab bar on mobile, sidebar on desktop, drawer for the rest.

| Route | What it does |
|---|---|
| `/app` | Today — the day's written brief, session spec, task checklist, daily rules |
| `/app/program` | All days grouped by phase, locked beyond current day |
| `/app/program/[day]` | Any reached day in full |
| `/app/measure` | Baseline / retest / final + the seven nightly markers |
| `/app/progress` | **The chart.** This is what closes the 30-day sale |
| `/app/lessons` | 19 lessons, unlocked by day |
| `/app/messages` | Private thread — the thing no competitor offers |
| `/app/settings` | Language, PIN, neutral notifications, delete everything |

First run shows a three-screen onboarding, ending on the medical screen.

## Content

All product content is data, in `lib/content/`. No copy is hardcoded in components.

| File | Contents |
|---|---|
| `protocol.en.ts` / `protocol.fr.ts` | Days 0–30, every brief, session spec and task |
| `lessons.en.ts` / `lessons.fr.ts` | 19 lessons |
| `patterns.ts` | The four result-page pattern write-ups |
| `quiz.ts` | Questions, scoring weights, echo lines |
| `marketing.ts` | Advertorial, offer, FAQ, disclaimer |
| `reviews.ts` | **Empty.** Add real ones as they arrive — see below |

### The day map

```
Day 0   Reset — no training. 48h abstinence window opens.
Day 1   Baseline, under four fixed conditions. Pelvic floor starts.
Day 2   Stop-start session 1. Ceiling 6.
Day 3   Session 2 — signals before the number
Day 4   Session 3 — 10s holds at 7
Day 5   Rest
Day 6   Session 4 — 20s holds
Day 7   Session 5 — varied stimulation
Day 8   Session 6 + mid-point marker check
Day 9   Rest
Day 10  Session 7 — deliberate finish. 48h window opens.
Day 11  Rest. Nothing.
Day 12  RETEST — same conditions, same mode.
─────── 10-Day Test ends here ───────
Day 13  Bottleneck diagnosis. Bloodwork list if nothing moved.
Day 14  Release work (reverse kegels) — every 3rd day from here
Day 15–22  Loading. Ceiling rises to 8, never 9. Strength week begins.
Day 23–27  PARTNER PHASE — the 30-day differentiator
Day 28–29  Rest, 48h window
Day 30  Final measurement + maintenance plan
```

Seven sessions across days 2–10 is roughly 5–6 per week. That dose is deliberate — four
sessions will not move a motor skill, and the retest failing is the only thing that can kill
the funnel.

### Adding reviews

`lib/content/reviews.ts` is empty and the page currently says so out loud, which converts
better than invented proof and cannot blow up later. When real ones arrive:

- Get **written permission** first. In this category this is not optional.
- Crop out the name and photo before adding a WhatsApp screenshot. First name plus city, or an
  initial. Never a full name, never a face.
- Only fill in `numbers` when the customer actually logged both measurements.
- Put screenshots in `public/reviews/`.

## Payments

`lib/payments/index.ts` — one interface, two rails, both stubbed until credentials land.

- **Fapshi** — MTN / Orange Mobile Money, XAF. The live call is written out in a comment; drop
  it in when the account is verified.
- **Whop** — international cards, USD, merchant of record. Needs only the plan ids; hosted
  checkout works as soon as `WHOP_PLAN_TEST` and `WHOP_PLAN_SPRINT` are set.

Until either is configured, `/offer` catches the failure and captures a contact instead of
dead-ending on a broken button.

**Before launch, verify the statement descriptor reads `METRON` on both rails.** That one
setting does more for the privacy promise than every feature in the app.

Prices live in a country-keyed price book in the same file. Never a single global price —
add a row per market.

## Built for global from day one

Cheap to do now, painful to retrofit, so already done:

- Money stored as minor units + ISO currency code, never hardcoded XAF
- One `PaymentProvider` interface — adding Stripe or Razorpay is one file
- `priceBook` keyed by country
- Every string in `lib/i18n/` — nothing hardcoded in a component
- Content split into **universal protocol** (fixed) and **regional layer** (`regional: true` on
  rules and lessons that name local food). Tigernuts, plantain and yam are regional, not core —
  expanding means swapping a food list, not rewriting the protocol.

## Still to do

1. **Supabase.** `lib/store.ts` is a thin swappable layer over `localStorage`. Reimplement it
   against Postgres with row-level security and nothing in the components changes. Use phone
   OTP — it matters more than email in Cameroon.
2. **A separate domain for the funnel.** Run ads and the advertorial from a throwaway domain,
   not `metron.life`. When a funnel domain gets flagged, the brand domain survives.
3. **Media on Cloudflare R2 or Bunny**, not Supabase storage. Zero egress.
4. **Audio, not video**, for the guided sessions — breath pacing, kegel timing, stop-start
   rhythm. A fraction of the size, and better for content he does with his eyes shut.
5. Real PNG icons at 192/512 for Android install.
6. Trademark check on "Metron" in classes 9, 41, 44 before spending on brand.

## Legal and safety

- Medical red flags are screened at intake (quiz Q3 and Q9), not at Day 13, and route to a
  "see a doctor first" branch on the result page.
- The disclaimer sits in `marketing.ts` and appears on the advertorial, the result page, every
  lesson, and settings.
- No claim that the programme cures or treats anything. No promised duration. No
  before/after imagery.
- The pill argument is the *citable* version — regulators finding undeclared pharmaceuticals in
  supplements marketed as herbal — not an unsourced blanket accusation. Keep it that way; it is
  both defensible and harder to wave away.
