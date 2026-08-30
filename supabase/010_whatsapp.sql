-- ===========================================================================
-- Metron — migration 010: reach him where he actually is
--
-- Run after 009_start_funnel.sql.
--
-- Plenty of men in this market have no email address. The checkout demanded
-- one anyway, at the exact moment a man was reaching for his PIN, so he either
-- left, or he invented an address, paid, and never received his access code.
-- That second outcome is a refund and a complaint rather than a customer.
--
-- WhatsApp is now an accepted alternative. It is stored apart from `phone`
-- because `phone` is the wallet that paid, and the handset holding the money
-- is frequently not the handset he reads.
-- ===========================================================================

alter table public.leads add column if not exists whatsapp text;

-- ---------------------------------------------------------------------------
-- The intake view has to carry the column or the number is captured and never
-- seen on any admin screen.
--
-- This is 002's view with one line added. Every quiz-derived column below is
-- read by the Customers and Leads tabs, so they are reproduced exactly —
-- rewriting this view from memory instead of from 002_intake.sql is how those
-- screens end up blank.
-- ---------------------------------------------------------------------------
drop view if exists public.intake;

create view public.intake as
select
  l.created_at,
  l.updated_at,
  l.stage,
  l.name,
  l.contact,
  l.phone,
  l.whatsapp,
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
