'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CalendarDays, CheckCircle2, Crown, Globe2, Medal, Trophy } from 'lucide-react';
import MobileScreen from '@/components/mobile/MobileScreen';
import ProGymPassCard from '@/components/ProGymPassCard';

export default function ProfileScreen({ email, fullName }: { email: string; fullName: string }) {
  const router = useRouter();

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

        <ProGymPassCard onUpgrade={() => router.push('/profile/subscription?focus=pro')} variant="profile" />

        <Link href="/profile/settings" className="flex h-[82px] items-center justify-between rounded-[16px] border border-[#d7e3f7] bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.9px] text-[#cad5e2]">Settings</p>
            <p className="text-[12px] font-bold tracking-[-0.3px] text-[#0f172b]">Preferences & Security</p>
          </div>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#eff6ff] text-xl text-[#94a3b8]">›</span>
        </Link>

        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.6px] text-[#94a3b8]">Product Gym V2.4.0</p>
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
