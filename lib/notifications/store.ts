import type {
  CompanyProgressNotificationSource,
  ProductGymNotification,
  ProductGymNotificationType
} from './types';

const STORAGE_PREFIX = 'product-gym:notifications:v1';
const NOTIFICATIONS_CHANGED_EVENT = 'product-gym:notifications-changed';
const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
const ACTIVITY_PRACTICING_COUNT = 14;
const ACTIVITY_RANKED_COUNT = 3;

const isBrowser = () => typeof window !== 'undefined';

const storageKeyForUser = (userId: string) => `${STORAGE_PREFIX}:${userId}`;

const nowIso = () => new Date().toISOString();

const createNotificationId = (type: ProductGymNotificationType) => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${type}:${crypto.randomUUID()}`;
  }

  return `${type}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
};

const parseNotifications = (value: string | null): ProductGymNotification[] => {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is ProductGymNotification =>
        typeof item?.id === 'string' &&
        typeof item?.type === 'string' &&
        typeof item?.title === 'string' &&
        typeof item?.body === 'string' &&
        typeof item?.createdAt === 'string' &&
        typeof item?.isRead === 'boolean'
    );
  } catch {
    return [];
  }
};

const sortNewestFirst = (notifications: ProductGymNotification[]) =>
  [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

const saveNotifications = (
  userId: string,
  notifications: ProductGymNotification[]
) => {
  if (!isBrowser()) return;

  window.localStorage.setItem(
    storageKeyForUser(userId),
    JSON.stringify(sortNewestFirst(notifications))
  );
  window.dispatchEvent(
    new CustomEvent(NOTIFICATIONS_CHANGED_EVENT, { detail: { userId } })
  );
};

const getNotifications = (userId: string): ProductGymNotification[] => {
  if (!isBrowser()) return [];

  return sortNewestFirst(
    parseNotifications(window.localStorage.getItem(storageKeyForUser(userId)))
  );
};

const getLastNotificationOfType = (
  notifications: ProductGymNotification[],
  type: ProductGymNotificationType
) => notifications.find((notification) => notification.type === type) ?? null;

const isOlderThan = (createdAt: string, intervalMs: number) =>
  Date.now() - new Date(createdAt).getTime() >= intervalMs;

const addNotification = (
  userId: string,
  notification: Omit<ProductGymNotification, 'id' | 'createdAt' | 'isRead'> & {
    id?: string;
    createdAt?: string;
    isRead?: boolean;
  }
) => {
  const notifications = getNotifications(userId);
  const nextNotification: ProductGymNotification = {
    id: notification.id ?? createNotificationId(notification.type),
    type: notification.type,
    title: notification.title,
    body: notification.body,
    createdAt: notification.createdAt ?? nowIso(),
    isRead: notification.isRead ?? false,
    metadata: notification.metadata
  };

  saveNotifications(userId, [nextNotification, ...notifications]);
  return nextNotification;
};

export const readNotifications = getNotifications;

export const getUnreadNotificationCount = (userId: string) =>
  getNotifications(userId).filter((notification) => !notification.isRead)
    .length;

export const markAllNotificationsRead = (userId: string) => {
  const notifications = getNotifications(userId);
  const next = notifications.map((notification) => ({
    ...notification,
    isRead: true
  }));

  saveNotifications(userId, next);
  return next;
};

export const ensureWelcomeNotification = (userId: string) => {
  const notifications = getNotifications(userId);
  if (notifications.some((notification) => notification.type === 'welcome')) {
    return notifications;
  }

  addNotification(userId, {
    id: 'welcome',
    type: 'welcome',
    title: 'Welcome to Product Gym',
    body: 'Your practice journey starts now. Pick a challenge and start building momentum.'
  });

  return getNotifications(userId);
};

const chooseCompanyForReminder = (
  companies: CompanyProgressNotificationSource[]
) => {
  const candidates = companies.filter(
    (company) => company.totalChallenges > 0 && company.progress < 100
  );

  return candidates.sort((a, b) => b.progress - a.progress)[0] ?? null;
};

export const ensureCompanyProgressReminder = ({
  userId,
  companies
}: {
  userId: string;
  companies: CompanyProgressNotificationSource[];
}) => {
  const notifications = getNotifications(userId);
  const lastReminder = getLastNotificationOfType(
    notifications,
    'company_progress_reminder'
  );

  if (lastReminder && !isOlderThan(lastReminder.createdAt, TWO_DAYS_MS)) {
    return notifications;
  }

  const company = chooseCompanyForReminder(companies);
  if (!company) return notifications;

  const completedChallenges = Math.min(
    company.totalChallenges,
    Math.max(0, Math.round((company.progress / 100) * company.totalChallenges))
  );
  const challengesLeft = Math.max(
    0,
    company.totalChallenges - completedChallenges
  );

  if (challengesLeft === 0) return notifications;

  addNotification(userId, {
    type: 'company_progress_reminder',
    title: `Keep going on ${company.companyName}`,
    body: `You have ${challengesLeft} of ${company.totalChallenges} challenges left to complete all challenges in ${company.companyName}.`,
    metadata: {
      companyId: company.companyId,
      progress: company.progress,
      challengesLeft,
      totalChallenges: company.totalChallenges
    }
  });

  return getNotifications(userId);
};

export const ensureActivityReminder = (userId: string) => {
  const notifications = getNotifications(userId);
  const lastReminder = getLastNotificationOfType(
    notifications,
    'activity_reminder'
  );

  if (lastReminder && !isOlderThan(lastReminder.createdAt, THREE_DAYS_MS)) {
    return notifications;
  }

  addNotification(userId, {
    type: 'activity_reminder',
    title: 'Others are practicing too',
    body: `${ACTIVITY_PRACTICING_COUNT} users are practicing right now, and ${ACTIVITY_RANKED_COUNT} of them have already joined the rankings.`,
    metadata: {
      practicingCount: ACTIVITY_PRACTICING_COUNT,
      rankedCount: ACTIVITY_RANKED_COUNT
    }
  });

  return getNotifications(userId);
};

export const addChallengeCompletedNotification = ({
  userId,
  challengeId
}: {
  userId: string;
  challengeId: string;
}) => {
  const notifications = getNotifications(userId);
  const alreadyNotified = notifications.some(
    (notification) =>
      notification.type === 'challenge_completed' &&
      notification.metadata?.challengeId === challengeId
  );

  if (alreadyNotified) return notifications;

  addNotification(userId, {
    type: 'challenge_completed',
    title: 'Challenge completed',
    body: 'Nice work — you finished this challenge. Keep going and build your streak.',
    metadata: { challengeId, progress: 100 }
  });

  return getNotifications(userId);
};

export const addPartialChallengeProgressNotification = ({
  userId,
  challengeId,
  progressPercent
}: {
  userId: string;
  challengeId: string;
  progressPercent: number;
}) => {
  const safeProgress = Math.max(1, Math.min(99, Math.round(progressPercent)));
  const notifications = getNotifications(userId);
  const existingIndex = notifications.findIndex(
    (notification) =>
      notification.type === 'challenge_progress' &&
      notification.metadata?.challengeId === challengeId
  );

  const nextNotification: ProductGymNotification = {
    id:
      existingIndex >= 0
        ? notifications[existingIndex].id
        : createNotificationId('challenge_progress'),
    type: 'challenge_progress',
    title: 'Challenge in progress',
    body: `You’ve completed ${safeProgress}% of this challenge. You’re close — come back and finish it.`,
    createdAt: nowIso(),
    isRead: false,
    metadata: { challengeId, progress: safeProgress }
  };

  const next =
    existingIndex >= 0
      ? notifications.map((notification, index) =>
          index === existingIndex ? nextNotification : notification
        )
      : [nextNotification, ...notifications];

  saveNotifications(userId, next);
  return getNotifications(userId);
};

export const ensureGeneratedNotifications = ({
  userId,
  companies = []
}: {
  userId: string;
  companies?: CompanyProgressNotificationSource[];
}) => {
  ensureWelcomeNotification(userId);
  ensureActivityReminder(userId);
  ensureCompanyProgressReminder({ userId, companies });

  return getNotifications(userId);
};

export const subscribeToNotificationChanges = (
  userId: string,
  callback: () => void
) => {
  if (!isBrowser()) return () => undefined;

  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKeyForUser(userId)) callback();
  };
  const onCustomEvent = (event: Event) => {
    if ((event as CustomEvent).detail?.userId === userId) callback();
  };

  window.addEventListener('storage', onStorage);
  window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, onCustomEvent);

  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, onCustomEvent);
  };
};
