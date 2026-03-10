'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import MobileScreen from '@/components/mobile/MobileScreen';
import { updateProfile } from './actions';

type ProfileValues = {
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  phone: string | null;
};

export default function ProfileEditScreen({ email, profile, status, error }: { email: string; profile: ProfileValues; status?: string; error?: string; }) {
  const initialValues = useMemo(
    () => ({
      first_name: profile.first_name ?? '',
      last_name: profile.last_name ?? '',
      username: profile.username ?? '',
      phone: profile.phone ?? ''
    }),
    [profile.first_name, profile.last_name, profile.phone, profile.username]
  );

  const [formValues, setFormValues] = useState(initialValues);

  return (
    <MobileScreen>
      <section className="mx-auto w-full max-w-[361px]">
        <header className="mb-4 flex items-center gap-3">
          <Link href="/profile" className="grid h-8 w-8 place-items-center rounded-full bg-white text-xl text-[#64748b]">‹</Link>
          <h1 className="text-[24px] font-bold tracking-[-0.6px] text-[var(--profile-title-color)]">Edit Profile</h1>
        </header>

        <section className="rounded-[16px] border border-[#dbeafe] bg-white p-3">
          <form action={updateProfile} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Field label="First Name" name="first_name" value={formValues.first_name} onChange={(value) => setFormValues((prev) => ({ ...prev, first_name: value }))} />
              <Field label="Last Name" name="last_name" value={formValues.last_name} onChange={(value) => setFormValues((prev) => ({ ...prev, last_name: value }))} />
            </div>

            <Field label="Username" name="username" value={formValues.username} onChange={(value) => setFormValues((prev) => ({ ...prev, username: value.toLowerCase() }))} required minLength={3} maxLength={20} pattern="[A-Za-z0-9_]{3,20}" title="3-20 chars: letters, numbers, underscore" />
            <Field label="Email" value={email} readOnly />
            <Field label="Phone" name="phone" value={formValues.phone} onChange={(value) => setFormValues((prev) => ({ ...prev, phone: value }))} />

            {status && <p className="text-xs font-medium text-emerald-600">{status}</p>}
            {error && <p className="text-xs font-medium text-red-500">{error}</p>}

            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setFormValues(initialValues)} className="h-[43px] w-[90px] rounded-[12px] border border-[#dbeafe] bg-white text-[10px] font-black uppercase tracking-[1px] text-[#64748b]">Discard</button>
              <button type="submit" className="h-[43px] w-[90px] rounded-[12px] bg-[#2563eb] text-[10px] font-black uppercase tracking-[1px] text-white">Save</button>
            </div>
          </form>
        </section>
      </section>
    </MobileScreen>
  );
}

function Field({ label, className = '', value, name, onChange, readOnly, required, minLength, maxLength, pattern, title }: { label: string; className?: string; value: string; name?: string; onChange?: (value: string) => void; readOnly?: boolean; required?: boolean; minLength?: number; maxLength?: number; pattern?: string; title?: string; }) {
  return (
    <div className={className}>
      <p className="mb-1 text-[10px] font-black uppercase tracking-[1px] text-[#64748b]">{label}</p>
      <input
        name={name}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        readOnly={readOnly}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        pattern={pattern}
        title={title}
        className="h-[43px] w-full rounded-[12px] border border-[#dbeafe] bg-white px-3 text-[14px] font-medium text-[var(--profile-title-color)] read-only:bg-[#f8fafc] read-only:text-[#94a3b8]"
      />
    </div>
  );
}
