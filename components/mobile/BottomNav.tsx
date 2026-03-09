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
      className={`fixed inset-x-0 bottom-0 z-[9999] border-t border-[#dce3ec] bg-white/95 backdrop-blur ${className}`.trim()}
      {...props}
    >
      <div className="mx-auto grid w-full max-w-[420px] grid-cols-4 px-5 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 ${
                active ? 'text-[#2563eb]' : 'text-[#94a3b8]'
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-[11px] font-bold uppercase tracking-[0.08em]">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
