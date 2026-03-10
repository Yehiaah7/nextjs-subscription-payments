'use client';

import Link from 'next/link';
import { CheckCircle2, ChevronRight, Flame, Rocket, Trophy, UserRound } from 'lucide-react';
import { ReactNode, useMemo, useState } from 'react';
import { getCompanyHref } from '@/app/(authenticated)/companies/navigation';

type MainTab = 'companies' | 'skill-paths' | 'products';

export type HomeTrack = {
  id: string;
  title: string;
  description: string | null;
  moduleCount: number;
  practicingCount?: string;
  progress?: number;
};

type UserStats = {
  rank: string;
  solved: string;
  solvingDays: string;
};

const featuredProducts = [
  { name: 'Instagram', type: 'Social Product', lessons: 12 },
  { name: 'Notion', type: 'Productivity Suite', lessons: 9 },
  { name: 'Canva', type: 'Design Platform', lessons: 8 }
];

export default function HomeScreen({
  companyTracks,
  skillTracks,
  userName,
  userStats
}: {
  companyTracks: HomeTrack[];
  skillTracks: HomeTrack[];
  userName: string;
  userStats: UserStats;
}) {
  const [tab, setTab] = useState<MainTab>('companies');
  const initials = useMemo(
    () =>
      userName
        .split(' ')
        .slice(0, 2)
        .map((name) => name[0]?.toUpperCase())
        .join(''),
    [userName]
  );

  return (
    <section className="text-text">
      <header className="mb-4 flex items-start justify-between gap-3">
        <h1 className="t-title">Product Gym Floor</h1>
        <div className="text-right">
          <p className="t-label text-primary">Streak</p>
          <p className="t-streak mt-1 flex items-center justify-end gap-1">
            <Flame className="h-4 w-4 fill-orange-500 text-orange-500" />12 Days
          </p>
        </div>
      </header>

      <div className="app-card mb-4 border border-primary-soft">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary-soft p-1.5">
              <Rocket className="h-3.5 w-3.5 text-primary" />
            </div>
            <p className="text-[11px] font-bold">7 Days remaining in your Pro trial</p>
          </div>
          <button className="rounded-pill bg-amber-400 px-2.5 py-1 t-label text-amber-950">Upgrade</button>
        </div>
      </div>

      <section
        className="app-card mb-4 border"
        style={{
          backgroundColor: '#dbeafe',
          borderColor: '#bedbff'
        }}
      >
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#60a5fa] text-sm font-bold text-white">
            {initials || 'PG'}
          </div>
          <div>
            <h2 className="text-[16px] font-bold leading-[1.35] text-[#0f172a]">{userName}</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#2563eb]">PRODUCT GYM MEMBER</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <StatTile icon={<Trophy className="h-3.5 w-3.5" />} label="Rank" value={userStats.rank} />
          <StatTile icon={<CheckCircle2 className="h-3.5 w-3.5" />} label="Solved" value={userStats.solved} />
          <StatTile icon={<Flame className="h-3.5 w-3.5" />} label="Solving Days" value={userStats.solvingDays} />
        </div>
      </section>

      <div className="app-segment mb-4">
        <div className="grid h-full grid-cols-3 gap-1">
          <TabButton label="Companies" active={tab === 'companies'} onClick={() => setTab('companies')} />
          <TabButton label="Skill Paths" active={tab === 'skill-paths'} onClick={() => setTab('skill-paths')} />
          <TabButton label="Products" active={tab === 'products'} onClick={() => setTab('products')} />
        </div>
      </div>

      {tab === 'companies' && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="t-card-title">Mock Interview Challenges</h3>
            <Link href="/companies/view-all" className="t-label text-primary">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {companyTracks.length === 0 ? (
              <EmptyState message="No company challenges yet." />
            ) : (
              companyTracks.map((track) => (
                <CompanyTrackCard key={track.id} track={track} href={getCompanyHref(track.id)} />
              ))
            )}
          </div>
        </section>
      )}
      {tab === 'skill-paths' && (
        <div className="space-y-4">
          {skillTracks.length === 0 ? (
            <EmptyState message="No skill path challenges yet." />
          ) : (
            skillTracks.map((track) => (
              <SimpleCard
                key={track.id}
                title={track.title}
                subtitle={track.description ?? 'Skill path'}
                meta={`${track.moduleCount} challenges`}
              />
            ))
          )}
        </div>
      )}
      {tab === 'products' && (
        <div className="space-y-4">
          {featuredProducts.map((product) => (
            <SimpleCard
              key={product.name}
              title={product.name}
              subtitle={product.type}
              meta={`${product.lessons} lessons`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function StatTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <article className="rounded-xl bg-[#eff6ff] px-2 py-2 text-center">
      <div className="mb-1 inline-flex items-center justify-center rounded-full bg-white p-1 text-primary">{icon}</div>
      <p className="text-[9px] font-black uppercase tracking-[0.1em] text-[#64748b]">{label}</p>
      <p className="mt-1 text-[20px] font-bold leading-none text-[#0f172a]">{value}</p>
    </article>
  );
}

function CompanyTrackCard({ track, href }: { track: HomeTrack; href: string }) {
  const boundedProgress = Math.max(0, Math.min(100, track.progress ?? 45));

  return (
    <Link href={href} className="block w-full">
      <article className="app-card border border-primary-soft">
        <div className="mb-3 flex items-start gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#f1f5f9]">
            <div className="grid h-9 w-9 place-items-center rounded-[10px] bg-white text-sm font-bold text-[#0f172a]">
              {track.title[0] ?? 'C'}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-[16px] font-bold text-[#0f172a]">{track.title}</h4>
            <p className="mt-0.5 truncate text-[12px] font-medium text-[#64748b]">
              {track.description ?? 'Product Sense'}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#64748b]">
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {track.moduleCount} Challenges
              </span>
              <span className="inline-flex items-center gap-1">
                <UserRound className="h-3.5 w-3.5" />
                {track.practicingCount ?? '1.2K'} Practicing
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 rounded-pill bg-[#e2e8f0]">
            <div className="h-full rounded-pill bg-primary" style={{ width: `${boundedProgress}%` }} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.1em] text-primary">{boundedProgress}%</span>
          <span className="text-[10px] font-black uppercase tracking-[0.1em] text-primary">Resume</span>
          <span className="grid h-7 w-7 place-items-center rounded-full bg-primary-soft text-primary" aria-label={`Resume ${track.title}`}>
            <ChevronRight className="h-4 w-4" />
          </span>
        </div>
      </article>
    </Link>
  );
}

function EmptyState({ message }: { message: string }) {
  return <div className="app-card t-body-muted border border-primary-soft">{message}</div>;
}

function SimpleCard({ title, subtitle, meta }: { title: string; subtitle: string; meta?: string }) {
  return (
    <article className="app-card border border-primary-soft">
      <h3 className="t-card-title">{title}</h3>
      <p className="t-body-muted">{subtitle}</p>
      {meta ? <p className="t-label mt-2 text-muted">{meta}</p> : null}
    </article>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`h-full rounded-pill px-2 t-label ${active ? 'bg-container text-primary shadow-button' : 'text-muted'}`}
    >
      {label}
    </button>
  );
}
