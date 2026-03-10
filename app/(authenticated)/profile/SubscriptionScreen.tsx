'use client';

import Link from 'next/link';
import { BadgeCheck, CheckCircle2, ShieldCheck } from 'lucide-react';
import MobileScreen from '@/components/mobile/MobileScreen';

export default function SubscriptionScreen() {
  return (
    <MobileScreen>
      <section className="mx-auto flex w-full max-w-[361px] flex-col gap-4">
        <header className="flex items-center gap-3">
          <Link href="/profile" className="grid h-8 w-8 place-items-center rounded-full bg-white text-[16px] text-[#51a2ff]">‹</Link>
          <h1 className="text-[24px] font-bold tracking-[-0.6px] text-[#0f172b]">Gym Pass</h1>
        </header>

        <section className="h-[57px] rounded-[16px] border border-[#2b7fff] bg-[#155dfc] p-3 text-white">
          <p className="text-[10px] font-black uppercase leading-[1] tracking-[1px] text-[#dbeafe]">Trial in progress</p>
          <p className="mt-1 text-[11px] font-bold">You are currently enjoying a Pro Trial.</p>
        </section>

        <section className="rounded-[16px] border border-[#dbeafe] bg-white p-3">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[#eff6ff] text-[#2563eb]">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <h2 className="text-[16px] font-bold tracking-[-0.4px] text-[var(--profile-title-color)]">Standard</h2>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[1px] text-[#94a3b8]">Foundation Level</p>
          <ul className="mt-3 space-y-1 text-[12px] font-medium leading-4 text-[#45556c]">
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2563eb]" />1 mock assignment open at once</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2563eb]" />1 challenge every 2 days</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2563eb]" />Public global ranking</li>
          </ul>
          <button className="mt-3 h-[49px] w-full rounded-[16px] border border-[#dbeafe] bg-white px-[72px] py-4 text-[12px] font-bold uppercase tracking-[1.2px] text-[var(--profile-title-color)]">Current Plan</button>
        </section>

        <section className="rounded-[16px] border border-[#1447e6] bg-[#447dfd] p-3 text-white">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[rgba(255,255,255,0.2)] text-white">
              <BadgeCheck className="h-4 w-4" />
            </span>
            <h2 className="text-[16px] font-bold tracking-[-0.4px]">Pro Gym Pass</h2>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[1px] text-[#dbeafe]">Foundation Level</p>
          <ul className="mt-3 space-y-1 text-[12px] font-medium leading-4 text-[#dbeafe]">
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white" />All company assignments unlocked</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white" />Unlimited daily challenges</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white" />Decision quality analytics</li>
          </ul>
          <button className="mt-3 h-[49px] w-full rounded-[16px] bg-[#155dfc] px-[72px] py-4 text-[12px] font-bold uppercase tracking-[1.2px] text-white">Upgrade to Pro</button>
        </section>
      </section>
    </MobileScreen>
  );
}
