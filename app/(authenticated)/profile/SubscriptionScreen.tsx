'use client';

import Link from 'next/link';
import MobileScreen from '@/components/mobile/MobileScreen';

export default function SubscriptionScreen() {
  return (
    <MobileScreen>
      <section className="mx-auto w-full max-w-[361px]">
        <header className="mb-4 flex items-center gap-3">
          <Link href="/profile" className="grid h-8 w-8 place-items-center rounded-full bg-white text-xl text-[#64748b]">‹</Link>
          <h1 className="text-[24px] font-bold tracking-[-0.6px] text-[var(--profile-title-color)]">Subscription</h1>
        </header>

        <section className="rounded-[16px] border border-[#bedbff] bg-white p-3">
          <p className="text-[10px] font-black uppercase tracking-[1px] text-[#2563eb]">Trial in progress</p>
          <p className="mt-1 text-[12px] font-medium text-[#64748b]">You are currently enjoying a Pro Trial.</p>
        </section>

        <section className="mt-4 rounded-[16px] border border-[#dbeafe] bg-white p-3">
          <h2 className="text-[16px] font-bold tracking-[-0.4px] text-[var(--profile-title-color)]">Standard</h2>
          <p className="text-[10px] font-black uppercase tracking-[1px] text-[#94a3b8]">$0/month</p>
          <ul className="mt-3 space-y-1 text-[12px] font-medium text-[#64748b]">
            <li>• 1 mock assignment open at once</li>
            <li>• 1 challenge every 2 days</li>
            <li>• Public global ranking</li>
          </ul>
          <button className="mt-3 h-[43px] w-full rounded-[12px] border border-[#dbeafe] bg-white text-[10px] font-black uppercase tracking-[1px] text-[var(--profile-title-color)]">Current Plan</button>
        </section>

        <section className="mt-4 rounded-[16px] bg-[var(--profile-pro-bg)] p-3 text-white shadow-[var(--profile-container-effect)]">
          <h2 className="text-[16px] font-bold tracking-[-0.4px]">Pro Gym Pass</h2>
          <p className="text-[10px] font-black uppercase tracking-[1px] text-[#bfdbfe]">$7/month</p>
          <ul className="mt-3 space-y-1 text-[12px] font-medium text-[#dbeafe]">
            <li>• All company assignments unlocked</li>
            <li>• Unlimited daily challenges</li>
            <li>• Decision quality analytics</li>
          </ul>
          <button className="mt-3 h-[43px] w-full rounded-[12px] bg-[#2563eb] text-[10px] font-black uppercase tracking-[1px] text-white">Upgrade to Pro</button>
        </section>
      </section>
    </MobileScreen>
  );
}
