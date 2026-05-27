const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function calculateTrialDaysLeft(params: {
  trialEndAt?: string | Date | null;
  trialStartedAt?: string | Date | null;
  trialDurationDays?: number;
  now?: Date;
}): number {
  const {
    trialEndAt,
    trialStartedAt,
    trialDurationDays = 7,
    now = new Date()
  } = params;

  const parsedTrialEndAt = trialEndAt ? new Date(trialEndAt) : null;
  if (parsedTrialEndAt && !Number.isNaN(parsedTrialEndAt.getTime())) {
    return Math.max(0, Math.ceil((parsedTrialEndAt.getTime() - now.getTime()) / MS_PER_DAY));
  }

  const parsedTrialStartedAt = trialStartedAt ? new Date(trialStartedAt) : null;
  if (parsedTrialStartedAt && !Number.isNaN(parsedTrialStartedAt.getTime())) {
    const trialEnd = new Date(parsedTrialStartedAt.getTime() + trialDurationDays * MS_PER_DAY);
    return Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / MS_PER_DAY));
  }

  return Math.max(0, trialDurationDays);
}

export function formatTrialCountdownLabel(daysLeft: number): string {
  if (daysLeft <= 0) {
    return 'Trial ended';
  }

  if (daysLeft === 1) {
    return '1 day left';
  }

  return `${daysLeft} days left`;
}
