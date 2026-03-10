alter table public.profiles
  add column if not exists phone_country text,
  add column if not exists phone_dial_code text,
  add column if not exists phone_national text,
  add column if not exists phone_e164 text;
