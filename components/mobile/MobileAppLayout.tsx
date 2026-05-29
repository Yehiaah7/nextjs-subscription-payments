'use client';

import { PropsWithChildren } from 'react';
import { cn } from '@/utils/cn';
import { pageEnter } from '@/lib/motion';
import BottomNav from './BottomNav';
import ResponsiveLayoutGuard from './ResponsiveLayoutGuard';

type MobileAppLayoutProps = PropsWithChildren<{
  showBottomNav?: boolean;
}>;

export default function MobileAppLayout({
  children,
  showBottomNav = false
}: MobileAppLayoutProps) {
  return (
    <section className="min-h-dvh bg-bg text-text">
      <ResponsiveLayoutGuard />
      <main
        className={cn(
          'app-shell',
          pageEnter,
          showBottomNav ? 'app-shell-nav' : 'app-shell-page'
        )}
      >
        {children}
      </main>
      {showBottomNav ? <BottomNav data-testid="bottom-nav" /> : null}
    </section>
  );
}
