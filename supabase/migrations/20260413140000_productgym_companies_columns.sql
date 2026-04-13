alter table public.options
  add column if not exists is_correct boolean default false;

alter table public.questions
  add column if not exists explanation text;

alter table public.quizzes
  add column if not exists category text;

select pg_notify('pgrst','reload schema');
