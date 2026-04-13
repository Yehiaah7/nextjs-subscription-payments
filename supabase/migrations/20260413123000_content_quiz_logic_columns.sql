alter table if exists public.options
  add column if not exists is_correct boolean not null default false;

alter table if exists public.questions
  add column if not exists feedback text;

create unique index if not exists answers_attempt_question_unique
  on public.answers (attempt_id, question_id);

notify pgrst, 'reload schema';
