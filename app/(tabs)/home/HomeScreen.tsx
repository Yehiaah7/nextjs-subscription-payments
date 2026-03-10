'use client';

import Link from 'next/link';
import { Flame, Rocket } from 'lucide-react';
import { useMemo, useState } from 'react';
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

const featuredProducts = [
  { name: 'Instagram', type: 'Social Product', lessons: 12 },
  { name: 'Notion', type: 'Productivity Suite', lessons: 9 },
  { name: 'Canva', type: 'Design Platform', lessons: 8 }
];

export default function HomeScreen({ companyTracks, skillTracks, userName }: { companyTracks: HomeTrack[]; skillTracks: HomeTrack[]; userName: string; }) {
  const [tab, setTab] = useState<MainTab>('companies');
  const initials = useMemo(() => userName.split(' ').slice(0, 2).map((name) => name[0]?.toUpperCase()).join(''), [userName]);

  return (
    <section className="text-text">
      <header className="mb-4 flex items-start justify-between gap-3">
        <h1 className="t-title">Product Gym Floor</h1>
        <div className="text-right">
          <p className="t-label text-primary">Streak</p>
          <p className="t-streak mt-1 flex items-center justify-end gap-1"><Flame className="h-4 w-4 fill-orange-500 text-orange-500" />12 Days</p>
        </div>
      </header>

      <div className="app-card mb-4 border border-primary-soft">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary-soft p-1.5"><Rocket className="h-3.5 w-3.5 text-primary" /></div>
            <p className="text-[11px] font-bold">7 Days remaining in your Pro trial</p>
          </div>
          <button className="rounded-pill bg-amber-400 px-2.5 py-1 t-label text-amber-950">Upgrade</button>
        </div>
      </div>

      <section className="app-card mb-4 border border-primary-soft bg-primary-soft/90">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-sm font-bold text-white">{initials || 'PG'}</div>
          <div>
            <h2 className="t-card-title">{userName}</h2>
            <p className="t-label text-primary">Rank #12</p>
          </div>
        </div>
        <p className="t-body-muted mt-4">Focus: Metrics · Product Sense</p>
        <p className="t-label mt-2 text-muted">12 Challenges completed</p>
      </section>

      <div className="app-segment mb-4"><div className="grid h-full grid-cols-3 gap-1"><TabButton label="Companies" active={tab === 'companies'} onClick={() => setTab('companies')} /><TabButton label="Skill Paths" active={tab === 'skill-paths'} onClick={() => setTab('skill-paths')} /><TabButton label="Products" active={tab === 'products'} onClick={() => setTab('products')} /></div></div>

      {tab === 'companies' && <section><div className="mb-3 flex items-center justify-between"><h3 className="t-card-title">Mock Interview Challenges</h3><Link href="/companies/view-all" className="t-label text-primary">View all</Link></div><div className="space-y-4">{companyTracks.length===0?<EmptyState message="No company challenges yet." />:companyTracks.map((track)=><CompanyTrackCard key={track.id} track={track} href={getCompanyHref(track.id)} />)}</div></section>}
      {tab === 'skill-paths' && <div className="space-y-4">{skillTracks.length===0?<EmptyState message="No skill path challenges yet." />:skillTracks.map((track)=><SimpleCard key={track.id} title={track.title} subtitle={track.description ?? 'Skill path'} meta={`${track.moduleCount} challenges`} />)}</div>}
      {tab === 'products' && <div className="space-y-4">{featuredProducts.map((product)=><SimpleCard key={product.name} title={product.name} subtitle={product.type} meta={`${product.lessons} lessons`} />)}</div>}
    </section>
  );
}

function CompanyTrackCard({ track, href }: { track: HomeTrack; href: string }) {
  return <Link href={href} className="block w-full"><article className="app-card border border-primary-soft"><h4 className="t-card-title">{track.title}</h4><p className="t-body-muted mt-1">Focus: {track.description ?? 'Product Sense'}</p><div className="t-label mt-2 flex items-center justify-between text-muted"><span>{track.moduleCount} Challenges</span><span>{track.practicingCount ?? '1.2K'} practicing</span></div></article></Link>;
}

function EmptyState({ message }: { message: string }) { return <div className="app-card t-body-muted border border-primary-soft">{message}</div>; }

function SimpleCard({ title, subtitle, meta }: { title: string; subtitle: string; meta?: string }) {
  return <article className="app-card border border-primary-soft"><h3 className="t-card-title">{title}</h3><p className="t-body-muted">{subtitle}</p>{meta ? <p className="t-label mt-2 text-muted">{meta}</p> : null}</article>;
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return <button onClick={onClick} className={`h-full rounded-pill px-2 t-label ${active ? 'bg-container text-primary shadow-button' : 'text-muted'}`}>{label}</button>;
}
