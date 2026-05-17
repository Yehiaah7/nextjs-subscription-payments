'use client';

import { useRouter } from 'next/navigation';

type NotificationsBellButtonProps = {
  unreadCount: number;
};

export default function NotificationsBellButton({
  unreadCount: _unreadCount
}: NotificationsBellButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label="Open Notifications"
      onClick={() => {
        console.log('BELL_CLICKED');
        router.push('/notifications');
      }}
    >
      🔔
    </button>
  );
}
