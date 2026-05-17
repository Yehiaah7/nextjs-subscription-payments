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
  const {
    notifications,
    highlightedNotificationIds,
    clearHighlightedNotifications
  } = useNotifications();
  const highlightedIdsViewedOnOpen = useRef<string[]>([]);

  useEffect(() => {
    const nextHighlightedIds = notifications
      .filter((notification) => highlightedNotificationIds.has(notification.id))
      .map((notification) => notification.id);

    highlightedIdsViewedOnOpen.current = Array.from(
      new Set([...highlightedIdsViewedOnOpen.current, ...nextHighlightedIds])
    );
  }, [highlightedNotificationIds, notifications]);

  useEffect(
    () => () => {
      clearHighlightedNotifications(highlightedIdsViewedOnOpen.current);
    },
    [clearHighlightedNotifications]
  );

  const formattedNotifications = useMemo(
    () =>
      notifications.map((notification) => ({
        ...notification,
        time: formatNotificationTime(notification.createdAt),
        isHighlighted: highlightedNotificationIds.has(notification.id)
      })),
    [highlightedNotificationIds, notifications]
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
                Recent practice and progress updates.
              </p>
            </div>
          </header>

          {formattedNotifications.length ? (
            <div className="overflow-hidden rounded-[22px] border border-[var(--alerts-card-stroke)] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
              {formattedNotifications.map((alert) => (
                <article
                  key={alert.id}
                  className={cn(
                    'min-h-[86px] w-full border-b border-[#eef2f7] bg-white p-4 transition-[box-shadow,color] last:border-b-0 hover:shadow-[inset_3px_0_0_#2563eb]',
                    alert.isHighlighted && 'shadow-[inset_3px_0_0_#2563eb]'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="min-w-0 text-[14px] font-bold leading-[1.25] tracking-[-0.35px] text-[var(--alerts-heading-color)]">
                      {alert.title}
                    </h2>
                    <p className="shrink-0 pt-0.5 text-[10px] font-bold text-[var(--alerts-time-color)]">
                      {alert.time}
                    </p>
                  </div>
                  <p className="mt-1.5 text-[12px] font-medium leading-[1.45] text-[var(--alerts-body-color)]">
                    {alert.body}
                  </p>
                </article>
              ))}
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
