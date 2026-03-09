'use client';

import Link from 'next/link';
import MobileScreen from '@/components/mobile/MobileScreen';

export default function ProfileEditScreen({ email }: { email: string }) {
  return (
    <MobileScreen>
      <header className="mb-4 flex items-center gap-3">
        <Link
          href="/profile"
          className="grid h-9 w-9 place-items-center rounded-xl bg-[#eef2f6] text-2xl text-[#97a6ba]"
        >
          ‹
        </Link>
        <h1 className="text-[48px] font-black leading-none tracking-[-0.03em] text-[#111827]">
          Settings
        </h1>
      </header>

      <section className="rounded-[24px] border border-[#e5e9f0] bg-[#f8fafc] p-4 shadow-[0_1px_4px_rgba(15,23,42,0.08)]">
        <h2 className="text-3xl font-bold leading-none text-[#111827]">
          Account Preferences
        </h2>
        <p className="mt-2 text-sm font-semibold text-[#95a2b3]">
          Manage your identity and subscription across the Gym Floor.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Field label="First Name" value="Ahmed" />
          <Field label="Last Name" value="Yehia" />
        </div>

        <Field className="mt-3" label="Gym Username" value="ahmedy" />
        <Field className="mt-3" label="Email Address" value={email} />
        <Field className="mt-3" label="Gym Password" value="••••••" />

        <div className="mt-3">
          <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-[#c1c9d4]">
            Phone Number
          </p>
          <div className="flex gap-3">
            <div className="w-24 rounded-2xl border border-[#e3e8ef] bg-[#f1f4f8] px-3 py-4 text-lg font-semibold text-[#9ba9bb]">
              +20
            </div>
            <div className="flex-1 rounded-2xl border border-[#e3e8ef] bg-white px-4 py-4 text-[32px] font-bold leading-none tracking-[-0.03em] text-[#1f2937]">
              123 456 7890
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#e4e9f0] pt-4">
          <button className="rounded-2xl bg-[#edf1f6] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-[#9eacc0]">
            Discard Changes
          </button>
          <button className="rounded-2xl bg-[#0f1a33] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white">
            Save Preferences
          </button>
        </div>
      </section>
    </MobileScreen>
  );
}

function Field({
  label,
  value,
  className = ''
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-[#c1c9d4]">
        {label}
      </p>
      <div className="rounded-2xl border border-[#e3e8ef] bg-white px-4 py-4 text-[35px] font-bold leading-none tracking-[-0.03em] text-[#1f2937]">
        {value}
      </div>
    </div>
  );
}
