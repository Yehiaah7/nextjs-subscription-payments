'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { BellFilledIcon } from '@/components/icons/FilledIcons';
import {
  focusRingInteractive,
  iconBtnInteractive
} from '@/components/ui/interactive';
import { cn } from '@/utils/cn';

type NotificationsBellButtonProps = {
  unreadCount: number;
};

export default function NotificationsBellButton({
  unreadCount
}: NotificationsBellButtonProps) {
  const router = useRouter();

  const openNotifications = useCallback(() => {
    router.push('/alerts');
  }, [router]);

  return (
    <button
      type="button"
      aria-label="Open Notifications"
      onClick={openNotifications}
      className={cn(
        'relative z-20 inline-flex h-8 w-8 touch-manipulation items-center justify-center rounded-full bg-white text-muted hover:text-primary',
        iconBtnInteractive,
        focusRingInteractive
      )}
    >
      <BellFilledIcon className="pointer-events-none h-4 w-4" />
      {unreadCount > 0 ? (
        <span
          aria-label={`${unreadCount} unread notifications`}
          className="pointer-events-none absolute -right-1 -top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-[#ff4d4f] px-1 text-[9px] font-black leading-none text-white shadow-[0_2px_6px_rgba(239,68,68,0.35)]"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      ) : null}
    </button>
  );
}
