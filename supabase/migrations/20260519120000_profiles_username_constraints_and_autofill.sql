create or replace function public.normalize_profile_username(input text)
returns text
language sql
immutable
as $$
  select left(
    trim(both '._-' from regexp_replace(lower(coalesce(input, '')), '[^a-z0-9._-]+', '', 'g')),
    30
  );
$$;

update public.profiles
set username = public.normalize_profile_username(coalesce(username, split_part(coalesce(name, 'user'), ' ', 1)))
where username is null or username = '' or username !~ '^[a-z0-9._-]{3,30}$';

with ranked as (
  select id, username, row_number() over (partition by username order by created_at nulls first, id) as rn
  from public.profiles
  where username is not null and username <> ''
)
update public.profiles p
set username = left(p.username, 28) || (ranked.rn - 1)::text
from ranked
where p.id = ranked.id and ranked.rn > 1;

alter table public.profiles
  alter column username set not null;

create unique index if not exists profiles_username_unique_idx
  on public.profiles (username);

create or replace function public.handle_new_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  full_name text;
  first_name_value text;
  last_name_value text;
  base_username text;
  candidate_username text;
  suffix integer := 0;
begin
  full_name := nullif(coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''), '');
  first_name_value := nullif(coalesce(new.raw_user_meta_data->>'first_name', split_part(coalesce(full_name, ''), ' ', 1)), '');
  last_name_value := nullif(coalesce(new.raw_user_meta_data->>'last_name', nullif(trim(replace(coalesce(full_name, ''), split_part(coalesce(full_name, ''), ' ', 1), '')), '')), '');

  base_username := public.normalize_profile_username(split_part(coalesce(new.email, 'user'), '@', 1));
  if length(base_username) < 3 then
    base_username := 'user';
  end if;

  loop
    candidate_username := case when suffix = 0 then base_username else left(base_username, 30 - char_length(suffix::text)) || suffix::text end;
    exit when not exists (select 1 from public.profiles where username = candidate_username and id <> new.id);
    suffix := suffix + 1;
  end loop;

  insert into public.profiles (id, name, first_name, last_name, username, phone)
  values (
    new.id,
    coalesce(full_name, new.email),
    first_name_value,
    last_name_value,
    candidate_username,
    nullif(new.raw_user_meta_data->>'phone', '')
  )
  on conflict (id) do update
  set
    first_name = coalesce(profiles.first_name, excluded.first_name),
    last_name = coalesce(profiles.last_name, excluded.last_name),
    username = coalesce(nullif(profiles.username, ''), excluded.username),
    name = coalesce(profiles.name, excluded.name);

  return new;
end;
$$;
