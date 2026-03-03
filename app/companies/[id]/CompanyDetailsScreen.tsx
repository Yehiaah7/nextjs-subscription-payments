'use client';

import { ChevronLeft, Clock3, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

export type ChallengeStatus = 'in-progress' | 'not-solved' | 'solved';

export type CompanyChallenge = {
  id: string;
  trackId: string;
  title: string;
  status: ChallengeStatus;
  practicingCount: string;
  duration: string;
};

type FilterTab = 'all' | ChallengeStatus;

const FILTERS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'in-progress', label: 'In-progress' },
  { key: 'not-solved', label: 'Not solved' },
  { key: 'solved', label: 'Solved' }
];

const STATUS_STYLES: Record<ChallengeStatus, string> = {
  'in-progress': 'bg-[#fff7ed] text-[#f97316]',
  'not-solved': 'bg-[#fee2e2] text-[#dc2626]',
  solved: 'bg-[#dcfce7] text-[#16a34a]'
};

const STATUS_LABELS: Record<ChallengeStatus, string> = {
  'in-progress': 'In-progress',
  'not-solved': 'Not solved',
  solved: 'Solved'
};

export default function CompanyDetailsScreen({
  company,
  challenges,
  progressPercent
}: {
  company: { id: string; title: string; description: string | null };
  challenges: CompanyChallenge[];
  progressPercent: number;
}) {
  const [filter, setFilter] = useState<FilterTab>('all');

  const filteredChallenges = useMemo(() => {
    if (filter === 'all') return challenges;
    return challenges.filter((challenge) => challenge.status === filter);
  }, [challenges, filter]);

  return (
    <section className="min-h-dvh bg-[#e9edf3] px-4 py-6 text-[#1f2937]">
      <div className="mx-auto w-full max-w-[590px]">
        <header className="mb-5 flex items-center gap-3">
          <Link
            href="/companies"
            className="grid h-9 w-9 place-items-center rounded-xl bg-[#edf1f6] text-[#94a3b8]"
            aria-label="Back to companies"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-[44px] font-bold leading-none tracking-[-0.02em] text-[#111827]">
            Company Details
          </h1>
        </header>

        <article className="mb-4 rounded-3xl bg-[#f3f4f6] p-4">
          <div className="mb-3 flex items-start gap-3">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-3xl font-bold text-[#4285f4]">
              {company.title.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-[38px] font-bold leading-none text-[#1f2937]">{company.title}</h2>
              <p className="mt-1 text-2xl font-semibold leading-tight text-[#64748b]">
                {company.description ?? 'Interview challenge collection'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 rounded-full bg-[#e2e8f0]">
              <div
                className="h-full rounded-full bg-[#2563eb]"
                style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }}
              />
            </div>
            <span className="text-lg font-bold text-[#94a3b8]">{progressPercent}% complete</span>
          </div>
        </article>

        <div className="mb-4 grid grid-cols-4 rounded-full bg-[#dce3ec] p-1 text-center text-sm font-semibold text-[#64748b]">
          {FILTERS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`rounded-full px-2 py-2 transition ${
                filter === tab.key ? 'bg-white text-[#111827]' : 'hover:text-[#111827]'
              }`}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-3 pb-8">
          {filteredChallenges.map((challenge) => (
            <Link
              key={challenge.id}
              href={`/challenge/${challenge.trackId}/${challenge.id}`}
              className="block rounded-3xl bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-[32px] font-bold leading-tight text-[#1f2937]">{challenge.title}</h3>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-bold uppercase tracking-[0.04em] ${STATUS_STYLES[challenge.status]}`}
                >
                  {STATUS_LABELS[challenge.status]}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-4 text-lg font-bold text-[#94a3b8]">
                <span className="flex items-center gap-1">
                  <UserRound className="h-4 w-4" />
                  {challenge.practicingCount} practicing
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
