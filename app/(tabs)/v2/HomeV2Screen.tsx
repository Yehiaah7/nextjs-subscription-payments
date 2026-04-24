'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  Crown,
  Flame,
  Layers3,
  Rocket,
  Sparkles,
  Trophy,
  UserRound
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import MotionPage from '@/components/motion/MotionPage';
import { MotionButton } from '@/components/motion';
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

  const firstName = userName.split(' ')[0] ?? 'there';
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
        <div className="inline-flex w-fit items-center rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-700">
          V2 Preview
        </div>
        <header className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-white shadow-[0_20px_52px_rgba(15,23,42,0.12)]">
          <div className="relative border-b border-slate-200/80 bg-[radial-gradient(circle_at_top_right,_#e0ecff_0,_#f8fbff_45%,_white_100%)] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Product Gym Floor
                </p>
                <h1 className="mt-2 text-[28px] font-semibold leading-tight tracking-tight text-slate-900">
                  Home
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <TopActionButton
                  icon={<Bell className="h-4 w-4" />}
                  label="Alerts"
                />
                <TopActionButton
                  icon={<Sparkles className="h-4 w-4" />}
                  label="Updates"
                />
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Good evening, {firstName}. You&apos;re in a strong weekly rhythm.
            </p>
          </div>

          <div className="grid gap-3 p-3.5 md:grid-cols-12">
            <article className="rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.32)] md:col-span-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/75">
                Streak
              </p>
              <div className="mt-3 flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/18 backdrop-blur-sm">
                  <Flame className="h-5 w-5 fill-orange-300 text-orange-200" />
                </span>
                <div>
                  <p className="text-2xl font-semibold leading-none">12 days</p>
                  <p className="mt-1 text-xs text-white/80">
                    Keep your momentum with one completed module today.
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200/80 bg-slate-950 p-4 text-white shadow-[0_12px_28px_rgba(15,23,42,0.32)] md:col-span-7">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Pro trial
                  </p>
                  <p className="mt-1 text-lg font-semibold">7 days remaining</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-semibold">
                  <Crown className="h-3.5 w-3.5 text-amber-300" />
                  Trial active
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-300">
                Unlock all company assignments and keep your interview pace on
                track.
              </p>
              <div className="mt-3 rounded-2xl border border-white/15 bg-white/5 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-300">
                  Today&apos;s goal
                </p>
                <p className="mt-1 text-sm font-medium">Finish 2 modules</p>
              </div>
              <MotionButton
                className={cn(
                  'mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-3 py-2.5 text-sm font-semibold text-slate-900',
                  btnInteractive,
                  btnInteractiveColored,
                  focusRingInteractive
                )}
              >
                <Rocket className="h-4 w-4" />
                Upgrade to Pro
              </MotionButton>
            </article>
          </div>
        </header>

        <section className="rounded-[30px] border border-slate-200/70 bg-white p-4 shadow-[0_16px_38px_rgba(15,23,42,0.08)]">
          <div className="grid gap-4 lg:grid-cols-[1.25fr_2fr]">
            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-3.5">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-900 text-sm font-bold text-white">
                  {initials || 'PG'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {userName}
                  </p>
                  <p className="text-xs text-slate-500">
                    Product Gym member overview
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-2xl border border-amber-200/70 bg-amber-50 px-3 py-2">
                <p className="text-xs font-medium text-amber-900">
                  Current plan
                </p>
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-amber-800">
                  <Crown className="h-3.5 w-3.5" />
                  Trial
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-0.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Performance snapshot
                </p>
                <span className="text-xs font-medium text-slate-500">
                  Updated today
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <StatPill
                  icon={<Trophy className="h-3.5 w-3.5 text-violet-600" />}
                  label="Current rank"
                  value={userStats.rank}
                />
                <StatPill
                  icon={
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  }
                  label="Questions solved"
                  value={userStats.solved}
                />
                <StatPill
                  icon={<Flame className="h-3.5 w-3.5 text-orange-600" />}
                  label="Solving days"
                  value={userStats.solvingDays}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3 rounded-[28px] border border-slate-200/70 bg-white p-3.5 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                Discover
              </p>
              <h2 className="text-base font-semibold text-slate-900">
                Practice interview questions
              </h2>
            </div>
            <div className="relative inline-flex">
              <select
                value={selectedSeniority}
                onChange={(event) =>
                  setSelectedSeniority(event.target.value as SeniorityFilter)
                }
                className={cn(
                  'appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2 pl-3 pr-8 text-xs font-semibold text-slate-700',
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
              <ChevronRight className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-slate-500" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1 rounded-2xl bg-slate-100 p-1">
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
            <div className="space-y-2">
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
        </section>

        <div className="rounded-2xl border border-violet-200/80 bg-violet-50/60 p-3">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700">
            <Layers3 className="h-3.5 w-3.5" />
            Fresh UI preview
          </p>
          <p className="mt-1 text-xs text-violet-900/80">
            This /v2 page is a redesigned composition while keeping your current
            Home route and underlying data intact.
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
          'overflow-hidden rounded-3xl border border-slate-200 bg-white',
          cardInteractive
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-3 py-2.5">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            Company track
          </span>
          <span className="text-xs font-semibold text-blue-700">
            {boundedProgress}% complete
          </span>
        </div>

        <div className="space-y-3 p-3.5">
          <div className="flex items-start gap-3">
            <CompanyThumbnail
              companyId={track.companySummary.id}
              companyName={track.companySummary.name}
              companyLogoSrc={track.companySummary.logo}
              className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white"
            />
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-[15px] font-semibold text-slate-900">
                {track.companySummary.name}
              </h3>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {track.companySummary.focus
                  ? `Focus: ${track.companySummary.focus}`
                  : 'Interview preparation track'}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-700">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  {track.companySummary.challengesCount} challenges
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-700">
                  <UserRound className="h-3.5 w-3.5 text-blue-600" />
                  {track.companySummary.practicingCount} practicing
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="h-2.5 rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 transition-[width] duration-300"
                style={{ width: `${boundedProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Continue where you left off
              </p>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                Resume
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

function TopActionButton({
  icon,
  label
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      className={cn(
        'grid h-10 w-10 place-items-center rounded-xl border border-slate-200/80 bg-white text-slate-600 shadow-[0_4px_14px_rgba(15,23,42,0.08)]',
        btnInteractive,
        btnInteractiveNeutral,
        focusRingInteractive
      )}
      aria-label={label}
    >
      {icon}
    </button>
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
        'relative rounded-xl px-2 py-2 text-xs font-semibold',
        active ? 'text-slate-900' : 'text-slate-500',
        tabInteractive,
        focusRingInteractive
      )}
    >
      {active ? (
        <motion.span
          layoutId="home-v2-tab"
          transition={springTransition}
          className="absolute inset-0 rounded-xl bg-white shadow-sm"
        />
      ) : null}
      <span className="relative">{label}</span>
    </button>
  );
}

function Empty({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
      {message}
    </div>
  );
}

function StatPill({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60 p-3 shadow-[0_6px_18px_rgba(15,23,42,0.07)]">
      <div className="mb-2 inline-flex rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
        {icon}
      </div>
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold leading-none text-slate-900">
        {value}
      </p>
    </article>
  );
}
