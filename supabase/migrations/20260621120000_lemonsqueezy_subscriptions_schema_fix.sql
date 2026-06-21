create table if not exists public.lemonsqueezy_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lemon_squeezy_subscription_id text not null unique,
  lemon_squeezy_customer_id text,
  lemon_squeezy_order_id text,
  lemon_squeezy_product_id text,
  lemon_squeezy_variant_id text,
  status text not null,
  trial_ends_at timestamptz,
  renews_at timestamptz,
  ends_at timestamptz,
  cancelled boolean default false,
  raw_payload jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.lemonsqueezy_subscriptions enable row level security;

create policy "Users can view own Lemon Squeezy subscriptions"
  on public.lemonsqueezy_subscriptions
  for select
  to authenticated
  using (auth.uid() = user_id);

create index if not exists lemonsqueezy_subscriptions_user_id_idx
  on public.lemonsqueezy_subscriptions(user_id);

create index if not exists lemonsqueezy_subscriptions_status_idx
  on public.lemonsqueezy_subscriptions(status);
