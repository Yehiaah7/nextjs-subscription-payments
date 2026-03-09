import MobileAppLayout from '@/components/mobile/MobileAppLayout';
import { requireUser } from '@/utils/auth/require-user';
import { PropsWithChildren } from 'react';

export default async function TabsLayout({ children }: PropsWithChildren) {
  await requireUser();

  return <MobileAppLayout showBottomNav>{children}</MobileAppLayout>;
}
