import { requireUser } from '@/utils/auth/require-user';
import ProfileEditScreen from '../ProfileEditScreen';

export default async function ProfileEditPage() {
  const user = await requireUser();

  return <ProfileEditScreen email={user.email ?? 'member@example.com'} />;
}
