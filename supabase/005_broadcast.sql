-- ===========================================================================
-- Metron — migration 005: broadcasts, and the customer's own unread count
--
-- Run after 004_progress.sql.
--
-- Why this exists: the coach could only reply inside one man's thread. There
-- was no way to tell everybody something — a change to the programme, a
-- reminder to the men sitting on Day 0, an answer to a question forty people
-- have. Doing that by hand across a customer list is how it stops happening.
--
-- Two halves. `read_by_user` lets the app show him a badge, which the threads
-- table could not do: it tracked whether the ADMIN had seen a message, and
-- nothing tracked whether HE had. `broadcasts` keeps a record of what was sent
-- to whom, so a message is never sent twice and you can see what went out.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- His side of "unread".
--
-- Backfilled true for everything that already exists: marking a year of old
-- messages unread would greet every customer with a badge for a conversation
-- he has already had.
-- ---------------------------------------------------------------------------
alter table public.threads
  add column if not exists read_by_user boolean not null default false;

update public.threads set read_by_user = true where created_at < now();

-- A coach message he has not opened yet. Partial, because that is the only
-- row the badge query ever asks for.
create index if not exists threads_unread_user_idx
  on public.threads (ref, created_at desc)
  where sender = 'coach' and not read_by_user;

-- ---------------------------------------------------------------------------
-- What was sent, to whom, and how.
--
-- The body is kept even though every recipient also has a copy in `threads`:
-- the thread rows are what he reads, this is what you audit. If a send half
-- fails you need to know what the message actually said, not reconstruct it
-- from one man's inbox.
-- ---------------------------------------------------------------------------
create table if not exists public.broadcasts (
  id          bigserial primary key,
  audience    text not null check (audience in ('all','paid','leads','inactive')),
  subject     text,
  body        text not null check (length(body) between 1 and 4000),
  via_app     boolean not null default true,
  via_email   boolean not null default false,
  recipients  integer not null default 0,
  emailed     integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists broadcasts_recent_idx on public.broadcasts (created_at desc);

alter table public.broadcasts enable row level security;
-- No policy: written and read by the server with the service role only.
