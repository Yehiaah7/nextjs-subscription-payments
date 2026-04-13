alter table public.questions
  add column if not exists explanation text;

alter table public.options
  add column if not exists is_correct boolean not null default false;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'tracks_type_title_key') then
    alter table public.tracks
      add constraint tracks_type_title_key unique (type, title);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'modules_track_title_key') then
    alter table public.modules
      add constraint modules_track_title_key unique (track_id, title);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'quizzes_module_title_difficulty_key') then
    alter table public.quizzes
      add constraint quizzes_module_title_difficulty_key unique (module_id, title, difficulty);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'questions_quiz_sort_key') then
    alter table public.questions
      add constraint questions_quiz_sort_key unique (quiz_id, sort_order);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'options_question_sort_key') then
    alter table public.options
      add constraint options_question_sort_key unique (question_id, sort_order);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'answers_attempt_question_key') then
    alter table public.answers
      add constraint answers_attempt_question_key unique (attempt_id, question_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'quizzes_difficulty_level_check'
      and conrelid = 'public.quizzes'::regclass
  ) then
    alter table public.quizzes
      add constraint quizzes_difficulty_level_check
      check (difficulty is null or difficulty in ('junior', 'mid', 'senior'));
  end if;
end $$;

create index if not exists quizzes_module_level_idx
  on public.quizzes (module_id, difficulty);

create index if not exists questions_quiz_sort_idx
  on public.questions (quiz_id, sort_order);

create index if not exists quizzes_difficulty_idx
  on public.quizzes (difficulty);

create index if not exists attempts_user_quiz_started_idx
  on public.attempts (user_id, quiz_id, started_at desc);

-- Ensure public-readable content tables for authenticated sessions
alter table public.tracks enable row level security;
alter table public.modules enable row level security;
alter table public.quizzes enable row level security;
alter table public.questions enable row level security;
alter table public.options enable row level security;
alter table public.attempts enable row level security;
alter table public.answers enable row level security;

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

drop policy if exists "attempts_own_all" on public.attempts;
create policy "attempts_own_all" on public.attempts
for all using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "answers_own_all" on public.answers;
create policy "answers_own_all" on public.answers
for all
using (
  exists (
    select 1 from public.attempts
    where attempts.id = answers.attempt_id
      and attempts.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.attempts
    where attempts.id = answers.attempt_id
      and attempts.user_id = auth.uid()
  )
);
