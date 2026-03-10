import { requireUser } from '@/utils/auth/require-user';
import { createClient } from '@/utils/supabase/server';
import SettingsScreen from './SettingsScreen';

type ProfileRecord = {
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  phone: string | null;
  phone_country: string | null;
  phone_dial_code: string | null;
  phone_national: string | null;
  phone_e164: string | null;
};

export default async function SettingsPage({
  searchParams
}: {
  searchParams: { error?: string; status?: string };
}) {
  const user = await requireUser();
  const supabase = createClient();

  const { data } = await (supabase as any)
    .from('profiles')
    .select('first_name, last_name, username, phone, phone_country, phone_dial_code, phone_national, phone_e164')
    .eq('id', user.id)
    .maybeSingle();

  return (
    <SettingsScreen
      email={user.email ?? 'member@example.com'}
      profile={(data ?? {
        first_name: '',
        last_name: '',
        username: '',
        phone: '',
        phone_country: 'EG',
        phone_dial_code: '+20',
        phone_national: '',
        phone_e164: ''
      }) as ProfileRecord}
      error={searchParams.error}
      status={searchParams.status}
    />
  );
}
