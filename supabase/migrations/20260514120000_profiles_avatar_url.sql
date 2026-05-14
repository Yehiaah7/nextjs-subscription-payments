alter table public.profiles
  add column if not exists avatar_url text;

update public.profiles as profiles
set avatar_url = users.avatar_url
from public.users as users
where profiles.id = users.id
  and profiles.avatar_url is null
  and users.avatar_url is not null;
