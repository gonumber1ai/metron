-- ===========================================================================
-- Metron — migration 011: two funnels, neither able to see the other
--
-- Run after 010_whatsapp.sql. Safe to re-run.
--
-- ── WHAT WAS WRONG ────────────────────────────────────────────────────────
-- The two roads shared events, so every screen mixed them.
--
--   1. /start fired `quiz_start`. Every man on the direct page was counted as
--      having started the quiz, so the quiz funnel's first step was inflated
--      by traffic that never saw a question.
--   2. `offer_view` fires on /offer however a man arrived, so quiz buyers
--      landed in the direct funnel's checkout and paid columns — which is how
--      a tag with one page view showed three checkouts, and a tag with zero
--      button presses showed a sale.
--
-- The page now fires `start_view`, and both views below are anchored to a set
-- of refs that belong to one road. A ref lands in exactly one set: the events
-- that define them cannot both be produced by the same visit.
--
-- Legacy rows recorded before the split still say quiz_start/'direct', so the
-- direct set reads both names. That marker is what keeps the quiz set clean
-- for the same period, which is why it is matched on rather than ignored.
--
-- Language is never merged. Every view groups by locale, so an English and a
-- French ad under the same tag are two rows and can never average together.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Who walked which road.
--
-- direct_refs  touched the gate, the direct page, one of its buy buttons, or
--              the pay button on the checkout it sent them to.
-- quiz_refs    started the quiz and never touched any of that.
--
-- Kept as views rather than repeated in each funnel: the definition of "this
-- man is on that road" belongs in one place, or the two screens drift apart
-- the first time a step is added to either.
-- ---------------------------------------------------------------------------
create or replace view public.direct_refs as
select distinct ref
from public.events
where name in ('gate_view', 'gate_pass', 'start_view', 'start_cta', 'pay_attempt')
   or (name = 'quiz_start' and detail = 'direct');

create or replace view public.quiz_refs as
select distinct e.ref
from public.events e
where e.name = 'quiz_start'
  and coalesce(e.detail, '') <> 'direct'
  and not exists (select 1 from public.direct_refs d where d.ref = e.ref);

-- ---------------------------------------------------------------------------
-- THE DIRECT FUNNEL: gate → page → buy → checkout → pay → paid
-- ---------------------------------------------------------------------------
drop view if exists public.funnel_start;

create view public.funnel_start as
select
  coalesce(e.campaign, '(none)')                                     as campaign,
  e.locale,
  count(distinct e.ref) filter (where e.name = 'gate_view')          as gate_views,
  count(distinct e.ref) filter (where e.name = 'gate_pass')          as gate_passed,
  count(distinct e.ref) filter (
    where e.name = 'start_view'
       or (e.name = 'quiz_start' and e.detail = 'direct')
  )                                                                  as page_views,
  count(distinct e.ref) filter (where e.name = 'start_cta')          as clicked,
  count(distinct e.ref) filter (where e.name = 'offer_view')         as saw_checkout,
  count(distinct e.ref) filter (where e.name = 'pay_attempt')        as tried_to_pay,
  count(distinct p.ref)                                              as paid,
  min(e.created_at)                                                  as first_seen,
  max(e.created_at)                                                  as last_seen
from public.events e
join public.direct_refs d on d.ref = e.ref
left join public.payments p on p.ref = e.ref and p.status = 'paid'
group by coalesce(e.campaign, '(none)'), e.locale
order by page_views desc;

-- Which block on the page closes him. Direct road by definition.
drop view if exists public.start_cta_breakdown;

create view public.start_cta_breakdown as
select
  coalesce(e.detail, '(unknown)') as position,
  e.locale,
  count(distinct e.ref)           as people,
  count(*)                        as presses,
  count(distinct p.ref)           as paid
from public.events e
left join public.payments p on p.ref = e.ref and p.status = 'paid'
where e.name = 'start_cta'
group by coalesce(e.detail, '(unknown)'), e.locale
order by people desc;

-- ---------------------------------------------------------------------------
-- THE QUIZ FUNNEL: started → finished → checkout → paid
--
-- Same columns as before so the Ads tab keeps working, but restricted to men
-- who actually took the quiz. Anyone who arrived through the direct page is
-- excluded, including their payment.
-- ---------------------------------------------------------------------------
drop view if exists public.funnel_by_campaign;

create view public.funnel_by_campaign as
select
  coalesce(e.campaign, '(none)')                                as campaign,
  e.locale,
  count(distinct e.ref) filter (where e.name = 'quiz_start')    as started,
  count(distinct e.ref) filter (where e.name = 'quiz_complete') as finished,
  count(distinct e.ref) filter (where e.name = 'offer_view')    as saw_offer,
  count(distinct p.ref)                                         as paid,
  min(e.created_at)                                             as first_seen,
  max(e.created_at)                                             as last_seen
from public.events e
join public.quiz_refs q on q.ref = e.ref
left join public.payments p on p.ref = e.ref and p.status = 'paid'
group by coalesce(e.campaign, '(none)'), e.locale
order by started desc;

drop view if exists public.funnel_by_locale;

create view public.funnel_by_locale as
select
  e.locale,
  count(distinct e.ref) filter (where e.name = 'quiz_start')    as started,
  count(distinct e.ref) filter (where e.name = 'quiz_complete') as finished,
  count(distinct e.ref) filter (where e.name = 'offer_view')    as saw_offer,
  count(distinct p.ref)                                         as paid
from public.events e
join public.quiz_refs q on q.ref = e.ref
left join public.payments p on p.ref = e.ref and p.status = 'paid'
group by e.locale
order by started desc;
