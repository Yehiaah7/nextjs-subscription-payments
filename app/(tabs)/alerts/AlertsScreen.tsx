'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef } from 'react';
import { ArrowLeftFilledIcon } from '@/components/icons/FilledIcons';
import MobileScreen from '@/components/mobile/MobileScreen';
import MotionPage from '@/components/motion/MotionPage';
import { useNotifications } from '@/components/notifications/NotificationsProvider';
import {
  focusRingInteractive,
  iconBtnInteractive
} from '@/components/ui/interactive';
import { cn } from '@/utils/cn';

const relativeTimeFormatter = new Intl.RelativeTimeFormat('en', {
  numeric: 'auto'
});

const formatNotificationTime = (createdAt: string) => {
  const createdTime = new Date(createdAt).getTime();
  const diffMs = createdTime - Date.now();
  const diffMinutes = Math.round(diffMs / (60 * 1000));
  const diffHours = Math.round(diffMs / (60 * 60 * 1000));
  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));

  if (Math.abs(diffMinutes) < 60) {
    return relativeTimeFormatter.format(diffMinutes, 'minute');
  }

  if (Math.abs(diffHours) < 24) {
    return relativeTimeFormatter.format(diffHours, 'hour');
  }

  return relativeTimeFormatter.format(diffDays, 'day');
};

export default function AlertsScreen() {
  const { notifications, markAllAsRead } = useNotifications();
  const unreadOnOpenIds = useRef<Set<string>>();

  if (!unreadOnOpenIds.current && notifications.length > 0) {
    unreadOnOpenIds.current = new Set(
      notifications
        .filter((notification) => !notification.isRead)
        .map((notification) => notification.id)
    );
  }

  useEffect(() => {
    if (notifications.some((notification) => !notification.isRead)) {
      markAllAsRead();
    }
  }, [markAllAsRead, notifications]);

  const formattedNotifications = useMemo(
    () =>
      notifications.map((notification) => ({
        ...notification,
        time: formatNotificationTime(notification.createdAt),
        wasUnreadOnOpen: unreadOnOpenIds.current?.has(notification.id) ?? false
      })),
    [notifications]
  );

  return (
    <MobileScreen>
      <MotionPage>
        <section className="mx-auto w-full max-w-[361px] pb-4">
          <header className="mb-4 flex items-center gap-2">
            <Link
              href="/home"
              aria-label="Back to Home"
              className={cn(
                'inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-muted',
                iconBtnInteractive,
                focusRingInteractive
              )}
            >
              <ArrowLeftFilledIcon className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-[var(--alerts-title-size)] font-bold leading-[1.4] tracking-[var(--alerts-title-track)] text-[var(--alerts-title-color)]">
                Notifications
              </h1>
              <p className="text-[11px] font-semibold text-muted">
                New alerts are marked unread until you view this page.
              </p>
            </div>
          </header>

          {formattedNotifications.length ? (
            <div className="space-y-4">
              {formattedNotifications.map((alert) => {
                const emphasizeUnread = alert.wasUnreadOnOpen || !alert.isRead;

                return (
                  <article
                    key={alert.id}
                    className={cn(
                      'min-h-[92px] w-full rounded-[var(--alerts-card-radius)] border p-3 transition-colors',
                      emphasizeUnread
                        ? 'border-primary-soft bg-[#eff6ff] shadow-[0_10px_20px_rgba(37,99,235,0.08)]'
                        : 'border-[var(--alerts-card-stroke)] bg-[var(--alerts-card-bg)]'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        {emphasizeUnread ? (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                        ) : null}
                        <h2 className="truncate text-[14px] font-bold tracking-[-0.35px] text-[var(--alerts-heading-color)]">
                          {alert.title}
                        </h2>
                      </div>
                      <p className="shrink-0 text-[10px] font-bold text-[var(--alerts-time-color)]">
                        {alert.time}
                      </p>
                    </div>
                    <p className="mt-2 text-[12px] font-medium leading-[1.45] text-[var(--alerts-body-color)]">
                      {alert.body}
                    </p>
                    {emphasizeUnread ? (
                      <p className="mt-2 text-[10px] font-black uppercase tracking-[0.08em] text-primary">
                        New
                      </p>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[var(--alerts-card-radius)] border border-dashed border-[var(--alerts-card-stroke)] bg-white p-4 text-sm font-semibold text-muted">
              You are all caught up. New challenge and progress updates will
              appear here.
            </div>
          )}
        </section>
      </MotionPage>
    </MobileScreen>
  );
}
