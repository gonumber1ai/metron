-- ===========================================================================
-- Metron — migration 012: Direct Funnel 2 (the /c challenge page)
--
-- Run after 011_two_funnels.sql.
--
-- Seven French Facebook links, one page, one table. Each row is one ad tag,
-- and the columns are the steps a man actually walks on /c, in order:
--
--   arrived      landed on the page            start_view, detail 'c'
--   passed_quiz  answered all three questions  quiz_complete, detail 'c'
--   clicked      pressed any buy button        start_cta, detail 'c_*'
--   saw_checkout reached /offer                offer_view
--   tried_to_pay pressed Pay                   pay_attempt
--   paid         money moved                   payments.status = 'paid'
--
-- ── SCOPED TO MEN WHO WALKED THIS PAGE ────────────────────────────────────
-- offer_view fires on /offer however a man got there. Counting it unscoped
-- is how earlier panels showed checkouts under tags that had no page views —
-- traffic from another funnel under the same tag was leaking in. A ref is in
-- this table only if it fired start_view with detail 'c'. Everything after is
-- counted for that ref alone.
--
-- Counts are DISTINCT refs, not rows. One man reloading is one man.
-- ===========================================================================

drop view if exists public.funnel_d2;
create view public.funnel_d2 as
with here as (
  select distinct ref
  from public.events
  where name = 'start_view' and detail = 'c'
)
select
  coalesce(e.campaign, '(none)')                                           as campaign,
  e.locale,
  count(distinct e.ref) filter (where e.name = 'start_view'
                                  and e.detail = 'c')                      as arrived,
  count(distinct e.ref) filter (where e.name = 'quiz_complete'
                                  and e.detail = 'c')                      as passed_quiz,
  count(distinct e.ref) filter (where e.name = 'start_cta'
                                  and e.detail like 'c\_%')                as clicked,
  count(distinct e.ref) filter (where e.name = 'offer_view')               as saw_checkout,
  count(distinct e.ref) filter (where e.name = 'pay_attempt')              as tried_to_pay,
  count(distinct p.ref)                                                    as paid,
  min(e.created_at)                                                        as first_seen,
  max(e.created_at)                                                        as last_seen
from public.events e
join here h on h.ref = e.ref
left join public.payments p
  on p.ref = e.ref and p.status = 'paid'
group by coalesce(e.campaign, '(none)'), e.locale
order by arrived desc;
