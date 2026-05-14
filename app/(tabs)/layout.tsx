import MobileAppLayout from '@/components/mobile/MobileAppLayout';
import { UserAvatarProvider } from '@/components/ui/UserAvatarContext';
import { requireUser } from '@/utils/auth/require-user';
import { createClient } from '@/utils/supabase/server';
import { PropsWithChildren } from 'react';

type ProfileRecord = {
  name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};

type UserRecord = {
  full_name: string | null;
};

export default async function TabsLayout({ children }: PropsWithChildren) {
  const user = await requireUser();
  const supabase = createClient();

  const [{ data: profileData }, { data: userData }] = await Promise.all([
    (supabase as any)
      .from('profiles')
      .select('name, first_name, last_name, avatar_url')
      .eq('id', user.id)
      .maybeSingle(),
    (supabase as any)
      .from('users')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle()
  ]);

  const profile = (profileData ?? null) as ProfileRecord | null;
  const userRecord = (userData ?? null) as UserRecord | null;

  return (
    <UserAvatarProvider
      initialAvatar={{
        firstName: profile?.first_name,
        lastName: profile?.last_name,
        fullName:
          profile?.name ??
          userRecord?.full_name ??
          user.user_metadata?.full_name ??
          user.user_metadata?.name,
        email: user.email,
        imageUrl: profile?.avatar_url ?? null
      }}
    >
      <MobileAppLayout showBottomNav>{children}</MobileAppLayout>
    </UserAvatarProvider>
  );
}
