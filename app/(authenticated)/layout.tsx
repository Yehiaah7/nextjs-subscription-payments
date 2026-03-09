import BottomNav from '@/components/mobile/BottomNav';
import { requireUser } from '@/utils/auth/require-user';
import { PropsWithChildren } from 'react';

export default async function AuthenticatedLayout({
  children
}: PropsWithChildren) {
  await requireUser();

  return (
    <section className="min-h-dvh bg-[#e9edf3] text-[#1f2937]">
      <div className="mx-auto w-full max-w-[460px] px-4 pb-24 pt-6 sm:pt-8">
        {children}
      </div>
      <BottomNav />
    </section>
  );
}
