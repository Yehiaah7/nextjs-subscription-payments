alter table public.profiles
  add column if not exists practice_time_seconds bigint not null default 0;

create or replace function public.increment_practice_time(seconds_to_add integer)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_total bigint;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if seconds_to_add is null or seconds_to_add <= 0 then
    return null;
  end if;

  update public.profiles
  set practice_time_seconds = coalesce(practice_time_seconds, 0) + seconds_to_add
  where id = auth.uid()
  returning practice_time_seconds into updated_total;

  return updated_total;
end;
$$;

grant execute on function public.increment_practice_time(integer) to authenticated;
