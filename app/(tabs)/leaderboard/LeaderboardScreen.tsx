'use client';

import MobileScreen from '@/components/mobile/MobileScreen';
import { Flame, Trophy } from 'lucide-react';
import { useMemo, useState } from 'react';

type BoardTab = 'weekly' | 'all-time';

type Leader = {
  name: string;
  title: string;
  solved: number;
  points: number;
  avatar?: string;
  accent: string;
  isCurrentUser?: boolean;
};

const weeklyLeaders: Leader[] = [
  {
    name: 'Alex Chen',
    title: 'Growth PM',
    solved: 42,
    points: 50,
    accent: 'from-amber-300 to-yellow-500',
    avatar: 'AC'
  },
  {
    name: 'Elena Rodriguez',
    title: 'Growth PM',
    solved: 34,
    points: 32,
    accent: 'from-rose-300 to-red-500',
    avatar: 'ER'
  },
  {
    name: 'David Zhang',
    title: 'Growth PM',
    solved: 30,
    points: 20,
    accent: 'from-amber-200 to-stone-400',
    avatar: 'DZ'
  },
  {
    name: 'Fatima Noor',
    title: 'Product Strategist',
    solved: 29,
    points: 19,
    accent: 'from-sky-300 to-blue-500',
    avatar: 'FN'
  },
  {
    name: 'Ibrahim Saleh',
    title: 'A/B Testing PM',
    solved: 28,
    points: 18,
    accent: 'from-fuchsia-300 to-purple-500',
    avatar: 'IS'
  },
  {
    name: 'Mina Patel',
    title: 'Platform PM',
    solved: 27,
    points: 17,
    accent: 'from-orange-300 to-amber-500',
    avatar: 'MP'
  },
  {
    name: 'Sara Khan',
    title: 'Core Product PM',
    solved: 26,
    points: 15,
    accent: 'from-cyan-300 to-teal-500',
    avatar: 'SK'
  },
  {
    name: 'Noah Silva',
    title: 'Monetization PM',
    solved: 24,
    points: 14,
    accent: 'from-lime-300 to-emerald-500',
    avatar: 'NS'
  },
  {
    name: 'Ahmed Yehia',
    title: 'PM @ VOIS_',
    solved: 20,
    points: 12,
    accent: 'from-orange-400 to-rose-500',
    avatar: 'AY',
    isCurrentUser: true
  },
  {
    name: 'Priya Iyer',
    title: 'Marketplace PM',
    solved: 19,
    points: 11,
    accent: 'from-violet-300 to-indigo-500',
    avatar: 'PI'
  },
  {
    name: 'Arjun Rao',
    title: 'Growth PM',
    solved: 18,
    points: 10,
    accent: 'from-emerald-300 to-green-600',
    avatar: 'AR'
  },
  {
    name: 'Maya Desai',
    title: 'Product Lead',
    solved: 17,
    points: 9,
    accent: 'from-pink-300 to-rose-500',
    avatar: 'MD'
  },
  {
    name: 'Omar Farouk',
    title: 'Analytics PM',
    solved: 16,
    points: 8,
    accent: 'from-indigo-300 to-blue-600',
    avatar: 'OF'
  },
  {
    name: 'Hana Lee',
    title: 'Core Product PM',
    solved: 15,
    points: 7,
    accent: 'from-teal-300 to-cyan-600',
    avatar: 'HL'
  },
  {
    name: 'Julia Park',
    title: 'International PM',
    solved: 14,
    points: 6,
    accent: 'from-red-300 to-orange-500',
    avatar: 'JP'
  },
  {
    name: 'Lucas Meyer',
    title: 'Mobile PM',
    solved: 13,
    points: 6,
    accent: 'from-slate-300 to-zinc-500',
    avatar: 'LM'
  },
  {
    name: 'Aisha Ali',
    title: 'Activation PM',
    solved: 12,
    points: 5,
    accent: 'from-sky-300 to-indigo-500',
    avatar: 'AA'
  },
  {
    name: 'Nadia Nasser',
    title: 'UX PM',
    solved: 11,
    points: 4,
    accent: 'from-yellow-300 to-orange-500',
    avatar: 'NN'
  },
  {
    name: 'Khaled Aziz',
    title: 'Retention PM',
    solved: 10,
    points: 3,
    accent: 'from-green-300 to-emerald-600',
    avatar: 'KA'
  },
  {
    name: 'Rania Salem',
    title: 'Product Analyst',
    solved: 9,
    points: 2,
    accent: 'from-purple-300 to-violet-600',
    avatar: 'RS'
  }
];

