do $$ begin
  create type public.track_seniority as enum ('junior', 'mid', 'senior');
exception
  when duplicate_object then null;
end $$;

alter table public.tracks
  add column if not exists seniority public.track_seniority;

update public.tracks
set seniority = case
  when lower(title) in ('google', 'meta') then 'junior'::public.track_seniority
  when lower(title) in ('amazon', 'microsoft') then 'mid'::public.track_seniority
  when lower(title) in ('airbnb', 'stripe') then 'senior'::public.track_seniority
  else 'junior'::public.track_seniority
end
where type = 'company'
  and seniority is null;
