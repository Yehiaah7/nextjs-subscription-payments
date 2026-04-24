'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  Flame,
  Rocket,
  Sparkles,
  Trophy,
  UserRound
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import MotionPage from '@/components/motion/MotionPage';
import { MotionButton, MotionCard } from '@/components/motion';
import {
  btnInteractive,
  btnInteractiveColored,
  btnInteractiveNeutral,
  cardInteractive,
  focusRingInteractive,
  tabInteractive
} from '@/components/ui/interactive';
import {
  SENIORITY_FILTER_LABELS,
  SENIORITY_OPTIONS,
  SENIORITY_STORAGE_KEY,
  Seniority,
  SeniorityFilter
} from '@/components/seniority/constants';
import { getCompanyHref } from '@/app/(authenticated)/companies/navigation';
import CompanyThumbnail from '@/app/(authenticated)/companies/CompanyThumbnail';
import { cn } from '@/utils/cn';
import { fadeSlideUp, listVariants, springTransition } from '@/lib/motion';
import type {
  HomeTrack,
  SkillPathCategory,
  SkillPathChallenge
} from '../home/HomeScreen';

type MainTab = 'companies' | 'skill-paths' | 'products';

export default function HomeV2Screen({
  companyTracks,
  skillPathCategories,
  skillPathChallenges,
  userName,
  userStats
}: {
  companyTracks: HomeTrack[];
  skillPathCategories: SkillPathCategory[];
  skillPathChallenges: SkillPathChallenge[];
  userName: string;
  userStats: {
    rank: string;
    solved: string;
    solvingDays: string;
  };
}) {
  const [tab, setTab] = useState<MainTab>('companies');
  const [selectedSeniority, setSelectedSeniority] =
    useState<SeniorityFilter>('all');

  const defaultSkillCategoryKey =
    skillPathCategories.find((category) => category.key === 'discovery')?.key ??
    skillPathCategories[0]?.key ??
    null;
  const [selectedSkillCategoryKey] = useState<string | null>(
    defaultSkillCategoryKey
  );

  const initials = useMemo(
    () =>
      userName
        .split(' ')
        .slice(0, 2)
        .map((name) => name[0]?.toUpperCase())
        .join(''),
    [userName]
  );

  const selectedCategory =
    skillPathCategories.find(
      (category) => category.key === selectedSkillCategoryKey
    ) ?? skillPathCategories[0];
  const selectedCategoryChallenges = selectedCategory
    ? skillPathChallenges.filter(
        (challenge) =>
          challenge.categoryId === selectedCategory.id &&
          (selectedSeniority === 'all' || challenge.level === selectedSeniority)
      )
    : [];

  const filteredCompanyTracks = companyTracks
    .filter((track) =>
      selectedSeniority === 'all'
        ? true
        : track.seniorities.includes(selectedSeniority)
    )
    .filter((track) => track.companySummary.challengesCount > 0)
    .reduce<HomeTrack[]>((acc, track) => {
      if (
        acc.some(
          (existing) => existing.companySummary.id === track.companySummary.id
        )
      ) {
        return acc;
      }

      acc.push(track);
      return acc;
    }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem(SENIORITY_STORAGE_KEY);
    if (stored && SENIORITY_OPTIONS.includes(stored as SeniorityFilter)) {
      setSelectedSeniority(stored as SeniorityFilter);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(SENIORITY_STORAGE_KEY, selectedSeniority);
  }, [selectedSeniority]);

  return (
    <MotionPage>
      <section className="space-y-4 text-slate-900">
        <header className="rounded-3xl border border-slate-200/70 bg-gradient-to-b from-white to-slate-50/70 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Product Gym Floor
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                Welcome back, {userName.split(' ')[0]}
              </h1>
            </div>
            <button
              className={cn(
                'grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm',
                btnInteractive,
                btnInteractiveNeutral,
                focusRingInteractive
              )}
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <article className="rounded-2xl border border-amber-200/70 bg-amber-50/80 p-3">
              <p className="text-xs font-medium text-amber-800">
                Current streak
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-lg font-semibold text-amber-900">
                <Flame className="h-4 w-4 fill-orange-500 text-orange-500" />
                12 days
              </p>
            </article>
            <article className="rounded-2xl border border-blue-200/80 bg-blue-50/80 p-3">
              <p className="text-xs font-medium text-blue-700">Trial status</p>
              <p className="mt-1 text-lg font-semibold text-blue-900">
                7 days left
              </p>
            </article>
          </div>
        </header>

        <MotionCard
          className={cn(
            'rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.08)]',
            cardInteractive
          )}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-sm font-bold text-white">
                {initials || 'PG'}
              </div>
              <div>
                <p className="text-base font-semibold text-slate-900">
                  {userName}
                </p>
                <p className="text-xs font-medium text-slate-500">
                  Product Gym member
                </p>
              </div>
            </div>
            <MotionButton
              className={cn(
                'rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white',
                btnInteractive,
                btnInteractiveColored,
                focusRingInteractive
              )}
            >
              <span className="inline-flex items-center gap-1.5">
                <Rocket className="h-3.5 w-3.5" />
                Upgrade
              </span>
            </MotionButton>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <StatBlock
              icon={<Trophy className="h-3.5 w-3.5 text-amber-500" />}
              label="Rank"
              value={userStats.rank}
            />
            <StatBlock
              icon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
              label="Solved"
              value={userStats.solved}
            />
            <StatBlock
              icon={<Flame className="h-3.5 w-3.5 text-orange-500" />}
              label="Solving days"
              value={userStats.solvingDays}
            />
          </div>
        </MotionCard>

        <section className="rounded-3xl border border-slate-200/80 bg-white p-3 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Practice interview questions
            </h2>
            <div className="relative inline-flex">
              <select
                value={selectedSeniority}
                onChange={(event) =>
                  setSelectedSeniority(event.target.value as SeniorityFilter)
                }
                className={cn(
                  'appearance-none rounded-full border border-blue-100 bg-blue-50 py-1 pl-3 pr-8 text-xs font-semibold text-blue-700',
                  btnInteractive,
                  btnInteractiveNeutral,
                  focusRingInteractive
                )}
                aria-label="Filter interview questions by level"
              >
                {SENIORITY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {SENIORITY_FILTER_LABELS[option]}
                  </option>
                ))}
              </select>
              <ChevronRight className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-blue-600" />
            </div>
          </div>

          <div className="rounded-2xl bg-slate-100/80 p-1">
            <div className="grid grid-cols-3 gap-1">
              <TabButton
                label="Companies"
                active={tab === 'companies'}
                onClick={() => setTab('companies')}
              />
              <TabButton
                label="Skill paths"
                active={tab === 'skill-paths'}
                onClick={() => setTab('skill-paths')}
              />
              <TabButton
                label="Products"
                active={tab === 'products'}
                onClick={() => setTab('products')}
              />
            </div>
          </div>
        </section>

        {tab === 'companies' ? (
          <motion.div
            className="space-y-3"
            variants={listVariants}
            initial="initial"
            animate="animate"
          >
            {filteredCompanyTracks.length === 0 ? (
              <Empty message="No challenges for this level yet." />
            ) : (
              filteredCompanyTracks.map((track) => (
                <motion.div
                  key={track.companySummary.id}
                  variants={fadeSlideUp}
                >
                  <CompanyCardV2
                    track={track}
                    href={getCompanyHref(track.companySummary.id)}
                  />
                </motion.div>
              ))
            )}
          </motion.div>
        ) : null}

        {tab === 'skill-paths' ? (
          <div className="space-y-3">
            {selectedCategoryChallenges.length > 0 ? (
              selectedCategoryChallenges.map((challenge) => (
                <Empty key={challenge.id} message={challenge.title} />
              ))
            ) : (
              <Empty message="No skill path challenges yet." />
            )}
          </div>
        ) : null}

        {tab === 'products' ? <Empty message="No products yet." /> : null}

        <div className="rounded-3xl border border-violet-200/80 bg-violet-50/60 p-3">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700">
            <Sparkles className="h-3.5 w-3.5" />
            Fresh UI preview
          </p>
          <p className="mt-1 text-xs text-violet-900/80">
            This /v2 page is a visual refresh while keeping your current Home
            route intact.
          </p>
        </div>
      </section>
    </MotionPage>
  );
}

