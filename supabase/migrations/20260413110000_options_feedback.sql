alter table public.options
  add column if not exists feedback text;

alter table public.options
  add column if not exists is_correct boolean not null default false;
