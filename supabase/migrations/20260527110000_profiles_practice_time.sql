alter table public.profiles
  add column if not exists practice_time_seconds integer not null default 0;
