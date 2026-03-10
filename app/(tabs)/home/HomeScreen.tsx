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

export default function HomeScreen({
  companyTracks,
  skillTracks,
  userName
}: {
  companyTracks: HomeTrack[];
  skillTracks: HomeTrack[];
  userName: string;
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
    <section className="font-['Geist',-apple-system,system-ui,sans-serif] text-[#0f172b]">
      <header className="mb-4 flex items-start justify-between gap-3">
        <h1 className="text-[24px] font-bold leading-[140%] tracking-[-0.6px]">Product Gym Floor</h1>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase leading-[15px] tracking-[1px] text-[#51a2ff]">Streak</p>
          <p className="mt-1 flex items-center justify-end gap-1 text-[14px] font-bold leading-[20px] text-[#0f172b]">
            <Flame className="h-4 w-4 fill-[#ff7a00] text-[#ff7a00]" />
            12 Days
          </p>
        </div>
      </header>

      <div className="mb-4 h-[57px] w-full rounded-2xl border border-[#dbeafe] bg-white p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-[#dbeafe] p-1.5">
              <Rocket className="h-3.5 w-3.5 text-[#155dfc]" />
            </div>
            <div>
              <p className="text-[11px] font-bold leading-[140%] text-[#0f172b]">7 Days remaining in your Pro trial</p>
            </div>
          </div>
          <button className="rounded-full bg-[#ffb900] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.9px] text-[#461901]">
            Upgrade
          </button>
        </div>
      </div>

      <section className="mb-4 h-[154px] w-full rounded-2xl border border-[#bedbff] bg-[#dbeafe] p-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#155dfc] text-sm font-bold text-white">
            {initials || 'PG'}
          </div>
          <div>
            <h2 className="text-[16px] font-bold leading-normal text-[#0f172b]">{userName}</h2>
            <p className="text-[7px] font-black uppercase leading-none tracking-[0.7px] text-[#155dfc]">Rank #12</p>
          </div>
        </div>

        <p className="mt-4 text-[12px] font-medium text-[#62748e]">Focus: Metrics · Product Sense</p>
        <p className="mt-2 text-[10px] font-bold tracking-[0.5px] text-[#62748e]">12 Challenges completed</p>
      </section>

      <div className="mb-4 h-[39px] w-full rounded-[1000px] border border-[#e2e8f0] bg-[#e2e8f0] p-1">
        <div className="grid h-full grid-cols-3 gap-1">
          <TabButton label="Companies" active={tab === 'companies'} onClick={() => setTab('companies')} />
          <TabButton label="Skill Paths" active={tab === 'skill-paths'} onClick={() => setTab('skill-paths')} />
          <TabButton label="Products" active={tab === 'products'} onClick={() => setTab('products')} />
        </div>
      </div>

      {tab === 'companies' && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0f172b]">Mock Interview Challenges</h3>
            <Link href="/companies/view-all" className="text-[9px] font-bold uppercase tracking-[0.9px] text-[#155dfc]">
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
              <SimpleCard key={track.id} title={track.title} subtitle={track.description ?? 'Skill path'} meta={`${track.moduleCount} challenges`} />
            ))
          )}
        </div>
      )}

      {tab === 'products' && (
        <div className="space-y-4">
          {featuredProducts.map((product) => (
            <SimpleCard key={product.name} title={product.name} subtitle={product.type} meta={`${product.lessons} lessons`} />
          ))}
        </div>
      )}
    </section>
  );
}

function CompanyTrackCard({ track, href }: { track: HomeTrack; href: string }) {
  return (
    <Link href={href} className="block w-full">
      <article className="h-[123px] w-full rounded-2xl border border-[#dbeafe] bg-white p-3">
        <h4 className="text-[16px] font-bold text-[#0f172b]">{track.title}</h4>
        <p className="mt-1 text-[12px] font-medium text-[#62748e]">Focus: {track.description ?? 'Product Sense'}</p>
        <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-[#62748e]">
          <span className="tracking-[0.5px]">{track.moduleCount} Challenges</span>
          <span>{track.practicingCount ?? '1.2K'} practicing</span>
        </div>
      </article>
    </Link>
  );
}

function EmptyState({ message }: { message: string }) {
  return <div className="rounded-2xl border border-[#dbeafe] bg-white p-3 text-[12px] font-medium text-[#62748e]">{message}</div>;
}

function SimpleCard({ title, subtitle, meta }: { title: string; subtitle: string; meta?: string }) {
  return (
    <article className="rounded-2xl border border-[#dbeafe] bg-white p-3">
      <h3 className="text-[16px] font-bold text-[#0f172b]">{title}</h3>
      <p className="text-[12px] font-medium text-[#62748e]">{subtitle}</p>
      {meta ? <p className="mt-2 text-[10px] font-bold tracking-[0.5px] text-[#62748e]">{meta}</p> : null}
    </article>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`h-full rounded-[1000px] px-2 text-[9px] font-bold uppercase tracking-[0.9px] ${active ? 'bg-white text-[#155dfc]' : 'text-[#62748e]'}`}
    >
      {label}
    </button>
  );
}
