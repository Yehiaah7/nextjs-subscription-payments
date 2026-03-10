'use client';

import { Bell, Home, Trophy, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ComponentProps } from 'react';

const visibleRoutes = new Set(['/home', '/leaderboard', '/alerts', '/profile']);

const navItems = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/profile', label: 'Profile', icon: User }
];

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
        <div className="grid h-full grid-cols-4">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;

            return (
              <Link key={href} href={href} className={`flex h-full flex-col items-center justify-center gap-0.5 ${active ? 'text-primary' : 'text-muted'}`}>
                <Icon className="h-[18px] w-[18px]" />
                <span className="t-label">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
