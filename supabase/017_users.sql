-- Metron — migration 017: accounts. Idempotent.
-- A WhatsApp number and a password. No name, no email. The id doubles as
-- the visitor ref, so everything already keyed by ref keys to the account.
create table if not exists public.users (
  id             text primary key,
  phone          text not null unique,
  password_hash  text not null,
  lang           text not null default 'en',
  region         text not null default 'cm',
  pin_hash       text,
  created_at     timestamptz not null default now(),
  deleted_at     timestamptz
);
alter table public.users enable row level security;
