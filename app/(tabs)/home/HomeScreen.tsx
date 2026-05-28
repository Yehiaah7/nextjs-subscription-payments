'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  BadgeCheckFilledIcon,
  BellFilledIcon,
  CalendarFilledIcon,
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
  Trash2,
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
import { toast } from '@/components/ui/Toasts/use-toast';
import { logout } from '@/app/auth/actions';
import { ensureCompanyProgressReminder } from '@/lib/notifications/store';
import { getNotificationIconConfig } from '@/lib/notifications/iconMapping';
import type { ProductGymNotification } from '@/lib/notifications/types';
import UserStatTile from '@/components/ui/UserStatTile';
import type { UserProfileStats } from '@/types/user-profile-stats';
import ProGymPassCard from '@/components/ProGymPassCard';
import { useLemonSqueezyUpgrade } from '@/components/useLemonSqueezyUpgrade';
import CompanyDetailsScreen, {
  type CompanyChallenge
} from '@/app/(authenticated)/companies/[trackId]/CompanyDetailsScreen';

type MainTab = 'companies' | 'skill-paths' | 'products';
type DesktopSection = 'home' | 'notifications' | 'leaderboard' | 'settings';
type BoardTab = 'weekly' | 'all-time';

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
  const searchParams = useSearchParams();
  const { avatar } = useUserAvatar();
  const { refreshNotifications } = useNotifications();
  const [tab, setTab] = useState<MainTab>('companies');
  const [selectedDesktopSection, setSelectedDesktopSection] =
    useState<DesktopSection>('home');
  const [selectedContentTab, setSelectedContentTab] =
    useState<MainTab>('companies');
  const initialCompanyId = searchParams.get('company');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    initialCompanyId
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
    const requestedCompanyId = searchParams.get('company');
    if (!requestedCompanyId) return;

    const companyExists = companyTracks.some(
      (track) => track.companySummary.id === requestedCompanyId
    );
    if (!companyExists) return;

    setSelectedDesktopSection('home');
    setSelectedContentTab('companies');
    setSelectedCompanyId(requestedCompanyId);
    setSelectedSkillPathId(null);
    setSelectedProductId(null);
  }, [companyTracks, searchParams]);

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
        selectedSeniority={selectedSeniority}
        onSelectSeniority={setSelectedSeniority}
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
  selectedSeniority,
  onSelectSeniority,
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
  selectedSeniority: SeniorityFilter;
  onSelectSeniority: (seniority: SeniorityFilter) => void;
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
  const { notifications, highlightedNotificationIds, deleteNotificationById } =
    useNotifications();
  const [desktopNotificationToDelete, setDesktopNotificationToDelete] =
    useState<ProductGymNotification | null>(null);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [desktopLeaderboardTab, setDesktopLeaderboardTab] =
    useState<BoardTab>('weekly');
  const isHomeSection = selectedDesktopSection === 'home';
  const hasScrollableMainContent =
    isHomeSection && Boolean(selectedCompanyTrack);

  const confirmDeleteDesktopNotification = () => {
    if (!desktopNotificationToDelete) return;

    deleteNotificationById(desktopNotificationToDelete.id);
    setDesktopNotificationToDelete(null);
    toast({
      title: 'Notification deleted successfully'
    });
  };

  return (
    <div className="hidden h-screen overflow-hidden bg-[#f6f8fb] text-text lg:flex lg:flex-col">
      <DesktopTopNavbar onUpgrade={handleUpgrade} isUpgrading={isUpgrading} />
      <section
        className={cn(
          'grid min-h-0 flex-1 overflow-hidden',
          isHomeSection
            ? 'grid-cols-[88px_minmax(268px,308px)_minmax(0,1fr)_300px] xl:grid-cols-[88px_332px_minmax(0,1fr)_360px]'
            : 'grid-cols-[88px_minmax(0,1fr)]'
        )}
      >
        <aside className="relative z-30 flex min-h-0 flex-col items-center justify-between border-r border-primary-soft bg-white px-2 py-3">
          <nav
            className="flex w-full flex-col gap-1.5"
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
                className="h-10 w-10 shadow-sm shadow-black/15"
                initialsClassName="text-xs"
              />
            </button>
            <div
              className="invisible fixed bottom-5 left-[80px] z-[100] w-44 translate-x-1 rounded-[18px] border border-primary-soft bg-white p-2 opacity-0 shadow-2xl shadow-slate-900/20 transition group-hover:visible group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-x-0 group-focus-within:opacity-100"
              role="menu"
            >
              <Link
                href="/profile/settings"
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold text-[var(--color-ink)] hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                role="menuitem"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <button
                type="button"
                onClick={() => setShowLogoutConfirmation(true)}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                role="menuitem"
              >
                <LogOut className="h-4 w-4 text-red-600" />
                Sign out
              </button>
            </div>
          </div>
        </aside>

        {isHomeSection ? (
          <aside className="flex min-h-0 flex-col overflow-hidden border-r border-primary-soft bg-white/85 px-4 py-5">
            <h1 className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[16px] font-medium tracking-[-0.02em] text-[var(--color-ink)]">
              <span>Practice</span>
              <span className="relative inline-flex">
                <select
                  value={selectedSeniority}
                  onChange={(event) =>
                    onSelectSeniority(event.target.value as SeniorityFilter)
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
              <span>PM Interview Questions.</span>
            </h1>

            <div className="app-segment mt-3 h-9 p-0.5">
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

            <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pb-4 pr-1">
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
        ) : null}

        <main
          className={cn(
            'min-h-0 min-w-0 px-6 py-6',
            hasScrollableMainContent ? 'overflow-y-auto' : 'overflow-hidden',
            !isHomeSection && 'overflow-hidden px-10 py-0 xl:px-16'
          )}
        >
          {isHomeSection ? (
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
          ) : selectedDesktopSection === 'notifications' ? (
            <DesktopNotificationsWorkspace
              notifications={notifications}
              highlightedNotificationIds={highlightedNotificationIds}
              onRequestDelete={setDesktopNotificationToDelete}
            />
          ) : selectedDesktopSection === 'leaderboard' ? (
            <DesktopLeaderboardWorkspace
              tab={desktopLeaderboardTab}
              onTabChange={setDesktopLeaderboardTab}
            />
          ) : (
            <DesktopSettingsWorkspace
              userName={userName}
              userEmail={userEmail}
            />
          )}
        </main>

        {desktopNotificationToDelete ? (
          <div
            className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 px-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="desktop-delete-notification-title"
          >
            <div className="w-full max-w-[329px] rounded-3xl bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
              <h2
                id="desktop-delete-notification-title"
                className="text-base font-bold tracking-[-0.35px] text-[#0f172b]"
              >
                Delete notification?
              </h2>
              <p className="mt-2 text-sm font-medium leading-5 text-[#45556c]">
                This notification will be removed from your list.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDesktopNotificationToDelete(null)}
                  className={cn(
                    'inline-flex h-[39px] items-center justify-center rounded-xl border border-[#e2e8f0] bg-white px-4 py-[11px] text-[11px] font-black uppercase tracking-[0.08em] text-[#0f172b]',
                    btnInteractive,
                    btnInteractiveNeutral,
                    focusRingInteractive
                  )}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteDesktopNotification}
                  className={cn(
                    'inline-flex h-[39px] items-center justify-center rounded-xl border border-red-500 bg-red-500 px-4 py-[11px] text-[11px] font-black uppercase tracking-[0.08em] text-white',
                    btnInteractive,
                    btnInteractiveColored,
                    focusRingInteractive
                  )}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {showLogoutConfirmation ? (
          <div
            className="fixed inset-0 z-[110] grid place-items-center bg-slate-950/35 px-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="desktop-logout-title"
          >
            <div className="w-full max-w-[329px] rounded-3xl bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
              <h2
                id="desktop-logout-title"
                className="text-base font-bold tracking-[-0.35px] text-[#0f172b]"
              >
                Sign out?
              </h2>
              <p className="mt-2 text-sm font-medium leading-5 text-[#45556c]">
                Are you sure you want to sign out of Product Gym?
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirmation(false)}
                  className={cn(
                    'inline-flex h-[39px] items-center justify-center rounded-xl border border-[#e2e8f0] bg-white px-4 py-[11px] text-[11px] font-black uppercase tracking-[0.08em] text-[#0f172b]',
                    btnInteractive,
                    btnInteractiveNeutral,
                    focusRingInteractive
                  )}
                >
                  Cancel
                </button>
                <form action={logout}>
                  <button
                    type="submit"
                    className={cn(
                      'inline-flex h-[39px] w-full items-center justify-center rounded-xl border border-red-500 bg-red-500 px-4 py-[11px] text-[11px] font-black uppercase tracking-[0.08em] text-white',
                      btnInteractive,
                      btnInteractiveColored,
                      focusRingInteractive
                    )}
                  >
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : null}

        {isHomeSection ? (
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
        ) : null}
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
    <header className="flex h-[64px] shrink-0 items-center justify-between border-b border-primary-soft bg-white px-6">
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
        'flex w-full flex-col items-center gap-1 rounded-xl px-1 py-2.5 text-[9px] font-black uppercase tracking-[0.01em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        active
          ? 'bg-primary-soft text-primary'
          : 'text-muted hover:bg-surface-soft',
        btnInteractive
      )}
    >
      {icon}
      <span className="max-w-full whitespace-normal break-words text-center leading-tight">
        {label}
      </span>
    </button>
  );
}