function CompanyCardV2({ track, href }: { track: HomeTrack; href: string }) {
  const boundedProgress = Math.max(
    0,
    Math.min(100, track.companySummary.progress)
  );

  return (
    <Link href={href} className={cn('block', focusRingInteractive)}>
      <article
        className={cn(
          'rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)]',
          cardInteractive
        )}
      >
        <div className="mb-3 flex items-start gap-3">
          <CompanyThumbnail
            companyId={track.companySummary.id}
            companyName={track.companySummary.name}
            companyLogoSrc={track.companySummary.logo}
            className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-white"
          />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[15px] font-semibold text-slate-900">
              {track.companySummary.name}
            </h3>
            <p className="mt-1 truncate text-xs text-slate-500">
              {track.companySummary.focus
                ? `Focus: ${track.companySummary.focus}`
                : ''}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {track.companySummary.challengesCount} Challenges
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5">
                <UserRound className="h-3.5 w-3.5" />
                {track.companySummary.practicingCount} Practicing
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-2 flex-1 rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-[width] duration-300"
              style={{ width: `${boundedProgress}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-blue-700">
            {boundedProgress}%
          </span>
          <span className="grid h-8 w-8 place-items-center rounded-full border border-blue-100 bg-blue-50 text-blue-700">
            <ChevronRight className="h-4 w-4" />
          </span>
        </div>
      </article>
    </Link>
  );
}

function TabButton({
  label,
  active,
  onClick
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative rounded-2xl px-2 py-2 text-xs font-semibold',
        active ? 'text-slate-900' : 'text-slate-500',
        tabInteractive,
        focusRingInteractive
      )}
    >
      {active ? (
        <motion.span
          layoutId="home-v2-tab"
          transition={springTransition}
          className="absolute inset-0 rounded-2xl bg-white shadow-sm"
        />
      ) : null}
      <span className="relative">{label}</span>
    </button>
  );
}

function Empty({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-3 text-sm text-slate-500">
      {message}
    </div>
  );
}

function StatBlock({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-center">
      <div className="mb-1 inline-flex items-center justify-center rounded-full bg-white p-1">
        {icon}
      </div>
      <p className="text-[10px] font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold leading-none text-slate-900">
        {value}
      </p>
    </article>
  );
}
