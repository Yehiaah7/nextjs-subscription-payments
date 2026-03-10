'use client';

import MobileScreen from '@/components/mobile/MobileScreen';
import { useMemo, useState } from 'react';

type BoardTab = 'weekly' | 'all-time';

type Leader = {
  name: string;
  title: string;
  solved: number;
  points: number;
  avatar?: string;
  isCurrentUser?: boolean;
};

const weeklyLeaders: Leader[] = [
  { name: 'Alex Chen', title: 'Growth PM', solved: 42, points: 50, avatar: 'AC' },
  { name: 'Elena Rodriguez', title: 'Growth PM', solved: 34, points: 32, avatar: 'ER' },
  { name: 'David Zhang', title: 'Growth PM', solved: 30, points: 20, avatar: 'DZ' },
  { name: 'Ahmed Yehia', title: 'PM @ VOIS_', solved: 20, points: 12, avatar: 'AY', isCurrentUser: true }
];

const allTimeLeaders: Leader[] = [
  { name: 'Marcus Aurelius', title: 'Chief Product', solved: 99, points: 120, avatar: 'MA' },
  { name: 'Elena Rodriguez', title: 'Growth PM', solved: 84, points: 90, avatar: 'ER' },
  { name: 'David Zhang', title: 'Growth PM', solved: 74, points: 70, avatar: 'DZ' },
  { name: 'Ahmed Yehia', title: 'PM @ VOIS_', solved: 56, points: 51, avatar: 'AY', isCurrentUser: true }
];

export default function LeaderboardScreen() {
  const [tab, setTab] = useState<BoardTab>('weekly');

  const rankedLeaders = useMemo(
    () =>
      (tab === 'weekly' ? weeklyLeaders : allTimeLeaders).map((leader, index) => ({
        ...leader,
        rank: index + 1
      })),
    [tab]
  );

  const currentUser = rankedLeaders.find((leader) => leader.isCurrentUser);

  return (
    <MobileScreen>
      <section className="mx-auto w-full max-w-[361px]">
        <header className="mb-4">
          <h1 className="text-[var(--lb-title-size)] font-bold leading-[var(--lb-title-line)] tracking-[var(--lb-title-track)] text-[var(--lb-title-color)]">
            Leaderboard
          </h1>
        </header>

        <div className="mb-4 grid h-[var(--lb-tabbar-height)] w-full grid-cols-2 gap-1 rounded-[var(--lb-tabbar-radius)] border border-[var(--lb-tabbar-stroke)] bg-[var(--lb-tabbar-bg)] p-1">
          <SegmentButton label="Weekly" active={tab === 'weekly'} onClick={() => setTab('weekly')} />
          <SegmentButton label="All Time" active={tab === 'all-time'} onClick={() => setTab('all-time')} />
        </div>

        <p className="mb-4 text-[10px] font-black uppercase leading-[1.4] tracking-[0.5px] text-[var(--lb-meta-color)]">GLOBAL RANKING</p>

        <div className="space-y-4">
          {rankedLeaders.slice(0, 3).map((leader) => (
            <LeaderCard key={`${tab}-${leader.rank}`} leader={leader} />
          ))}
        </div>

        {currentUser && (
          <>
            <div className="my-4 flex items-center gap-2">
              <div className="h-px flex-1 bg-[var(--lb-divider)]" />
              <p className="text-[9px] font-black uppercase tracking-[1.8px] text-[var(--lb-meta-color)]">YOUR POSITION</p>
              <div className="h-px flex-1 bg-[var(--lb-divider)]" />
            </div>
            <LeaderCard leader={currentUser} highlighted />
          </>
        )}
      </section>
    </MobileScreen>
  );
}

function LeaderCard({ leader, highlighted = false }: { leader: Leader & { rank: number }; highlighted?: boolean }) {
  return (
    <article
      className={`h-[81px] w-full rounded-[var(--lb-card-radius)] border bg-[var(--lb-card-bg)] p-3 ${
        highlighted ? 'border-[#ffd5ad]' : 'border-[var(--lb-card-stroke)]'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="grid h-[56px] w-[56px] place-items-center rounded-[12px] bg-[var(--lb-avatar-bg)] text-sm font-bold text-white">
          {leader.avatar}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-[16px] font-bold leading-[1.2] tracking-[-0.4px] text-[var(--lb-name-color)]">{leader.name}</p>
              <p className="truncate text-[10px] font-black uppercase tracking-[1px] text-[var(--lb-role-color)]">{leader.title}</p>
            </div>
            <div className="rounded-full bg-[var(--lb-score-bg)] px-2 py-1 text-[10px] font-bold text-[var(--lb-score-color)]">{leader.points}D</div>
          </div>
          <p className="mt-1 text-[10px] font-bold text-[var(--lb-solved-color)]">#{leader.rank} • {leader.solved} solved</p>
        </div>
      </div>
    </article>
  );
}

function SegmentButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`rounded-[999px] text-[10px] font-black uppercase tracking-[1px] ${
        active
          ? 'bg-[var(--lb-tab-active-bg)] text-[var(--lb-tab-active-color)] shadow-[var(--lb-tab-active-shadow)]'
          : 'text-[var(--lb-tab-inactive-color)]'
      }`}
    >
      {label}
    </button>
  );
}
