import type { ReactNode } from 'react';
import AuthBrandHeader from '@/components/ui/AuthBrandHeader';
import { cn } from '@/utils/cn';

type AuthLayoutProps = {
  children: ReactNode;
  cardClassName?: string;
};

export const authTitleClassName =
  'text-[34px] font-extrabold leading-[1.03] tracking-[-0.03em] text-slate-900 md:text-[42px]';

export const authInputShellClassName =
  'flex h-12 w-full min-w-0 max-w-full items-center gap-2 rounded-2xl border border-border bg-white px-4 transition-colors focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20';

export default function AuthLayout({
  children,
  cardClassName
}: AuthLayoutProps) {
  return (
    <div className="min-h-dvh bg-[#F7F7F7] md:flex md:flex-col">
      <AuthBrandHeader />
      <main className="flex justify-center overflow-x-hidden px-4 py-6 md:flex-1 md:items-center md:py-10">
        <div
          className={cn(
            'w-full min-w-0 max-w-sm rounded-[20px] border border-border bg-white px-5 py-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:px-6 md:max-w-[440px] md:p-8',
            cardClassName
          )}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
