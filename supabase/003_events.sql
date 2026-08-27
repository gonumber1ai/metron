-- ===========================================================================
-- Metron — migration 003: funnel events and the admin view
--
-- Run in the Supabase SQL editor after 002_intake.sql.
--
-- We cannot see who merely LOOKED at a page without adding an analytics
-- vendor, and adding one to this product means handing a third party a list of
-- men who visited a sexual-health site. So we record actions instead: the
-- moment he taps Start, each question he answers, the result page, checkout,
-- payment. Every row is an act he chose, tied only to an anonymous ref.
--
-- Recording the question NUMBER is the point. "60 started, 25 finished" tells
-- you something is wrong; "18 of the 35 quit on question 6" tells you what.
-- ===========================================================================

create table if not exists public.events (
  id         bigserial primary key,
  ref        text not null,
  name       text not null,
  -- question index for quiz_answer, plan for checkout, and so on
  detail     text,
  locale     text not null default 'en',
  country    text,
  created_at timestamptz not null default now()
);

create index if not exists events_name_idx on public.events (name, created_at desc);
create index if not exists events_ref_idx  on public.events (ref, created_at);

alter table public.events enable row level security;
-- No policy: only the service role touches this. Nothing client-side reads it.

-- ---------------------------------------------------------------------------
-- Funnel: one row per step, with how many reached it.
-- ---------------------------------------------------------------------------
create or replace view public.funnel as
with steps as (
  select 'quiz_start'       as step, 1 as ord, count(distinct ref) as people from public.events where name = 'quiz_start'
  union all
  select 'quiz_complete',      2, count(distinct ref) from public.events where name = 'quiz_complete'
  union all
  select 'result_view',        3, count(distinct ref) from public.events where name = 'result_view'
  union all
  select 'offer_view',         4, count(distinct ref) from public.events where name = 'offer_view'
  union all
  select 'checkout_started',   5, count(distinct ref) from public.leads  where stage in ('checkout_started','paid')
  union all
  select 'paid',               6, count(distinct ref) from public.leads  where stage = 'paid'
)
select
  step,
  people,
  round(
    100.0 * people / nullif(max(people) over (), 0), 1
  ) as pct_of_top
from steps
order by ord;

-- ---------------------------------------------------------------------------
-- Where the quiz loses people. The last question each man answered, counted.
-- ---------------------------------------------------------------------------
create or replace view public.quiz_dropoff as
with last_seen as (
  select ref, max((detail)::int) as last_question
  from public.events
  where name = 'quiz_answer' and detail ~ '^[0-9]+$'
  group by ref
),
finished as (
  select distinct ref from public.events where name = 'quiz_complete'
)
select
  l.last_question + 1                        as reached_question,
  count(*) filter (where f.ref is null)      as quit_here,
  count(*)                                   as reached
from last_seen l
left join finished f on f.ref = l.ref
group by l.last_question
order by l.last_question;
