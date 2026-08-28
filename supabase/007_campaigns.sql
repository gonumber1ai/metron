-- ===========================================================================
-- Metron — migration 007: which ad actually worked
--
-- Run after 006_activity_day30.sql.
--
-- Splitting the funnel by language answers half the question. Two English ads
-- running at once are still one undivided number, and the whole point of
-- testing four creatives is to find the one worth putting money behind.
--
-- So every visitor carries the tag from the link he arrived on, from his first
-- page view to his purchase, and the two views below turn that into a table
-- you can read in five seconds: for each ad, how many started, how many
-- finished, how many paid.
-- ===========================================================================

-- First touch, kept forever. Never overwritten on a later visit: a man who
-- clicks the French ad, leaves, and comes back through the English one three
-- days later was won by the French ad, and re-stamping him hands the credit to
-- whichever ad happened to be last.
alter table public.events add column if not exists campaign text;
alter table public.leads  add column if not exists campaign text;

create index if not exists events_campaign_idx on public.events (campaign, name);
create index if not exists leads_campaign_idx  on public.leads (campaign);

-- ---------------------------------------------------------------------------
-- Per-ad funnel.
--
-- Counts DISTINCT refs, not rows. A man who reloads the quiz four times is one
-- man, and counting rows would make the worst ad look like the best simply
-- because its traffic was confused.
-- ---------------------------------------------------------------------------
create or replace view public.funnel_by_campaign as
select
  coalesce(e.campaign, '(none)')                                     as campaign,
  e.locale,
  count(distinct e.ref) filter (where e.name = 'quiz_start')         as started,
  count(distinct e.ref) filter (where e.name = 'quiz_complete')      as finished,
  count(distinct e.ref) filter (where e.name = 'offer_view')         as saw_offer,
  count(distinct p.ref)                                              as paid,
  min(e.created_at)                                                  as first_seen,
  max(e.created_at)                                                  as last_seen
from public.events e
left join public.payments p
  on p.ref = e.ref and p.status = 'paid'
group by coalesce(e.campaign, '(none)'), e.locale
order by started desc;

-- ---------------------------------------------------------------------------
-- Same funnel, by language only. Useful once several ads run per language and
-- the question becomes "is French worth the translation effort at all".
-- ---------------------------------------------------------------------------
create or replace view public.funnel_by_locale as
select
  e.locale,
  count(distinct e.ref) filter (where e.name = 'quiz_start')    as started,
  count(distinct e.ref) filter (where e.name = 'quiz_complete') as finished,
  count(distinct e.ref) filter (where e.name = 'offer_view')    as saw_offer,
  count(distinct p.ref)                                         as paid
from public.events e
left join public.payments p
  on p.ref = e.ref and p.status = 'paid'
group by e.locale
order by started desc;
