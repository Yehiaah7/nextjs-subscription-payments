export type UserProfileStatKey = 'rank' | 'solved' | 'solvingDays';

export type UserProfileStat = {
  value: string;
  isAvailable: boolean;
  unavailableReason?: string;
};

export type UserProfileStats = Record<UserProfileStatKey, UserProfileStat>;
