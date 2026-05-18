'use client';

import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  deleteNotification,
  ensureGeneratedNotifications,
  readNotifications,
  subscribeToNotificationChanges
} from '@/lib/notifications/store';
import type {
  CompanyProgressNotificationSource,
  ProductGymNotification
} from '@/lib/notifications/types';

const EMPTY_COMPANIES: CompanyProgressNotificationSource[] = [];

const notificationHighlightKey = (notification: ProductGymNotification) =>
  `${notification.id}:${notification.createdAt}`;

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
      notification.createdAt === next.createdAt
    );
  });

type NotificationsContextValue = {
  notifications: ProductGymNotification[];
  highlightedNotificationIds: Set<string>;
  clearHighlightedNotifications: (notificationIds: string[]) => void;
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
  const [clearedHighlightKeys, setClearedHighlightKeys] = useState<Set<string>>(
    () => new Set()
  );
  const notificationsRef = useRef<ProductGymNotification[]>([]);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

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

  useEffect(() => {
    setClearedHighlightKeys(new Set());
  }, [userId]);

  const clearHighlightedNotifications = useCallback(
    (notificationIds: string[]) => {
      if (notificationIds.length === 0) return;

      setClearedHighlightKeys((currentKeys) => {
        const nextKeys = new Set(currentKeys);
        notificationsRef.current
          .filter((notification) => notificationIds.includes(notification.id))
          .forEach((notification) =>
            nextKeys.add(notificationHighlightKey(notification))
          );
        return nextKeys;
      });
    },
    []
  );

  const deleteNotificationById = useCallback(
    (notificationId: string) => {
      setNotifications((currentNotifications) =>
        currentNotifications.filter(
          (notification) => notification.id !== notificationId
        )
      );
      setClearedHighlightKeys((currentKeys) => {
        const nextKeys = new Set(currentKeys);
        notificationsRef.current
          .filter((notification) => notification.id === notificationId)
          .forEach((notification) =>
            nextKeys.delete(notificationHighlightKey(notification))
          );
        return nextKeys;
      });
      queueMicrotask(() => {
        deleteNotification(userId, notificationId);
      });
    },
    [userId]
  );

  const highlightedNotificationIds = useMemo(
    () =>
      new Set(
        notifications
          .filter(
            (notification) =>
              !clearedHighlightKeys.has(notificationHighlightKey(notification))
          )
          .map((notification) => notification.id)
      ),
    [clearedHighlightKeys, notifications]
  );

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notifications,
      highlightedNotificationIds,
      clearHighlightedNotifications,
      deleteNotificationById,
      refreshNotifications
    }),
    [
      clearHighlightedNotifications,
      deleteNotificationById,
      highlightedNotificationIds,
      notifications,
      refreshNotifications
    ]
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
