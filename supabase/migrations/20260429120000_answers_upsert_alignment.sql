-- Ensure answers table can support upsert payload used by QuizScreen.
alter table if exists public.answers
  add column if not exists attempt_id uuid references public.attempts(id) on delete cascade,
  add column if not exists question_id uuid references public.questions(id) on delete cascade,
  add column if not exists option_id uuid references public.options(id) on delete set null,
  add column if not exists points_awarded integer,
  add column if not exists text_answer text;

-- attempt_id/question_id are required by client payload and conflict target.
alter table if exists public.answers
  alter column attempt_id set not null,
  alter column question_id set not null;

-- Ensure ON CONFLICT(attempt_id, question_id) is valid.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'answers_attempt_question_key'
      and conrelid = 'public.answers'::regclass
  ) then
    alter table public.answers
      add constraint answers_attempt_question_key unique (attempt_id, question_id);
  end if;
end $$;

create unique index if not exists answers_attempt_question_unique
  on public.answers (attempt_id, question_id);

notify pgrst, 'reload schema';
