-- ===========================================================================
-- Metron — TEST DATA. Not a migration. Safe to run more than once.
--
-- Six fake people — five customers and one who stopped at checkout — with
-- progress, messages to the coach, and replies. Between them they cover every
-- state the admin screen has: two unanswered questions, a man who paid and
-- never opened the app, a finished 10-day with a real jump, a man stalled on
-- Day 3, a French 30-day customer, and a lead who never paid.
--
-- ── READ THIS BEFORE RUNNING ──────────────────────────────────────────────
-- This writes into the LIVE database, so these six will be counted in the
-- admin dashboard's revenue, customer count and conversion rate alongside real
-- buyers. Every row is prefixed TEST- for exactly that reason, and the cleanup
-- at the bottom removes all of it in one statement. Run that before you judge
-- any real number.
--
-- Works whether or not 005_broadcast.sql has been applied: read_by_user is
-- never named here, so it takes its default (false) when the column exists,
-- which is what puts the badge on the bell.
-- ===========================================================================

begin;

-- Idempotent: clear any previous run first so re-running does not duplicate.
delete from public.threads  where ref like 'TEST-%';
delete from public.progress where ref like 'TEST-%';
delete from public.payments where ref like 'TEST-%';
delete from public.events   where ref like 'TEST-%';
delete from public.leads    where ref like 'TEST-%';

-- ---------------------------------------------------------------------------
-- Who they are
-- ---------------------------------------------------------------------------
insert into public.leads (ref, name, contact, phone, plan, locale, stage, provider, created_at, updated_at) values
  ('TEST-EMEKA',  'Emeka',   'test.emeka@example.com',   '677000101', 'test',   'en', 'paid', 'fapshi', now() - interval '16 days', now() - interval '1 day'),
  ('TEST-BRICE',  'Brice',   'test.brice@example.com',   '699000102', 'test',   'en', 'paid', 'fapshi', now() - interval '9 days',  now() - interval '4 hours'),
  ('TEST-ARNAUD', 'Arnaud',  'test.arnaud@example.com',  '655000103', 'sprint', 'fr', 'paid', 'fapshi', now() - interval '21 days', now() - interval '2 days'),
  ('TEST-KEVIN',  'Kevin',   'test.kevin@example.com',   '678000104', 'test',   'en', 'paid', 'whop',   now() - interval '3 days',  now() - interval '3 days'),
  ('TEST-SAMUEL', 'Samuel',  'test.samuel@example.com',  '691000105', 'test',   'en', 'paid', 'fapshi', now() - interval '14 days', now() - interval '6 hours'),
  ('TEST-DIDIER', 'Didier',  'test.didier@example.com',  '652000106', 'test',   'fr', 'lead', null,     now() - interval '2 days',  now() - interval '2 days');

-- ---------------------------------------------------------------------------
-- What they paid
-- ---------------------------------------------------------------------------
insert into public.payments (ref, provider, provider_txn, plan, currency, amount_minor, status, created_at) values
  ('TEST-EMEKA',  'fapshi', 'TEST-TXN-EMEKA',  'test',   'XAF', 7500,  'paid', now() - interval '16 days'),
  ('TEST-BRICE',  'fapshi', 'TEST-TXN-BRICE',  'test',   'XAF', 7500,  'paid', now() - interval '9 days'),
  ('TEST-ARNAUD', 'fapshi', 'TEST-TXN-ARNAUD', 'sprint', 'XAF', 69000, 'paid', now() - interval '21 days'),
  ('TEST-KEVIN',  'whop',   'TEST-TXN-KEVIN',  'test',   'USD', 1500,  'paid', now() - interval '3 days'),
  ('TEST-SAMUEL', 'fapshi', 'TEST-TXN-SAMUEL', 'test',   'XAF', 7500,  'paid', now() - interval '14 days');

