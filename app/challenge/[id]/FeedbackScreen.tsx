'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type FeedbackVariant = 'correct' | 'wrong';

const COPY = {
  correct: {
    title: 'Decision Correct',
    statusText: 'High Strategic Precision',
    statusClass: 'text-[#09b47a]',
    statusDotClass: 'bg-[#09b47a]',
    icon: '✓',
    iconClass: 'text-[#09b47a]',
    iconGlowClass: 'shadow-[0_10px_35px_rgba(9,180,122,0.28)]',
    progressStatus: 'Mastery',
    progressStatusClass: 'text-[#09b47a]',
    insightTitle: 'Strategic Logic',
    insightSubtitle: 'Validation',
    insight:
      'At this scale, you’re not just managing a product; you’re managing trust. A 15% drop is painful, but a compromised reputation is fatal. You chose the long-game—exactly what a Senior PM should do.'
  },
  wrong: {
    title: 'Decision Incorrect',
    statusText: 'Suboptimal Outcome',
    statusClass: 'text-[#ff3347]',
    statusDotClass: 'bg-[#ff3347]',
    icon: '✕',
    iconClass: 'text-[#ff3347]',
    iconGlowClass: 'shadow-[0_10px_35px_rgba(255,51,71,0.24)]',
    progressStatus: 'Learning',
    progressStatusClass: 'text-[#f59e0b]',
    insightTitle: 'Corrective Insight',
    insightSubtitle: 'Gap Analysis',
    insight:
      'While the immediate revenue gains are tempting, this decision risks the long-term health of the ecosystem. A Senior PM must weigh short-term metrics against platform stability and user trust.'
  }
} as const;

function getNextChallengeId(challengeId: string) {
  const numericChallengeId = Number.parseInt(challengeId, 10);

  if (Number.isNaN(numericChallengeId)) {
    return `${challengeId}-next`;
  }

  return String(numericChallengeId + 1);
}

export default function FeedbackScreen({
  challengeId,
  variant
}: {
  challengeId: string;
  variant: FeedbackVariant;
}) {
  const searchParams = useSearchParams();
  const content = COPY[variant];
  const nextChallengeId = getNextChallengeId(challengeId);
  const companyId = searchParams.get('companyId');
  const returnToTrackHref = companyId ? `/companies/${companyId}` : '/companies';
  const nextChallengeHref = `/challenge/${nextChallengeId}${companyId ? `?companyId=${companyId}` : ''}`;

  return (
    <main className="mx-auto min-h-screen max-w-[460px] bg-[#eef2f6] px-4 py-6 text-[#0f172a]">
      <section className="mt-12 flex flex-col items-center text-center">
        <div
          className={`inline-flex h-24 w-24 items-center justify-center rounded-[24px] bg-white text-5xl font-bold ${content.iconClass} ${content.iconGlowClass}`}
          aria-hidden
        >
          {content.icon}
        </div>

        <h1 className="mt-10 text-6xl font-black leading-[1.05] tracking-[-0.03em]">
          {content.title}
        </h1>

        <div
          className={`mt-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] ${content.statusClass}`}
        >
          <span className={`h-2 w-2 rounded-full ${content.statusDotClass}`} />
          {content.statusText}
        </div>
      </section>

      <section className="mt-14 rounded-2xl bg-white p-5 shadow-[0_6px_18px_rgba(15,23,42,0.07)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#94a3b8]">
              Challenge Progress
            </p>
            <p className="mt-2 text-[33px] font-black leading-none tracking-[-0.03em] text-[#0f172a]">
              75% Complete
            </p>
            <p className="mt-1 text-sm font-semibold text-[#64748b]">
              Problem 4 of 5
            </p>
          </div>

          <div className="text-right">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#94a3b8]">
              Status
            </p>
            <p
              className={`mt-2 text-xs font-black uppercase tracking-[0.14em] ${content.progressStatusClass}`}
            >
              {content.progressStatus}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-3xl bg-white p-6 shadow-[0_6px_18px_rgba(15,23,42,0.07)]">
        <div>
          <p className="text-3xl font-black tracking-[-0.02em] text-[#0f172a]">
            {content.insightTitle}
          </p>
          <p className="mt-1 text-sm font-black uppercase tracking-[0.14em] text-[#2563eb]">
            {content.insightSubtitle}
          </p>
        </div>

        <div className="mt-5 rounded-3xl bg-[#f3f6fa] p-5">
          <p className="text-xl font-bold leading-relaxed text-[#475569]">
            “{content.insight}”
          </p>
        </div>

        <div className="mt-6">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#94a3b8]">
            Impact
          </p>
          <div className="mt-3 flex gap-2">
            <span className="inline-flex items-center rounded-full bg-[#eaf1ff] px-3 py-1 text-xs font-black uppercase tracking-[0.1em] text-[#3b82f6]">
              ⦿ Strategy
            </span>
            <span className="inline-flex items-center rounded-full bg-[#efecff] px-3 py-1 text-xs font-black uppercase tracking-[0.1em] text-[#6366f1]">
              ◎ Discovery
            </span>
          </div>
        </div>
      </section>

      <div className="mt-6 space-y-3 pb-4">
        <Link
          href={nextChallengeHref}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-[#2563eb] px-4 py-4 text-sm font-black uppercase tracking-[0.12em] text-white"
        >
          Next Challenge
        </Link>
        <Link
          href={returnToTrackHref}
          className="inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-black text-[#2563eb]"
        >
          Return to Track
        </Link>
      </div>
    </main>
  );
}
