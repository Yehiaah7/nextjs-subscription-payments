'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import {
  ArrowLeftFilledIcon,
  BellFilledIcon
} from '@/components/icons/FilledIcons';
import MobileScreen from '@/components/mobile/MobileScreen';
import MotionPage from '@/components/motion/MotionPage';
import { useNotifications } from '@/components/notifications/NotificationsProvider';
import {
  btnInteractive,
  btnInteractiveColored,
  btnInteractiveNeutral,
  focusRingInteractive,
  iconBtnInteractive
} from '@/components/ui/interactive';
import type { ProductGymNotification } from '@/lib/notifications/types';
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

type FormattedNotification = ProductGymNotification & {
  time: string;
  isHighlighted: boolean;
};

export default function NotificationsScreen() {
  const {
    notifications,
    highlightedNotificationIds,
    clearHighlightedNotifications,
    deleteNotificationById
  } = useNotifications();
  const highlightedIdsViewedOnOpen = useRef<string[]>([]);
  const [notificationToDelete, setNotificationToDelete] =
    useState<FormattedNotification | null>(null);

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

  const formattedNotifications = useMemo<FormattedNotification[]>(
    () =>
      notifications.map((notification) => ({
        ...notification,
        time: formatNotificationTime(notification.createdAt),
        isHighlighted: highlightedNotificationIds.has(notification.id)
      })),
    [highlightedNotificationIds, notifications]
  );

  const confirmDeleteNotification = () => {
    if (!notificationToDelete) return;

    deleteNotificationById(notificationToDelete.id);
    setNotificationToDelete(null);
  };

  return (
    <MobileScreen>
      <MotionPage>
        <section className="mx-auto w-full max-w-[361px] pb-4 text-text">
          <header className="mb-4 flex items-center gap-2">
            <Link
              href="/home"
              aria-label="Back to Home"
              className={cn(
                'inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-muted',
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
              {formattedNotifications.map((notification) => (
                <article
                  key={notification.id}
                  className={cn(
                    'group flex min-h-[94px] w-full items-start gap-3 border-b border-[#eef2f7] bg-white p-4 transition-[box-shadow,color] last:border-b-0 hover:shadow-[inset_3px_0_0_#2563eb]',
                    notification.isHighlighted &&
                      'shadow-[inset_3px_0_0_#2563eb]'
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="min-w-0 text-[14px] font-bold leading-[1.25] tracking-[-0.35px] text-[var(--alerts-heading-color)] group-hover:text-primary">
                        {notification.title}
                      </h2>
                      <p className="shrink-0 pt-0.5 text-[10px] font-bold text-[var(--alerts-time-color)]">
                        {notification.time}
                      </p>
                    </div>
                    <p className="mt-1.5 text-[12px] font-medium leading-[1.45] text-[var(--alerts-body-color)]">
                      {notification.body}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotificationToDelete(notification)}
                    className={cn(
                      'mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-red-100 bg-white text-red-600',
                      btnInteractive,
                      btnInteractiveNeutral,
                      focusRingInteractive
                    )}
                    aria-label={`Delete ${notification.title}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[var(--alerts-card-radius)] border border-dashed border-[var(--alerts-card-stroke)] bg-white p-6 text-center shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary-soft text-primary">
                <BellFilledIcon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-[15px] font-bold tracking-[-0.35px] text-[var(--alerts-heading-color)]">
                No notifications yet
              </h2>
              <p className="mt-2 text-[12px] font-medium leading-[1.45] text-[var(--alerts-body-color)]">
                You’re all caught up. New updates will appear here.
              </p>
            </div>
          )}
        </section>

        {notificationToDelete ? (
          <div
            className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 px-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-notification-title"
          >
            <div className="w-full max-w-[329px] rounded-3xl bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
              <h2
                id="delete-notification-title"
                className="text-base font-bold tracking-[-0.35px] text-[#0f172b]"
              >
                Delete notification?
              </h2>
              <p className="mt-2 text-sm font-medium leading-5 text-[#45556c]">
                This notification will be removed from your list.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNotificationToDelete(null)}
                  className={cn(
                    'inline-flex h-[39px] items-center justify-center rounded-xl border border-[#e2e8f0] bg-white px-4 py-[11px] text-[11px] font-black uppercase tracking-[0.08em] text-[#0f172b]',
                    btnInteractive,
                    btnInteractiveNeutral,
                    focusRingInteractive
                  )}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteNotification}
                  className={cn(
                    'inline-flex h-[39px] items-center justify-center rounded-xl border border-red-500 bg-red-500 px-4 py-[11px] text-[11px] font-black uppercase tracking-[0.08em] text-white',
                    btnInteractive,
                    btnInteractiveColored,
                    focusRingInteractive
                  )}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </MotionPage>
    </MobileScreen>
  );
}
