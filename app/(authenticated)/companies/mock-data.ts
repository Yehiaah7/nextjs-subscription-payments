import type { ChallengeStatus } from './[trackId]/CompanyDetailsScreen';

export type MockCompany = {
  id: string;
  title: string;
  focus: string;
  seniority: 'junior' | 'mid' | 'senior';
  challengesCount: number;
  practicingCount: string;
  progress: number;
  description?: string;
};

export const MOCK_COMPANIES: MockCompany[] = [
  {
    id: 'google',
    title: 'Google',
    focus: 'Metrics • Product Sense',
    description: 'Metrics • Product Sense',
    seniority: 'junior',
    challengesCount: 12,
    practicingCount: '1.2K',
    progress: 45
  },
  {
    id: 'meta',
    title: 'Meta',
    focus: 'Execution • Growth',
    description: 'Execution • Growth',
    seniority: 'junior',
    challengesCount: 14,
    practicingCount: '1.8K',
    progress: 62
  },
  {
    id: 'amazon',
    title: 'Amazon',
    focus: 'Product Strategy • Analytics',
    description: 'Product Strategy • Analytics',
    seniority: 'mid',
    challengesCount: 11,
    practicingCount: '2.1K',
    progress: 38
  },
  {
    id: 'microsoft',
    title: 'Microsoft',
    focus: 'B2B • Systems Thinking',
    description: 'B2B • Systems Thinking',
    seniority: 'mid',
    challengesCount: 10,
    practicingCount: '1.4K',
    progress: 57
  },
  {
    id: 'airbnb',
    title: 'Airbnb',
    focus: 'Marketplace • Experimentation',
    description: 'Marketplace • Experimentation',
    seniority: 'senior',
    challengesCount: 13,
    practicingCount: '980',
    progress: 51
  },
  {
    id: 'stripe',
    title: 'Stripe',
    focus: 'Payments • Platform',
    description: 'Payments • Platform',
    seniority: 'senior',
    challengesCount: 15,
    practicingCount: '1.6K',
    progress: 69
  }
];

export type MockChallenge = {
  id: string;
  title: string;
  status: ChallengeStatus;
  practicingCount: string;
  duration: string;
};

const baseChallenges = [
  { slug: 'north-star-metrics', title: 'North Star Metrics', duration: '12 mins' },
  { slug: 'retention-diagnosis', title: 'Retention Diagnosis', duration: '14 mins' },
  { slug: 'launch-prioritization', title: 'Launch Prioritization', duration: '10 mins' },
  { slug: 'pricing-packaging', title: 'Pricing & Packaging', duration: '16 mins' },
  { slug: 'stakeholder-alignment', title: 'Stakeholder Alignment', duration: '9 mins' },
  { slug: 'tradeoff-evaluation', title: 'Tradeoff Evaluation', duration: '11 mins' }
];

const statusPattern: ChallengeStatus[] = [
  'in-progress',
  'not-solved',
  'solved',
  'not-solved',
  'solved',
  'in-progress'
];

export const getMockChallenges = (companyId: string): MockChallenge[] =>
  baseChallenges.map((challenge, index) => ({
    id: `${companyId}-${challenge.slug}`,
    title: challenge.title,
    status: statusPattern[index % statusPattern.length],
    practicingCount: `${650 + index * 120}`,
    duration: challenge.duration
  }));

export const getMockCompanyById = (id: string) =>
  MOCK_COMPANIES.find((company) => company.id === id) ?? null;
