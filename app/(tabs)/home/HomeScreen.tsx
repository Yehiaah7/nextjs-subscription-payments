'use client';

import Link from 'next/link';
import {
  BellFilledIcon,
  CheckCircleFilledIcon,
  ChevronRightFilledIcon,
  FireFilledIcon,
  HomeFilledIcon,
  RocketFilledIcon,
  TrophyFilledIcon,
  UsersFilledIcon
} from '@/components/icons/FilledIcons';
import {
  Clock3,
  Crosshair,
  HelpCircle,
  LogOut,
  Package,
  Settings,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ReactNode, useEffect, useState } from 'react';
import { MotionButton, MotionCard } from '@/components/motion';
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
import { fadeSlideUp, listVariants, springTransition } from '@/lib/motion';
import { cn } from '@/utils/cn';
import { getProTrialRemainingCopy } from '@/lib/trial';
import type { CompanySummary } from '@/app/(authenticated)/companies/company-summary';
import CompanyThumbnail from '@/app/(authenticated)/companies/CompanyThumbnail';
import UserAvatar from '@/components/ui/UserAvatar';
import { useUserAvatar } from '@/components/ui/UserAvatarContext';
import NotificationsBellButton from '@/components/notifications/NotificationsBellButton';
import { useNotifications } from '@/components/notifications/NotificationsProvider';
import { ensureCompanyProgressReminder } from '@/lib/notifications/store';
import UserStatTile from '@/components/ui/UserStatTile';
import type { UserProfileStats } from '@/types/user-profile-stats';
import ProGymPassCard from '@/components/ProGymPassCard';
import { useLemonSqueezyUpgrade } from '@/components/useLemonSqueezyUpgrade';
import CompanyDetailsScreen, {
  type CompanyChallenge
} from '@/app/(authenticated)/companies/[trackId]/CompanyDetailsScreen';

type MainTab = 'companies' | 'skill-paths' | 'products';
type DesktopSection = 'home' | 'notifications' | 'leaderboard';

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

