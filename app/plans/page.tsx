import MobileScreen from '@/components/mobile/MobileScreen';
import ProGymPassCard from '@/components/ProGymPassCard';
import Pricing from '@/components/ui/Pricing/Pricing';
import { requireUser } from '@/utils/auth/require-user';
import { createClient } from '@/utils/supabase/server';
import { getProducts, getSubscription } from '@/utils/supabase/queries';

export default async function PlansPage() {
  const user = await requireUser();
  const supabase = createClient();

  const [products, subscription] = await Promise.all([
    getProducts(supabase),
    getSubscription(supabase)
  ]);

  return (
    <MobileScreen>
      <section className="mx-auto w-full max-w-[361px] px-4 pt-6">
        <ProGymPassCard variant="plans" managePlansLabel="Manage Plans" />
      </section>
      <Pricing user={user} products={products ?? []} subscription={subscription} />
    </MobileScreen>
  );
}
