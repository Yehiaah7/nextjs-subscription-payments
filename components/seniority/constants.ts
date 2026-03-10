export type Seniority = 'junior' | 'mid' | 'senior';

export const SENIORITY_LABELS: Record<Seniority, string> = {
  junior: 'Junior',
  mid: 'Mid-level',
  senior: 'Senior'
};

export const SENIORITY_OPTIONS: Seniority[] = ['junior', 'mid', 'senior'];

export const SENIORITY_STORAGE_KEY = 'home-selected-seniority';
