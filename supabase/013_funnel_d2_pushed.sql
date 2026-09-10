-- ===========================================================================
-- Metron — migration 013: split the last step of the /c funnel in two
--
-- SELF-CONTAINED. Supersedes 012_funnel_d2.sql — running this file alone is
-- enough, whether or not 012 was ever run.
--
-- ── WHAT CHANGED AND WHY ──────────────────────────────────────────────────
-- `tried_to_pay` counted pay_attempt, which used to mean a man pressed a Pay
-- button on our own form. That form is gone: the checkout now opens Fapshi
-- the instant he arrives, so pay_attempt fires on arrival and the column had
-- become an exact copy of saw_checkout — a step that reads 100% and answers
-- nothing.
--
-- It is replaced by `pushed`, from the pay_pushed event, which fires when the
-- transaction leaves CREATED — meaning he filled Fapshi's own form and a USSD
-- prompt reached a handset. Their page is on their origin so we cannot watch
-- it, but we poll payment-status every three seconds while it is open, and
-- that status change is the only honest signal that he tried.
--
-- ── WHY IT IS THE COLUMN THAT DECIDES THE PRICE ───────────────────────────
-- The two halves of the old last step point at opposite fixes:
--
--   reached checkout, never pushed   he is refusing to pay
--   pushed, never paid               he is failing to — an empty wallet,
--                                    or a PIN he never entered
--
-- Only the second is a price problem. Dropping the price to answer the first
-- one treats a man who was never going to pay as a man who could not afford
-- to, and learns nothing either way.
--
--   arrived      landed on the page            start_view, detail 'c'
--   passed_quiz  said yes to the one question  quiz_complete, detail 'c'
--   clicked      pressed any buy button        start_cta, detail 'c_*'
--   saw_checkout reached /offer                offer_view
--   pushed       a prompt reached his handset  pay_pushed
--   paid         money moved                   payments.status = 'paid'
--
-- Scoped to refs that fired start_view with detail 'c', so traffic from
-- another funnel under the same tag cannot leak in. Counts are DISTINCT refs:
-- one man reloading is one man.
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
  count(distinct e.ref) filter (where e.name = 'pay_pushed')               as pushed,
  count(distinct p.ref)                                                    as paid,
  min(e.created_at)                                                        as first_seen,
  max(e.created_at)                                                        as last_seen
from public.events e
join here h on h.ref = e.ref
left join public.payments p
  on p.ref = e.ref and p.status = 'paid'
group by coalesce(e.campaign, '(none)'), e.locale
order by arrived desc;