const desktopRelativeTimeFormatter = new Intl.RelativeTimeFormat('en', {
  numeric: 'auto'
});

const formatDesktopNotificationTime = (createdAt: string) => {
  const createdTime = new Date(createdAt).getTime();
  const diffMs = createdTime - Date.now();
  const diffMinutes = Math.round(diffMs / (60 * 1000));
  const diffHours = Math.round(diffMs / (60 * 60 * 1000));
  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));

  if (Math.abs(diffMinutes) < 60) {
    return desktopRelativeTimeFormatter.format(diffMinutes, 'minute');
  }

  if (Math.abs(diffHours) < 24) {
    return desktopRelativeTimeFormatter.format(diffHours, 'hour');
  }

  return desktopRelativeTimeFormatter.format(diffDays, 'day');
};

const desktopNotificationIcons = {
  hand: BadgeCheckFilledIcon,
  target: CheckCircleFilledIcon,
  rocket: RocketFilledIcon,
  users: UsersFilledIcon,
  trophy: TrophyFilledIcon
} as const;

function DesktopNotificationsWorkspace({
  notifications,
  highlightedNotificationIds,
  onRequestDelete
}: {
  notifications: ProductGymNotification[];
  highlightedNotificationIds: Set<string>;
  onRequestDelete: (notification: ProductGymNotification) => void;
}) {
  return (
    <section className="mx-auto flex h-full w-full max-w-3xl flex-col pt-10 xl:pt-12">
      <div className="mb-5 text-left">
        <h1 className="text-[26px] font-black tracking-[-0.045em] text-[var(--color-ink)]">
          Notifications
        </h1>
        <p className="mt-1 text-sm font-semibold text-muted">
          Recent practice, challenge, and subscription updates.
        </p>
      </div>

      {notifications.length ? (
        <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-2">
          {notifications.map((notification) => {
            const iconConfig = getNotificationIconConfig(notification.type);
            const NotificationIcon = desktopNotificationIcons[iconConfig.icon];
            const isHighlighted = highlightedNotificationIds.has(
              notification.id
            );

            return (
              <article
                key={notification.id}
                className={cn(
                  'group flex items-start gap-3.5 rounded-[22px] border-none bg-white px-4 py-3.5 text-left shadow-sm shadow-slate-900/5',
                  isHighlighted && 'bg-primary-soft/45'
                )}
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <NotificationIcon className="h-4 w-4 shrink-0" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="min-w-0 text-[15px] font-bold leading-[1.3] tracking-[-0.2px] text-[var(--alerts-heading-color)]">
                      {notification.title}
                    </h2>
                    <p className="shrink-0 pt-0.5 text-[11px] font-semibold text-[var(--alerts-time-color)]">
                      {formatDesktopNotificationTime(notification.createdAt)}
                    </p>
                  </div>
                  <p className="mt-1.5 text-[13px] font-medium leading-[1.5] text-[var(--alerts-body-color)]">
                    {notification.body}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRequestDelete(notification)}
                  className={cn(
                    'mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#8da0b7] hover:bg-[#f2f6fb] hover:text-red-600',
                    btnInteractive,
                    btnInteractiveNeutral,
                    focusRingInteractive
                  )}
                  aria-label={`Delete ${notification.title}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-[var(--alerts-card-stroke)] bg-white p-8 text-center shadow-sm shadow-slate-900/5">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-productGym-yellowSoft text-amber-700">
            <BellFilledIcon className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-[18px] font-bold tracking-[-0.35px] text-[var(--alerts-heading-color)]">
            No notifications yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-[13px] font-medium leading-[1.45] text-[var(--alerts-body-color)]">
            You’ll see updates about your progress, challenges, and subscription
            here.
          </p>
        </div>
      )}
    </section>
  );
}

function DesktopSettingsWorkspace({
  userName,
  userEmail
}: {
  userName: string;
  userEmail?: string | null;
}) {
  const settingsSections = [
    {
      title: 'Profile',
      description:
        'Review the account identity Product Gym uses across your practice workspace.',
      detail: userEmail ?? 'No email on file'
    },
    {
      title: 'Preferences',
      description:
        'Keep your practice reminders, difficulty filters, and workspace preferences organized.',
      detail:
        'Practice defaults can be managed from your full profile settings.'
    },
    {
      title: 'Security',
      description:
        'Manage session safety and password updates from the dedicated settings page.',
      detail: 'Use the profile settings page for account changes.'
    }
  ];

  return (
    <section className="mx-auto flex h-full w-full max-w-3xl flex-col pt-10 xl:pt-12">
      <header className="mb-5 max-w-xl text-left">
        <h1 className="text-[26px] font-black tracking-[-0.045em] text-[var(--color-ink)]">
          Settings
        </h1>
        <p className="mt-1 text-sm font-semibold leading-6 text-muted">
          Manage your account preferences and Product Gym experience.
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto pb-6">
        <div className="space-y-3">
          {settingsSections.map((section) => (
            <section
              key={section.title}
              className="rounded-[24px] border border-primary-soft bg-white p-5 text-left shadow-sm shadow-slate-900/5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-[17px] font-black tracking-[-0.03em] text-[var(--color-ink)]">
                    {section.title}
                  </h2>
                  <p className="mt-1 text-sm font-medium leading-6 text-muted">
                    {section.description}
                  </p>
                </div>
                <span className="rounded-full bg-primary-soft px-3 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-primary">
                  {section.title === 'Profile' ? 'Account' : 'Coming soon'}
                </span>
              </div>
              <p className="mt-4 rounded-2xl bg-surface-soft px-4 py-3 text-sm font-semibold text-[#45556c]">
                {section.detail}
              </p>
            </section>
          ))}
        </div>

        <Link
          href="/profile/settings"
          className={cn(
            'mt-4 inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-[12px] font-black uppercase tracking-[0.08em] text-white shadow-sm shadow-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            btnInteractive,
            btnInteractiveColored
          )}
        >
          Open full settings
        </Link>
      </div>
    </section>
  );
}

function DesktopLeaderboardWorkspace({
  tab,
  onTabChange
}: {
  tab: BoardTab;
  onTabChange: (tab: BoardTab) => void;
}) {
  return (
    <section className="mx-auto flex h-full w-full max-w-3xl flex-col pt-10 xl:pt-12">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-4 text-left">
        <div className="min-w-0 max-w-xl">
          <h1 className="text-[26px] font-black tracking-[-0.045em] text-[var(--color-ink)]">
            Leaderboard
          </h1>
          <p className="mt-1 text-sm font-semibold leading-6 text-muted">
            Track your ranking and compare your progress with other Product Gym
            members.
          </p>
        </div>
        <div className="app-segment h-10 w-[220px] shrink-0 p-0.5">
          <div className="grid h-full grid-cols-2 gap-1">
            <DesktopLeaderboardSegmentButton
              label="Weekly"
              active={tab === 'weekly'}
              onClick={() => onTabChange('weekly')}
            />
            <DesktopLeaderboardSegmentButton
              label="All Time"
              active={tab === 'all-time'}
              onClick={() => onTabChange('all-time')}
            />
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="rounded-[24px] border-none bg-white p-8 text-center shadow-sm shadow-slate-900/5">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-[#51a2ff] shadow-[inset_0_0_0_1px_rgba(81,162,255,0.14)]">
            <CalendarFilledIcon className="h-7 w-7" />
          </div>
          <p className="mt-6 text-[10px] font-black uppercase leading-[1.4] tracking-[0.5px] text-[var(--lb-meta-color)]">
            GLOBAL RANKING
          </p>
          <h2 className="mx-auto mt-2 max-w-md text-[18px] font-bold leading-[1.25] tracking-[-0.3px] text-[var(--lb-title-color)]">
            Solve challenges for 30 days to unlock rankings.
          </h2>
          <p className="mx-auto mt-2 max-w-[240px] t-body-muted">
            Keep your streak going to join the competition.
          </p>
        </div>
      </div>
    </section>
  );
}

function DesktopLeaderboardSegmentButton({
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
      type="button"
      className={cn(
        'relative h-full whitespace-nowrap rounded-pill px-2 t-label',
        active ? 'text-white' : 'text-muted',
        tabInteractive,
        focusRingInteractive
      )}
    >
      {active ? (
        <motion.span
          layoutId="desktop-leaderboard-tab-indicator"
          transition={springTransition}
          className="absolute inset-0 rounded-pill bg-primary shadow-button"
        />
      ) : null}
      <span className="relative">{label}</span>
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
        'group w-full rounded-[18px] border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
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
        <div className="h-1.5 min-w-0 flex-1 rounded-pill bg-[var(--color-border)]">
          <div
            className="h-full rounded-pill bg-primary"
            style={{ width: `${boundedProgress}%` }}
          />
        </div>
        <span className="shrink-0 text-[10px] font-black text-primary">
          {boundedProgress}%
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-soft px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-primary shadow-sm shadow-primary/10 transition-colors group-hover:bg-primary/15 group-focus-visible:bg-primary/15">
          {boundedProgress > 0 ? 'Continue' : 'Start'}
          <ChevronRightFilledIcon className="h-3.5 w-3.5" />
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
    <div className="flex h-full min-h-0 items-center justify-center overflow-hidden">
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
