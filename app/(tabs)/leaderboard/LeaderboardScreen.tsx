'use client';

import { motion } from 'framer-motion';
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
        <LeaderboardRocketIllustration className="h-9 w-9" />
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

function LeaderboardRocketIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      role="img"
      aria-label="Rocket"
    >
      <path
        d="M15.2 28.7 11.6 32.3c-.6.6-1.6.2-1.6-.7v-3.1c0-.4.2-.8.5-1.1l2.2-2.2 2.5 3.5Z"
        fill="#f97316"
      />
      <path
        d="M11.3 21.4 6.7 22.9c-.8.3-1.5-.6-1.1-1.3l2.1-3.7c.2-.3.5-.5.9-.6l4.9-.8-2.2 4.9Z"
        fill="#93c5fd"
      />
      <path
        d="M18.6 28.7 17.8 33.6c-.1.8.8 1.3 1.4.8l3.7-2.1c.3-.2.5-.5.6-.9l1.5-4.6-6.4 1.9Z"
        fill="#60a5fa"
      />
      <path
        d="M12 26.7 9.3 24c-.4-.4-.5-1.1-.2-1.6l2.6-5.4c3.1-6.5 8.8-11.4 15.7-13.2 2-.5 3.8 1.3 3.3 3.3-1.8 7-6.6 12.7-13.2 15.8l-5.4 2.6c-.1.1-.1.1-.1.1Z"
        fill="#447dfd"
      />
      <path
        d="M15.5 30.2 9.8 24.5c-.6-.6-.6-1.6 0-2.2l1.2-1.2 8.9 8.9-1.2 1.2c-.6.6-1.6.6-2.2 0Z"
        fill="#1d4ed8"
      />
      <path
        d="M21.2 9.3c2-1.3 4.2-2.2 6.7-2.9.7-.2 1.3.5 1.1 1.1-.6 2.4-1.6 4.7-2.9 6.7l-4.9-4.9Z"
        fill="#bfdbfe"
      />
      <circle cx="21.7" cy="15.9" r="3.5" fill="#eff6ff" />
      <circle cx="21.7" cy="15.9" r="2" fill="#38bdf8" />
      <path
        d="M9.7 28.8c-1.5.2-3 1-4.3 2.3-1.4 1.4-2.2 3.1-2.4 4.9 1.8-.2 3.5-1 4.9-2.4 1.3-1.3 2.1-2.8 2.3-4.3l-.5-.5Z"
        fill="#fb923c"
      />
      <path
        d="M7.6 30.9c-.7.3-1.4.8-2 1.4-.6.6-1.1 1.3-1.4 2 .8-.3 1.5-.8 2.1-1.4.6-.6 1-1.3 1.3-2Z"
        fill="#fde047"
      />
    </svg>
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
