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
      aria-label="Colorful rocket"
    >
      <defs>
        <linearGradient
          id="rocketFlameOuter"
          x1="8"
          y1="27"
          x2="2"
          y2="38"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fb7185" />
          <stop offset="0.45" stopColor="#f97316" />
          <stop offset="1" stopColor="#facc15" />
        </linearGradient>
        <linearGradient
          id="rocketFlameInner"
          x1="7.8"
          y1="29.4"
          x2="3.8"
          y2="35.3"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff7ad" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient
          id="rocketWingLeft"
          x1="5.3"
          y1="14.4"
          x2="14.9"
          y2="23.7"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#22d3ee" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient
          id="rocketWingRight"
          x1="16.6"
          y1="25.2"
          x2="26"
          y2="34.2"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#a855f7" />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient
          id="rocketBody"
          x1="10.4"
          y1="27.2"
          x2="30.8"
          y2="5.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#2563eb" />
          <stop offset="0.44" stopColor="#7c3aed" />
          <stop offset="1" stopColor="#ff4db8" />
        </linearGradient>
        <linearGradient
          id="rocketNose"
          x1="20.8"
          y1="8.6"
          x2="29.1"
          y2="6.9"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fde047" />
          <stop offset="1" stopColor="#fb7185" />
        </linearGradient>
        <linearGradient
          id="rocketWindow"
          x1="18"
          y1="12.3"
          x2="24.8"
          y2="19.1"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#e0f2fe" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      <path
        d="M9.8 28.4c-1.7.2-3.4 1.1-4.8 2.5-1.5 1.5-2.4 3.4-2.6 5.3 1.9-.2 3.8-1.1 5.3-2.6 1.4-1.4 2.3-3.1 2.5-4.8l-.4-.4Z"
        fill="url(#rocketFlameOuter)"
      />
      <path
        d="M7.5 30.7c-.8.4-1.5.9-2.1 1.5-.7.7-1.2 1.5-1.6 2.3.9-.3 1.7-.9 2.4-1.6.6-.6 1.1-1.4 1.5-2.1l-.2-.1Z"
        fill="url(#rocketFlameInner)"
      />
      <path
        d="m12.6 21.5-5.4 1.7c-.9.3-1.7-.7-1.2-1.5l2.3-4c.2-.4.6-.7 1.1-.8l5.5-.9-2.3 5.5Z"
        fill="url(#rocketWingLeft)"
      />
      <path
        d="m18.5 27.3-.9 5.6c-.2.9.8 1.6 1.6 1.2l4-2.3c.4-.2.7-.6.8-1.1l1.7-5.4-7.2 2Z"
        fill="url(#rocketWingRight)"
      />
      <path
        d="M12 26.8 9.2 24c-.5-.5-.6-1.2-.3-1.8l2.6-5.5C14.7 9.9 20.7 4.9 28 3.1c2.1-.5 3.9 1.3 3.4 3.4-1.8 7.3-6.8 13.3-13.6 16.5l-5.5 2.6c-.1.1-.2.2-.3.2Z"
        fill="url(#rocketBody)"
      />
      <path
        d="m15.4 30.6-6-6c-.6-.6-.6-1.7 0-2.3l1.2-1.2 9.3 9.3-1.2 1.2c-.6.6-1.7.6-2.3 0Z"
        fill="#4338ca"
      />
      <path
        d="M21 9.3c2-1.4 4.4-2.4 7-3.1.7-.2 1.4.5 1.2 1.2-.7 2.6-1.7 5-3.1 7L21 9.3Z"
        fill="url(#rocketNose)"
      />
      <circle cx="21.5" cy="16" r="3.9" fill="#f8fafc" />
      <circle cx="21.5" cy="16" r="2.4" fill="url(#rocketWindow)" />
      <circle cx="22.5" cy="14.9" r="0.8" fill="#ffffff" opacity="0.95" />
      <path
        d="M32.8 16.1 34 18.4l2.3 1.2L34 20.8l-1.2 2.3-1.2-2.3-2.3-1.2 2.3-1.2 1.2-2.3Z"
        fill="#facc15"
      />
      <path
        d="m7.6 10.3.8 1.5 1.5.8-1.5.8-.8 1.5-.8-1.5-1.5-.8 1.5-.8.8-1.5Z"
        fill="#22d3ee"
      />
      <circle cx="32.6" cy="27.7" r="1.3" fill="#fb7185" />
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
