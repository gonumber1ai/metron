-- ===========================================================================
-- Metron — Postgres schema
--
-- Run in the Supabase SQL editor. Replaces lib/store.ts (localStorage) without
-- touching any component: reimplement load/save/update against these tables.
--
-- Privacy is enforced here, at the database, not in application code. Every
-- table has row-level security on, and every policy keys off auth.uid(). A bug
-- in a React component cannot leak another man's measurements.
--
-- No real name is stored anywhere. Auth is phone OTP (or email) and `username`
-- is a free-text handle the user picks, or leaves null.
-- ===========================================================================

-- ---------------------------------------------------------------- profiles
create table public.profiles (
  id            uuid primary key references auth.users on delete cascade,
  username      text,                       -- a handle, never a legal name
  locale        text not null default 'en',
  country       text not null default 'default',
  plan          text check (plan in ('test','sprint')),
  -- the current protocol day, 0..30
  day           smallint not null default 0 check (day between 0 and 30),
  mode          text check (mode in ('solo','partner')),
  pin_enabled   boolean not null default false,
  started_at    timestamptz,
  created_at    timestamptz not null default now()
);

-- ------------------------------------------------------------------- quiz
create table public.quiz_results (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles on delete cascade,
  pattern     text not null check (pattern in ('anxious','conditioned','dependent','depleted')),
  scores      jsonb not null,
  now_minutes numeric(4,1) not null,
  want_minutes numeric(4,1) not null,
  flags       text[] not null default '{}',
  answers     jsonb not null,
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------- measurements
create table public.measurements (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references public.profiles on delete cascade,
  day       smallint not null check (day in (1, 12, 30)),
  seconds   integer not null check (seconds > 0 and seconds < 14400),
  mode      text not null check (mode in ('solo','partner')),
  taken_at  timestamptz not null default now(),
  -- one measurement per checkpoint; re-recording overwrites
  unique (user_id, day)
);

-- ---------------------------------------------------------- daily markers
create table public.marker_logs (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references public.profiles on delete cascade,
  day       smallint not null check (day between 0 and 30),
  erection  smallint not null check (erection between 1 and 5),
  energy    smallint not null check (energy between 1 and 5),
  libido    smallint not null check (libido between 1 and 5),
  stress    smallint not null check (stress between 1 and 5),
  sleep     smallint not null check (sleep between 1 and 5),
  stomach   smallint not null check (stomach between 1 and 5),
  control   smallint not null check (control between 1 and 5),
  logged_at timestamptz not null default now(),
  unique (user_id, day)
);

-- --------------------------------------------------------- task progress
create table public.task_completions (
  user_id   uuid not null references public.profiles on delete cascade,
  day       smallint not null check (day between 0 and 30),
  task_id   text not null,
  done_at   timestamptz not null default now(),
  primary key (user_id, day, task_id)
);

create table public.lesson_reads (
  user_id  uuid not null references public.profiles on delete cascade,
  slug     text not null,
  read_at  timestamptz not null default now(),
  primary key (user_id, slug)
);

-- ------------------------------------------------------ the private thread
create table public.messages (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles on delete cascade,
  sender     text not null check (sender in ('user','coach')),
  body       text not null check (length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index on public.messages (user_id, created_at desc);

-- ---------------------------------------------------------------- payments
create table public.payments (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references public.profiles on delete set null,
  -- the anonymous handle generated client-side before signup, so a payment
  -- that lands before the account exists can still be reconciled
  ref            text not null,
  provider       text not null check (provider in ('fapshi','whop')),
  provider_txn   text,
  plan           text not null check (plan in ('test','sprint')),
  currency       text not null,
  amount_minor   integer not null,
  status         text not null default 'pending'
                   check (status in ('pending','paid','failed','refunded')),
  created_at     timestamptz not null default now(),
  unique (provider, provider_txn)
);

create index on public.payments (ref);

-- ------------------------------------------------------------------ leads
-- Quiz opt-ins and pre-launch captures. Not linked to a profile: a lead has
-- not consented to anything beyond being written to.
create table public.leads (
  id         uuid primary key default gen_random_uuid(),
  contact    text not null,
  ref        text,
  plan       text,
  locale     text not null default 'en',
  created_at timestamptz not null default now()
);

-- ===========================================================================
-- ROW LEVEL SECURITY
-- ===========================================================================

alter table public.profiles         enable row level security;
alter table public.quiz_results     enable row level security;
alter table public.measurements     enable row level security;
alter table public.marker_logs      enable row level security;
alter table public.task_completions enable row level security;
alter table public.lesson_reads     enable row level security;
alter table public.messages         enable row level security;
alter table public.payments         enable row level security;
alter table public.leads            enable row level security;

create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Same shape for every user-owned table.
create policy "own rows" on public.quiz_results
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.measurements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.marker_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.task_completions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.lesson_reads
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- The user reads the whole thread but may only ever write as 'user'.
-- Coach replies are inserted with the service role key from the admin side.
create policy "read own thread" on public.messages
  for select using (auth.uid() = user_id);
create policy "write as self" on public.messages
  for insert with check (auth.uid() = user_id and sender = 'user');

-- Payments are readable by the owner and written only by webhooks
-- (service role bypasses RLS). No client-side insert path exists.
create policy "read own payments" on public.payments
  for select using (auth.uid() = user_id);

-- Leads: no client read at all. Inserts come from the server route.
-- (Left with RLS on and no policy, so only the service role can touch it.)

-- ===========================================================================
-- Create the profile row automatically on signup.
-- ===========================================================================
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===========================================================================
-- Deleting a profile cascades everything. "Delete my account and all data"
-- in Settings should call this, not just clear local state.
-- ===========================================================================
