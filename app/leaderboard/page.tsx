import { requireUser } from '@/utils/auth/require-user';
import LeaderboardScreen from './LeaderboardScreen';

export default async function LeaderboardPage() {
  await requireUser();

  return <LeaderboardScreen />;
}
