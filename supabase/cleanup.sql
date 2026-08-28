-- ===========================================================================
-- Metron — cleanup. Not a migration. Run the parts you want.
--
-- Run STEP 1 first and read it. It tells you whether anything in there is a
-- real customer, which decides whether step 3 is safe. Nothing below step 1
-- can be undone.
-- ===========================================================================


-- ===========================================================================
-- STEP 1 — LOOK BEFORE YOU DELETE. Changes nothing.
-- ===========================================================================

-- Everyone in the system, seeded and real, side by side.
select
  case when ref like 'TEST-%' then 'seeded test data' else 'REAL — not seeded' end as origin,
  stage,
  count(*)                                            as people,
  min(created_at)::date                               as first,
  max(created_at)::date                               as last
from public.leads
group by 1, 2
order by 1, 2;

-- Money. Any row here NOT marked seeded is a real payment from a real man.
select
  case when ref like 'TEST-%' then 'seeded test data' else 'REAL PAYMENT' end as origin,
  currency,
  count(*)                                            as payments,
  sum(amount_minor)                                   as total_minor
from public.payments
where status = 'paid'
group by 1, 2
order by 1;


-- ===========================================================================
-- STEP 2 — REMOVE THE SEEDED THIRTEEN. Safe: touches only TEST- rows.
--
-- This is the one you almost certainly want. It takes the fake customers out
-- of revenue, conversion and the ads baseline, and cannot touch a real buyer
-- because every seeded row was prefixed for exactly this moment.
-- ===========================================================================

begin;

delete from public.threads  where ref like 'TEST-%';
delete from public.progress where ref like 'TEST-%';
delete from public.payments where ref like 'TEST-%';
delete from public.events   where ref like 'TEST-%';
delete from public.leads    where ref like 'TEST-%';

commit;


-- ===========================================================================
-- STEP 3 — START FROM ZERO. DESTRUCTIVE. READ THIS.
--
-- Wipes EVERY lead, event, payment, message and progress row, seeded and real
-- alike. Use it only if step 1 showed no real payments and you want the funnel
-- numbers to start clean on the day the ads go live.
--
-- If step 1 showed even one REAL PAYMENT, do not run this. That row is a man
-- who gave you money, his access code, and his refund claim. There is no undo
-- and no backup of it anywhere else.
--
-- Uncomment to run.
-- ===========================================================================

-- begin;
--
-- delete from public.threads;
-- delete from public.progress;
-- delete from public.payments;
-- delete from public.events;
-- delete from public.leads;
--
-- commit;


-- ===========================================================================
-- STEP 4 — CHECK IT WORKED. Changes nothing.
-- ===========================================================================

select 'leads' as table_name, count(*) from public.leads
union all select 'payments', count(*) from public.payments
union all select 'events',   count(*) from public.events
union all select 'threads',  count(*) from public.threads
union all select 'progress', count(*) from public.progress;
