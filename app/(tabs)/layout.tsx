import BottomNav from '@/components/mobile/BottomNav';
import { requireUser } from '@/utils/auth/require-user';
import { PropsWithChildren } from 'react';

export default async function TabsLayout({ children }: PropsWithChildren) {
  await requireUser();

  return (
    <section className="min-h-dvh overflow-visible bg-[#e9edf3] text-[#1f2937]">
      <main className="mx-auto w-full max-w-[460px] overflow-visible px-4 pb-[96px] pt-6 sm:pt-8">
        {children}
      </main>
      <BottomNav data-testid="bottom-nav" />
    </section>
  );
}
