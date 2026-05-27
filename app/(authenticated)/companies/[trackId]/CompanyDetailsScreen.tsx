'use client';

import SeniorityDropdown from '@/components/seniority/SeniorityDropdown';
import { MotionButton, MotionCard } from '@/components/motion';
import {
  cardInteractive,
  focusRingInteractive,
  iconBtnInteractive,
  tabInteractive
} from '@/components/ui/interactive';
import {
  SENIORITY_OPTIONS,
  SENIORITY_STORAGE_KEY,
  Seniority,
  SeniorityFilter
} from '@/components/seniority/constants';
import MotionPage from '@/components/motion/MotionPage';
import { fadeSlideUp, listVariants, springTransition } from '@/lib/motion';
import { cn } from '@/utils/cn';
import {
  ArrowPathFilledIcon,
  ChevronLeftFilledIcon,
  ChevronRightFilledIcon,
  ClockFilledIcon,
  TrophyFilledIcon,
  UsersFilledIcon
} from '@/components/icons/FilledIcons';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CompanySummary } from '../company-summary';
import CompanySummaryCard from '../CompanySummaryCard';
import { consumeCompanyChallengeListRefresh } from '../challenge-refresh';

export type ChallengeStatus = 'in-progress' | 'not-solved' | 'solved';
export type CompanyChallenge = {
  id: string;
  title: string;
  category: string;
  categorySortOrder: number;
  status: ChallengeStatus;
  attemptId: string | null;
  answeredCount: number;
  isCompleted: boolean;
  solvedBadgeValue: 'IN PROGRESS' | 'NOT SOLVED' | 'SOLVED';
  tabClassification: ChallengeStatus;
  practicingCount: string;
  duration: string;
  seniority: Seniority;
  answeredSteps: number;
  completedSteps: number;
  totalSteps: number;
  progressPercent: number;
  score: number;
  retake: boolean;
  reviewAvailable: boolean;
};
type FilterTab = 'all' | ChallengeStatus;

const FILTERS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'ALL' },
  { key: 'in-progress', label: 'IN-PROGRESS' },
  { key: 'not-solved', label: 'NOT SOLVED' },
  { key: 'solved', label: 'SOLVED' }
];

const STATUS_STYLES: Record<ChallengeStatus, string> = {
  'in-progress': 'bg-amber-100 text-amber-600',
  'not-solved': 'bg-red-100 text-red-600',
  solved: 'bg-green-100 text-green-600'
};

