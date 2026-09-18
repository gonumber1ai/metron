-- ===========================================================================
-- Metron — migration 015: CRM, funnel attribution, server-side offer clock
--
-- Run ONCE in the Supabase SQL editor. Every statement is idempotent, so
-- running it twice is harmless. Nothing here drops or rewrites data.
--
-- The code is written to work BEFORE this runs — event writes fall back to
-- the old shape when the new columns are missing — so the live funnel does
-- not break in the gap. But nothing new is recorded until it has run: no
-- sessions, no return visits, no button ids, no funnel on an event, and no
-- server-side timer. Run it before sending traffic to the new funnels.
-- ===========================================================================

-- ── events: what was missing ──────────────────────────────────────────────
-- session   one per browser tab-session, so "returned" means something
-- funnel    which of the four he was in — decided on the landing page
-- page      the path the event fired on
-- cta       a stable id for the button pressed, never its text
-- eid       client-generated id, unique, so a retry or a refresh that fires
--           the same event twice lands once
alter table public.events add column if not exists session text;
alter table public.events add column if not exists funnel  text;
alter table public.events add column if not exists page    text;
alter table public.events add column if not exists cta     text;
alter table public.events add column if not exists eid     text;

create unique index if not exists events_eid_key    on public.events (eid) where eid is not null;
create index        if not exists events_funnel_idx on public.events (funnel, created_at desc);
create index        if not exists events_session_idx on public.events (session);

-- ── the offer clock, on the server ─────────────────────────────────────────
-- One row per visitor. Created the first time he lands on a funnel and never
-- restarted: not by a refresh, not by closing the browser, not by coming back
-- tomorrow, not by pressing the button ten times. The browser countdown only
-- displays what this row says. The payment route reads this row, not a
-- cookie, to decide what he pays.
--
--   live        the offer price holds
--   expired     the clock ran; he pays the full price
--   recovering  he came back after expiry and pressed the last-chance link;
--               the offer price is honoured for this attempt
--   paid        money moved at the offer or full price
--   recovered   money moved through the last-chance link
create table if not exists public.offers (
  ref             text primary key,
  funnel          text not null,
  started_at      timestamptz not null default now(),
  expires_at      timestamptz not null,
  recovery_until  timestamptz not null,
  status          text not null default 'live'
                  check (status in ('live','expired','recovering','paid','recovered')),
  -- timer_expired is written to events exactly once, and this is the once
  expired_logged  boolean not null default false,
  updated_at      timestamptz not null default now()
);
create index if not exists offers_funnel_idx on public.offers (funnel, started_at desc);
create index if not exists offers_status_idx on public.offers (status, expires_at);
alter table public.offers enable row level security;

-- ── attribution on the money and the people ───────────────────────────────
alter table public.payments add column if not exists funnel text;
alter table public.leads    add column if not exists funnel text;
create index if not exists payments_funnel_idx on public.payments (funnel);

-- ── recovery: what was sent, to whom, when ────────────────────────────────
-- A message is a row here and an event in `events`. This table is the
-- frequency cap: the sender refuses a second row inside the window.
create table if not exists public.recovery (
  id          bigserial primary key,
  ref         text not null,
  funnel      text not null,
  channel     text not null check (channel in ('email','whatsapp','popup')),
  status      text not null default 'sent'
              check (status in ('queued','sent','failed','clicked','suppressed')),
  detail      text,
  created_at  timestamptz not null default now()
);
create index if not exists recovery_ref_idx on public.recovery (ref, created_at desc);
alter table public.recovery enable row level security;
