-- Metron — migration 018: "Remind me tonight" (Brief 2, 2.2). Idempotent.
-- One pending reminder per man per kind. The WhatsApp sender marks it sent.
create table if not exists public.reminders (
  id          bigserial primary key,
  ref         text not null,
  kind        text not null default 'session_ready',
  at          timestamptz not null,
  locale      text not null default 'en',
  status      text not null default 'pending' check (status in ('pending','sent','cancelled')),
  created_at  timestamptz not null default now(),
  unique (ref, kind)
);
create index if not exists reminders_due_idx on public.reminders (status, at);
alter table public.reminders enable row level security;
