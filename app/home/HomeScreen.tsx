'use client';

import { Briefcase, Clock3, Package, Users } from 'lucide-react';
import MobileScreen from '@/components/mobile/MobileScreen';
import { type ReactNode, useState } from 'react';
import Link from 'next/link';
import { getCompanyHref } from '../companies/navigation';

type MainTab = 'companies' | 'skill-paths' | 'products';

export type HomeTrack = {
  id: string;
  title: string;
  description: string | null;
  moduleCount: number;
};

const featuredProducts = [
  { name: 'Instagram', type: 'Social Product', lessons: 12 },
  { name: 'Notion', type: 'Productivity Suite', lessons: 9 },
  { name: 'Canva', type: 'Design Platform', lessons: 8 }
];

export default function HomeScreen({
  companyTracks,
  skillTracks
}: {
  companyTracks: HomeTrack[];
  skillTracks: HomeTrack[];
}) {
  const [tab, setTab] = useState<MainTab>('companies');

  return (
    <MobileScreen>
      <header className="mb-5">
        <h1 className="text-4xl font-bold text-[#111827]">Practice Hub</h1>
        <p className="mt-1 text-base font-medium text-[#64748b]">
          Daily mobile practice for PM interviews.
        </p>
      </header>

      <div className="mb-5 grid grid-cols-3 rounded-full bg-[#dce3ec] p-1 text-center">
        <TabButton
          label="Companies"
          active={tab === 'companies'}
          onClick={() => setTab('companies')}
        />
        <TabButton
          label="Skill Paths"
          active={tab === 'skill-paths'}
          onClick={() => setTab('skill-paths')}
        />
        <TabButton
          label="Products"
          active={tab === 'products'}
          onClick={() => setTab('products')}
        />
      </div>

      {tab === 'companies' && (
        <div className="space-y-3">
          {companyTracks.length === 0 ? (
            <EmptyState message="No company challenges yet." />
          ) : (
            companyTracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                icon={<Briefcase className="h-5 w-5 text-[#2563eb]" />}
                href={getCompanyHref(track.id)}
              />
            ))
          )}
        </div>
      )}

      {tab === 'skill-paths' && (
        <div className="space-y-3">
          {skillTracks.length === 0 ? (
            <EmptyState message="No skill path challenges yet." />
          ) : (
            skillTracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                icon={<Users className="h-5 w-5 text-[#2563eb]" />}
              />
            ))
          )}
        </div>
      )}

      {tab === 'products' && (
        <div className="space-y-3">
          {featuredProducts.map((product) => (
            <article key={product.name} className="rounded-3xl bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-bold text-[#111827]">
                    {product.name}
                  </h3>
                  <p className="text-sm font-medium text-[#64748b]">
                    {product.type}
                  </p>
                </div>
                <Package className="h-5 w-5 text-[#2563eb]" />
              </div>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.08em] text-[#94a3b8]">
                {product.lessons} Lessons
              </p>
            </article>
          ))}
        </div>
      )}
    </MobileScreen>
  );
}

function TrackCard({
  track,
  icon,
  href
}: {
  track: HomeTrack;
  icon: ReactNode;
  href?: string;
}) {
  const card = (
    <article className="rounded-3xl bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-2xl font-bold text-[#111827]">{track.title}</h3>
          <p className="text-sm font-medium text-[#64748b]">
            {track.description ?? 'Practice set'}
          </p>
        </div>
        {icon}
      </div>
      <p className="mt-2 flex items-center gap-1 text-xs font-bold uppercase tracking-[0.08em] text-[#94a3b8]">
        <Clock3 className="h-4 w-4" /> {track.moduleCount} Modules
      </p>
    </article>
  );

  if (href) {
    return (
      <Link href={href} className="block cursor-pointer">
        {card}
      </Link>
    );
  }

  return card;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-3xl bg-white p-4 text-center text-sm font-semibold text-[#94a3b8]">
      {message}
    </div>
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
      className={`rounded-full px-2 py-2 text-xs font-bold uppercase tracking-[0.08em] ${
        active ? 'bg-white text-[#2563eb]' : 'text-[#64748b]'
      }`}
    >
      {label}
    </button>
  );
}
