alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists username text,
  add column if not exists phone text;

update public.profiles
set username = lower(username)
where username is not null;

create unique index if not exists profiles_username_unique_idx
  on public.profiles (lower(username))
  where username is not null;

create or replace function public.handle_new_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
  candidate_username text;
begin
  base_username := lower(split_part(new.email, '@', 1));
  candidate_username := lower(nullif(new.raw_user_meta_data->>'username', ''));

  if candidate_username is null then
    loop
      candidate_username := base_username || '_' || lpad((floor(random() * 10000))::text, 4, '0');
      exit when not exists (
        select 1 from public.profiles where lower(username) = candidate_username
      );
    end loop;
  end if;

  insert into public.profiles (id, name, first_name, last_name, username, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    nullif(new.raw_user_meta_data->>'first_name', ''),
    nullif(new.raw_user_meta_data->>'last_name', ''),
    candidate_username,
    nullif(new.raw_user_meta_data->>'phone', '')
  )
  on conflict (id) do update
  set
    name = excluded.name,
    first_name = coalesce(excluded.first_name, profiles.first_name),
    last_name = coalesce(excluded.last_name, profiles.last_name),
    username = coalesce(excluded.username, profiles.username),
    phone = coalesce(excluded.phone, profiles.phone);

  return new;
end;
$$;
