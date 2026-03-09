import { requireUser } from '@/utils/auth/require-user';
import { PropsWithChildren } from 'react';
import AuthenticatedShell from './AuthenticatedShell';

export default async function AuthenticatedLayout({
  children
}: PropsWithChildren) {
  await requireUser();

  return <AuthenticatedShell>{children}</AuthenticatedShell>;
}
