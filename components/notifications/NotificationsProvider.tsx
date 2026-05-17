'use client';

import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import {
  deleteNotification,
  ensureGeneratedNotifications,
  markAllNotificationsRead,
  readNotifications,
  subscribeToNotificationChanges
} from '@/lib/notifications/store';
import type {
  CompanyProgressNotificationSource,
  ProductGymNotification
} from '@/lib/notifications/types';

const EMPTY_COMPANIES: CompanyProgressNotificationSource[] = [];

const areNotificationsEqual = (
  left: ProductGymNotification[],
  right: ProductGymNotification[]
) =>
  left.length === right.length &&
  left.every((notification, index) => {
    const next = right[index];

    return (
      next &&
      notification.id === next.id &&
      notification.createdAt === next.createdAt &&
      notification.isRead === next.isRead
    );
  });

type NotificationsContextValue = {
  notifications: ProductGymNotification[];
  unreadCount: number;
  markAllAsRead: () => void;
  deleteNotificationById: (notificationId: string) => void;
  refreshNotifications: () => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null
);

export function NotificationsProvider({
  userId,
  companies = EMPTY_COMPANIES,
  children
}: PropsWithChildren<{
  userId: string;
  companies?: CompanyProgressNotificationSource[];
}>) {
  const [notifications, setNotifications] = useState<ProductGymNotification[]>(
    []
  );

  const refreshNotifications = useCallback(() => {
    const nextNotifications = readNotifications(userId);

    setNotifications((currentNotifications) =>
      areNotificationsEqual(currentNotifications, nextNotifications)
        ? currentNotifications
        : nextNotifications
    );
  }, [userId]);

  useEffect(() => {
    ensureGeneratedNotifications({ userId, companies });
    refreshNotifications();

    return subscribeToNotificationChanges(userId, refreshNotifications);
  }, [companies, refreshNotifications, userId]);

  const markAllAsRead = useCallback(() => {
    setNotifications(markAllNotificationsRead(userId));
  }, [userId]);

  const deleteNotificationById = useCallback(
    (notificationId: string) => {
      setNotifications(deleteNotification(userId, notificationId));
    },
    [userId]
  );

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notifications,
      unreadCount: notifications.filter((notification) => !notification.isRead)
        .length,
      markAllAsRead,
      deleteNotificationById,
      refreshNotifications
    }),
    [deleteNotificationById, markAllAsRead, notifications, refreshNotifications]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      'useNotifications must be used inside NotificationsProvider'
    );
  }

  return context;
}
