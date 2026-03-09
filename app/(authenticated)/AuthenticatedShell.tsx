import { PropsWithChildren } from 'react';

export default function AuthenticatedShell({ children }: PropsWithChildren) {
  return (
    <section className="min-h-dvh overflow-visible bg-[#e9edf3] text-[#1f2937]">
      <main className="mx-auto w-full max-w-[460px] overflow-visible px-4 pt-6 sm:pt-8">
        {children}
      </main>
    </section>
  );
}
