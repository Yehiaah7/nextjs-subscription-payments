import { requireUser } from '@/utils/auth/require-user';
import AlertsScreen from '../alerts/AlertsScreen';

export default async function NotificationsPage() {
  await requireUser();

  return <AlertsScreen />;
}
