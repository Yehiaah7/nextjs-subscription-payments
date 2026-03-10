alter table public.profiles
  add column if not exists phone_country text,
  add column if not exists phone_country_code text,
  add column if not exists phone_national text,
  add column if not exists phone_e164 text,
  add column if not exists phone text;

update public.profiles
set phone_country_code = coalesce(phone_country_code, phone_dial_code)
where phone_country_code is null;
