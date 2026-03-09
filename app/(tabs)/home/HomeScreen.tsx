'use client';

import { ChevronDown, ChevronRight, Flame, Rocket, Trophy, Users } from 'lucide-react';
import MobileScreen from '@/components/mobile/MobileScreen';
import { type ReactNode, useMemo, useState } from 'react';
import Link from 'next/link';
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
    <MobileScreen>
      <header className="mb-4 flex items-start justify-between">
        <h1 className="text-[42px] font-black leading-[0.95] text-[#101827]">
          Product Gym Floor
        </h1>
        <div className="pt-1 text-right">
          <p className="text-xs font-black uppercase tracking-[0.08em] text-[#2f6df6]">
            Streak ⓘ
          </p>
          <p className="flex items-center justify-end gap-1 text-[34px] font-black leading-none text-[#ff6a00]">
            <Flame className="h-8 w-8 fill-[#ff6a00] text-[#ff6a00]" />12 Days
          </p>
        </div>
      </header>

      <div className="mb-4 flex items-center justify-between rounded-2xl bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#edf3ff] p-2">
            <Rocket className="h-4 w-4 text-[#2f6df6]" />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.08em] text-[#2f6df6]">
              Free trial active
            </p>
            <p className="text-sm font-semibold text-[#64748b]">
              7 days remaining in your Pro trial
            </p>
          </div>
        </div>
        <button className="rounded-full bg-[#f8b500] px-4 py-2 text-sm font-black uppercase text-[#101827]">
          Upgrade
        </button>
      </div>

      <section className="mb-4 rounded-3xl bg-[#bfd4f3] p-4">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#2f6df6] text-lg font-black text-white">
            {initials || 'PG'}
          </div>
          <div>
            <h2 className="text-[34px] font-black leading-none text-[#101827]">{userName}</h2>
            <p className="text-sm font-black uppercase tracking-[0.08em] text-[#2f6df6]">
              Product gym member
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <StatPill title="Rank" value="#12" icon={<Trophy className="h-4 w-4 text-[#f7b500]" />} />
          <StatPill title="Solved" value="42" icon={<div className="h-2.5 w-2.5 rounded-full border-2 border-[#2ec39a]" />} />
          <StatPill title="Solving Days" value="32" icon={<div className="h-3.5 w-3.5 rounded-sm border border-[#f39b45]" />} />
        </div>
      </section>

      <p className="mb-3 text-[38px] font-black leading-none text-[#101827]">
        Practice <span className="text-[#2f6df6]">JUNIOR</span>
        <ChevronDown className="mb-1 inline h-6 w-6 text-[#2f6df6]" /> PM skills with:
      </p>

      <div className="mb-4 grid grid-cols-3 rounded-full bg-[#dce3ec] p-1 text-center">
        <TabButton label="Companies" active={tab === 'companies'} onClick={() => setTab('companies')} />
        <TabButton label="Skill Paths" active={tab === 'skill-paths'} onClick={() => setTab('skill-paths')} />
        <TabButton label="Products" active={tab === 'products'} onClick={() => setTab('products')} />
      </div>

      {tab === 'companies' && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[34px] font-black leading-none text-[#101827]">
              Mock Interview Challenges
            </p>
            <Link
              href="/companies/view-all"
              className="text-sm font-black uppercase tracking-[0.08em] text-[#2563eb]"
            >
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {companyTracks.length === 0 ? (
              <EmptyState message="No company challenges yet." />
            ) : (
              companyTracks.map((track) => (
                <CompanyTrackCard key={track.id} track={track} href={getCompanyHref(track.id)} />
              ))
            )}
          </div>
        </div>
      )}

      {tab === 'skill-paths' && (
        <div className="space-y-3">
          {skillTracks.length === 0 ? (
            <EmptyState message="No skill path challenges yet." />
          ) : (
            skillTracks.map((track) => (
              <SimpleCard key={track.id} title={track.title} subtitle={track.description ?? 'Skill path'} icon={<Users className="h-5 w-5 text-[#2563eb]" />} />
            ))
          )}
        </div>
      )}

      {tab === 'products' && (
        <div className="space-y-3">
          {featuredProducts.map((product) => (
            <SimpleCard key={product.name} title={product.name} subtitle={product.type} meta={`${product.lessons} lessons`} />
          ))}
        </div>
      )}
    </MobileScreen>
  );
}

function CompanyTrackCard({
  track,
  href
}: {
  track: HomeTrack;
  href: string;
}) {
  const progress = Math.max(0, Math.min(track.progress ?? 45, 100));
  const card = (
    <article className="rounded-3xl bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#f3f5f9] text-[30px] font-black text-[#4385f4]">
          G
        </div>
        <div className="flex-1">
          <h3 className="text-[42px] font-black leading-none text-[#101827]">{track.title}</h3>
          <p className="text-sm font-semibold text-[#64748b]">Focus: {track.description ?? 'Product sense'}</p>
          <div className="mt-2 flex items-center gap-4 text-xs font-black uppercase tracking-[0.08em] text-[#94a3b8]">
            <span>◎ {track.moduleCount} Challenges</span>
            <span>⚭ {track.practicingCount ?? '1.2K'} Practicing</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="h-2 flex-1 rounded-full bg-[#e9edf3]">
          <div className="h-full rounded-full bg-[#2f6df6]" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-sm font-black text-[#64748b]">{progress}%</p>
        <p className="text-sm font-black uppercase tracking-[0.08em] text-[#2563eb]">Resume</p>
        <ChevronRight className="h-5 w-5 rounded-full bg-[#edf3ff] p-1 text-[#2f6df6]" />
      </div>
    </article>
  );

  return <Link href={href} className="block cursor-pointer">{card}</Link>;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-3xl bg-white p-4 text-center text-sm font-semibold text-[#94a3b8]">
      {message}
    </div>
  );
}

function StatPill({
  title,
  value,
  icon
}: {
  title: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-[#e9edf3] px-2 py-3">
      <div className="mb-1 flex justify-center">{icon}</div>
      <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#7f8ba0]">{title}</p>
      <p className="text-[30px] font-black leading-none text-[#101827]">{value}</p>
    </div>
  );
}

function SimpleCard({
  title,
  subtitle,
  icon,
  meta
}: {
  title: string;
  subtitle: string;
  icon?: ReactNode;
  meta?: string;
}) {
  return (
    <article className="rounded-3xl bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-2xl font-bold text-[#111827]">{title}</h3>
          <p className="text-sm font-medium text-[#64748b]">{subtitle}</p>
          {meta ? (
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.08em] text-[#94a3b8]">{meta}</p>
          ) : null}
        </div>
        {icon}
      </div>
    </article>
  );
}

function TabButton({
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
      className={`rounded-full px-2 py-2 text-xs font-black uppercase tracking-[0.08em] ${
        active ? 'bg-white text-[#2563eb]' : 'text-[#64748b]'
      }`}
    >
      {label}
    </button>
  );
}
