import { PropsWithChildren } from 'react';

export default function ChallengeLayout({ children }: PropsWithChildren) {
  return (
    <section className="-mx-4 -mt-6 min-h-dvh bg-[#F7F7F7] px-4 pt-6">
      {children}
    </section>
  );
}