export default function HomeScreen({
  companyTracks,
  skillPathCategories,
  skillPathChallenges,
  userId,
  userName,
  userFirstName,
  userLastName,
  userAvatarUrl,
  userEmail,
  userStats,
  challengesByCompany
}: {
  companyTracks: HomeTrack[];
  skillPathCategories: SkillPathCategory[];
  skillPathChallenges: SkillPathChallenge[];
  userId: string;
  userName: string;
  userFirstName?: string | null;
  userLastName?: string | null;
  userAvatarUrl?: string | null;
  userEmail?: string | null;
  userStats: UserProfileStats;
  challengesByCompany: Record<string, CompanyChallenge[]>;
}) {
  const { avatar } = useUserAvatar();
  const { refreshNotifications } = useNotifications();
  const [tab, setTab] = useState<MainTab>('companies');
  const [selectedDesktopSection, setSelectedDesktopSection] =
    useState<DesktopSection>('home');
  const [selectedContentTab, setSelectedContentTab] =
    useState<MainTab>('companies');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    null
  );
  const [selectedSkillPathId, setSelectedSkillPathId] = useState<string | null>(
    null
  );
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
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
  const trialDaysLeft = 7;
  const freeTrialCopy = getProTrialRemainingCopy(trialDaysLeft);

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

  const selectedCompanyTrack = selectedCompanyId
    ? (filteredCompanyTracks.find(
        (track) => track.companySummary.id === selectedCompanyId
      ) ?? null)
    : null;

  useEffect(() => {
    ensureCompanyProgressReminder({
      userId,
      companies: companyTracks.map((track) => ({
        companyId: track.companySummary.id,
        companyName: track.companySummary.name,
        progress: track.companySummary.progress,
        totalChallenges: track.companySummary.challengesCount
      }))
    });
    refreshNotifications();
  }, [companyTracks, refreshNotifications, userId]);

  return (
    <MotionPage>
      <section className="text-text lg:hidden">
        <header className="mb-4 flex items-start justify-between gap-3">
          <h1 className="t-title">Product Gym Floor</h1>
          <NotificationsBellButton />
        </header>

        {showFreeTrialCard ? (
          <MotionCard
            className={cn(
              'mb-4 rounded-[16px] bg-productGym-yellow p-3 text-productGym-ink shadow-sm shadow-black/5',
              cardInteractive
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex items-center gap-2">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-productGym-ink shadow-sm shadow-black/10">
                  <RocketFilledIcon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="t-label text-productGym-ink">
                    Free Trial Active
                  </p>
                  <p className="text-[11px] font-semibold text-productGym-ink/75">
                    {freeTrialCopy}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <MotionButton
                  className={cn(
                    btnInteractive,
                    'rounded-full bg-productGym-ink px-3 py-1 text-[10px] font-black uppercase tracking-[1px] text-white shadow-sm shadow-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 focus-visible:ring-offset-productGym-yellow'
                  )}
                >
                  Upgrade
                </MotionButton>
                <button
                  type="button"
                  onClick={() => setShowFreeTrialCard(false)}
                  aria-label="Dismiss free trial card"
                  className={cn(
                    iconBtnInteractive,
                    'inline-flex h-6 w-6 items-center justify-center rounded-full text-productGym-ink/75 hover:bg-white/45 hover:text-productGym-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/25 focus-visible:ring-offset-2 focus-visible:ring-offset-productGym-yellow'
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
              imageUrl={avatar.imageUrl ?? userAvatarUrl}
              firstName={avatar.firstName ?? userFirstName}
              lastName={avatar.lastName ?? userLastName}
              fullName={avatar.fullName ?? userName}
              email={avatar.email ?? userEmail}
              className="h-11 w-11"
              initialsClassName="text-sm"
            />
            <div>
              <h2 className="text-[16px] font-bold leading-[1.35] text-[var(--color-ink)]">
                {userName}
              </h2>
              <p className="text-[10px] font-black tracking-[0.04em] text-primary">
                Product Gym member
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <UserStatTile
              icon={<TrophyFilledIcon className="h-3.5 w-3.5 text-[#eab308]" />}
              label="Rank"
              stat={userStats.rank}
            />
            <UserStatTile
              icon={
                <CheckCircleFilledIcon className="h-3.5 w-3.5 text-[#22c55e]" />
              }
              label="Solved"
              stat={userStats.solved}
            />
            <UserStatTile
              icon={
                <FireFilledIcon className="h-3.5 w-3.5 text-productGym-pink" />
              }
              label="Solving Days"
              stat={userStats.solvingDays}
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

      <DesktopHomeLayout
        selectedDesktopSection={selectedDesktopSection}
        onSelectDesktopSection={setSelectedDesktopSection}
        selectedContentTab={selectedContentTab}
        onSelectContentTab={(nextTab) => {
          setSelectedContentTab(nextTab);
          setSelectedCompanyId(null);
          setSelectedSkillPathId(null);
          setSelectedProductId(null);
        }}
        selectedCompanyId={selectedCompanyId}
        onSelectCompany={(companyId) => {
          setSelectedCompanyId(companyId);
          setSelectedSkillPathId(null);
          setSelectedProductId(null);
        }}
        onSelectSkillPath={(skillPathId) => {
          setSelectedSkillPathId(skillPathId);
          setSelectedCompanyId(null);
          setSelectedProductId(null);
        }}
        onSelectProduct={(productId) => {
          setSelectedProductId(productId);
          setSelectedCompanyId(null);
          setSelectedSkillPathId(null);
        }}
        selectedSkillPathId={selectedSkillPathId}
        selectedProductId={selectedProductId}
        filteredCompanyTracks={filteredCompanyTracks}
        selectedCompanyTrack={selectedCompanyTrack}
        skillPathCategories={skillPathCategories}
        challengesByCompany={challengesByCompany}
        userName={userName}
        userFirstName={userFirstName}
        userLastName={userLastName}
        userEmail={userEmail}
        userStats={userStats}
        userAvatarUrl={userAvatarUrl}
        avatar={avatar}
      />
    </MotionPage>
  );
}

function DesktopHomeLayout({
  selectedDesktopSection,
  onSelectDesktopSection,
  selectedContentTab,
  onSelectContentTab,
  selectedCompanyId,
  onSelectCompany,
  onSelectSkillPath,
  onSelectProduct,
  selectedSkillPathId,
  selectedProductId,
  filteredCompanyTracks,
  selectedCompanyTrack,
  skillPathCategories,
  challengesByCompany,
  userName,
  userFirstName,
  userLastName,
  userEmail,
  userStats,
  userAvatarUrl,
  avatar
}: {
  selectedDesktopSection: DesktopSection;
  onSelectDesktopSection: (section: DesktopSection) => void;
  selectedContentTab: MainTab;
  onSelectContentTab: (tab: MainTab) => void;
  selectedCompanyId: string | null;
  onSelectCompany: (companyId: string) => void;
  onSelectSkillPath: (skillPathId: string) => void;
  onSelectProduct: (productId: string) => void;
  selectedSkillPathId: string | null;
  selectedProductId: string | null;
  filteredCompanyTracks: HomeTrack[];
  selectedCompanyTrack: HomeTrack | null;
  skillPathCategories: SkillPathCategory[];
  challengesByCompany: Record<string, CompanyChallenge[]>;
  userName: string;
  userFirstName?: string | null;
  userLastName?: string | null;
  userEmail?: string | null;
  userStats: UserProfileStats;
  userAvatarUrl?: string | null;
  avatar: {
    imageUrl?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    fullName?: string | null;
    email?: string | null;
  };
}) {
  const selectedCompanyChallenges = selectedCompanyId
    ? (challengesByCompany[selectedCompanyId] ?? [])
    : [];
  const { handleUpgrade, isUpgrading } = useLemonSqueezyUpgrade();

  return (
    <div className="hidden h-screen overflow-hidden bg-[#f6f8fb] text-text lg:flex lg:flex-col">
      <DesktopTopNavbar onUpgrade={handleUpgrade} isUpgrading={isUpgrading} />
      <section className="grid min-h-0 flex-1 grid-cols-[88px_minmax(260px,300px)_minmax(0,1fr)_300px] overflow-hidden xl:grid-cols-[88px_320px_minmax(0,1fr)_360px]">
        <aside className="relative z-30 flex min-h-0 flex-col items-center justify-between border-r border-primary-soft bg-white px-3 py-5">
          <nav
            className="flex w-full flex-col gap-2"
            aria-label="Desktop primary"
          >
            <DesktopNavButton
              icon={<HomeFilledIcon className="h-5 w-5" />}
              label="Home"
              active={selectedDesktopSection === 'home'}
              onClick={() => onSelectDesktopSection('home')}
            />
            <DesktopNavButton
              icon={<BellFilledIcon className="h-5 w-5" />}
              label="Notifications"
              active={selectedDesktopSection === 'notifications'}
              onClick={() => onSelectDesktopSection('notifications')}
            />
            <DesktopNavButton
              icon={<TrophyFilledIcon className="h-5 w-5" />}
              label="Leaderboard"
              active={selectedDesktopSection === 'leaderboard'}
              onClick={() => onSelectDesktopSection('leaderboard')}
            />
          </nav>

          <div className="group relative flex w-full justify-center">
            <button
              type="button"
              className={cn(
                'rounded-full p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                iconBtnInteractive
              )}
              aria-label="Open profile menu"
              aria-haspopup="menu"
            >
              <UserAvatar
                imageUrl={avatar.imageUrl ?? userAvatarUrl}
                firstName={avatar.firstName ?? userFirstName}
                lastName={avatar.lastName ?? userLastName}
                fullName={avatar.fullName ?? userName}
                email={avatar.email ?? userEmail}
                className="h-14 w-14 shadow-sm shadow-black/15"
                initialsClassName="text-base"
              />
            </button>
            <div
              className="invisible fixed bottom-5 left-[80px] z-[100] w-44 translate-x-1 rounded-[18px] border border-primary-soft bg-white p-2 opacity-0 shadow-2xl shadow-slate-900/20 transition group-hover:visible group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-x-0 group-focus-within:opacity-100"
              role="menu"
            >
              <Link
                href="/profile/settings"
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-[var(--color-ink)] hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                role="menuitem"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <Link
                href="/logout"
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-[var(--color-ink)] hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                role="menuitem"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Link>
            </div>
          </div>
        </aside>

        <aside className="flex min-h-0 flex-col overflow-hidden border-r border-primary-soft bg-white/85 px-5 py-6">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-primary">
            Browse
          </p>
          <h1 className="mt-1 text-[22px] font-black tracking-[-0.04em] text-[var(--color-ink)]">
            Product Gym
          </h1>

          <div className="app-segment mt-5">
            <div className="grid h-full grid-cols-3 gap-1">
              <TabButton
                label="Companies"
                active={selectedContentTab === 'companies'}
                onClick={() => onSelectContentTab('companies')}
              />
              <TabButton
                label="Skill Path"
                active={selectedContentTab === 'skill-paths'}
                onClick={() => onSelectContentTab('skill-paths')}
              />
              <TabButton
                label="Products"
                active={selectedContentTab === 'products'}
                onClick={() => onSelectContentTab('products')}
              />
            </div>
          </div>

          <div className="mt-5 min-h-0 flex-1 space-y-3 overflow-y-auto pb-4 pr-1">
            {selectedContentTab === 'companies' ? (
              filteredCompanyTracks.length === 0 ? (
                <EmptyState message="No challenges for this level yet." />
              ) : (
                filteredCompanyTracks.map((track) => (
                  <DesktopCompanyBrowseCard
                    key={track.companySummary.id}
                    track={track}
                    active={selectedCompanyId === track.companySummary.id}
                    onClick={() => onSelectCompany(track.companySummary.id)}
                  />
                ))
              )
            ) : null}

            {selectedContentTab === 'skill-paths' ? (
              skillPathCategories.length ? (
                skillPathCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => onSelectSkillPath(category.id)}
                    className={cn(
                      'app-card w-full border text-left',
                      selectedSkillPathId === category.id
                        ? 'border-primary bg-primary-soft'
                        : 'border-primary-soft bg-white',
                      cardInteractive,
                      focusRingInteractive
                    )}
                  >
                    <p className="t-card-title">{category.title}</p>
                    <p className="t-body-muted mt-1">Skill path challenges</p>
                  </button>
                ))
              ) : (
                <EmptyState message="Skill paths are coming soon." />
              )
            ) : null}

            {selectedContentTab === 'products' ? (
              <button
                type="button"
                onClick={() => onSelectProduct('product-practice')}
                className={cn(
                  'app-card w-full border text-left',
                  selectedProductId === 'product-practice'
                    ? 'border-primary bg-primary-soft'
                    : 'border-primary-soft bg-white',
                  cardInteractive,
                  focusRingInteractive
                )}
              >
                <p className="t-card-title">Product practice</p>
                <p className="t-body-muted mt-1">
                  Product tracks are coming soon.
                </p>
              </button>
            ) : null}
          </div>
        </aside>

        <main className="min-h-0 min-w-0 overflow-y-auto px-6 py-6">
          {selectedDesktopSection === 'home' ? (
            selectedCompanyTrack ? (
              <CompanyDetailsScreen
                companySummary={selectedCompanyTrack.companySummary}
                companyId={selectedCompanyTrack.companySummary.id}
                challenges={selectedCompanyChallenges}
                displayMode="embedded"
              />
            ) : selectedSkillPathId || selectedProductId ? (
              <DesktopEmptyState
                title="Coming soon"
                message="This practice area is being prepared for Product Gym members."
              />
            ) : (
              <DesktopEmptyState message="Choose a company, skill path, or product to start elevating your PM skills." />
            )
          ) : (
            <DesktopEmptyState
              title={
                selectedDesktopSection === 'notifications'
                  ? 'Notifications'
                  : 'Leaderboard'
              }
              message="This desktop view is coming soon. Head back home to keep practicing."
            />
          )}
        </main>

        <aside className="min-h-0 overflow-y-auto border-l border-primary-soft bg-white/70 px-5 py-6">
          <div className="space-y-4">
            <UserStatsProfileCard
              userName={userName}
              userFirstName={userFirstName}
              userLastName={userLastName}
              userEmail={userEmail}
              userStats={userStats}
              userAvatarUrl={userAvatarUrl}
              avatar={avatar}
            />
            <ProGymPassCard />
          </div>
        </aside>
      </section>
    </div>
  );
}

function DesktopTopNavbar({
  onUpgrade,
  isUpgrading
}: {
  onUpgrade: () => void;
  isUpgrading: boolean;
}) {
  return (
    <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-primary-soft bg-white px-6">
      <div className="flex items-center gap-3" aria-label="Product Gym">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-[15px] font-black tracking-[-0.04em] text-white shadow-sm shadow-primary/20">
          PG
        </div>
        <div>
          <p className="text-[18px] font-black tracking-[-0.04em] text-[var(--color-ink)]">
            Product Gym
          </p>
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-primary">
            PM practice floor
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <MotionButton
          type="button"
          onClick={onUpgrade}
          disabled={isUpgrading}
          className={cn(
            'inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-[12px] font-black uppercase tracking-[0.08em] text-white shadow-sm shadow-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70',
            btnInteractive,
            btnInteractiveColored
          )}
        >
          {isUpgrading ? 'Opening…' : 'Upgrade'}
        </MotionButton>
        <MotionButton
          type="button"
          title="Feedback flow coming soon"
          className={cn(
            'inline-flex h-10 items-center justify-center rounded-full border border-primary-soft bg-white px-5 text-[12px] font-black uppercase tracking-[0.08em] text-[var(--color-ink)] shadow-sm shadow-slate-900/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            btnInteractive,
            btnInteractiveNeutral
          )}
        >
          Send feedback
        </MotionButton>
      </div>
    </header>
  );
}

function DesktopNavButton({
  icon,
  label,
  active,
  onClick
}: {
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'flex flex-col items-center gap-1 rounded-2xl px-2 py-3 text-[10px] font-black uppercase tracking-[0.04em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        active
          ? 'bg-primary-soft text-primary'
          : 'text-muted hover:bg-surface-soft',
        btnInteractive
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function DesktopCompanyBrowseCard({
  track,
  active,
  onClick
}: {
  track: HomeTrack;
  active: boolean;
  onClick: () => void;
}) {
  const boundedProgress = Math.max(
    0,
    Math.min(100, track.companySummary.progress)
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full rounded-[18px] border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        active
          ? 'border-primary bg-primary-soft shadow-sm shadow-primary/10'
          : 'border-primary-soft bg-white hover:border-primary/40 hover:bg-surface-soft',
        cardInteractive
      )}
    >
      <div className="flex items-center gap-3">
        <CompanyThumbnail
          companyId={track.companySummary.id}
          companyName={track.companySummary.name}
          companyLogoSrc={track.companySummary.logo}
          className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-white"
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-black text-[var(--color-ink)]">
            {track.companySummary.name}
          </h3>
          <p className="truncate text-[11px] font-semibold text-[#9a7a30]">
            {track.companySummary.focus
              ? `Focus: ${track.companySummary.focus}`
              : 'PM practice'}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold tracking-[0.04em] text-[#5D6B74]">
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
      <div className="mt-3 flex items-center gap-2">
        <div className="h-1.5 flex-1 rounded-pill bg-[var(--color-border)]">
          <div
            className="h-full rounded-pill bg-primary"
            style={{ width: `${boundedProgress}%` }}
          />
        </div>
        <span className="text-[10px] font-black text-primary">
          {boundedProgress}%
        </span>
      </div>
    </button>
  );
}

function UserStatsProfileCard({
  userName,
  userFirstName,
  userLastName,
  userEmail,
  userStats,
  userAvatarUrl,
  avatar
}: {
  userName: string;
  userFirstName?: string | null;
  userLastName?: string | null;
  userEmail?: string | null;
  userStats: UserProfileStats;
  userAvatarUrl?: string | null;
  avatar: {
    imageUrl?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    fullName?: string | null;
    email?: string | null;
  };
}) {
  return (
    <MotionCard
      className={cn('app-card border', cardInteractive)}
      style={{ backgroundColor: '#ffffff', borderColor: '#dbeafe' }}
    >
      <div className="mb-3 flex items-center gap-3">
        <UserAvatar
          imageUrl={avatar.imageUrl ?? userAvatarUrl}
          firstName={avatar.firstName ?? userFirstName}
          lastName={avatar.lastName ?? userLastName}
          fullName={avatar.fullName ?? userName}
          email={avatar.email ?? userEmail}
          className="h-11 w-11"
          initialsClassName="text-sm"
        />
        <div>
          <h2 className="text-[16px] font-bold leading-[1.35] text-[var(--color-ink)]">
            {userName}
          </h2>
          <p className="text-[10px] font-black tracking-[0.04em] text-primary">
            Product Gym member
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <UserStatTile
          icon={<TrophyFilledIcon className="h-3.5 w-3.5 text-[#eab308]" />}
          label="Rank"
          stat={userStats.rank}
        />
        <UserStatTile
          icon={
            <CheckCircleFilledIcon className="h-3.5 w-3.5 text-[#22c55e]" />
          }
          label="Solved"
          stat={userStats.solved}
        />
        <UserStatTile
          icon={<FireFilledIcon className="h-3.5 w-3.5 text-productGym-pink" />}
          label="Solving Days"
          stat={userStats.solvingDays}
        />
        <UserStatTile
          icon={<HelpCircle className="h-3.5 w-3.5 text-sky-500" />}
          label="Questions Solved"
          stat={userStats.questionsSolved}
          showInfoIcon={false}
        />
        <UserStatTile
          icon={<Crosshair className="h-3.5 w-3.5 text-violet-500" />}
          label="Accuracy"
          stat={userStats.firstTryAccuracy}
          showInfoIcon={false}
        />
        <UserStatTile
          icon={<Clock3 className="h-3.5 w-3.5 text-indigo-500" />}
          label="Practice Time"
          stat={userStats.practiceTime}
          showInfoIcon={false}
        />
      </div>
    </MotionCard>
  );
}

function DesktopEmptyState({
  title = 'Ready when you are',
  message
}: {
  title?: string;
  message: string;
}) {
  return (
    <div className="flex min-h-[calc(100dvh-48px)] items-center justify-center">
      <div className="max-w-md rounded-[28px] border border-primary-soft bg-white p-8 text-center shadow-sm shadow-slate-900/5">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary">
          <Package className="h-7 w-7" />
        </div>
        <h2 className="mt-5 text-[24px] font-black tracking-[-0.04em] text-[var(--color-ink)]">
          {title}
        </h2>
        <p className="mt-2 text-[15px] font-medium leading-6 text-muted">
          {message}
        </p>
      </div>
    </div>
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
        <h4 className="line-clamp-2 text-[16px] font-bold leading-[1.35] text-[var(--color-ink)]">
          {challenge.title}
        </h4>
        <div className="mt-2 flex items-center gap-3 text-[10px] font-black tracking-[0.04em] text-[#5D6B74]">
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

function CompanyTrackCard({ track, href }: { track: HomeTrack; href: string }) {
  const boundedProgress = Math.max(
    0,
    Math.min(100, track.companySummary.progress)
  );
  const ctaLabel = boundedProgress === 0 ? 'Start' : 'Continue';

  return (
    <MotionCard>
      <Link
        href={href}
        onClick={() =>
          console.log('[proof] company challenge card clicked', {
            companyId: track.companySummary.id,
            href
          })
        }
        className={cn('block w-full', focusRingInteractive)}
      >
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
              <h4 className="truncate text-[16px] font-bold text-[var(--color-ink)]">
                {track.companySummary.name}
              </h4>
              <p className="mt-0.5 truncate text-[12px] font-medium text-[#9a7a30]">
                {track.companySummary.focus
                  ? `Focus: ${track.companySummary.focus}`
                  : ''}
              </p>
              <div className="mt-2 flex items-center gap-3 text-[10px] font-bold tracking-[0.04em] text-[#5D6B74]">
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
            <div className="h-1.5 flex-1 rounded-pill bg-[var(--color-border)]">
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
