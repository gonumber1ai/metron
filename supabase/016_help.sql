-- Metron — migration 016: Help & Support requests. Idempotent.
create table if not exists public.help_requests (
  id          bigserial primary key,
  ref         text,
  category    text not null,
  message     text not null,
  contact     text,
  locale      text not null default 'en',
  status      text not null default 'open' check (status in ('open','replied','closed')),
  created_at  timestamptz not null default now()
);
create index if not exists help_requests_status_idx on public.help_requests (status, created_at desc);
alter table public.help_requests enable row level security;
