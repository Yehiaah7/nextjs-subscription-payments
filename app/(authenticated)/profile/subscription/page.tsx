import { requireUser } from '@/utils/auth/require-user';
import SubscriptionScreen from '../SubscriptionScreen';

export default async function ProfileSubscriptionPage() {
  await requireUser();

  return <SubscriptionScreen />;
}
