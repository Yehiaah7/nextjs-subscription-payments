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
    <section className="min-h-dvh overflow-visible bg-[#e9edf3] text-[#1f2937]">
      <main
        className={`mx-auto w-full max-w-[460px] overflow-visible px-4 pt-6 sm:pt-8 ${
          showBottomNav ? 'pb-24' : 'pb-8'
        }`}
      >
        {children}
      </main>
      {showBottomNav ? <BottomNav data-testid="bottom-nav" /> : null}
    </section>
  );
}
