-- ===========================================================================
-- Metron — migration 014: "Learn test", the bootcamp signup page (/learn)
--
-- Two views. Self-contained; run once.
--
--   learn_daily     arrivals and signups per link per day, by the day a
--                   visitor first landed — same rule as funnel_d2_daily
--   learn_signups   the people, newest first, so the admin can call them
--
-- Leads for the bootcamp live in the same `leads` table as everything else,
-- kept apart by plan = 'learn'.
-- ===========================================================================

drop view if exists public.learn_daily;
create view public.learn_daily as
with cohort as (
  select
    ref,
    (min(created_at) at time zone 'Africa/Douala')::date as day
  from public.events
  where name = 'start_view' and detail = 'learn'
  group by ref
)
select
  c.day,
  coalesce(e.campaign, '(none)')                                           as campaign,
  count(distinct e.ref) filter (where e.name = 'start_view'
                                  and e.detail = 'learn')                  as arrived,
  count(distinct e.ref) filter (where e.name = 'learn_signup')             as signed_up
from public.events e
join cohort c on c.ref = e.ref
group by c.day, coalesce(e.campaign, '(none)')
order by c.day desc, arrived desc;

drop view if exists public.learn_signups;
create view public.learn_signups as
select
  l.name,
  l.phone,
  l.contact                                                  as email,
  l.locale,
  l.ref,
  (l.created_at at time zone 'Africa/Douala')                as signed_at,
  -- which link brought them, read from their own events
  (select e.campaign from public.events e
     where e.ref = l.ref and e.campaign is not null
     order by e.created_at asc limit 1)                      as campaign
from public.leads l
where l.plan = 'learn'
order by l.created_at desc;
