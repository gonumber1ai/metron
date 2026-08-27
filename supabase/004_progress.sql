-- ===========================================================================
-- Metron — migration 004: progress, and the admin thread
--
-- Run after 003_events.sql.
--
-- Why this exists: everything a paying customer does — his measurements, his
-- training sessions, his nightly markers, which day he is on — was living in
-- his browser and nowhere else. That meant nobody could see whether anyone was
-- actually using what they bought, a man who cleared his data lost his whole
-- history, and the refund promise could not be checked against anything.
--
-- Keyed on `ref`, the anonymous handle, exactly like leads and payments. Still
-- no real name anywhere.
-- ===========================================================================

create table if not exists public.progress (
  ref           text primary key,
  plan          text check (plan in ('test','sprint')),
  day           smallint not null default 0 check (day between 0 and 30),
  started_at    timestamptz,
  -- kept whole rather than shredded into rows: the app owns the shape, and a
  -- migration should never be needed to add a field to a marker log
  measurements  jsonb not null default '[]'::jsonb,
  sessions      jsonb not null default '[]'::jsonb,
  markers       jsonb not null default '[]'::jsonb,
  updated_at    timestamptz not null default now()
);

create index if not exists progress_updated_idx on public.progress (updated_at desc);

alter table public.progress enable row level security;
-- No policy: written by the server with the service role, read only by admin.

-- ---------------------------------------------------------------------------
-- Admin thread. The app already had a messages table keyed to a profile, but
-- there are no profiles — nobody signs up, they pay and get a code. This is
-- the same idea keyed on ref.
-- ---------------------------------------------------------------------------
create table if not exists public.threads (
  id         bigserial primary key,
  ref        text not null,
  sender     text not null check (sender in ('user','coach')),
  body       text not null check (length(body) between 1 and 4000),
  read_by_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists threads_ref_idx on public.threads (ref, created_at);
create index if not exists threads_unread_idx on public.threads (read_by_admin, created_at desc)
  where sender = 'user';

alter table public.threads enable row level security;
-- No policy: the server mediates every read and write.

-- ---------------------------------------------------------------------------
-- Who is actually doing the programme.
--
-- Left join from leads so a man who paid and never opened the app still
-- appears, with nulls — that is the row worth chasing, and an inner join would
-- hide exactly the people you need to see.
-- ---------------------------------------------------------------------------
create or replace view public.activity as
select
  l.ref,
  l.name,
  l.contact,
  l.phone,
  l.stage,
  l.plan,
  l.created_at                                        as joined,
  p.day,
  p.updated_at                                        as last_seen,
  jsonb_array_length(coalesce(p.measurements, '[]'))  as measurements,
  jsonb_array_length(coalesce(p.sessions, '[]'))      as sessions,
  jsonb_array_length(coalesce(p.markers, '[]'))       as markers,
  -- day 1 and day 12, in seconds, so the admin can see the promise being met
  (select (m ->> 'seconds')::int from jsonb_array_elements(coalesce(p.measurements,'[]')) m
    where (m ->> 'day')::int = 1 limit 1)             as baseline_seconds,
  (select (m ->> 'seconds')::int from jsonb_array_elements(coalesce(p.measurements,'[]')) m
    where (m ->> 'day')::int = 12 limit 1)            as retest_seconds,
  (select count(*) from public.threads t
    where t.ref = l.ref and t.sender = 'user' and not t.read_by_admin) as unread
from public.leads l
left join public.progress p on p.ref = l.ref
where l.stage = 'paid'
order by p.updated_at desc nulls last;
