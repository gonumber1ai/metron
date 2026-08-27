-- ===========================================================================
-- Metron — migration 002: capture the intake, not just the sale
--
-- Run in the Supabase SQL editor after schema.sql.
--
-- Why: everything a man tells us happens BEFORE he pays — the assessment, his
-- name, his number, his email. Until now none of it was kept unless the
-- payment completed, so a man who filled the form and then abandoned at the
-- checkout page left no trace at all. Those are the most valuable people on
-- the site: they wanted it enough to type their details.
--
-- The quiz is stored as the scored result, not raw answers, so the admin view
-- reads "conditioned, 2 min, wants 15" rather than a wall of option ids.
-- ===========================================================================

alter table public.leads add column if not exists name        text;
alter table public.leads add column if not exists phone       text;
alter table public.leads add column if not exists quiz        jsonb;
alter table public.leads add column if not exists stage       text
  not null default 'lead' check (stage in ('lead','checkout_started','paid'));
alter table public.leads add column if not exists provider    text;
alter table public.leads add column if not exists updated_at  timestamptz not null default now();

-- One row per device, updated as he moves along, rather than a new row every
-- time he touches something. Without this a man who retries a failed payment
-- three times appears as four different people.
create unique index if not exists leads_ref_key on public.leads (ref) where ref is not null;

create index if not exists leads_stage_idx on public.leads (stage, created_at desc);

-- ---------------------------------------------------------------------------
-- Admin view: who is in the funnel, and where they stopped.
-- ---------------------------------------------------------------------------
create or replace view public.intake as
select
  l.created_at,
  l.updated_at,
  l.stage,
  l.name,
  l.contact,
  l.phone,
  l.locale,
  l.plan,
  l.provider,
  l.quiz ->> 'pattern'                         as pattern,
  (l.quiz ->> 'now')::numeric                  as lasts_now_min,
  (l.quiz ->> 'want')::numeric                 as wants_min,
  (l.quiz ->> 'gap')::numeric                  as gap_min,
  l.quiz -> 'flags'                            as flags,
  l.ref
from public.leads l
order by l.updated_at desc;

-- The view inherits the table's RLS. leads has RLS on with no policy, so only
-- the service role can read it — which is what the admin side uses.
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
