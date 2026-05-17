'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { BellFilledIcon } from '@/components/icons/FilledIcons';
import {
  focusRingInteractive,
  iconBtnInteractive
} from '@/components/ui/interactive';
import { cn } from '@/utils/cn';

export default function NotificationsBellButton() {
  const router = useRouter();

  const openNotificationsPage = useCallback(() => {
    console.log('[proof] notifications bell clicked');
    router.push('/notifications');
  }, [router]);

  return (
    <button
      type="button"
      aria-label="Open Notifications"
      onClick={openNotificationsPage}
      className={cn(
        'relative z-20 inline-flex h-8 w-8 touch-manipulation items-center justify-center rounded-full bg-white text-muted hover:text-primary',
        iconBtnInteractive,
        focusRingInteractive
      )}
    >
      <BellFilledIcon className="pointer-events-none h-4 w-4" />
    </button>
  );
}
