'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Info, X } from 'lucide-react';
import type { UserProfileStat } from '@/types/user-profile-stats';

const rankingsLockedTitle = 'Rankings locked';
const rankingsLockedBody =
  'Solve challenges for 30 days to unlock rankings. Keep your streak going to join the competition.';

type UserStatTileProps = {
  icon: ReactNode;
  label: string;
  stat: UserProfileStat;
  showInfoIcon?: boolean;
};

export default function UserStatTile({
  icon,
  label,
  stat,
  showInfoIcon = true
}: UserStatTileProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <article className="rounded-xl bg-[var(--color-background)] px-2 py-2 text-center">
      <div className="mb-1 inline-flex items-center justify-center rounded-full bg-white p-1">
        {icon}
      </div>
      <p className="flex items-center justify-center gap-1 text-[9px] font-black tracking-[0.04em] text-[#64748b]">
        <span>{label}</span>
        {showInfoIcon && !stat.isAvailable ? (
          <StatInfoIcon label={label} onOpen={() => setIsModalOpen(true)} />
        ) : null}
      </p>
      <p className="mt-1 flex items-center justify-center gap-1 text-[20px] font-bold leading-none text-[#0f172a]">
        <span>{stat.value}</span>
      </p>
      <RankingsLockedModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </article>
  );
}

function StatInfoIcon({
  label,
  onOpen
}: {
  label: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open rankings locked details for ${label}`}
      className="inline-flex h-3 w-3 items-center justify-center rounded-full text-slate-400 outline-none transition-colors hover:text-slate-500 focus-visible:ring-1 focus-visible:ring-[#93c5fd]"
    >
      <Info className="h-2.5 w-2.5" aria-hidden="true" />
    </button>
  );
}

function RankingsLockedModal({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isMounted || !isOpen) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-5 py-8 backdrop-blur-[1px]"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rankings-locked-title"
        aria-describedby="rankings-locked-description"
        className="relative w-full max-w-[320px] rounded-[20px] bg-white px-5 pb-6 pt-5 text-center shadow-[0_24px_60px_rgba(15,23,42,0.24)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close rankings locked modal"
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
        <div className="mx-auto mb-4 mt-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#51a2ff] shadow-[inset_0_0_0_1px_rgba(81,162,255,0.14)]">
          <Info className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2
          id="rankings-locked-title"
          className="text-[18px] font-bold leading-[1.25] tracking-[-0.3px] text-[#0f172a]"
        >
          {rankingsLockedTitle}
        </h2>
        <p
          id="rankings-locked-description"
          className="mx-auto mt-2 max-w-[250px] text-[13px] font-semibold leading-[1.45] text-[#64748b]"
        >
          {rankingsLockedBody}
        </p>
      </div>
    </div>,
    document.body
  );
}
