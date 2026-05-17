'use client';

import type { ReactNode } from 'react';
import { Info } from 'lucide-react';
import type { UserProfileStat } from '@/types/user-profile-stats';

type UserStatTileProps = {
  icon: ReactNode;
  label: string;
  stat: UserProfileStat;
};

export default function UserStatTile({ icon, label, stat }: UserStatTileProps) {
  const tooltip =
    stat.unavailableReason ??
    'This stat will appear when real data becomes available.';

  return (
    <article className="rounded-xl bg-[#eff6ff] px-2 py-2 text-center">
      <div className="mb-1 inline-flex items-center justify-center rounded-full bg-white p-1">
        {icon}
      </div>
      <p className="flex items-center justify-center gap-1 text-[9px] font-black tracking-[0.04em] text-[#64748b]">
        <span>{label}</span>
        {!stat.isAvailable ? (
          <StatInfoIcon label={label} tooltip={tooltip} />
        ) : null}
      </p>
      <p className="mt-1 flex items-center justify-center gap-1 text-[20px] font-bold leading-none text-[#0f172a]">
        <span>{stat.value}</span>
      </p>
    </article>
  );
}

function StatInfoIcon({ label, tooltip }: { label: string; tooltip: string }) {
  return (
    <span className="group relative inline-flex align-middle">
      <span
        tabIndex={0}
        aria-label={`${label}: ${tooltip}`}
        title={tooltip}
        className="inline-flex h-3 w-3 items-center justify-center rounded-full text-slate-400 outline-none transition-colors hover:text-slate-500 focus-visible:ring-1 focus-visible:ring-[#93c5fd]"
      >
        <Info className="h-2.5 w-2.5" aria-hidden="true" />
      </span>
      <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 hidden w-36 -translate-x-1/2 rounded-lg bg-slate-900 px-2 py-1 text-center text-[9px] font-semibold leading-snug text-white shadow-lg group-hover:block group-focus-within:block">
        {tooltip}
      </span>
    </span>
  );
}
