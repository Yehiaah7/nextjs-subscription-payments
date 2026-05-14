'use client';

import { motion } from 'framer-motion';
import { CalendarRange } from 'lucide-react';
import MobileScreen from '@/components/mobile/MobileScreen';
import MotionPage from '@/components/motion/MotionPage';
import {
  focusRingInteractive,
  tabInteractive
} from '@/components/ui/interactive';
import { springTransition } from '@/lib/motion';
import { cn } from '@/utils/cn';
import { useState } from 'react';

type BoardTab = 'weekly' | 'all-time';

export default function LeaderboardScreen() {
  const [tab, setTab] = useState<BoardTab>('weekly');

  return (
    <MobileScreen>
      <MotionPage>
        <section className="mx-auto w-full max-w-[361px]">
          <header className="mb-4">
            <h1 className="text-[var(--lb-title-size)] font-bold leading-[var(--lb-title-line)] tracking-[var(--lb-title-track)] text-[var(--lb-title-color)]">
              Leaderboard
            </h1>
          </header>

          <div className="app-segment mb-4">
            <div className="grid h-full grid-cols-2 gap-1">
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
          </div>

          <p className="mb-4 text-[10px] font-black uppercase leading-[1.4] tracking-[0.5px] text-[var(--lb-meta-color)]">
            GLOBAL RANKING
          </p>

          <LeaderboardEmptyState />
        </section>
      </MotionPage>
    </MobileScreen>
  );
}

function LeaderboardEmptyState() {
  return (
    <div className="app-card flex min-h-[236px] flex-col items-center justify-center px-6 py-8 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-orange-50 shadow-[inset_0_0_0_1px_rgba(68,125,253,0.12)]">
        <CalendarRange className="h-8 w-8 text-blue-500" strokeWidth={2.25} />
      </div>
      <h2 className="text-[16px] font-bold leading-[1.25] tracking-[-0.3px] text-[var(--lb-title-color)]">
        Solve challenges for 30 days to unlock rankings.
      </h2>
      <p className="mt-2 max-w-[240px] t-body-muted">
        Keep your streak going to join the competition.
      </p>
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
          layoutId="leaderboard-tab-indicator"
          transition={springTransition}
          className="absolute inset-0 rounded-pill bg-primary shadow-button"
        />
      ) : null}
      <span className="relative">{label}</span>
    </button>
  );
}
