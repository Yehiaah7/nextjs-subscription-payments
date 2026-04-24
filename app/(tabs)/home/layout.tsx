import { PropsWithChildren } from 'react';

export default function HomeLayout({ children }: PropsWithChildren) {
  return <section className="min-h-full bg-[#F5F5F5]">{children}</section>;
}
