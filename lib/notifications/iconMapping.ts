import type { ProductGymNotificationType } from './types';

export type NotificationIconConfig = {
  icon: 'hand' | 'target' | 'rocket' | 'users' | 'trophy';
  chipClassName: string;
  iconClassName: string;
};

const notificationTypeToIcon: Record<
  ProductGymNotificationType,
  NotificationIconConfig
> = {
  welcome: {
    icon: 'hand',
    chipClassName: 'bg-violet-100',
    iconClassName: 'text-violet-700'
  },
  challenge_completed: {
    icon: 'trophy',
    chipClassName: 'bg-amber-100',
    iconClassName: 'text-amber-700'
  },
  challenge_progress: {
    icon: 'target',
    chipClassName: 'bg-sky-100',
    iconClassName: 'text-sky-700'
  },
  company_progress_reminder: {
    icon: 'rocket',
    chipClassName: 'bg-emerald-100',
    iconClassName: 'text-emerald-700'
  },
  activity_reminder: {
    icon: 'users',
    chipClassName: 'bg-blue-100',
    iconClassName: 'text-blue-700'
  }
};

export const getNotificationIconConfig = (
  type: ProductGymNotificationType
): NotificationIconConfig => notificationTypeToIcon[type];
