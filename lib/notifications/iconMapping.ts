import type { ProductGymNotificationType } from './types';

export type NotificationIconConfig = {
  icon: 'sparkles' | 'target' | 'rocket' | 'users' | 'trophy';
  chipClassName: string;
  iconClassName: string;
};

const notificationTypeToIcon: Record<
  ProductGymNotificationType,
  NotificationIconConfig
> = {
  welcome: {
    icon: 'sparkles',
    chipClassName: 'bg-violet-100',
    iconClassName: 'text-violet-600'
  },
  challenge_completed: {
    icon: 'trophy',
    chipClassName: 'bg-amber-100',
    iconClassName: 'text-amber-600'
  },
  challenge_progress: {
    icon: 'target',
    chipClassName: 'bg-sky-100',
    iconClassName: 'text-sky-600'
  },
  company_progress_reminder: {
    icon: 'rocket',
    chipClassName: 'bg-emerald-100',
    iconClassName: 'text-emerald-600'
  },
  activity_reminder: {
    icon: 'users',
    chipClassName: 'bg-fuchsia-100',
    iconClassName: 'text-fuchsia-600'
  }
};

export const getNotificationIconConfig = (
  type: ProductGymNotificationType
): NotificationIconConfig => notificationTypeToIcon[type];
