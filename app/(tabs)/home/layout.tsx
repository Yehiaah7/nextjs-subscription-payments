import { PropsWithChildren } from 'react';

export default function HomeLayout({ children }: PropsWithChildren) {
  return (
    <section className="min-h-full bg-[#e9edf3]">
      <div className="mx-auto w-full max-w-[420px] px-4 pb-[calc(96px+env(safe-area-inset-bottom))]">
        {children}
      </div>
    </section>
  );
}
