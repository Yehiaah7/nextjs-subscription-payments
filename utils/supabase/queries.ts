import { cache } from 'react';

export const getUser = cache(async (supabase: any) => {
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
});

export const getSubscription = cache(async (supabase: any) => {
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*, prices(*, products(*))')
    .in('status', ['trialing', 'active'])
    .maybeSingle();

  return subscription;
});

export const getProducts = cache(async (supabase: any) => {
  const { data: products, error } = await supabase
    .from('products')
    .select('*, prices(*)')
    .eq('active', true)
    .eq('prices.active', true)
    .order('metadata->index')
    .order('unit_amount', { referencedTable: 'prices' });

  return products;
});

export const getUserDetails = cache(async (supabase: any) => {
  const { data: userDetails } = await supabase
    .from('users')
    .select('*')
    .single();
  return userDetails;
});

const LEMON_SQUEEZY_PRO_STATUSES = new Set(['active', 'on_trial']);

type LemonSqueezySubscription = {
  status: string | null;
  renews_at: string | null;
  ends_at: string | null;
  cancelled: boolean | null;
};

export function hasActiveLemonSqueezyAccess(
  subscription: LemonSqueezySubscription,
  now = new Date()
) {
  const status = subscription.status?.toLowerCase() ?? '';

  if (LEMON_SQUEEZY_PRO_STATUSES.has(status)) {
    return true;
  }

  if (status !== 'cancelled') {
    return false;
  }

  const accessEndsAt = subscription.ends_at ?? subscription.renews_at;
  if (!accessEndsAt) {
    return false;
  }

  const parsedAccessEndsAt = new Date(accessEndsAt);
  return (
    !Number.isNaN(parsedAccessEndsAt.getTime()) &&
    parsedAccessEndsAt.getTime() > now.getTime()
  );
}

export const getLemonSqueezySubscriptions = cache(async (supabase: any) => {
  const { data: subscriptions } = await supabase
    .from('lemonsqueezy_subscriptions')
    .select('*')
    .order('updated_at', { ascending: false });

  return (subscriptions ?? []) as LemonSqueezySubscription[];
});

export const getHasProSubscription = cache(async (supabase: any) => {
  const [stripeSubscription, lemonSqueezySubscriptions] = await Promise.all([
    getSubscription(supabase),
    getLemonSqueezySubscriptions(supabase)
  ]);

  return (
    Boolean(stripeSubscription) ||
    lemonSqueezySubscriptions.some((subscription) =>
      hasActiveLemonSqueezyAccess(subscription)
    )
  );
});
