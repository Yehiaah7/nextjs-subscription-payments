'use client';

import { ChevronDown, ChevronLeft, ChevronRight, CircleDot, Clock3, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

export type ChallengeStatus = 'in-progress' | 'not-solved' | 'solved';
export type CompanyChallenge = { id: string; title: string; status: ChallengeStatus; practicingCount: string; duration: string; };
type FilterTab = 'all' | ChallengeStatus;

const FILTERS: { key: FilterTab; label: string }[] = [{ key: 'all', label: 'ALL' }, { key: 'in-progress', label: 'IN-PROGRESS' }, { key: 'not-solved', label: 'NOT SOLVED' }, { key: 'solved', label: 'SOLVED' }];
const STATUS_STYLES: Record<ChallengeStatus, string> = { 'in-progress': 'bg-amber-100 text-amber-600', 'not-solved': 'bg-red-100 text-red-600', solved: 'bg-green-100 text-green-600' };
const STATUS_LABELS: Record<ChallengeStatus, string> = { 'in-progress': 'IN PROGRESS', 'not-solved': 'NOT SOLVED', solved: 'SOLVED' };

export default function CompanyDetailsScreen({ company, challenges, progressPercent, practicingCount }: { company: { id: string; title: string; description: string | null }; challenges: CompanyChallenge[]; progressPercent: number; practicingCount: string; }) {
  const [filter, setFilter] = useState<FilterTab>('all');
  const filteredChallenges = useMemo(() => (filter === 'all' ? challenges : challenges.filter((challenge) => challenge.status === filter)), [challenges, filter]);

  return (
    <section>
      <header className="mb-4 flex items-center gap-3"><Link href="/home" className="grid h-9 w-9 place-items-center rounded-button bg-surface-muted text-muted" aria-label="Back to companies"><ChevronLeft className="h-5 w-5" /></Link><h1 className="t-title">{company.title}</h1></header>
      <article className="app-card mb-5"><h2 className="t-card-title text-[22px]">{company.title}</h2><p className="t-body-muted">Focus: {company.description ?? 'Metrics · Product Sense'}</p><div className="t-label mt-1 flex items-center gap-3 text-muted"><span className="flex items-center gap-1"><CircleDot className="h-4 w-4" />{challenges.length} Challenges</span><span className="flex items-center gap-1"><UserRound className="h-4 w-4" />{practicingCount} Practicing</span></div><div className="mt-3 h-2.5 rounded-pill bg-surface-soft"><div className="h-full rounded-pill bg-primary" style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }} /></div></article>
      <div className="mb-4 flex items-center gap-2"><span className="t-card-title">Practice</span><span className="inline-flex items-center gap-1 text-primary t-label">JUNIOR<ChevronDown className="h-4 w-4" /></span></div>
      <div className="app-segment mb-4 grid grid-cols-4 text-center">{FILTERS.map((tab)=><button key={tab.key} onClick={() => setFilter(tab.key)} className={`rounded-pill px-2 t-label ${filter===tab.key?'bg-container text-primary shadow-button':'text-muted'}`} type="button">{tab.label}</button>)}</div>
      <div className="space-y-3 pb-8">{filteredChallenges.map((challenge)=><Link key={challenge.id} href={`/challenge/${company.id}?company=${company.id}`} className="app-card block"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><h3 className="t-card-title">{challenge.title}</h3><span className={`rounded-pill px-3 py-1 t-label ${STATUS_STYLES[challenge.status]}`}>{STATUS_LABELS[challenge.status]}</span></div><span className="grid h-8 w-8 place-items-center rounded-pill bg-surface-muted text-muted"><ChevronRight className="h-4 w-4" /></span></div><div className="t-label mt-2 flex items-center gap-3 text-muted"><span className="inline-flex items-center gap-1"><UserRound className="h-3.5 w-3.5" />{challenge.practicingCount} practicing</span><span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{challenge.duration}</span></div></Link>)}</div>
    </section>
  );
}
