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

export default function ProfileEditScreen({
  email,
  profile,
  status,
  error
}: {
  email: string;
  profile: ProfileValues;
  status?: string;
  error?: string;
}) {
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

        <form action={updateProfile} className="mt-5">
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="First Name"
              name="first_name"
              value={formValues.first_name}
              onChange={(value) => setFormValues((prev) => ({ ...prev, first_name: value }))}
            />
            <Field
              label="Last Name"
              name="last_name"
              value={formValues.last_name}
              onChange={(value) => setFormValues((prev) => ({ ...prev, last_name: value }))}
            />
          </div>

          <Field
            className="mt-3"
            label="Gym Username"
            name="username"
            value={formValues.username}
            onChange={(value) =>
              setFormValues((prev) => ({ ...prev, username: value.toLowerCase() }))
            }
            required
            minLength={3}
            maxLength={20}
            pattern="[A-Za-z0-9_]{3,20}"
            title="3-20 chars: letters, numbers, underscore"
          />
          <Field className="mt-3" label="Email Address" value={email} readOnly />

          <Field
            className="mt-3"
            label="Phone Number"
            name="phone"
            value={formValues.phone}
            onChange={(value) => setFormValues((prev) => ({ ...prev, phone: value }))}
          />

          {status && <p className="mt-3 text-sm font-semibold text-emerald-600">{status}</p>}
          {error && <p className="mt-3 text-sm font-semibold text-red-500">{error}</p>}

          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#e4e9f0] pt-4">
            <button
              type="button"
              onClick={() => setFormValues(initialValues)}
              className="rounded-2xl bg-[#edf1f6] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-[#9eacc0]"
            >
              Discard Changes
            </button>
            <button
              type="submit"
              className="rounded-2xl bg-[#0f1a33] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </section>
    </MobileScreen>
  );
}

function Field({
  label,
  className = '',
  value,
  name,
  onChange,
  readOnly,
  required,
  minLength,
  maxLength,
  pattern,
  title
}: {
  label: string;
  className?: string;
  value: string;
  name?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  title?: string;
}) {
  return (
    <div className={className}>
      <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-[#c1c9d4]">
        {label}
      </p>
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
        className="w-full rounded-2xl border border-[#e3e8ef] bg-white px-4 py-4 text-[35px] font-bold leading-none tracking-[-0.03em] text-[#1f2937] read-only:bg-[#f1f4f8] read-only:text-[#9ba9bb]"
      />
    </div>
  );
}
