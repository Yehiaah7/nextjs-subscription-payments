import { PropsWithChildren } from 'react';
import BottomNav from './BottomNav';

type MobileAppLayoutProps = PropsWithChildren<{
  showBottomNav?: boolean;
}>;

export default function MobileAppLayout({
  children,
  showBottomNav = false
}: MobileAppLayoutProps) {
  return (
    <section className="min-h-dvh bg-[#e9edf3] text-[#1f2937]">
      <main
        className={`mx-auto w-full max-w-[420px] px-4 pt-6 sm:pt-8 ${
          showBottomNav
            ? 'pb-[calc(96px+env(safe-area-inset-bottom))]'
            : 'pb-8'
        }`}
      >
        {children}
      </main>
      {showBottomNav ? <BottomNav data-testid="bottom-nav" /> : null}
    </section>
  );
}
