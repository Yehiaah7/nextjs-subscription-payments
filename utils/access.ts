const MS_PER_DAY = 24 * 60 * 60 * 1000;
export const FREE_TRIAL_DAYS = 7;
export const FREE_TRIAL_COMPANY_SLUGS = ['airbnb', 'uber'] as const;
export type TrialStatus = 'active' | 'ended';

type DateInput = string | Date | null | undefined;

export function normalizeCompanySlug(value: string | null | undefined): string {
  return (value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseDate(value: DateInput): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function resolveTrialEndAt(params: {
  trialEndAt?: DateInput;
  trialStartedAt?: DateInput;
  createdAt?: DateInput;
  trialDurationDays?: number;
}): Date {
  const { trialDurationDays = FREE_TRIAL_DAYS } = params;
  const explicitEnd = parseDate(params.trialEndAt);
  if (explicitEnd) return explicitEnd;

  const start =
    parseDate(params.trialStartedAt) ??
    parseDate(params.createdAt) ??
    new Date();
  return new Date(start.getTime() + trialDurationDays * MS_PER_DAY);
}

export function getTrialDaysLeft(
  trialEndAt: DateInput,
  now = new Date()
): number {
  const end = parseDate(trialEndAt);
  if (!end) return 0;
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / MS_PER_DAY));
}

export function getTrialStatus(
  trialEndAt: DateInput,
  now = new Date()
): TrialStatus {
  return getTrialDaysLeft(trialEndAt, now) > 0 ? 'active' : 'ended';
}

export function isFreeTrialActive(
  trialEndAt: DateInput,
  now = new Date()
): boolean {
  return getTrialStatus(trialEndAt, now) === 'active';
}

export function canAccessCompany({
  companySlug,
  isPro,
  isTrialActive
}: {
  companySlug: string;
  isPro: boolean;
  isTrialActive: boolean;
}): boolean {
  if (isPro) return true;
  if (!isTrialActive) return false;
  return FREE_TRIAL_COMPANY_SLUGS.includes(
    normalizeCompanySlug(
      companySlug
    ) as (typeof FREE_TRIAL_COMPANY_SLUGS)[number]
  );
}

export function formatTrialCountdownLabel(daysLeft: number): string {
  if (daysLeft <= 0) return 'Free trial ended';
  if (daysLeft === 1) return '1 day left';
  return `${daysLeft} days left`;
}
