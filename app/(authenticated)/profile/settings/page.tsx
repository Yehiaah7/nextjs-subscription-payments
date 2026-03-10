import { requireUser } from '@/utils/auth/require-user';
import { createClient } from '@/utils/supabase/server';
import SettingsScreen from './SettingsScreen';

const FALLBACK_PHONE_COUNTRY = 'EG';
const FALLBACK_PHONE_DIAL_CODE = '+20';

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

function deriveProfileValues(
  user: any,
  profile: ProfileRecord | null
): ProfileRecord {
  const metadata = (user.user_metadata ?? {}) as Record<
    string,
    string | null | undefined
  >;

  const first_name = profile?.first_name ?? metadata.first_name ?? '';
  const last_name = profile?.last_name ?? metadata.last_name ?? '';
  const username = profile?.username ?? metadata.username ?? '';

  const metadataPhone = (metadata.phone ?? '')?.toString().trim();
  const phone_e164 = (
    profile?.phone_e164 ??
    profile?.phone ??
    metadataPhone ??
    ''
  ).trim();
  const phone_country =
    profile?.phone_country ?? metadata.phone_country ?? FALLBACK_PHONE_COUNTRY;
  const phone_dial_code =
    profile?.phone_dial_code ??
    metadata.phone_dial_code ??
    FALLBACK_PHONE_DIAL_CODE;
  const phone_national = profile?.phone_national ?? '';

  return {
    first_name: first_name || '',
    last_name: last_name || '',
    username: username || '',
    phone: phone_e164 || '',
    phone_country: phone_country || FALLBACK_PHONE_COUNTRY,
    phone_dial_code: phone_dial_code || FALLBACK_PHONE_DIAL_CODE,
    phone_national: phone_national || '',
    phone_e164: phone_e164 || ''
  };
}

export default async function SettingsPage({
  searchParams
}: {
  searchParams: { error?: string; status?: string };
}) {
  const user = await requireUser();
  const supabase = createClient();

  const { data } = await (supabase as any)
    .from('profiles')
    .select(
      'first_name, last_name, username, phone, phone_country, phone_dial_code, phone_national, phone_e164'
    )
    .eq('id', user.id)
    .maybeSingle();

  const resolvedProfile = deriveProfileValues(
    user,
    (data ?? null) as ProfileRecord | null
  );

  const hasProfileData = Boolean(
    data?.first_name ||
    data?.last_name ||
    data?.username ||
    data?.phone ||
    data?.phone_e164
  );
  const hasMetadataData = Boolean(
    user.user_metadata?.first_name ||
    user.user_metadata?.last_name ||
    user.user_metadata?.username ||
    user.user_metadata?.phone
  );

  if (!hasProfileData && hasMetadataData) {
    await (supabase as any).from('profiles').upsert(
      {
        id: user.id,
        first_name: resolvedProfile.first_name || null,
        last_name: resolvedProfile.last_name || null,
        username: resolvedProfile.username || null,
        phone: resolvedProfile.phone || null,
        phone_country: resolvedProfile.phone_country || FALLBACK_PHONE_COUNTRY,
        phone_dial_code:
          resolvedProfile.phone_dial_code || FALLBACK_PHONE_DIAL_CODE,
        phone_national: resolvedProfile.phone_national || null,
        phone_e164: resolvedProfile.phone_e164 || null,
        name:
          [resolvedProfile.first_name, resolvedProfile.last_name]
            .filter(Boolean)
            .join(' ')
            .trim() ||
          user.email ||
          'Member'
      },
      { onConflict: 'id' }
    );
  }

  return (
    <SettingsScreen
      email={user.email ?? 'member@example.com'}
      profile={resolvedProfile}
      error={searchParams.error}
      status={searchParams.status}
    />
  );
}
