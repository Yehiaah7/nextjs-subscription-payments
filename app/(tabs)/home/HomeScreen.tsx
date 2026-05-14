'use client';

import Link from 'next/link';
import {
  BellFilledIcon,
  CheckCircleFilledIcon,
  ChevronRightFilledIcon,
  FireFilledIcon,
  RocketFilledIcon,
  TrophyFilledIcon,
  UsersFilledIcon
} from '@/components/icons/FilledIcons';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { ReactNode, useEffect, useState } from 'react';
import {
  MotionButton,
  MotionCard
} from '@/components/motion';
import MotionPage from '@/components/motion/MotionPage';
import { getCompanyHref } from '@/app/(authenticated)/companies/navigation';
import {
  btnInteractive,
  btnInteractiveColored,
  btnInteractiveNeutral,
  cardInteractive,
  focusRingInteractive,
  iconBtnInteractive,
  tabInteractive
} from '@/components/ui/interactive';
import {
  SENIORITY_FILTER_LABELS,
  SENIORITY_OPTIONS,
  SENIORITY_STORAGE_KEY,
  Seniority,
  SeniorityFilter
} from '@/components/seniority/constants';
import {
  fadeSlideUp,
  listVariants,
  springTransition
} from '@/lib/motion';
import { cn } from '@/utils/cn';
import type { CompanySummary } from '@/app/(authenticated)/companies/company-summary';
import CompanyThumbnail from '@/app/(authenticated)/companies/CompanyThumbnail';
import UserAvatar from '@/components/ui/UserAvatar';
import { useUserAvatar } from '@/components/ui/UserAvatarContext';

type MainTab = 'companies' | 'skill-paths' | 'products';

export type HomeTrack = {
  companySummary: CompanySummary;
  seniorities: Seniority[];
};

export type SkillPathCategory = {
  id: string;
  key: string;
  title: string;
};

export type SkillPathChallenge = {
  id: string;
  categoryId: string;
  title: string;
  level: Seniority;
  practicingCount: number;
  durationMin: number;
  durationMax: number;
};

type UserStats = {
  rank: string;
  solved: string;
  solvingDays: string;
};

