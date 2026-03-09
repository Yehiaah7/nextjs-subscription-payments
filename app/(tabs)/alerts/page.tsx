import { requireUser } from '@/utils/auth/require-user';
import AlertsScreen from './AlertsScreen';

export default async function AlertsPage() {
  await requireUser();

  return <AlertsScreen />;
}
