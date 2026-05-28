import { requireUser } from '@/utils/auth/require-user';
import { createClient } from '@/utils/supabase/server';
import { getHasProSubscription } from '@/utils/supabase/queries';
import SubscriptionScreen from '../SubscriptionScreen';

export default async function ProfileSubscriptionPage() {
  await requireUser();
  const supabase = createClient();
  const hasProSubscription = await getHasProSubscription(supabase);

  return (
    <SubscriptionScreen
      subscriptionState={hasProSubscription ? 'pro' : 'trial'}
    />
  );
}
