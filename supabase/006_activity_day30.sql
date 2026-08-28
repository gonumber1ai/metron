-- ===========================================================================
-- Metron — migration 006: show the Day 30 number in the admin
--
-- Run after 005_broadcast.sql.
--
-- The activity view read Day 1 and Day 12 only, which was right when the
-- 10-Day Reset was the whole product. A Sprint customer measures again on Day
-- 30, and that number — the one he actually paid 69 000 for — never reached
-- any screen. The admin was looking at a man's half-time score and calling it
-- his result.
--
-- `final_seconds` is Day 30 where it exists and falls back to Day 12, so the
-- column means "his most recent measurement" for every customer on either
-- plan, and a 10-day buyer is unaffected. retest_seconds stays exactly as it
-- was so nothing that already reads it changes meaning.
-- ===========================================================================

-- Dropped and recreated rather than "create or replace". Postgres will only
-- let a replace ADD columns at the end of a view; these two land before
-- `unread`, so it refuses with "cannot change name of view column". Nothing
-- depends on this view — the server queries it by name — so dropping is safe
-- and keeps the columns in a sensible order.
drop view if exists public.activity;

create view public.activity as
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
  (select (m ->> 'seconds')::int from jsonb_array_elements(coalesce(p.measurements,'[]')) m
    where (m ->> 'day')::int = 1 limit 1)             as baseline_seconds,
  (select (m ->> 'seconds')::int from jsonb_array_elements(coalesce(p.measurements,'[]')) m
    where (m ->> 'day')::int = 12 limit 1)            as retest_seconds,
  (select (m ->> 'seconds')::int from jsonb_array_elements(coalesce(p.measurements,'[]')) m
    where (m ->> 'day')::int = 30 limit 1)            as final_seconds,
  -- Whichever is the latest he has taken. This is the column worth reading.
  coalesce(
    (select (m ->> 'seconds')::int from jsonb_array_elements(coalesce(p.measurements,'[]')) m
      where (m ->> 'day')::int = 30 limit 1),
    (select (m ->> 'seconds')::int from jsonb_array_elements(coalesce(p.measurements,'[]')) m
      where (m ->> 'day')::int = 12 limit 1)
  )                                                   as latest_seconds,
  (select count(*) from public.threads t
    where t.ref = l.ref and t.sender = 'user' and not t.read_by_admin) as unread
from public.leads l
left join public.progress p on p.ref = l.ref
where l.stage = 'paid'
order by p.updated_at desc nulls last;
