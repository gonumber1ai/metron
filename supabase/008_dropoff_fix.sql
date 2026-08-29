-- ===========================================================================
-- Metron — migration 008: make the quiz drop-off table mean something
--
-- Run after 007_campaigns.sql.
--
-- The old view grouped men by the FURTHEST question they answered, then
-- reported "of the people whose furthest question was Q1, how many failed to
-- finish". That is 100% by construction — if your last answer was Q1 and you
-- did not finish, you quit at Q1 — so every row read 100% and the screen said
-- "most people quit on question 1" no matter what the data was.
--
-- What is actually wanted is a funnel: how many men REACHED each question, and
-- what share of them carried on. That is the number that says which question
-- is the wall.
-- ===========================================================================

drop view if exists public.quiz_dropoff;

create view public.quiz_dropoff as
with last_seen as (
  -- detail carries the zero-based question index, so +1 makes it human.
  select ref, max((detail)::int) + 1 as last_question
  from public.events
  where name = 'quiz_answer' and detail ~ '^[0-9]+$'
  group by ref
),
questions as (
  select generate_series(1, coalesce((select max(last_question) from last_seen), 1)) as q
)
select
  q.q                                                          as reached_question,
  -- Everyone who got at least this far.
  count(*) filter (where l.last_question >= q.q)               as reached,
  -- Of those, the ones who answered this question and stopped.
  count(*) filter (where l.last_question = q.q)                as quit_here,
  count(*) filter (where l.last_question > q.q)                as continued
from questions q
cross join last_seen l
group by q.q
order by q.q;
