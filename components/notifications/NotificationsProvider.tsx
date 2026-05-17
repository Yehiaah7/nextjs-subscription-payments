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
  ensureGeneratedNotifications,
  markAllNotificationsRead,
  readNotifications,
  subscribeToNotificationChanges
} from '@/lib/notifications/store';
import type {
  CompanyProgressNotificationSource,
  ProductGymNotification
} from '@/lib/notifications/types';

type NotificationsContextValue = {
  notifications: ProductGymNotification[];
  unreadCount: number;
  markAllAsRead: () => void;
  refreshNotifications: () => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null
);

export function NotificationsProvider({
  userId,
  companies = [],
  children
}: PropsWithChildren<{
  userId: string;
  companies?: CompanyProgressNotificationSource[];
}>) {
  const [notifications, setNotifications] = useState<ProductGymNotification[]>(
    []
  );

  const refreshNotifications = useCallback(() => {
    setNotifications(readNotifications(userId));
  }, [userId]);

  useEffect(() => {
    ensureGeneratedNotifications({ userId, companies });
    refreshNotifications();

    return subscribeToNotificationChanges(userId, refreshNotifications);
  }, [companies, refreshNotifications, userId]);

  const markAllAsRead = useCallback(() => {
    setNotifications(markAllNotificationsRead(userId));
  }, [userId]);

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notifications,
      unreadCount: notifications.filter((notification) => !notification.isRead)
        .length,
      markAllAsRead,
      refreshNotifications
    }),
    [markAllAsRead, notifications, refreshNotifications]
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
