'use client';

import { PropsWithChildren, useEffect } from 'react';
import BottomNav from './BottomNav';

export default function MobileScreen({ children }: PropsWithChildren) {
  useEffect(() => {
    document.body.classList.add('mobile-app-page');

    return () => {
      document.body.classList.remove('mobile-app-page');
    };
  }, []);

  return (
    <section className="bg-[#e9edf3] text-[#1f2937]">
      <div className="mx-auto min-h-dvh w-full max-w-[460px] px-4 pb-28 pt-6 sm:pt-8">
        {children}
      </div>
      <BottomNav />
    </section>
  );
}
