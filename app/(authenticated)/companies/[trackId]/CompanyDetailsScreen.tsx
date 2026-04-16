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
  Seniority
} from '@/components/seniority/constants';
import MotionPage from '@/components/motion/MotionPage';
import { fadeSlideUp, listVariants, springTransition } from '@/lib/motion';
import { cn } from '@/utils/cn';
import {
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Clock3,
  RotateCcw,
  UserRound
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

export type ChallengeStatus = 'in-progress' | 'not-solved' | 'solved';
export type CompanyChallenge = {
  id: string;
  title: string;
  category: string;
  categorySortOrder: number;
  status: ChallengeStatus;
  practicingCount: string;
  duration: string;
  seniority: Seniority;
  answeredSteps: number;
  completedSteps: number;
  totalSteps: number;
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

const STATUS_LABELS: Record<ChallengeStatus, string> = {
  'in-progress': 'IN PROGRESS',
  'not-solved': 'NOT SOLVED',
  solved: 'SOLVED'
};

export default function CompanyDetailsScreen({
  company,
  challenges,
  progressPercent,
  practicingCount
}: {
  company: { id: string; title: string; description: string | null };
  challenges: CompanyChallenge[];
  progressPercent: number;
  practicingCount: string;
}) {
  const [filter, setFilter] = useState<FilterTab>('all');
  const [selectedSeniority, setSelectedSeniority] =
    useState<Seniority>('junior');
  useEffect(() => {
    const stored = window.localStorage.getItem(SENIORITY_STORAGE_KEY);
    if (stored && SENIORITY_OPTIONS.includes(stored as Seniority)) {
      setSelectedSeniority(stored as Seniority);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(SENIORITY_STORAGE_KEY, selectedSeniority);
  }, [selectedSeniority]);

  const filteredChallenges = useMemo(
    () =>
      challenges
        .filter((challenge) => challenge.seniority === selectedSeniority)
        .filter((challenge) =>
          filter === 'all' ? true : challenge.status === filter
        )
        .sort((a, b) =>
          a.categorySortOrder === b.categorySortOrder
            ? a.title.localeCompare(b.title)
            : a.categorySortOrder - b.categorySortOrder
        ),
    [challenges, filter, selectedSeniority]
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
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="t-title">{company.title}</h1>
        </header>

        <article className="app-card mb-5">
          <h2 className="t-card-title text-[22px]">{company.title}</h2>
          <p className="t-body-muted">
            Focus: {company.description ?? 'Metrics · Product Sense'}
          </p>
          <div className="t-label mt-1 flex items-center gap-3 text-muted">
            <span className="flex items-center gap-1">
              <CircleDot className="h-4 w-4" />
              {challenges.length} Challenges
            </span>
            <span className="flex items-center gap-1">
              <UserRound className="h-4 w-4" />
              {practicingCount} Practicing
            </span>
          </div>
          <div className="mt-3 h-2.5 rounded-pill bg-surface-soft">
            <div
              className="h-full rounded-pill bg-primary"
              style={{
                width: `${Math.max(0, Math.min(100, progressPercent))}%`
              }}
            />
          </div>
        </article>

        <div className="mb-4 flex items-center gap-2">
          <span className="t-card-title">Practice</span>
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
              <span className="relative">{tab.label}</span>
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
                    href={`/challenge/${challenge.id}?company=${company.id}${challenge.reviewAvailable ? '&review=1' : ''}${challenge.retake ? '&retry=1' : ''}`}
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
                            STATUS_STYLES[challenge.status]
                          }`}
                        >
                          {STATUS_LABELS[challenge.status]}
                        </span>
                        {challenge.retake ? (
                          <RotateCcw
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
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    </div>
                    <div className="t-label mt-2 flex items-center gap-3 text-muted">
                      <span className="inline-flex items-center gap-1">
                        <UserRound className="h-3.5 w-3.5" />
                        {challenge.practicingCount} practicing
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-3.5 w-3.5" />
                        {challenge.duration}
                      </span>
                      <span className="inline-flex items-center gap-1">
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
                            width: `${
                              challenge.totalSteps
                                ? (challenge.completedSteps /
                                    challenge.totalSteps) *
                                  100
                                : 0
                            }%`
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
