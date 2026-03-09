'use client';

import Link from 'next/link';
import MobileScreen from '@/components/mobile/MobileScreen';

export default function ProfileScreen({ email }: { email: string }) {
  return (
    <MobileScreen>
      <header className="mb-5">
        <h1 className="text-[52px] font-black leading-none tracking-[-0.03em] text-[#111827]">Profile</h1>
      </header>

      <section className="rounded-[26px] bg-[#c5d3e8] p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]">
        <div className="flex flex-col items-center">
          <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-[22px] bg-[#89a4c6] text-4xl font-black uppercase text-white">
            {email.charAt(0)}
          </div>
          <p className="mt-3 text-[40px] font-bold leading-none tracking-[-0.03em] text-[#101827]">PM Member</p>
          <p className="mt-1 text-base font-black uppercase tracking-[0.13em] text-[#2d5eff]">Product Gym Member</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <StatCard label="Rank" value="#12" />
          <StatCard label="Solved" value="42" />
          <StatCard label="Solving Days" value="32" />
          <StatCard label="Weekly Top Performer" value="4 Times" />
        </div>
      </section>

      <section className="mt-5 rounded-[24px] bg-gradient-to-b from-[#2453e8] to-[#1f327f] p-5 text-white">
        <div className="flex items-center justify-between">
          <h2 className="text-4xl font-bold leading-none tracking-[-0.03em]">Pro Gym Pass</h2>
          <span className="rounded-full bg-[#7088df] px-3 py-1 text-xs font-black uppercase tracking-[0.09em]">Best Value</span>
        </div>

        <ul className="mt-5 space-y-3 text-lg font-semibold text-[#d6e3ff]">
          <li>◉ Unlimited mock challenges from top companies</li>
          <li>◉ Deep-dive decision feedback from FAANG PMs</li>
        </ul>

        <Link
          href="/profile/subscription"
          className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-4 text-sm font-black uppercase tracking-[0.11em] text-[#1d3a9a]"
        >
          Manage Subscription
        </Link>
      </section>

      <Link
        href="/profile/edit"
        className="mt-5 flex items-center justify-between rounded-[24px] bg-[#f3f4f6] px-5 py-5 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.2)]"
      >
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#b6c0cf]">Settings</p>
          <p className="text-2xl font-bold leading-none text-[#1f2937]">Preferences &amp; Security</p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-2xl text-[#c4ccd7]">›</span>
      </Link>

      <p className="mt-6 text-center text-xs font-black uppercase tracking-[0.24em] text-[#c4cedb]">Product Gym v2.4.0</p>
    </MobileScreen>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-3xl bg-[#ecf0f5] px-4 py-3 text-center">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#9caabf]">{label}</p>
      <p className="mt-1 text-[34px] font-black leading-none tracking-[-0.03em] text-[#1f2937]">{value}</p>
    </article>
  );
}
