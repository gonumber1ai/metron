# Fapshi Direct Pay — application email

Send to **support@fapshi.com**. Their guide is explicit that answering every
question speeds up review, and that Direct Pay is only approved for cases where
it is *genuinely necessary* — so the justification below leads with the reason
rather than the convenience.

**Before you send it:** they require that you have already implemented and
tested Direct Pay in **sandbox**. Point `FAPSHI_BASE_URL` at
`https://sandbox.fapshi.com` with the sandbox service's own credentials, set
`FAPSHI_DIRECT_PAY=1`, and run one payment through with a test number
(670000000 succeeds, 670000001 fails). Then say so honestly in the email.

---

**Subject:** Direct Pay activation request — METRON (metron.life)

> Hello Fapshi team,
>
> I would like to request Direct Pay activation for my live service.
>
> **Full name:** [your full name]
> **Fapshi account email:** [the email on the account]
> **Registered business name:** [registered name]
> **Application type:** Web application (mobile-first, installable as a PWA)
> **Live API User ID:** e8c2660f-586d-4262-8175-53e9440462b4
> **Live website:** https://metron.life
>
> **How the platform works**
>
> METRON is a paid men's health programme delivered entirely in the browser.
> A visitor completes a short private assessment, receives a personalised
> result, and can then buy a 10-day programme for 7,500 FCFA or a 30-day
> programme for 69,000 FCFA. Payment unlocks a day-by-day plan inside the
> web app. There is no physical product and no recurring billing — each
> purchase is a single one-time charge.
>
> **Sandbox testing**
>
> Yes. I implemented Direct Pay against https://sandbox.fapshi.com using my
> sandbox service credentials and confirmed the full flow with your published
> test numbers: a successful charge with 670000000 and a declined one with
> 670000001. Payment status polling and the webhook were both verified in
> sandbox before this request.
>
> **Why Direct Pay rather than Initiate Pay**
>
> The subject matter is private, and privacy is the core promise of the
> product — customers are told that nothing on their device or bank statement
> reveals what they bought.
>
> Initiate Pay sends the customer to an external checkout page and back again.
> On this particular product, that redirect is where customers abandon: the
> page leaves our site, the URL changes, and a man who is already uneasy about
> the purchase closes the tab. Keeping the payment inside our own interface —
> he enters his number, approves the USSD prompt on his handset, and never
> navigates away — removes that break entirely.
>
> Initiate Pay is currently live and working on my account, so this is a
> request to improve an existing, functioning integration rather than to get a
> first payment path working.
>
> I am happy to provide a walkthrough of the checkout, or a screen recording
> of the sandbox flow, if that helps the review.
>
> Thank you,
> [your name]
> [phone number]

---

## When it is approved

One environment variable:

```
FAPSHI_DIRECT_PAY=1
```

Redeploy, and the embedded phone-number form takes over automatically. Nothing
else changes — the hosted-link fallback stays in place underneath, so if
direct-pay ever errors the funnel still sells instead of stopping.

## If they decline

Nothing breaks. The hosted checkout is what runs today and it takes money. The
only cost is one redirect out and back, and the return page already verifies
the payment properly on the way in.
