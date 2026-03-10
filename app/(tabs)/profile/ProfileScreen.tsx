'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { logout } from '@/app/auth/actions';
import MobileScreen from '@/components/mobile/MobileScreen';

type ModalType = 'signout' | 'deactivation' | null;

export default function ProfileScreen({ email, fullName }: { email: string; fullName: string }) {
  const [openModal, setOpenModal] = useState<ModalType>(null);

  return (
    <MobileScreen>
      <section className="mx-auto w-full max-w-[361px]">
        <header className="mb-4">
          <h1 className="text-[24px] font-bold leading-[1.4] tracking-[-0.6px] text-[var(--profile-title-color)]">Profile</h1>
        </header>

        <section className="h-[315px] rounded-[var(--profile-card-radius)] border border-[var(--profile-main-stroke)] bg-[var(--profile-main-bg)] p-3">
          <div className="flex flex-col items-center">
            <div className="grid h-[80px] w-[80px] place-items-center rounded-full bg-[var(--profile-avatar-bg)] text-2xl font-bold uppercase text-white">{email.charAt(0)}</div>
            <p className="mt-3 text-center text-[24px] font-bold tracking-[-0.4px] text-[var(--profile-title-color)]">{fullName}</p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[1px] text-[var(--profile-member-color)]">PRODUCT GYM MEMBER</p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <StatCard label="RANK" value="#12" />
            <StatCard label="SOLVED" value="42" />
            <StatCard label="SOLVING DAYS" value="32" />
            <StatCard label="TOP PERFORMER" value="4X" />
          </div>
        </section>

        <section className="mt-4 rounded-[var(--profile-card-radius)] bg-[var(--profile-pro-bg)] p-3 text-white shadow-[var(--profile-container-effect)]">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[20px] font-bold tracking-[-0.4px]">Pro Gym Pass</h2>
            <span className="rounded-full bg-[var(--profile-pro-badge-bg)] px-2 py-1 text-[10px] font-black uppercase tracking-[1px]">Best Value</span>
          </div>
          <ul className="mt-3 space-y-2 text-[12px] font-medium text-[#dbeafe]">
            <li>• Unlimited mock challenges</li>
            <li>• Deep feedback from FAANG PMs</li>
          </ul>
          <Link href="/profile/subscription" className="mt-4 inline-flex h-[43px] w-full items-center justify-center rounded-[12px] bg-white text-[10px] font-black uppercase tracking-[1px] text-[#1e3a8a]">
            Manage Subscription
          </Link>
        </section>

        <Link href="/profile/edit" className="mt-4 flex h-[82px] items-center justify-between rounded-[16px] border border-[#d7e3f7] bg-white p-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[1px] text-[#94a3b8]">Settings</p>
            <p className="text-[16px] font-bold tracking-[-0.4px] text-[var(--profile-title-color)]">Preferences & Security</p>
          </div>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#eff6ff] text-xl text-[#94a3b8]">›</span>
        </Link>

        <button onClick={() => setOpenModal('signout')} className="mt-4 h-[64px] w-full rounded-[16px] border border-[#dbeafe] bg-white p-3 text-left">
          <p className="text-[16px] font-bold tracking-[-0.4px] text-[var(--profile-title-color)]">Sign Out</p>
          <p className="text-[12px] font-medium text-[#64748b]">Securely exit your session.</p>
        </button>

        <button onClick={() => setOpenModal('deactivation')} className="mt-4 h-[64px] w-full rounded-[16px] border border-[#fecaca] bg-white p-3 text-left">
          <p className="text-[16px] font-bold tracking-[-0.4px] text-[#dc2626]">Deactivate Account</p>
          <p className="text-[12px] font-medium text-[#ef4444]">Wipe all progress permanently.</p>
        </button>

        <ConfirmModal open={openModal === 'signout'} title="Sign Out?" description="Are you sure you want to end your session?" onCancel={() => setOpenModal(null)}>
          <form action={logout}>
            <button className="h-[43px] w-full rounded-[12px] bg-[#ef4444] text-[10px] font-black uppercase tracking-[1px] text-white">Confirm Sign Out</button>
          </form>
        </ConfirmModal>

        <ConfirmModal open={openModal === 'deactivation'} title="Deactivate Account?" description="This action is permanent and cannot be undone." onCancel={() => setOpenModal(null)}>
          <form action={logout}>
            <button className="h-[43px] w-full rounded-[12px] bg-[#ef4444] text-[10px] font-black uppercase tracking-[1px] text-white">Confirm Deactivation</button>
          </form>
        </ConfirmModal>
      </section>
    </MobileScreen>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-[12px] bg-white p-2 text-center">
      <p className="text-[7px] font-black uppercase tracking-[1px] text-[#64748b]">{label}</p>
      <p className="mt-1 text-[20px] font-bold tracking-[-0.4px] text-[var(--profile-title-color)]">{value}</p>
    </article>
  );
}

function ConfirmModal({ open, title, description, onCancel, children }: { open: boolean; title: string; description: string; onCancel: () => void; children: ReactNode; }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#0f172a]/40 px-4">
      <div className="w-full max-w-[361px] rounded-[16px] bg-white p-4 text-center">
        <h2 className="text-[24px] font-bold tracking-[-0.6px] text-[var(--profile-title-color)]">{title}</h2>
        <p className="mt-2 text-[12px] font-medium text-[#64748b]">{description}</p>
        <div className="mt-4">{children}</div>
        <button onClick={onCancel} className="mt-2 h-[43px] w-full rounded-[12px] border border-[#dbeafe] bg-white text-[10px] font-black uppercase tracking-[1px] text-[#64748b]">Cancel</button>
      </div>
    </div>
  );
}
