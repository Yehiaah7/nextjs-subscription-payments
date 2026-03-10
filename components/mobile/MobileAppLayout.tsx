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
    <section className="min-h-dvh bg-[#f8fafc] text-[#0f172b]">
      <main
        className={`mx-auto w-full max-w-[393px] px-4 pt-6 ${
          showBottomNav
            ? 'pb-[calc(68px+12px+env(safe-area-inset-bottom))]'
            : 'pb-6'
        }`}
      >
        {children}
      </main>
      {showBottomNav ? <BottomNav data-testid="bottom-nav" /> : null}
    </section>
  );
}
