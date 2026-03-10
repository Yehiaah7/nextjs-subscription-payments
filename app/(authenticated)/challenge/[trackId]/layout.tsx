import { PropsWithChildren } from 'react';

export default function ChallengeLayout({ children }: PropsWithChildren) {
  return (
    <section className="-mx-4 -mt-6 min-h-dvh bg-[#f1f5f9] px-4 pt-6">
      {children}
    </section>
  );
}
