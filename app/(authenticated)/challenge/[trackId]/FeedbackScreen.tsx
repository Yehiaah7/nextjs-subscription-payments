'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type FeedbackVariant = 'correct' | 'wrong';

type VariantCopy = {
  title: string;
  statusText: string;
  statusTextClass: string;
  topContainerClass: string;
  topContainerShadow: string;
  icon: string;
  iconClass: string;
  progressStatus: string;
  progressChipClass: string;
  insightTitle: string;
  insightSubtitle: string;
  insight: string;
};

const COPY: Record<FeedbackVariant, VariantCopy> = {
  correct: {
    title: 'Decision Correct',
    statusText: 'High Strategic Precision',
    statusTextClass: 'text-[#009966]',
    topContainerClass: 'bg-[#eff2ff] border-[#c6d2ff]',
    topContainerShadow: 'shadow-[0_25px_50px_-12px_rgba(0,188,125,0.45)]',
    icon: '✓',
    iconClass: 'text-[#009966]',
    progressStatus: 'Mastery',
    progressChipClass: 'bg-[#ecfdf3] text-[#009966]',
    insightTitle: 'Strategic Logic',
    insightSubtitle: 'Validation',
    insight:
      'At this scale, you’re not just managing a product; you’re managing trust. A 15% drop is painful, but a compromised reputation is fatal. You chose the long-game—exactly what a Senior PM should do.'
  },
  wrong: {
    title: 'Decision Incorrect',
    statusText: 'Suboptimal Outcome',
    statusTextClass: 'text-[#e7000b]',
    topContainerClass: 'bg-[#eff2ff] border-[#c6d2ff]',
    topContainerShadow: 'shadow-[0_25px_50px_-12px_rgba(251,44,54,0.45)]',
    icon: '✕',
    iconClass: 'text-[#e7000b]',
    progressStatus: 'In Progress',
    progressChipClass: 'bg-[#fffbeb] text-[#e17100]',
    insightTitle: 'Corrective Insight',
    insightSubtitle: 'Gap Analysis',
    insight:
      'While the immediate revenue gains are tempting, this decision risks the long-term health of the ecosystem. A Senior PM must weigh short-term metrics against platform stability and user trust.'
  }
};

function ChallengeResultScreen({
  variant,
  nextChallengeHref,
  returnToTrackHref
}: {
  variant: FeedbackVariant;
  nextChallengeHref: string;
  returnToTrackHref: string;
}) {
  const content = COPY[variant];

  return (
    <section className="mx-auto flex w-full max-w-[361px] flex-col gap-4 pb-4 text-[#0f172b]">
      <section className="flex flex-col items-center text-center">
        <div
          className={`inline-flex h-[74px] items-center justify-center rounded-full border px-6 ${content.topContainerClass} ${content.topContainerShadow}`}
          aria-hidden
        >
          <span className={`text-[30px] font-bold ${content.iconClass}`}>{content.icon}</span>
        </div>

        <h1 className="mt-4 text-[40px] font-bold leading-[1.05] tracking-[-0.03em]">
          {content.title}
        </h1>

        <p
          className={`mt-2 text-[10px] font-black uppercase tracking-[0.1em] ${content.statusTextClass}`}
        >
          {content.statusText}
        </p>
      </section>

      <section className="h-[78px] w-full rounded-2xl bg-white p-3 shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-[#64748b]">
              Challenge Progress
            </p>
            <p className="mt-1 text-sm font-black leading-none text-[#0f172b]">75% Complete</p>
            <p className="mt-1 text-[10px] font-bold leading-3 text-[#62748e]">Problem 4 of 5</p>
          </div>

          <span
            className={`inline-flex rounded-[1000px] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.06em] ${content.progressChipClass}`}
          >
            {content.progressStatus}
          </span>
        </div>
      </section>

      <section className="w-full rounded-2xl bg-white p-3 shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
        <p className="text-lg font-bold leading-6 text-[#0f172b]">{content.insightTitle}</p>
        <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#155dfc]">
          {content.insightSubtitle}
        </p>

        <div className="mt-3 rounded-2xl bg-[#f8fafc] p-3">
          <p className="text-sm font-medium leading-[22.75px] text-[#45556c]">“{content.insight}”</p>
        </div>
      </section>

      <div className="space-y-2 pt-1">
        <Link
          href={nextChallengeHref}
          className="inline-flex h-[45px] w-full items-center justify-center rounded-2xl bg-[#155dfc] text-sm font-bold text-white"
        >
          Next Challenge
        </Link>
        <Link
          href={returnToTrackHref}
          className="inline-flex w-full items-center justify-center py-2 text-sm font-bold text-[#155dfc]"
        >
          Return to Track
        </Link>
      </div>
    </section>
  );
}

export default function FeedbackScreen({ variant }: { variant: FeedbackVariant }) {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('company');
  const returnToTrackHref = companyId ? `/companies/${companyId}` : '/home';
  const nextChallengeHref = returnToTrackHref;

  return (
    <ChallengeResultScreen
      variant={variant}
      nextChallengeHref={nextChallengeHref}
      returnToTrackHref={returnToTrackHref}
    />
  );
}
