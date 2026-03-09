import MobileAppLayout from '@/components/mobile/MobileAppLayout';
import { PropsWithChildren } from 'react';

export default function AuthenticatedShell({ children }: PropsWithChildren) {
  return <MobileAppLayout>{children}</MobileAppLayout>;
}
