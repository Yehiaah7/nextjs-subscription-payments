'use client';

import { PropsWithChildren } from 'react';
import { usePathname } from 'next/navigation';
import BottomNav from '@/components/mobile/BottomNav';

const TAB_ROUTES = new Set(['/home', '/leaderboard', '/alerts', '/profile']);

export default function AuthenticatedShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const showBottomNav = TAB_ROUTES.has(pathname);

  return (
    <section className="min-h-dvh bg-[#e9edf3] text-[#1f2937]">
      <div
        className={`mx-auto w-full max-w-[460px] px-4 pt-6 sm:pt-8 ${
          showBottomNav ? 'pb-24' : 'pb-0'
        }`}
      >
        {children}
      </div>
      {showBottomNav ? <BottomNav /> : null}
    </section>
  );
}