export default function HomeScreen({
  companyTracks,
  skillPathCategories,
  skillPathChallenges,
  userName,
  userFirstName,
  userLastName,
  userAvatarUrl,
  userEmail,
  userStats
}: {
  companyTracks: HomeTrack[];
  skillPathCategories: SkillPathCategory[];
  skillPathChallenges: SkillPathChallenge[];
  userName: string;
  userFirstName?: string | null;
  userLastName?: string | null;
  userAvatarUrl?: string | null;
  userEmail?: string | null;
  userStats: UserStats;
}) {
  const { avatar } = useUserAvatar();
  const [tab, setTab] = useState<MainTab>('companies');
  const [showFreeTrialCard, setShowFreeTrialCard] = useState(true);
  const [selectedSeniority, setSelectedSeniority] =
    useState<SeniorityFilter>('all');
  const defaultSkillCategoryKey =
    skillPathCategories.find((category) => category.key === 'discovery')?.key ??
    skillPathCategories[0]?.key ??
    null;
  const [selectedSkillCategoryKey, setSelectedSkillCategoryKey] = useState<
    string | null
  >(defaultSkillCategoryKey);

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
      <section className="text-text">
        <header className="mb-4 flex items-start justify-between gap-3">
          <h1 className="t-title">Product Gym Floor</h1>
          <Link
            href="/alerts"
            aria-label="Open Notifications"
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-muted hover:text-primary',
              iconBtnInteractive,
              focusRingInteractive
            )}
          >
            <BellFilledIcon className="h-4 w-4" />
          </Link>
        </header>

        {showFreeTrialCard ? (
          <MotionCard
            className={cn(
              'app-card mb-4 border border-primary-soft',
              cardInteractive
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex items-center gap-2">
                <div className="rounded-lg bg-primary-soft p-1.5">
                  <RocketFilledIcon className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="t-label text-primary">Free Trial Active</p>
                  <p className="text-[11px] font-semibold text-muted">
                    7 Days remaining in your Pro trial
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <MotionButton
                  className={cn(
                    'rounded-pill whitespace-nowrap bg-emerald-500 px-2.5 py-1 t-label text-white hover:bg-emerald-600',
                    btnInteractive,
                    btnInteractiveColored,
                    focusRingInteractive
                  )}
                >
                  Upgrade
                </MotionButton>
                <button
                  type="button"
                  onClick={() => setShowFreeTrialCard(false)}
                  aria-label="Dismiss free trial card"
                  className={cn(
                    'inline-flex h-6 w-6 items-center justify-center rounded-full text-muted hover:bg-primary-soft hover:text-primary',
                    iconBtnInteractive,
                    focusRingInteractive
                  )}
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </div>
            </div>
          </MotionCard>
        ) : null}

        <MotionCard
          className={cn('app-card mb-4 border', cardInteractive)}
          style={{
            backgroundColor: '#ffffff',
            borderColor: '#dbeafe'
          }}
        >
          <div className="mb-3 flex items-center gap-3">
            <UserAvatar
              imageUrl={avatar.imageUrl}
              firstName={avatar.firstName ?? userFirstName}
              lastName={avatar.lastName ?? userLastName}
              fullName={avatar.fullName ?? userName}
              email={avatar.email ?? userEmail}
              className="h-11 w-11"
              initialsClassName="text-sm"
            />
            <div>
              <h2 className="text-[16px] font-bold leading-[1.35] text-[#0f172a]">
                {userName}
              </h2>
              <p className="text-[10px] font-black tracking-[0.04em] text-[#2563eb]">
                Product Gym member
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <StatTile
              icon={<TrophyFilledIcon className="h-3.5 w-3.5 text-[#eab308]" />}
              label="Rank"
              value={userStats.rank}
            />
            <StatTile
              icon={<CheckCircleFilledIcon className="h-3.5 w-3.5 text-[#22c55e]" />}
              label="Solved"
              value={userStats.solved}
            />
            <StatTile
              icon={<FireFilledIcon className="h-3.5 w-3.5 text-orange-500" />}
              label="Solving Days"
              value={userStats.solvingDays}
            />
          </div>
        </MotionCard>

        <h3 className="t-card-title mb-3 flex flex-wrap items-center gap-x-1.5 gap-y-1">
          <span>Practice</span>
          <span className="relative inline-flex">
            <select
              value={selectedSeniority}
              onChange={(event) =>
                setSelectedSeniority(event.target.value as SeniorityFilter)
              }
              className={cn(
                'appearance-none rounded-pill bg-primary-soft py-0.5 pl-2 pr-6 text-[14px] font-semibold text-primary',
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
            <ChevronRightFilledIcon className="pointer-events-none absolute right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-primary" />
          </span>
          <span>PM interview questions</span>
        </h3>

        <div className="app-segment mb-4">
          <div className="grid h-full grid-cols-3 gap-1">
            <TabButton
              label="Companies"
              active={tab === 'companies'}
              onClick={() => setTab('companies')}
            />
            <TabButton
              label="Skill Paths"
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

        {tab === 'companies' && (
          <section>
            <motion.div
              className="space-y-4"
              variants={listVariants}
              initial="initial"
              animate="animate"
            >
              {filteredCompanyTracks.length === 0 ? (
                <EmptyState message="No challenges for this level yet." />
              ) : (
                filteredCompanyTracks.map((track) => (
                  <motion.div
                    key={track.companySummary.id}
                    variants={fadeSlideUp}
                  >
                    <CompanyTrackCard
                      track={track}
                      href={getCompanyHref(track.companySummary.id)}
                    />
                  </motion.div>
                ))
              )}
            </motion.div>
          </section>
        )}
        {tab === 'skill-paths' && (
          <div className="space-y-4">
            <EmptyState message="No skill path challenges yet." />
          </div>
        )}
        {tab === 'products' && (
          <div className="space-y-4">
            <EmptyState message="No products yet." />
          </div>
        )}
      </section>
    </MotionPage>
  );
}

function SkillPathChallengeCard({
  challenge
}: {
  challenge: SkillPathChallenge;
}) {
  return (
    <MotionCard
      className={cn(
        'app-card flex cursor-pointer items-center justify-between gap-3 border border-primary-soft p-3',
        cardInteractive
      )}
    >
      <div className="min-w-0 flex-1">
        <h4 className="line-clamp-2 text-[16px] font-bold leading-[1.35] text-[#0f172a]">
          {challenge.title}
        </h4>
        <div className="mt-2 flex items-center gap-3 text-[10px] font-black tracking-[0.04em] text-[#64748b]">
          <span>{challenge.practicingCount} Practicing</span>
          <span>
            {challenge.durationMin}–{challenge.durationMax} mins
          </span>
        </div>
      </div>
      <MotionCard
        className={cn(
          'grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-soft text-primary',
          iconBtnInteractive,
          focusRingInteractive
        )}
      >
        <Link href={`/challenge/${challenge.id}`} aria-label={challenge.title}>
          <ChevronRightFilledIcon className="h-4 w-4" />
        </Link>
      </MotionCard>
    </MotionCard>
  );
}

function StatTile({
  icon,
  label,
  value
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-xl bg-[#eff6ff] px-2 py-2 text-center">
      <div className="mb-1 inline-flex items-center justify-center rounded-full bg-white p-1">
        {icon}
      </div>
      <p className="text-[9px] font-black tracking-[0.04em] text-[#64748b]">
        {label}
      </p>
      <p className="mt-1 text-[20px] font-bold leading-none text-[#0f172a]">
        {value}
      </p>
    </article>
  );
}

function CompanyTrackCard({ track, href }: { track: HomeTrack; href: string }) {
  const boundedProgress = Math.max(
    0,
    Math.min(100, track.companySummary.progress)
  );
  const ctaLabel = boundedProgress === 0 ? 'Start' : 'Continue';

  return (
    <MotionCard>
      <Link href={href} className={cn('block w-full', focusRingInteractive)}>
        <article
          className={cn(
            'app-card cursor-pointer border border-primary-soft',
            cardInteractive
          )}
        >
          <div className="mb-3 flex items-start gap-3">
            <CompanyThumbnail
              companyId={track.companySummary.id}
              companyName={track.companySummary.name}
              companyLogoSrc={track.companySummary.logo}
              className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white"
            />
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-[16px] font-bold text-[#0f172a]">
                {track.companySummary.name}
              </h4>
              <p className="mt-0.5 truncate text-[12px] font-medium text-[#9a7a30]">
                {track.companySummary.focus
                  ? `Focus: ${track.companySummary.focus}`
                  : ''}
              </p>
              <div className="mt-2 flex items-center gap-3 text-[10px] font-bold tracking-[0.04em] text-[#64748b]">
                <span className="inline-flex items-center gap-1 whitespace-nowrap">
                  <TrophyFilledIcon className="h-3.5 w-3.5" />
                  {track.companySummary.challengesCount} Challenges
                </span>
                <span className="inline-flex items-center gap-1 whitespace-nowrap">
                  <UsersFilledIcon className="h-3.5 w-3.5" />
                  {track.companySummary.practicingCount} Practicing
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-pill bg-[#e2e8f0]">
              <div
                className="h-full rounded-pill bg-primary"
                style={{ width: `${boundedProgress}%` }}
              />
            </div>
            <span className="text-[10px] font-black tracking-[0.04em] text-primary">
              {boundedProgress}%
            </span>
            <span className="text-[10px] font-black tracking-[0.04em] text-primary">
              {ctaLabel}
            </span>
            <span
              className="grid h-7 w-7 place-items-center rounded-full bg-primary-soft text-primary"
              aria-label={`${ctaLabel} ${track.companySummary.name}`}
            >
              <ChevronRightFilledIcon className="h-4 w-4" />
            </span>
          </div>
        </article>
      </Link>
    </MotionCard>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="app-card t-body-muted border border-primary-soft">
      {message}
    </div>
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
        'relative h-full rounded-pill px-2 t-label whitespace-nowrap',
        active ? 'text-white' : 'text-muted',
        tabInteractive,
        focusRingInteractive
      )}
    >
      {active ? (
        <motion.span
          layoutId="home-tab-indicator"
          transition={springTransition}
          className="absolute inset-0 rounded-pill bg-primary shadow-button"
        />
      ) : null}
      <span className="relative">{label}</span>
    </button>
  );
}
