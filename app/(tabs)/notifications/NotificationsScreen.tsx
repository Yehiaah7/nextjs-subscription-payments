'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import {
  ArrowLeftFilledIcon,
  BadgeCheckFilledIcon,
  BellFilledIcon,
  CheckCircleFilledIcon,
  RocketFilledIcon,
  TrophyFilledIcon,
  UsersFilledIcon
} from '@/components/icons/FilledIcons';
import MobileScreen from '@/components/mobile/MobileScreen';
import MotionPage from '@/components/motion/MotionPage';
import { toast } from '@/components/ui/Toasts/use-toast';
import { useNotifications } from '@/components/notifications/NotificationsProvider';
import {
  btnInteractive,
  btnInteractiveColored,
  btnInteractiveNeutral,
  focusRingInteractive,
  iconBtnInteractive
} from '@/components/ui/interactive';
import { getNotificationIconConfig } from '@/lib/notifications/iconMapping';
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

const notificationIcons = {
  hand: BadgeCheckFilledIcon,
  target: CheckCircleFilledIcon,
  rocket: RocketFilledIcon,
  users: UsersFilledIcon,
  trophy: TrophyFilledIcon
} as const;

type FormattedNotification = ProductGymNotification & {
  time: string;
  isHighlighted: boolean;
};

type NotificationSection = {
  label: 'Today' | 'Most recent';
  items: FormattedNotification[];
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

  const notificationSections = useMemo<NotificationSection[]>(() => {
    const todayItems: FormattedNotification[] = [];
    const mostRecentItems: FormattedNotification[] = [];

    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();

    formattedNotifications.forEach((notification) => {
      const createdAt = new Date(notification.createdAt).getTime();

      if (createdAt >= startOfToday) {
        todayItems.push(notification);
      } else {
        mostRecentItems.push(notification);
      }
    });

    const sections: NotificationSection[] = [
      { label: 'Today', items: todayItems },
      { label: 'Most recent', items: mostRecentItems }
    ];

    return sections.filter((section) => section.items.length > 0);
  }, [formattedNotifications]);

  const confirmDeleteNotification = () => {
    if (!notificationToDelete) return;

    deleteNotificationById(notificationToDelete.id);
    setNotificationToDelete(null);
    toast({
      title: 'Notification deleted successfully'
    });
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
            <div className="space-y-6">
              {notificationSections.map((section) => (
                <section key={section.label} aria-label={section.label}>
                  <h2 className="mb-2 px-1 text-[13px] font-extrabold uppercase tracking-[0.08em] text-[#506176]">
                    {section.label}
                  </h2>
                  <div className="overflow-hidden rounded-[28px] border border-[#e9eef5] bg-white">
                    {section.items.map((notification, index) => {
                      const iconConfig = getNotificationIconConfig(
                        notification.type
                      );
                      const NotificationIcon =
                        notificationIcons[iconConfig.icon];

                      return (
                        <article
                          key={notification.id}
                          className={cn(
                            'group flex w-full items-start gap-3.5 px-4 py-4',
                            index < section.items.length - 1 &&
                              'border-b border-[#edf2f8]'
                          )}
                        >
                          <div
                            className={cn(
                              'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary'
                            )}
                          >
                            <NotificationIcon className="h-4 w-4 shrink-0" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <h3 className="min-w-0 text-[14px] font-bold leading-[1.3] tracking-[-0.2px] text-[var(--alerts-heading-color)]">
                                {notification.title}
                              </h3>
                              <p className="shrink-0 pt-0.5 text-[11px] font-semibold text-[var(--alerts-time-color)]">
                                {notification.time}
                              </p>
                            </div>
                            <p className="mt-1.5 text-[12px] font-medium leading-[1.5] text-[var(--alerts-body-color)]">
                              {notification.body}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setNotificationToDelete(notification)
                            }
                            className={cn(
                              'mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#8da0b7] hover:bg-[#f2f6fb] hover:text-red-600',
                              btnInteractive,
                              btnInteractiveNeutral,
                              focusRingInteractive
                            )}
                            aria-label={`Delete ${notification.title}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="rounded-[var(--alerts-card-radius)] border border-dashed border-[var(--alerts-card-stroke)] bg-white p-6 text-center shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-productGym-yellowSoft text-amber-700">
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
            <div className="w-full max-w-[329px] rounded-[20px] bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
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
