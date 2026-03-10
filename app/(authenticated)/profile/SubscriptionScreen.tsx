'use client';

import Link from 'next/link';
import MobileScreen from '@/components/mobile/MobileScreen';

export default function SubscriptionScreen() {
  return (
    <MobileScreen>
      <header className="mb-5 flex items-center gap-3">
        <Link href="/profile" className="grid h-9 w-9 place-items-center rounded-xl bg-surface-muted text-2xl text-muted">
          ‹
        </Link>
        <h1 className="text-[52px] font-black leading-none tracking-[-0.03em] text-text">Gym Pass</h1>
      </header>

      <section className="rounded-2xl bg-[#1f5dea] px-4 py-3 text-white">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-[#c8dbff]">Trial in progress</p>
        <p className="mt-1 text-sm font-semibold">You are currently enjoying a Pro Trial.</p>
      </section>

      <section className="mt-5 rounded-card bg-bg p-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[56px] font-black leading-none tracking-[-0.03em] text-[#0f172a]">Standard</h2>
            <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-[#a0adbe]">Foundation level</p>
          </div>
          <p className="text-right text-[72px] font-black leading-none tracking-[-0.04em] text-[#0f172a]">
            $0<span className="text-[38px] font-bold text-[#94a3b8]">/mo</span>
          </p>
        </div>

        <ul className="mt-6 space-y-3 text-[31px] font-semibold leading-tight text-[#475569]">
          <li>◉ 1 mock assignment open at once</li>
          <li>◉ 1 challenge unlocked each 2 days</li>
          <li>◉ Standard Mentor Explanations</li>
          <li>◉ Public Global Ranking</li>
        </ul>

        <button className="mt-6 w-full rounded-2xl border border-[#dce3ec] bg-white px-4 py-4 text-sm font-black uppercase tracking-[0.11em] text-[#1f2937]">
          Current Plan
        </button>
      </section>

      <section className="mt-5 rounded-card bg-gradient-to-b from-[#2148c7] to-[#12235f] p-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[56px] font-black leading-none tracking-[-0.03em]">Pro Gym Pass</h2>
            <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-[#89b0ff]">Elite level</p>
          </div>
          <p className="text-right text-[72px] font-black leading-none tracking-[-0.04em]">
            $7<span className="text-[38px] font-bold text-[#9eb4e9]">/mo</span>
          </p>
        </div>

        <ul className="mt-6 space-y-3 text-[31px] font-semibold leading-tight text-[#dbe6ff]">
          <li>◉ All company assignments unlocked at once</li>
          <li>◉ Unlimited Daily Challenges</li>
          <li>◉ Unlock All Learning Paths</li>
          <li>◉ Johnny Supreme AI Mentor</li>
          <li>◉ Decision Quality Analytics</li>
        </ul>

        <button className="mt-6 w-full rounded-2xl bg-[#2867ff] px-4 py-4 text-sm font-black uppercase tracking-[0.11em] text-white">
          Upgrade to Pro
        </button>
      </section>
    </MobileScreen>
  );
}
