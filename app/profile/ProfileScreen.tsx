'use client';

import MobileScreen from '@/components/mobile/MobileScreen';

export default function ProfileScreen({ email }: { email: string }) {
  return (
    <MobileScreen>
      <header className="mb-5">
        <h1 className="text-4xl font-bold text-[#111827]">Profile</h1>
      </header>

      <section className="rounded-3xl bg-white p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-[#dbeafe] text-xl font-bold text-[#2563eb]">
            {email.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-bold text-[#111827]">PM Member</p>
            <p className="text-sm text-[#64748b]">{email}</p>
          </div>
        </div>

        <div className="space-y-2">
          <ProfileRow label="Subscription" value="Pro Trial" />
          <ProfileRow label="Current Rank" value="#12" />
          <ProfileRow label="Solved Challenges" value="42" />
        </div>

        <form action="/logout" method="post" className="mt-5">
          <button className="w-full rounded-2xl bg-[#111827] px-4 py-3 text-sm font-bold uppercase tracking-[0.08em] text-white">
            Sign out
          </button>
        </form>
      </section>
    </MobileScreen>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-[#f8fafc] px-3 py-2">
      <p className="text-sm font-medium text-[#64748b]">{label}</p>
      <p className="text-sm font-bold text-[#111827]">{value}</p>
    </div>
  );
}
