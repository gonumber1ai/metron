-- ===========================================================================
-- Metron — migration 009: the /start funnel, and the gate in front of it
--
-- Run after 008_dropoff_fix.sql.
--
-- The quiz funnel is measured (007). The direct sales page is not. It fires
-- quiz_start with detail 'direct' and then nothing until the checkout, so the
-- admin screen shows men entering and men paying with a black box between —
-- and that black box is the entire page we keep rewriting.
--
-- Two new events close it:
--   gate_pass   the visitor cleared the age gate the ad points at
--   start_cta   he pressed a buy button, and WHICH one (detail = position)
--
-- Position matters more than the total. Five buttons sit on that page — hero,
-- urgency, offer, guarantee, final, sticky — and knowing that the urgency
-- block closes three men for every one the hero closes tells you what to
-- write more of. A single undifferentiated "clicked" number does not.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- The direct funnel, per ad.
--
-- DISTINCT refs throughout: a man who reloads the page four times is one man,
-- and counting rows would make confused traffic look like good traffic.
--
-- Deliberately separate from funnel_by_campaign rather than bolted onto it.
-- The quiz funnel and the direct funnel have different steps, and forcing
-- them into one table produces a column that is null for half the rows and a
-- screen nobody can read.
-- ---------------------------------------------------------------------------
create or replace view public.funnel_start as
select
  coalesce(e.campaign, '(none)')                                        as campaign,
  e.locale,
  count(distinct e.ref) filter (where e.name = 'gate_view')             as gate_views,
  count(distinct e.ref) filter (where e.name = 'gate_pass')             as gate_passed,
  count(distinct e.ref) filter (
    where e.name = 'quiz_start' and e.detail = 'direct'
  )                                                                     as page_views,
  count(distinct e.ref) filter (where e.name = 'start_cta')             as clicked,
  count(distinct e.ref) filter (where e.name = 'offer_view')            as saw_checkout,
  count(distinct p.ref)                                                 as paid,
  min(e.created_at)                                                     as first_seen,
  max(e.created_at)                                                     as last_seen
from public.events e
left join public.payments p
  on p.ref = e.ref and p.status = 'paid'
group by coalesce(e.campaign, '(none)'), e.locale
having count(distinct e.ref) filter (
         where e.name in ('gate_view', 'start_cta')
            or (e.name = 'quiz_start' and e.detail = 'direct')
       ) > 0
order by page_views desc;

-- ---------------------------------------------------------------------------
-- Which button on the page actually closes him.
--
-- One row per CTA position. `people` counts distinct men rather than presses,
-- because a man who taps the sticky bar three times before paying is one
-- decision, not three.
-- ---------------------------------------------------------------------------
create or replace view public.start_cta_breakdown as
select
  coalesce(e.detail, '(unknown)')  as position,
  e.locale,
  count(distinct e.ref)            as people,
  count(*)                         as presses,
  count(distinct p.ref)            as paid
from public.events e
left join public.payments p
  on p.ref = e.ref and p.status = 'paid'
where e.name = 'start_cta'
group by coalesce(e.detail, '(unknown)'), e.locale
order by people desc;

-- The events table already indexes (name, created_at) and (campaign, name).
-- The views above also filter quiz_start on detail, which is low-cardinality
-- and only ever scanned within one name, so no extra index earns its keep yet.
