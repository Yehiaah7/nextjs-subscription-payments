export type ProductGymNotificationType =
  | 'welcome'
  | 'challenge_completed'
  | 'challenge_progress'
  | 'company_progress_reminder'
  | 'activity_reminder';

export type ProductGymNotification = {
  id: string;
  type: ProductGymNotificationType;
  title: string;
  body: string;
  createdAt: string;
  isRead: boolean;
  metadata?: Record<string, string | number | boolean | null>;
};

export type CompanyProgressNotificationSource = {
  companyId: string;
  companyName: string;
  progress: number;
  totalChallenges: number;
};