const allTimeLeaders: Leader[] = [
  {
    name: 'Marcus Aurelius',
    title: 'Chief Product',
    solved: 42,
    points: 50,
    accent: 'from-red-300 to-orange-500',
    avatar: 'MA'
  },
  {
    name: 'Elena Rodriguez',
    title: 'Growth PM',
    solved: 34,
    points: 32,
    accent: 'from-rose-300 to-red-500',
    avatar: 'ER'
  },
  {
    name: 'David Zhang',
    title: 'Growth PM',
    solved: 30,
    points: 20,
    accent: 'from-amber-200 to-stone-400',
    avatar: 'DZ'
  },
  {
    name: 'Alex Chen',
    title: 'Growth PM',
    solved: 29,
    points: 19,
    accent: 'from-amber-300 to-yellow-500',
    avatar: 'AC'
  },
  {
    name: 'Ibrahim Saleh',
    title: 'A/B Testing PM',
    solved: 28,
    points: 18,
    accent: 'from-fuchsia-300 to-purple-500',
    avatar: 'IS'
  },
  {
    name: 'Mina Patel',
    title: 'Platform PM',
    solved: 27,
    points: 17,
    accent: 'from-orange-300 to-amber-500',
    avatar: 'MP'
  },
  {
    name: 'Fatima Noor',
    title: 'Product Strategist',
    solved: 26,
    points: 16,
    accent: 'from-sky-300 to-blue-500',
    avatar: 'FN'
  },
  {
    name: 'Noah Silva',
    title: 'Monetization PM',
    solved: 24,
    points: 14,
    accent: 'from-lime-300 to-emerald-500',
    avatar: 'NS'
  },
  {
    name: 'Priya Iyer',
    title: 'Marketplace PM',
    solved: 23,
    points: 13,
    accent: 'from-violet-300 to-indigo-500',
    avatar: 'PI'
  },
  {
    name: 'Sara Khan',
    title: 'Core Product PM',
    solved: 22,
    points: 12,
    accent: 'from-cyan-300 to-teal-500',
    avatar: 'SK'
  },
  {
    name: 'Ahmed Yehia',
    title: 'PM @ VOIS_',
    solved: 20,
    points: 12,
    accent: 'from-orange-400 to-rose-500',
    avatar: 'AY',
    isCurrentUser: true
  },
  {
    name: 'Arjun Rao',
    title: 'Growth PM',
    solved: 18,
    points: 10,
    accent: 'from-emerald-300 to-green-600',
    avatar: 'AR'
  },
  {
    name: 'Maya Desai',
    title: 'Product Lead',
    solved: 17,
    points: 9,
    accent: 'from-pink-300 to-rose-500',
    avatar: 'MD'
  },
  {
    name: 'Omar Farouk',
    title: 'Analytics PM',
    solved: 16,
    points: 8,
    accent: 'from-indigo-300 to-blue-600',
    avatar: 'OF'
  },
  {
    name: 'Hana Lee',
    title: 'Core Product PM',
    solved: 15,
    points: 7,
    accent: 'from-teal-300 to-cyan-600',
    avatar: 'HL'
  },
  {
    name: 'Julia Park',
    title: 'International PM',
    solved: 14,
    points: 6,
    accent: 'from-red-300 to-orange-500',
    avatar: 'JP'
  },
  {
    name: 'Lucas Meyer',
    title: 'Mobile PM',
    solved: 13,
    points: 6,
    accent: 'from-slate-300 to-zinc-500',
    avatar: 'LM'
  },
  {
    name: 'Aisha Ali',
    title: 'Activation PM',
    solved: 12,
    points: 5,
    accent: 'from-sky-300 to-indigo-500',
    avatar: 'AA'
  },
  {
    name: 'Nadia Nasser',
    title: 'UX PM',
    solved: 11,
    points: 4,
    accent: 'from-yellow-300 to-orange-500',
    avatar: 'NN'
  },
  {
    name: 'Khaled Aziz',
    title: 'Retention PM',
    solved: 10,
    points: 3,
    accent: 'from-green-300 to-emerald-600',
    avatar: 'KA'
  }
];

