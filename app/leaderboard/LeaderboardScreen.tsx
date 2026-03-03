'use client';

import MobileScreen from '@/components/mobile/MobileScreen';
import { Medal } from 'lucide-react';
import { useState } from 'react';

type BoardTab = 'weekly' | 'all-time';

type Leader = {
  rank: number;
  name: string;
  score: number;
};

const weeklyLeaders: Leader[] = [
  { rank: 1, name: 'Maya Chen', score: 1240 },
  { rank: 2, name: 'Ahmed Yehia', score: 1160 },
  { rank: 3, name: 'Sofia Reed', score: 1035 },
  { rank: 4, name: 'Ibrahim Noor', score: 980 }
];

const allTimeLeaders: Leader[] = [
  { rank: 1, name: 'Jaden Cole', score: 21540 },
  { rank: 2, name: 'Maya Chen', score: 20310 },
  { rank: 3, name: 'Ahmed Yehia', score: 19330 },
  { rank: 4, name: 'Sofia Reed', score: 18675 }
];

export default function LeaderboardScreen() {
  const [tab, setTab] = useState<BoardTab>('weekly');
  const leaders = tab === 'weekly' ? weeklyLeaders : allTimeLeaders;

  return (
    <MobileScreen>
      <header className="mb-5">
        <h1 className="text-4xl font-bold text-[#111827]">Leaderboard</h1>
      </header>

      <div className="mb-5 grid grid-cols-2 rounded-full bg-[#dce3ec] p-1">
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

      <div className="space-y-3">
        {leaders.map((entry) => (
          <article
            key={`${tab}-${entry.rank}`}
            className="rounded-3xl bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#94a3b8]">
                  Rank #{entry.rank}
                </p>
                <h2 className="text-2xl font-bold text-[#111827]">
                  {entry.name}
                </h2>
              </div>
              <div className="flex items-center gap-2 text-[#2563eb]">
                <Medal className="h-5 w-5" />
                <span className="text-xl font-bold">{entry.score}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </MobileScreen>
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
      className={`rounded-full py-2 text-sm font-bold uppercase tracking-[0.08em] ${
        active ? 'bg-white text-[#2563eb]' : 'text-[#64748b]'
      }`}
    >
      {label}
    </button>
  );
}