export default function CompanyDetailsScreen({
  companySummary,
  challenges,
  companyId
}: {
  companySummary: CompanySummary;
  companyId: string;
  challenges: CompanyChallenge[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [filter, setFilter] = useState<FilterTab>('all');
  const [selectedSeniority, setSelectedSeniority] =
    useState<SeniorityFilter>('all');

  const refreshChallengeSnapshot = useCallback(() => {
    if (consumeCompanyChallengeListRefresh(companyId)) {
      router.refresh();
    }
  }, [companyId, router]);

  useEffect(() => {
    refreshChallengeSnapshot();
  }, [pathname, refreshChallengeSnapshot]);

  useEffect(() => {
    const handlePageShow = () => refreshChallengeSnapshot();
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [refreshChallengeSnapshot]);

  useEffect(() => {
    const stored = window.localStorage.getItem(SENIORITY_STORAGE_KEY);
    if (stored && SENIORITY_OPTIONS.includes(stored as SeniorityFilter)) {
      setSelectedSeniority(stored as SeniorityFilter);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(SENIORITY_STORAGE_KEY, selectedSeniority);
  }, [selectedSeniority]);

  const levelFilteredChallenges = useMemo(
    () =>
      challenges
        .filter((challenge) =>
          selectedSeniority === 'all'
            ? true
            : challenge.seniority === selectedSeniority
        )
        .sort((a, b) =>
          a.categorySortOrder === b.categorySortOrder
            ? a.title.localeCompare(b.title)
            : a.categorySortOrder - b.categorySortOrder
        ),
    [challenges, selectedSeniority]
  );

  const tabCounts = useMemo(() => {
    const counts: Record<FilterTab, number> = {
      all: levelFilteredChallenges.length,
      'in-progress': 0,
      'not-solved': 0,
      solved: 0
    };

    levelFilteredChallenges.forEach((challenge) => {
      counts[challenge.tabClassification] += 1;
    });

    return counts;
  }, [levelFilteredChallenges]);

  const filteredChallenges = useMemo(
    () =>
      levelFilteredChallenges
        .filter((challenge) =>
          filter === 'all' ? true : challenge.tabClassification === filter
        )
        .sort((a, b) =>
          a.categorySortOrder === b.categorySortOrder
            ? a.title.localeCompare(b.title)
            : a.categorySortOrder - b.categorySortOrder
        ),
    [levelFilteredChallenges, filter]
  );

  return (
    <MotionPage>
      <section>
        <header className="mb-4 flex items-center gap-3">
          <Link
            href="/home"
            className={cn(
              'grid h-9 w-9 place-items-center rounded-button bg-surface-muted text-muted',
              iconBtnInteractive,
              focusRingInteractive
            )}
            aria-label="Back to companies"
          >
            <ChevronLeftFilledIcon className="h-5 w-5" />
          </Link>
          <h1 className="t-title">Home</h1>
        </header>

        <CompanySummaryCard
          company={companySummary}
          className="app-card mb-5"
        />

        <div className="mb-4 flex items-center gap-2">
          <span className="t-card-title">PM interview practice</span>
          <SeniorityDropdown
            selected={selectedSeniority}
            onSelect={setSelectedSeniority}
          />
        </div>

        <div className="app-segment mb-4 grid grid-cols-4 gap-1 text-center">
          {FILTERS.map((tab) => (
            <MotionButton
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                'relative whitespace-nowrap rounded-pill px-1.5 text-[9px] font-black uppercase tracking-[0.06em]',
                filter === tab.key ? 'text-primary' : 'text-muted',
                tabInteractive,
                focusRingInteractive
              )}
              type="button"
            >
              {filter === tab.key ? (
                <motion.span
                  layoutId="tab-indicator"
                  transition={springTransition}
                  className="absolute inset-0 rounded-pill bg-container shadow-button"
                />
              ) : null}
              <span className="relative inline-flex items-center gap-1">
                <span>{tab.label}</span>
                <span
                  className={cn(
                    'rounded-pill px-1.5 py-0.5 text-[8px] font-black leading-none',
                    filter === tab.key
                      ? 'bg-primary/10 text-primary'
                      : 'bg-surface-muted text-muted'
                  )}
                >
                  {tabCounts[tab.key]}
                </span>
              </span>
            </MotionButton>
          ))}
        </div>

        <motion.div
          className="space-y-3 pb-8"
          variants={listVariants}
          initial="initial"
          animate="animate"
        >
          {filteredChallenges.length === 0 ? (
            <p className="app-card t-body-muted">
              No challenges for this level yet.
            </p>
          ) : (
            filteredChallenges.map((challenge) => (
              <motion.div key={challenge.id} variants={fadeSlideUp}>
                <MotionCard>
                  <Link
                    href={`/challenge/${challenge.id}?company=${companyId}${challenge.attemptId ? `&attempt=${challenge.attemptId}` : ''}${challenge.reviewAvailable ? '&review=1' : ''}${challenge.retake ? '&retry=1' : ''}`}
                    onClick={() =>
                      console.log('[proof] challenge card clicked', {
                        challengeId: challenge.id,
                        companyId
                      })
                    }
                    className={cn(
                      'app-card block cursor-pointer',
                      cardInteractive,
                      focusRingInteractive
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.08em] text-primary">
                            {challenge.category}
                          </p>
                          <h3 className="t-card-title">{challenge.title}</h3>
                        </div>
                        <span
                          className={`whitespace-nowrap rounded-pill px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.06em] ${
                            STATUS_STYLES[challenge.tabClassification]
                          }`}
                        >
                          {challenge.solvedBadgeValue}
                        </span>
                        {challenge.retake ? (
                          <ArrowPathFilledIcon
                            className="h-4 w-4 text-amber-500"
                            aria-label="Retake"
                          />
                        ) : null}
                      </div>
                      <span
                        className={cn(
                          'grid h-8 w-8 place-items-center rounded-pill bg-surface-muted text-muted',
                          iconBtnInteractive
                        )}
                      >
                        <ChevronRightFilledIcon className="h-4 w-4" />
                      </span>
                    </div>
                    <div className="t-label mt-2 flex items-center gap-3 text-muted">
                      <span className="inline-flex items-center gap-1">
                        <UsersFilledIcon className="h-3.5 w-3.5" />
                        {challenge.practicingCount} practicing
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ClockFilledIcon className="h-3.5 w-3.5" />
                        {challenge.duration}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <TrophyFilledIcon className="h-3.5 w-3.5" />
                        Score: {challenge.score}%
                      </span>
                    </div>
                    <div className="mt-3">
                      <div className="mb-1 text-[10px] font-black uppercase tracking-[0.08em] text-muted">
                        {challenge.completedSteps}/{challenge.totalSteps} steps
                        answered
                      </div>
                      <div className="h-2 rounded-pill bg-surface-soft">
                        <div
                          className="h-full rounded-pill bg-primary"
                          style={{
                            width: `${challenge.progressPercent}%`
                          }}
                        />
                      </div>
                    </div>
                  </Link>
                </MotionCard>
              </motion.div>
            ))
          )}
        </motion.div>
      </section>
    </MotionPage>
  );
}
