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
    <section className="min-h-dvh bg-bg text-text">
      <main className={`app-shell ${showBottomNav ? 'app-shell-nav' : 'app-shell-page'}`}>
        {children}
      </main>
      {showBottomNav ? <BottomNav data-testid="bottom-nav" /> : null}
    </section>
  );
}
