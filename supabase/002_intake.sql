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
