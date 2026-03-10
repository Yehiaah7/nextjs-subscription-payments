do $$
begin
  create type public.track_seniority as enum ('junior', 'mid', 'senior');
exception
  when duplicate_object then null;
end $$;

alter table public.modules
  add column if not exists seniority public.track_seniority;

update public.modules m
set seniority = coalesce(m.seniority, t.seniority, 'junior'::public.track_seniority)
from public.tracks t
where t.id = m.track_id;

alter table public.modules
  alter column seniority set default 'junior'::public.track_seniority,
  alter column seniority set not null;
