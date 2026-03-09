'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { logout } from '@/app/auth/actions';
import MobileScreen from '@/components/mobile/MobileScreen';

type ModalType = 'signout' | 'deactivation' | null;

export default function ProfileEditScreen({ email }: { email: string }) {
  const [openModal, setOpenModal] = useState<ModalType>(null);

  return (
    <MobileScreen>
      <header className="mb-4 flex items-center gap-3">
        <Link href="/profile" className="grid h-9 w-9 place-items-center rounded-xl bg-[#eef2f6] text-2xl text-[#97a6ba]">
          ‹
        </Link>
        <h1 className="text-[48px] font-black leading-none tracking-[-0.03em] text-[#111827]">Settings</h1>
      </header>

      <section className="rounded-[24px] border border-[#e5e9f0] bg-[#f8fafc] p-4 shadow-[0_1px_4px_rgba(15,23,42,0.08)]">
        <h2 className="text-3xl font-bold leading-none text-[#111827]">Account Preferences</h2>
        <p className="mt-2 text-sm font-semibold text-[#95a2b3]">Manage your identity and subscription across the Gym Floor.</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Field label="First Name" value="Ahmed" />
          <Field label="Last Name" value="Yehia" />
        </div>

        <Field className="mt-3" label="Gym Username" value="ahmedy" />
        <Field className="mt-3" label="Email Address" value={email} />
        <Field className="mt-3" label="Gym Password" value="••••••" />

        <div className="mt-3">
          <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-[#c1c9d4]">Phone Number</p>
          <div className="flex gap-3">
            <div className="w-24 rounded-2xl border border-[#e3e8ef] bg-[#f1f4f8] px-3 py-4 text-lg font-semibold text-[#9ba9bb]">+20</div>
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

      <button
        onClick={() => setOpenModal('signout')}
        className="mt-4 w-full rounded-[22px] bg-[#f8fafc] px-5 py-5 text-left shadow-[inset_0_0_0_1px_rgba(148,163,184,0.16)]"
      >
        <p className="text-3xl font-bold leading-none text-[#1f2937]">Sign Out</p>
        <p className="mt-1 text-sm font-semibold text-[#bfcbda]">Securely exit your session.</p>
      </button>

      <button
        onClick={() => setOpenModal('deactivation')}
        className="mt-4 w-full rounded-[22px] bg-[#f8fafc] px-5 py-5 text-left shadow-[inset_0_0_0_1px_rgba(254,202,202,0.7)]"
      >
        <p className="text-3xl font-bold leading-none text-[#ef4444]">Deactivate Account</p>
        <p className="mt-1 text-sm font-semibold text-[#f87171]">Wipe all progress and stats permanently.</p>
      </button>

      <ConfirmModal
        open={openModal === 'signout'}
        title="Sign Out?"
        description="Are you sure you want to end your session? Your progress is saved automatically."
        onCancel={() => setOpenModal(null)}
      >
        <form action={logout}>
          <button className="w-full rounded-2xl bg-[#f70213] px-4 py-4 text-sm font-black uppercase tracking-[0.11em] text-white">
            Confirm Sign Out
          </button>
        </form>
      </ConfirmModal>

      <ConfirmModal
        open={openModal === 'deactivation'}
        title="Deactivate Account?"
        description="This action is permanent. All your training progress, ranks, and decision history will be wiped forever from the gym."
        onCancel={() => setOpenModal(null)}
      >
        <button
          onClick={() => {
            console.log('TODO: implement account deactivation flow');
            setOpenModal(null);
          }}
          className="w-full rounded-2xl bg-[#f70213] px-4 py-4 text-sm font-black uppercase tracking-[0.11em] text-white"
        >
          Confirm Deactivation
        </button>
      </ConfirmModal>
    </MobileScreen>
  );
}

function Field({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-[#c1c9d4]">{label}</p>
      <div className="rounded-2xl border border-[#e3e8ef] bg-white px-4 py-4 text-[35px] font-bold leading-none tracking-[-0.03em] text-[#1f2937]">
        {value}
      </div>
    </div>
  );
}

function ConfirmModal({
  open,
  title,
  description,
  onCancel,
  children
}: {
  open: boolean;
  title: string;
  description: string;
  onCancel: () => void;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#334155]/45 px-4">
      <div className="w-full max-w-[420px] rounded-[34px] bg-white px-7 py-8 text-center">
        <h2 className="text-[68px] font-black leading-[0.98] tracking-[-0.03em] text-[#0f172a]">{title}</h2>
        <p className="mx-auto mt-5 max-w-[300px] text-[31px] font-semibold leading-[1.25] text-[#64748b]">{description}</p>
        <div className="mt-6">{children}</div>
        <button
          onClick={onCancel}
          className="mt-3 w-full rounded-2xl border border-[#edf2f7] bg-white px-4 py-4 text-sm font-black uppercase tracking-[0.11em] text-[#b2becd]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
