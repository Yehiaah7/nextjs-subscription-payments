import { requireUser } from '@/utils/auth/require-user';
import ProfileScreen from './ProfileScreen';

export default async function ProfilePage() {
  const user = await requireUser();

  return <ProfileScreen email={user.email ?? 'member@example.com'} />;
}
