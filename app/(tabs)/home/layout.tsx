import { PropsWithChildren } from 'react';

export default function HomeLayout({ children }: PropsWithChildren) {
  return <section className="min-h-full bg-[#F7F7F7]">{children}</section>;
}
