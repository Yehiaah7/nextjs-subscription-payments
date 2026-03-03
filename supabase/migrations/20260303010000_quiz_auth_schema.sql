create extension if not exists pgcrypto;

-- Remove starter-kit Stripe subscriptions table to reuse the required name.
drop table if exists public.subscriptions cascade;
drop type if exists public.subscription_status;

do $$ begin
  create type public.track_type as enum ('skill', 'company');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.plan_period as enum ('month', 'year');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.question_type as enum ('single_choice', 'multiple_choice', 'text');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.payment_provider as enum ('paymob');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tracks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type public.track_type not null,
  description text,
  is_published boolean not null default false
);

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references public.tracks(id) on delete cascade,
  title text not null,
  sort_order integer not null default 0
);

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  difficulty text,
  time_limit_sec integer,
  pass_score integer
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  type public.question_type not null,
  prompt text not null,
  sort_order integer not null default 0,
  points integer not null default 1
);

create table if not exists public.options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  label text not null,
  sort_order integer not null default 0
);

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  started_at timestamptz not null default timezone('utc', now()),
  submitted_at timestamptz,
  score integer,
  passed boolean
);

create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  option_id uuid references public.options(id) on delete set null,
  text_answer text,
  points_awarded integer
);

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price_egp integer not null,
  period public.plan_period not null,
  is_active boolean not null default true
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.plans(id),
  status text not null,
  current_period_end timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_egp integer not null,
  status text not null,
  provider public.payment_provider not null default 'paymob',
  provider_ref text,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.handle_new_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', new.email))
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute procedure public.handle_new_profile();

alter table public.profiles enable row level security;
alter table public.tracks enable row level security;
alter table public.modules enable row level security;
alter table public.quizzes enable row level security;
alter table public.questions enable row level security;
alter table public.options enable row level security;
alter table public.attempts enable row level security;
alter table public.answers enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;

drop policy if exists "profiles_own_select" on public.profiles;
create policy "profiles_own_select" on public.profiles
for select using (auth.uid() = id);

drop policy if exists "profiles_own_update" on public.profiles;
create policy "profiles_own_update" on public.profiles
for update using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "profiles_own_insert" on public.profiles;
create policy "profiles_own_insert" on public.profiles
for insert with check (auth.uid() = id);

drop policy if exists "content_tracks_public_read" on public.tracks;
create policy "content_tracks_public_read" on public.tracks
for select using (true);

drop policy if exists "content_modules_public_read" on public.modules;
create policy "content_modules_public_read" on public.modules
for select using (true);

drop policy if exists "content_quizzes_public_read" on public.quizzes;
create policy "content_quizzes_public_read" on public.quizzes
for select using (true);

drop policy if exists "content_questions_public_read" on public.questions;
create policy "content_questions_public_read" on public.questions
for select using (true);

drop policy if exists "content_options_public_read" on public.options;
create policy "content_options_public_read" on public.options
for select using (true);

drop policy if exists "content_plans_public_read" on public.plans;
create policy "content_plans_public_read" on public.plans
for select using (true);

drop policy if exists "attempts_own_all" on public.attempts;
create policy "attempts_own_all" on public.attempts
for all using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "answers_own_all" on public.answers;
create policy "answers_own_all" on public.answers
for all
using (
  exists (
    select 1
    from public.attempts
    where attempts.id = answers.attempt_id
      and attempts.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.attempts
    where attempts.id = answers.attempt_id
      and attempts.user_id = auth.uid()
  )
);

drop policy if exists "subscriptions_own_all" on public.subscriptions;
create policy "subscriptions_own_all" on public.subscriptions
for all using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "payments_own_all" on public.payments;
create policy "payments_own_all" on public.payments
for all using (auth.uid() = user_id)
with check (auth.uid() = user_id);
