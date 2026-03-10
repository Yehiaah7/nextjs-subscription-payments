'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { BadgeCheck, CalendarDays, CheckCircle2, Crown, Globe2, Medal, Trophy } from 'lucide-react';
import { logout } from '@/app/auth/actions';
import MobileScreen from '@/components/mobile/MobileScreen';

type ModalType = 'signout' | 'deactivation' | null;

export default function ProfileScreen({ email, fullName }: { email: string; fullName: string }) {
  const [openModal, setOpenModal] = useState<ModalType>(null);

  return (
    <MobileScreen>
      <section className="mx-auto flex w-full max-w-[361px] flex-col gap-4">
        <header>
          <h1 className="text-[24px] font-bold leading-[1.4] tracking-[-0.6px] text-[#0f172b]">Profile</h1>
        </header>

        <section className="rounded-[var(--profile-card-radius)] border border-[var(--profile-main-stroke)] bg-[var(--profile-main-bg)] p-3">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="grid h-[80px] w-[80px] place-items-center rounded-full bg-[var(--profile-avatar-bg)] text-2xl font-bold uppercase text-white">{email.charAt(0)}</div>
              <span className="absolute -right-0.5 -top-0.5 grid h-6 w-6 place-items-center rounded-full border border-[#bfdbfe] bg-white text-[#2563eb]">
                <Crown className="h-3.5 w-3.5" />
              </span>
            </div>
            <p className="mt-3 text-center text-[16px] font-bold tracking-[-0.3px] text-[#0f172b]">{fullName}</p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[1px] text-[var(--profile-member-color)]">PRODUCT GYM MEMBER</p>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <StatCard icon={<Trophy className="h-3.5 w-3.5" />} label="RANK" value="#12" />
            <StatCard icon={<CheckCircle2 className="h-3.5 w-3.5" />} label="SOLVED" value="42" />
            <StatCard icon={<CalendarDays className="h-3.5 w-3.5" />} label="SOLVING DAYS" value="32" />
            <StatCard icon={<Medal className="h-3.5 w-3.5" />} label="WEEKLY TOP PERFORMER" value="4X" />
            <StatCard icon={<Globe2 className="h-3.5 w-3.5" />} label="GLOBAL STANDINGS" value="#98" />
          </div>
        </section>

        <section className="rounded-[16px] border border-[#1447e6] bg-[#447dfd] p-3 text-white">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[rgba(255,255,255,0.2)] text-white">
              <BadgeCheck className="h-4 w-4" />
            </span>
            <h2 className="text-[16px] font-bold tracking-[-0.4px]">Pro Gym Pass</h2>
          </div>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[1px] text-[#dbeafe]">FOUNDATION LEVEL</p>
          <ul className="mt-3 space-y-1 text-[12px] font-medium leading-4 text-[#dbeafe]">
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white" />All company assignments unlocked</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white" />Unlimited daily challenges</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white" />Decision quality analytics</li>
          </ul>
          <div className="mt-3 rounded-[14px] bg-[#155dfc] p-2">
            <Link href="/profile/subscription" className="inline-flex h-[43px] w-full items-center justify-center rounded-[999px] bg-white text-[10px] font-black uppercase tracking-[1px] text-[#1c398e]">
              Upgrade to Pro
            </Link>
          </div>
        </section>

        <Link href="/profile/edit" className="flex h-[82px] items-center justify-between rounded-[16px] border border-[#d7e3f7] bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.9px] text-[#cad5e2]">Settings</p>
            <p className="text-[12px] font-bold tracking-[-0.3px] text-[#0f172b]">Preferences & Security</p>
          </div>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#eff6ff] text-xl text-[#94a3b8]">›</span>
        </Link>

        <button onClick={() => setOpenModal('signout')} className="h-[64px] w-full rounded-[16px] border border-[#dbeafe] bg-white p-3 text-left">
          <p className="text-[16px] font-bold tracking-[-0.4px] text-[var(--profile-title-color)]">Sign Out</p>
          <p className="text-[12px] font-medium text-[#64748b]">Securely exit your session.</p>
        </button>

        <button onClick={() => setOpenModal('deactivation')} className="h-[64px] w-full rounded-[16px] border border-[#fecaca] bg-white p-3 text-left">
          <p className="text-[16px] font-bold tracking-[-0.4px] text-[#dc2626]">Deactivate Account</p>
          <p className="text-[12px] font-medium text-[#ef4444]">Wipe all progress permanently.</p>
        </button>

        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.6px] text-[#94a3b8]">Product Gym V2.4.0</p>

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

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <article className="rounded-[12px] bg-[#eff6ff] px-2 py-2 text-center">
      <div className="mb-1 inline-flex items-center justify-center rounded-full bg-white p-1 text-[#2563eb]">{icon}</div>
      <p className="text-[8px] font-black uppercase tracking-[0.7px] text-[#64748b]">{label}</p>
      <p className="mt-1 text-[18px] font-bold leading-none text-[#0f172b]">{value}</p>
    </article>
  );
}

function ConfirmModal({ open, title, description, onCancel, children }: { open: boolean; title: string; description: string; onCancel: () => void; children: ReactNode; }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#0f172a]/40 px-4">
      <div className="w-full max-w-[361px] rounded-[16px] bg-white p-4 text-center shadow-[0px_25px_50px_-12px_rgba(15,23,42,0.25)]">
        <h2 className="text-[24px] font-bold tracking-[-0.6px] text-[#0f172b]">{title}</h2>
        <p className="mt-2 text-[12px] font-medium text-[#64748b]">{description}</p>
        <div className="mt-4">{children}</div>
        <button onClick={onCancel} className="mt-2 h-[43px] w-full rounded-[12px] border border-[#dbeafe] bg-white text-[10px] font-black uppercase tracking-[1px] text-[#64748b]">Cancel</button>
      </div>
    </div>
  );
}
