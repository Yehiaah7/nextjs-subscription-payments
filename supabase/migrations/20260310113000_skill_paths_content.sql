create table if not exists public.skill_path_categories (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  title text not null,
  icon text,
  sort_order integer not null default 0
);

create table if not exists public.skill_path_challenges (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.skill_path_categories(id) on delete cascade,
  title text not null,
  practicing_count integer not null default 0,
  duration_min integer not null,
  duration_max integer not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint skill_path_challenges_duration_check check (duration_min > 0 and duration_max >= duration_min),
  constraint skill_path_challenges_unique_title_per_category unique (category_id, title)
);

alter table public.skill_path_categories enable row level security;
alter table public.skill_path_challenges enable row level security;

drop policy if exists "skill_path_categories_authenticated_read" on public.skill_path_categories;
create policy "skill_path_categories_authenticated_read" on public.skill_path_categories
for select using (auth.role() = 'authenticated');

drop policy if exists "skill_path_challenges_authenticated_read" on public.skill_path_challenges;
create policy "skill_path_challenges_authenticated_read" on public.skill_path_challenges
for select using (auth.role() = 'authenticated');
