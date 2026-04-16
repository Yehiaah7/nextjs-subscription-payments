export type Seniority = 'junior' | 'mid' | 'senior';
export type SeniorityFilter = 'all' | Seniority;

export const SENIORITY_LABELS: Record<Seniority, string> = {
  junior: 'Junior',
  mid: 'Mid-level',
  senior: 'Senior'
};

export const SENIORITY_FILTER_LABELS: Record<SeniorityFilter, string> = {
  all: 'All levels',
  ...SENIORITY_LABELS
};

export const SENIORITY_OPTIONS: SeniorityFilter[] = [
  'all',
  'junior',
  'mid',
  'senior'
];

export const SENIORITY_STORAGE_KEY = 'home-selected-seniority';