export default function LeaderboardScreen() {
  const [tab, setTab] = useState<BoardTab>('weekly');

  const rankedLeaders = useMemo(
    () =>
      (tab === 'weekly' ? weeklyLeaders : allTimeLeaders).map(
        (leader, index) => ({
          ...leader,
          rank: index + 1
        })
      ),
    [tab]
  );

  const topLeaders = rankedLeaders.slice(0, 3);
  const currentUser = rankedLeaders.find((leader) => leader.isCurrentUser);

  return (
    <MobileScreen>
      <header className="mb-6 pt-1">
        <h1 className="t-title text-[32px]">
          Leaderboard
        </h1>
      </header>

      <div className="app-segment mb-4 grid grid-cols-2 shadow-none">
        <SegmentButton
          label="Weekly"
          active={tab === 'weekly'}
          onClick={() => setTab('weekly')}
        />
        <SegmentButton
          label="All Time"
          active={tab === 'all-time'}
          onClick={() => setTab('all-time')}
        />
      </div>

      <p className="mb-3 text-xs font-bold uppercase tracking-[0.1em] text-[#94a3b8]">
        Global Ranking
      </p>

      <div className="space-y-3">
        {topLeaders.map((leader) => (
          <LeaderCard key={`${tab}-${leader.rank}`} leader={leader} />
        ))}
      </div>

      {currentUser && (
        <>
          <div className="my-5 flex items-center gap-3">
            <div className="h-[1px] flex-1 bg-[#d9dfe7]" />
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9aa8bc]">
              Your Position
            </p>
            <div className="h-[1px] flex-1 bg-[#d9dfe7]" />
          </div>

          <LeaderCard leader={currentUser} highlighted />
        </>
      )}
    </MobileScreen>
  );
}

function LeaderCard({
  leader,
  highlighted = false
}: {
  leader: Leader & { rank: number };
  highlighted?: boolean;
}) {
  return (
    <article
      className={`relative app-card relative ${
        highlighted ? 'ring-2 ring-[#ffd5ad]' : ''
      }`}
    >
      <span className="absolute left-1 top-1 rounded-md bg-primary px-2 py-[1px] text-[11px] font-bold text-white">
        {leader.rank}
      </span>

      <div className="flex items-center gap-3">
        <Avatar
          name={leader.name}
          accent={leader.accent}
          fallback={leader.avatar}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-extrabold leading-tight text-text">
                {leader.name}
              </h2>
              <p className="truncate text-base font-semibold leading-tight text-muted">
                {leader.title}
              </p>
            </div>

            <div className="mt-0.5 flex items-center gap-1 rounded-full bg-[#fff2e8] px-2.5 py-1 text-[#ff6b00]">
              <Flame className="h-3.5 w-3.5 fill-current" />
              <span className="text-xs font-extrabold tracking-[0.02em]">
                {formatPoints(leader.points)}
              </span>
            </div>
          </div>

          <div className="mt-1.5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.04em]">
            <span className="inline-flex items-center gap-1 text-[#8ea0b8]">
              <span className="grid h-3.5 w-3.5 place-items-center rounded-full border border-[#19c37d] text-[#19c37d]">
                ✓
              </span>
              {leader.solved} Solved
            </span>
            {leader.rank === 1 && (
              <span className="inline-flex items-center gap-1 text-[#ff9d00]">
                <Trophy className="h-3.5 w-3.5" />
                Top Ranked
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function Avatar({
  name,
  accent,
  fallback
}: {
  name: string;
  accent: string;
  fallback?: string;
}) {
  return (
    <div
      className={`grid h-[58px] w-[58px] shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${accent}`}
      aria-label={`${name} avatar`}
    >
      <span className="text-lg font-extrabold text-white drop-shadow-sm">
        {(fallback ?? name)
          .split(' ')
          .slice(0, 2)
          .map((segment) => segment[0])
          .join('')
          .toUpperCase()}
      </span>
    </div>
  );
}

function SegmentButton({
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
      className={`rounded-[26px] py-3 text-sm font-extrabold uppercase tracking-[0.12em] transition-all ${
        active
          ? 'bg-container text-primary shadow-button'
          : 'text-muted'
      }`}
      type="button"
    >
      {label}
    </button>
  );
}

function formatPoints(points: number) {
  return `${new Intl.NumberFormat('en-US').format(points)}D`;
}