-- ---------------------------------------------------------------------------
-- What they have actually done
--
-- Kevin is deliberately absent: paid three days ago, no progress row at all.
-- He is the one the "Paid, never opened" audience and the red Last-seen column
-- exist to surface, and nothing else in this seed would produce him.
-- ---------------------------------------------------------------------------
insert into public.progress (ref, plan, day, started_at, measurements, sessions, markers, updated_at) values
  -- Finished the 10 days. 1:35 to 4:10 — the case the refund promise is built on.
  ('TEST-EMEKA', 'test', 12, now() - interval '16 days',
   '[{"day":1,"seconds":95,"mode":"solo","at":"2026-08-12T21:10:00Z"},
      {"day":12,"seconds":250,"mode":"solo","at":"2026-08-26T21:40:00Z"}]'::jsonb,
   '[{"day":2},{"day":3},{"day":4},{"day":6},{"day":7},{"day":9},{"day":10}]'::jsonb,
   '[{"day":1},{"day":2},{"day":3},{"day":4},{"day":5},{"day":6},{"day":7},{"day":8},{"day":9},{"day":10},{"day":11},{"day":12}]'::jsonb,
   now() - interval '1 day'),

  -- Mid-programme, baseline only.
  ('TEST-BRICE', 'test', 6, now() - interval '9 days',
   '[{"day":1,"seconds":70,"mode":"solo","at":"2026-08-19T22:05:00Z"}]'::jsonb,
   '[{"day":2},{"day":3},{"day":4}]'::jsonb,
   '[{"day":1},{"day":2},{"day":3},{"day":4},{"day":5}]'::jsonb,
   now() - interval '4 hours'),

  -- 30-day, deep in. Measured with a partner both times, which is the harder test.
  ('TEST-ARNAUD', 'sprint', 22, now() - interval '21 days',
   '[{"day":1,"seconds":110,"mode":"partner","at":"2026-08-07T20:30:00Z"},
      {"day":12,"seconds":265,"mode":"partner","at":"2026-08-18T20:15:00Z"}]'::jsonb,
   '[{"day":2},{"day":3},{"day":5},{"day":6},{"day":8},{"day":9},{"day":13},{"day":15},{"day":16},{"day":18},{"day":19},{"day":20}]'::jsonb,
   '[{"day":1},{"day":3},{"day":5},{"day":7},{"day":9},{"day":11},{"day":13},{"day":15},{"day":17},{"day":19},{"day":21}]'::jsonb,
   now() - interval '2 days'),

  -- Started, stalled on day 3. The man worth messaging before he asks for a refund.
  ('TEST-SAMUEL', 'test', 3, now() - interval '14 days',
   '[{"day":1,"seconds":140,"mode":"solo","at":"2026-08-14T23:00:00Z"}]'::jsonb,
   '[{"day":2}]'::jsonb,
   '[{"day":1},{"day":2}]'::jsonb,
   now() - interval '6 hours');

-- ---------------------------------------------------------------------------
-- The conversations
--
-- read_by_admin is false on the messages that should light up "Needs
-- attention": Brice's question and Samuel's, which are the two that actually
-- need answering. Everything already replied to is marked read.
-- ---------------------------------------------------------------------------
insert into public.threads (ref, sender, body, read_by_admin, created_at) values
  -- Emeka: finished, big jump, answered.
  ('TEST-EMEKA', 'user',
   'Boss I did day 12 last night. Day 1 I was 1 minute 35. Yesterday 4 minutes 10. I did not believe it so I checked the app twice. My wife noticed before I said anything.',
   true, now() - interval '2 days'),
  ('TEST-EMEKA', 'coach',
   'That is a real jump and I want to be clear about something: that was you. You did seven sessions and logged twelve nights straight. The programme only told you what to do — you are the one who did it on the nights you did not feel like it. Keep the markers going and do not chase the number now.',
   true, now() - interval '2 days' + interval '3 hours'),
  ('TEST-EMEKA', 'user',
   'Understood. Do I keep doing the sessions or stop now?',
   true, now() - interval '1 day'),
  ('TEST-EMEKA', 'coach',
   'Two a week keeps it. You built it, you can hold it with a lot less work than it took to get there.',
   true, now() - interval '1 day' + interval '2 hours'),

  -- Brice: mid-programme question, UNANSWERED.
  ('TEST-BRICE', 'user',
   'Day 6 today. Sessions are going fine but last night I went past 6 on the scale twice before I stopped. Is that a problem or normal at this stage?',
   false, now() - interval '4 hours'),

  -- Arnaud: French, 30-day, answered.
  ('TEST-ARNAUD', 'user',
   'Jour 22. Ma mesure du Jour 12 est passée de 1 min 50 à 4 min 25, et avec ma partenaire, pas tout seul. Je voulais juste vous le dire.',
   true, now() - interval '3 days'),
  ('TEST-ARNAUD', 'coach',
   'Avec une partenaire, c''est le test difficile — beaucoup d''hommes ne mesurent que seuls parce que le chiffre est plus flatteur. Vous ne l''avez pas fait. Ce résultat est le vôtre, pas le nôtre. Vous avez fait le travail, on vous a seulement dit quoi faire. Continuez exactement comme ça.',
   true, now() - interval '3 days' + interval '4 hours'),

  -- Samuel: stalled and honest about it. UNANSWERED — this is the refund risk.
  ('TEST-SAMUEL', 'user',
   'I stopped at day 3. Work has been heavy and I keep telling myself I will do it tomorrow. I still want to finish, I am just being honest with you.',
   false, now() - interval '6 hours');

