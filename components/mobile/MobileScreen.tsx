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
      <div className="mx-auto min-h-dvh w-full max-w-[620px] px-4 pb-28 pt-7">
        {children}
      </div>
      <BottomNav />
    </section>
  );
}
