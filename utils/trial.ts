import {
  FREE_TRIAL_DAYS,
  formatTrialCountdownLabel,
  getTrialDaysLeft,
  resolveTrialEndAt
} from './access';

export function calculateTrialDaysLeft(params: {
  trialEndAt?: string | Date | null;
  trialStartedAt?: string | Date | null;
  trialDurationDays?: number;
  now?: Date;
}): number {
  const trialEndAt = resolveTrialEndAt({
    trialEndAt: params.trialEndAt,
    trialStartedAt: params.trialStartedAt,
    trialDurationDays: params.trialDurationDays ?? FREE_TRIAL_DAYS
  });

  return getTrialDaysLeft(trialEndAt, params.now);
}

export { formatTrialCountdownLabel };