-- ---------------------------------------------------------------------------
-- Funnel events, so the Overview tab has a shape rather than a flat line
-- ---------------------------------------------------------------------------
insert into public.events (ref, name, detail, locale, country, created_at)
select r.ref, e.name, null, r.locale, 'CM', now() - interval '10 days'
from (values
  ('TEST-EMEKA','en'), ('TEST-BRICE','en'), ('TEST-ARNAUD','fr'),
  ('TEST-KEVIN','en'), ('TEST-SAMUEL','en'), ('TEST-DIDIER','fr')
) as r(ref, locale)
cross join (values ('quiz_start'), ('quiz_complete'), ('result_view'), ('offer_view')) as e(name);

-- Didier reached checkout and stopped; the other five paid.
insert into public.events (ref, name, detail, locale, country, created_at) values
  ('TEST-DIDIER', 'checkout_started', 'test',   'fr', 'CM', now() - interval '2 days'),
  ('TEST-EMEKA',  'checkout_started', 'test',   'en', 'CM', now() - interval '16 days'),
  ('TEST-EMEKA',  'paid',             'test',   'en', 'CM', now() - interval '16 days'),
  ('TEST-BRICE',  'checkout_started', 'test',   'en', 'CM', now() - interval '9 days'),
  ('TEST-BRICE',  'paid',             'test',   'en', 'CM', now() - interval '9 days'),
  ('TEST-ARNAUD', 'checkout_started', 'sprint', 'fr', 'CM', now() - interval '21 days'),
  ('TEST-ARNAUD', 'paid',             'sprint', 'fr', 'CM', now() - interval '21 days'),
  ('TEST-KEVIN',  'checkout_started', 'test',   'en', 'CM', now() - interval '3 days'),
  ('TEST-KEVIN',  'paid',             'test',   'en', 'CM', now() - interval '3 days'),
  ('TEST-SAMUEL', 'checkout_started', 'test',   'en', 'CM', now() - interval '14 days'),
  ('TEST-SAMUEL', 'paid',             'test',   'en', 'CM', now() - interval '14 days');

commit;

-- What you should see in the admin:
--   Revenue            5 customers — 91 500 FCFA and $15
--   Needs attention    3 — Brice unread, Samuel unread, Kevin never opened
--   Customers tab      Emeka 1:35 → 4:10, Arnaud 1:50 → 4:25, Kevin all blank
--                      with a red "never" in Last seen
--   Leads tab          Didier, stage "Checkout"
--   Write to people    "Paid, never opened" should match exactly 1 (Kevin)


-- ===========================================================================
-- CLEANUP — run this on its own when you are done. Removes every TEST- row and
-- nothing else, so real customers are untouched.
-- ===========================================================================
-- begin;
-- delete from public.threads  where ref like 'TEST-%';
-- delete from public.progress where ref like 'TEST-%';
-- delete from public.payments where ref like 'TEST-%';
-- delete from public.events   where ref like 'TEST-%';
-- delete from public.leads    where ref like 'TEST-%';
-- commit;
