'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ComponentProps } from 'react';
import {
  HomeFilledIcon,
  TrophyFilledIcon
} from '@/components/icons/FilledIcons';
import ThumbnailPlaceholder from '@/components/ui/ThumbnailPlaceholder';
import { focusRingInteractive, iconBtnInteractive } from '@/components/ui/interactive';
import { cn } from '@/utils/cn';

const visibleRoutes = new Set(['/home', '/leaderboard', '/alerts', '/profile']);

type NavItem = {
  href: string;
  label: string;
  icon?: typeof HomeFilledIcon;
};

const navItems = [
  { href: '/home', label: 'Home', icon: HomeFilledIcon },
  { href: '/leaderboard', label: 'Leaderboard', icon: TrophyFilledIcon },
  { href: '/profile', label: 'Profile' }
] satisfies ReadonlyArray<NavItem>;

type BottomNavProps = ComponentProps<'div'>;

export default function BottomNav({ className = '', ...props }: BottomNavProps) {
  const pathname = usePathname();

  if (!visibleRoutes.has(pathname)) {
    return null;
  }

  return (
    <div
      role="navigation"
      aria-label="Bottom navigation"
      data-testid="bottom-nav"
      className={`fixed inset-x-0 bottom-0 z-[9999] bg-white ${className}`.trim()}
      {...props}
    >
      <div className="mx-auto h-[68px] w-full max-w-[393px] px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3">
        <div className="grid h-full grid-cols-3">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex h-full flex-col items-center justify-center gap-0.5 rounded-md',
                  iconBtnInteractive,
                  focusRingInteractive
                )}
              >
                {Icon ? (
                  <Icon
                    className={cn('h-[18px] w-[18px]', active ? 'text-primary' : 'text-slate-400')}
                  />
                ) : (
                  <ThumbnailPlaceholder
                    fallback="P"
                    className={cn(
                      'h-[18px] w-[18px] rounded-[6px] border shadow-none',
                      active
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-slate-200 bg-slate-50'
                    )}
                    contentClassName={cn(
                      'text-[9px] font-bold leading-none',
                      active ? 'text-primary' : 'text-slate-400'
                    )}
                  />
                )}
                <span className={cn('t-label whitespace-nowrap', active ? 'text-primary' : 'text-muted')}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
