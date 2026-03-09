'use client';

import { Bell, Home, Trophy, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/profile', label: 'Profile', icon: User }
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      data-testid="bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-[9999] bg-white"
    >
      <div className="mx-auto grid w-full max-w-[460px] grid-cols-4 border-t border-[#dce3ec] px-5 py-3">
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
    </nav>
  );
}
