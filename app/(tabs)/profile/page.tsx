import { requireUser } from '@/utils/auth/require-user';
import { createClient } from '@/utils/supabase/server';
import ProfileScreen from './ProfileScreen';

type ProfileRecord = {
  name: string | null;
  first_name: string | null;
  last_name: string | null;
};

export default async function ProfilePage() {
  const user = await requireUser();
  const supabase = createClient();

  const { data } = await (supabase as any)
    .from('profiles')
    .select('name, first_name, last_name')
    .eq('id', user.id)
    .maybeSingle();

  const profile = (data ?? null) as ProfileRecord | null;

  return (
    <ProfileScreen
      email={user.email ?? 'member@example.com'}
      fullName={[profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim() || profile?.name || 'PM Member'}
    />
  );
}
