-- ===========================================================================
-- Metron — migration 013
--   1. split the last step of the /c funnel in two
--   2. add a day-by-day version of it
--
-- SELF-CONTAINED. Supersedes 012_funnel_d2.sql — running this file alone is
-- enough, whether or not 012 was ever run.
--
-- ── 1. WHAT CHANGED AND WHY ───────────────────────────────────────────────
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
--   saw_checkout reached /offer from /c        offer_view, after a start_cta c_*
--   form_shown   Fapshi's frame loaded         checkout_form
--   pushed       a USSD reached his handset    pay_pushed
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
  -- Only men who got there FROM this page. offer_view fires on /offer however
  -- he arrived, and a ref that once landed on /c and later reached /offer
  -- from another funnel was being counted here — which is how a day showed
  -- four men reaching a checkout that three had pressed a button for.
  count(distinct e.ref) filter (where e.name = 'offer_view'
                                  and e.ref in (select ref from public.events
                                                where name = 'start_cta'
                                                  and detail like 'c\_%'))   as saw_checkout,
  -- Fapshi's frame finished loading on his phone. Without this, a man whose
  -- frame never came up and a man who saw it and walked away were the same
  -- row.
  count(distinct e.ref) filter (where e.name = 'checkout_form')            as form_shown,
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


-- ===========================================================================
-- 2. THE SAME FUNNEL, ONE ROW PER DAY
--
-- ── A MAN BELONGS TO THE DAY HE ARRIVED, NOT THE DAY HE ACTED ─────────────
-- The obvious way to do this is to date each event and group by that. It is
-- wrong here: a man who arrives Monday night and pays Tuesday morning would
-- be an arrival on Monday and a payment on Tuesday, so Monday reads as a day
-- that sold nothing and Tuesday as a day that sold to nobody. Both false, and
-- the error grows exactly when it matters — around a change you are trying to
-- read the effect of.
--
-- So each ref is stamped with the day of its FIRST landing on /c and every
-- step it later takes is counted on that day. A row then answers the only
-- question worth asking: of the men who arrived on this day, how far did they
-- get. Each ref appears on exactly one day, so the days add up to the totals
-- in funnel_d2 above.
--
-- ── THE CLOCK IS DOUALA'S ─────────────────────────────────────────────────
-- created_at is UTC. Cameroon is UTC+1, so anything after 23:00 local lands
-- on the wrong day if you date it in UTC — which is a real part of the
-- evening, and the evening is when this traffic buys.
-- ===========================================================================

drop view if exists public.funnel_d2_daily;
create view public.funnel_d2_daily as
with cohort as (
  select
    ref,
    (min(created_at) at time zone 'Africa/Douala')::date as day
  from public.events
  where name = 'start_view' and detail = 'c'
  group by ref
)
select
  c.day,
  coalesce(e.campaign, '(none)')                                           as campaign,
  e.locale,
  count(distinct e.ref) filter (where e.name = 'start_view'
                                  and e.detail = 'c')                      as arrived,
  count(distinct e.ref) filter (where e.name = 'quiz_complete'
                                  and e.detail = 'c')                      as passed_quiz,
  count(distinct e.ref) filter (where e.name = 'start_cta'
                                  and e.detail like 'c\_%')                as clicked,
  -- Only men who got there FROM this page. offer_view fires on /offer however
  -- he arrived, and a ref that once landed on /c and later reached /offer
  -- from another funnel was being counted here — which is how a day showed
  -- four men reaching a checkout that three had pressed a button for.
  count(distinct e.ref) filter (where e.name = 'offer_view'
                                  and e.ref in (select ref from public.events
                                                where name = 'start_cta'
                                                  and detail like 'c\_%'))   as saw_checkout,
  -- Fapshi's frame finished loading on his phone. Without this, a man whose
  -- frame never came up and a man who saw it and walked away were the same
  -- row.
  count(distinct e.ref) filter (where e.name = 'checkout_form')            as form_shown,
  count(distinct e.ref) filter (where e.name = 'pay_pushed')               as pushed,
  count(distinct p.ref)                                                    as paid
from public.events e
join cohort c on c.ref = e.ref
left join public.payments p
  on p.ref = e.ref and p.status = 'paid'
group by c.day, coalesce(e.campaign, '(none)'), e.locale
order by c.day desc, arrived desc;
