'use client';

import { ChevronDown, ChevronLeft, ChevronRight, CircleDot, Clock3, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

export type ChallengeStatus = 'in-progress' | 'not-solved' | 'solved';

export type CompanyChallenge = {
  id: string;
  title: string;
  status: ChallengeStatus;
  practicingCount: string;
  duration: string;
};

type FilterTab = 'all' | ChallengeStatus;

const FILTERS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'ALL' },
  { key: 'in-progress', label: 'IN-PROGRESS' },
  { key: 'not-solved', label: 'NOT SOLVED' },
  { key: 'solved', label: 'SOLVED' }
];

const STATUS_STYLES: Record<ChallengeStatus, string> = {
  'in-progress': 'bg-[#fff7ed] text-[#f97316]',
  'not-solved': 'bg-[#fee2e2] text-[#dc2626]',
  solved: 'bg-[#dcfce7] text-[#16a34a]'
};

const STATUS_LABELS: Record<ChallengeStatus, string> = {
  'in-progress': 'IN PROGRESS',
  'not-solved': 'NOT SOLVED',
  solved: 'SOLVED'
};

function GoogleGlyph() {
  return (
    <span className="text-[24px] font-black leading-none" aria-hidden>
      <span className="text-[#4285f4]">G</span>
      <span className="text-[#ea4335]">•</span>
      <span className="text-[#fbbc05]">•</span>
      <span className="text-[#34a853]">•</span>
    </span>
  );
}

export default function CompanyDetailsScreen({
  company,
  challenges,
  progressPercent,
  practicingCount
}: {
  company: { id: string; title: string; description: string | null };
  challenges: CompanyChallenge[];
  progressPercent: number;
  practicingCount: string;
}) {
  const [filter, setFilter] = useState<FilterTab>('all');

  const filteredChallenges = useMemo(() => {
    if (filter === 'all') return challenges;
    return challenges.filter((challenge) => challenge.status === filter);
  }, [challenges, filter]);

  return (
    <section className="min-h-dvh bg-[#e9edf3] px-4 py-6 text-[#1f2937]">
      <div className="mx-auto w-full max-w-[560px]">
        <header className="mb-4 flex items-center gap-3">
          <Link
            href="/companies"
            className="grid h-9 w-9 place-items-center rounded-xl bg-[#edf1f6] text-[#94a3b8]"
            aria-label="Back to companies"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-5xl font-bold leading-none tracking-[-0.02em] text-[#1f2937]">
            {company.title}
          </h1>
        </header>

        <article className="mb-5 rounded-3xl bg-[#f3f5f7] p-4">
          <div className="mb-3 flex items-start gap-3">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white">
              <GoogleGlyph />
            </div>
            <div>
              <h2 className="text-[40px] font-bold leading-none text-[#1f2937]">{company.title}</h2>
              <p className="mt-1 text-[24px] font-semibold leading-tight text-[#7d8ea5]">
                Focus: {company.description ?? 'Metrics · Product Sense'}
              </p>
              <div className="mt-1 flex items-center gap-3 text-lg font-bold uppercase tracking-[0.03em] text-[#9caabf]">
                <span className="flex items-center gap-1">
                  <CircleDot className="h-4 w-4" />
                  {challenges.length} Challenges
                </span>
                <span className="flex items-center gap-1">
                  <UserRound className="h-4 w-4" />
                  {practicingCount} Practicing
                </span>
              </div>
            </div>
          </div>

          <div className="mb-1 flex items-center justify-between text-base font-bold uppercase tracking-[0.06em]">
            <span className="text-[#90a0b6]">Learning Progress</span>
            <span className="text-[#2563eb]">{progressPercent}% Complete</span>
          </div>
          <div className="h-2.5 rounded-full bg-[#e4eaf1]">
            <div
              className="h-full rounded-full bg-[#2563eb]"
              style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }}
            />
          </div>
        </article>

        <div className="mb-4 flex items-center gap-2 text-[42px] font-bold leading-none text-[#1f2937]">
          <span>Practice</span>
          <span className="inline-flex items-center gap-1 text-[#2563eb]">
            JUNIOR
            <ChevronDown className="h-5 w-5" />
          </span>
        </div>

        <div className="mb-4 grid grid-cols-4 rounded-full bg-[#dce3ec] p-1 text-center text-sm font-bold tracking-[0.02em] text-[#7f91a8]">
          {FILTERS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`rounded-full px-2 py-2 transition ${
                filter === tab.key ? 'bg-white text-[#2563eb] shadow-[0_1px_3px_rgba(0,0,0,0.08)]' : ''
              }`}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-3 pb-8">
          {filteredChallenges.map((challenge) => (
            <Link key={challenge.id} href={`/challenge/${challenge.id}`} className="block rounded-3xl bg-[#f3f5f7] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-[38px] font-bold leading-tight text-[#1f2937]">{challenge.title}</h3>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-[0.08em] ${STATUS_STYLES[challenge.status]}`}
                  >
                    {STATUS_LABELS[challenge.status]}
                  </span>
                </div>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#edf1f6] text-[#c1ccdb]">
                  <ChevronRight className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-1 flex items-center gap-4 text-lg font-bold uppercase tracking-[0.03em] text-[#9caabf]">
                <span className="flex items-center gap-1">
                  <UserRound className="h-4 w-4" />
                  {challenge.practicingCount} Practicing
                </span>
                <span className="flex items-center gap-1">
                  <Clock3 className="h-4 w-4" />
                  {challenge.duration}
                </span>
              </div>
            </Link>
          ))}

          {filteredChallenges.length === 0 && (
            <div className="rounded-3xl bg-white p-5 text-center text-xl font-semibold text-[#94a3b8]">
              No challenges in this filter yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
