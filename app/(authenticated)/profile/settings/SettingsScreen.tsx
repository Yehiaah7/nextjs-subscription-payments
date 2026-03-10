'use client';

import Link from 'next/link';
import { ReactNode, useMemo, useState } from 'react';
import { logout } from '@/app/auth/actions';
import MobileScreen from '@/components/mobile/MobileScreen';
import PasswordField from '@/components/ui/PasswordField';
import { changePassword, updateAccountPreferences } from './actions';

type ProfileValues = {
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  phone: string | null;
  phone_country: string | null;
  phone_dial_code: string | null;
  phone_national: string | null;
  phone_e164: string | null;
};

type ModalType = 'signout' | 'deactivation' | null;

type CountryOption = {
  code: string;
  dialCode: string;
  label: string;
  flag: string;
};

const COUNTRY_OPTIONS: CountryOption[] = [
  { code: 'EG', dialCode: '+20', label: 'Egypt', flag: '🇪🇬' },
  { code: 'SA', dialCode: '+966', label: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'AE', dialCode: '+971', label: 'UAE', flag: '🇦🇪' },
  { code: 'US', dialCode: '+1', label: 'United States', flag: '🇺🇸' },
  { code: 'GB', dialCode: '+44', label: 'United Kingdom', flag: '🇬🇧' }
];

function parsePhoneFromProfile(profile: ProfileValues) {
  const matchedCountry = COUNTRY_OPTIONS.find(
    (option) => option.code === profile.phone_country
  );
  const fallbackCountry = matchedCountry ?? COUNTRY_OPTIONS[0];

  let national = profile.phone_national ?? '';
  const existingE164 = profile.phone_e164 ?? profile.phone ?? '';

  if (!national && existingE164.startsWith('+')) {
    const byDial = COUNTRY_OPTIONS.find((option) =>
      existingE164.startsWith(option.dialCode)
    );
    if (byDial) {
      national = existingE164.slice(byDial.dialCode.length);
      return {
        phone_country: byDial.code,
        phone_dial_code: byDial.dialCode,
        phone_national: national
      };
    }
  }

  return {
    phone_country: fallbackCountry.code,
    phone_dial_code: profile.phone_dial_code ?? fallbackCountry.dialCode,
    phone_national: national
  };
}

export default function SettingsScreen({
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
  const parsedPhone = parsePhoneFromProfile(profile);

  const initialValues = useMemo(
    () => ({
      first_name: profile.first_name ?? '',
      last_name: profile.last_name ?? '',
      username: profile.username ?? '',
      phone_country: parsedPhone.phone_country,
      phone_dial_code: parsedPhone.phone_dial_code,
      phone_national: parsedPhone.phone_national,
      email
    }),
    [
      email,
      parsedPhone.phone_country,
      parsedPhone.phone_dial_code,
      parsedPhone.phone_national,
      profile.first_name,
      profile.last_name,
      profile.username
    ]
  );

  const [formValues, setFormValues] = useState(initialValues);
  const [openModal, setOpenModal] = useState<ModalType>(null);

  return (
    <MobileScreen>
      <section className="mx-auto w-full max-w-[361px] space-y-4">
        <header className="flex items-center gap-3">
          <Link
            href="/profile"
            className="grid h-8 w-8 place-items-center rounded-full bg-white text-[16px] text-[#51a2ff]"
          >
            ‹
          </Link>
          <h1 className="text-[24px] font-bold tracking-[-0.6px] text-[#0f172b]">
            Settings
          </h1>
        </header>

        <section className="rounded-[16px] border border-[#dbeafe] bg-white p-3">
          <p className="mb-3 text-[12px] font-bold tracking-[-0.3px] text-[#0f172b]">
            Account Preferences
          </p>
          <form action={updateAccountPreferences} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Field
                label="First name"
                name="first_name"
                value={formValues.first_name}
                onChange={(value) =>
                  setFormValues((prev) => ({ ...prev, first_name: value }))
                }
              />
              <Field
                label="Last name"
                name="last_name"
                value={formValues.last_name}
                onChange={(value) =>
                  setFormValues((prev) => ({ ...prev, last_name: value }))
                }
              />
            </div>

            <PhoneField
              phoneCountry={formValues.phone_country}
              phoneDialCode={formValues.phone_dial_code}
              phoneNational={formValues.phone_national}
              onCountryChange={(countryCode) => {
                const selectedCountry =
                  COUNTRY_OPTIONS.find(
                    (option) => option.code === countryCode
                  ) ?? COUNTRY_OPTIONS[0];
                setFormValues((prev) => ({
                  ...prev,
                  phone_country: selectedCountry.code,
                  phone_dial_code: selectedCountry.dialCode
                }));
              }}
              onNationalChange={(value) =>
                setFormValues((prev) => ({ ...prev, phone_national: value }))
              }
            />

            <Field
              label="Email"
              name="email"
              value={formValues.email}
              onChange={(value) =>
                setFormValues((prev) => ({ ...prev, email: value }))
              }
              type="email"
              required
            />
            <Field
              label="Username"
              name="username"
              value={formValues.username}
              onChange={(value) =>
                setFormValues((prev) => ({
                  ...prev,
                  username: value.toLowerCase()
                }))
              }
              required
              minLength={3}
              maxLength={20}
              pattern="[A-Za-z0-9_]{3,20}"
              title="3-20 chars: letters, numbers, underscore"
            />

            {status && (
              <p className="text-xs font-medium text-emerald-600">{status}</p>
            )}
            {error && (
              <p className="text-xs font-medium text-red-500">{error}</p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setFormValues(initialValues)}
                className="h-[43px] w-[90px] rounded-[12px] border border-[#dbeafe] bg-white text-[10px] font-black uppercase tracking-[1px] text-[#64748b]"
              >
                Discard
              </button>
              <button
                type="submit"
                className="h-[43px] w-[90px] rounded-[12px] bg-[#2563eb] text-[10px] font-black uppercase tracking-[1px] text-white"
              >
                Save
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-[16px] border border-[#dbeafe] bg-white p-3">
          <p className="mb-3 text-[12px] font-bold tracking-[-0.3px] text-[#0f172b]">
            Security
          </p>
          <form action={changePassword} className="space-y-3">
            <Field
              label="Current password"
              name="currentPassword"
              defaultValue=""
              type="password"
              required
              minLength={8}
            />
            <Field
              label="New password"
              name="password"
              defaultValue=""
              type="password"
              required
              minLength={8}
            />
            <Field
              label="Confirm password"
              name="passwordConfirm"
              defaultValue=""
              type="password"
              required
              minLength={8}
            />
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="h-[43px] rounded-[12px] bg-[#2563eb] px-10 text-[10px] font-black uppercase tracking-[1px] text-white"
              >
                CHANGE PASSWORD
              </button>
            </div>
          </form>
        </section>

        <button
          onClick={() => setOpenModal('signout')}
          className="h-[64px] w-full rounded-[16px] border border-[#dbeafe] bg-white p-3 text-left"
        >
          <p className="text-[16px] font-bold tracking-[-0.4px] text-[var(--profile-title-color)]">
            Sign Out
          </p>
          <p className="text-[12px] font-medium text-[#64748b]">
            Securely exit your session.
          </p>
        </button>

        <button
          onClick={() => setOpenModal('deactivation')}
          className="h-[64px] w-full rounded-[16px] border border-[#ff6467] bg-white p-3 text-left"
        >
          <p className="text-[16px] font-bold tracking-[-0.4px] text-[#e7000b]">
            Deactivate Account
          </p>
          <p className="text-[12px] font-medium text-[#ff6467]">
            Wipe all progress permanently.
          </p>
        </button>

        <ConfirmModal
          open={openModal === 'signout'}
          title="Sign Out?"
          description="Are you sure you want to end your session?"
          onCancel={() => setOpenModal(null)}
        >
          <form action={logout}>
            <button className="h-[43px] w-full rounded-[12px] bg-[#ef4444] text-[10px] font-black uppercase tracking-[1px] text-white">
              Confirm Sign Out
            </button>
          </form>
        </ConfirmModal>

        <ConfirmModal
          open={openModal === 'deactivation'}
          title="Deactivate Account?"
          description="This action is permanent and cannot be undone."
          onCancel={() => setOpenModal(null)}
        >
          <form action={logout}>
            <button className="h-[43px] w-full rounded-[12px] bg-[#e7000b] text-[10px] font-black uppercase tracking-[1px] text-white">
              Confirm Deactivation
            </button>
          </form>
        </ConfirmModal>
      </section>
    </MobileScreen>
  );
}

function PhoneField({
  phoneCountry,
  phoneDialCode,
  phoneNational,
  onCountryChange,
  onNationalChange
}: {
  phoneCountry: string;
  phoneDialCode: string;
  phoneNational: string;
  onCountryChange: (value: string) => void;
  onNationalChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-1 text-[9px] font-black uppercase tracking-[1px] text-[#94a3b8]">
        Phone
      </p>
      <div className="flex h-[43px] w-full items-center overflow-hidden rounded-[12px] border border-[#e2e8f0] bg-[#f8fafc]">
        <label className="flex h-full min-w-[124px] items-center border-r border-[#dbeafe] pl-3 pr-2 text-[14px] font-medium text-[var(--profile-title-color)]">
          <select
            name="phone_country"
            value={phoneCountry}
            onChange={(event) => onCountryChange(event.target.value)}
            className="w-full bg-transparent text-[14px] font-medium outline-none"
          >
            {COUNTRY_OPTIONS.map((option) => (
              <option key={option.code} value={option.code}>
                {option.flag} {option.label} {option.dialCode}
              </option>
            ))}
          </select>
        </label>
        <input type="hidden" name="phone_dial_code" value={phoneDialCode} />
        <input
          type="tel"
          name="phone_national"
          value={phoneNational}
          onChange={(event) => onNationalChange(event.target.value)}
          inputMode="numeric"
          placeholder="123 456 7890"
          className="h-full w-full bg-[#f8fafc] px-3 text-[14px] font-medium text-[var(--profile-title-color)] outline-none"
        />
      </div>
      <input
        type="hidden"
        name="phone"
        value={`${phoneDialCode}${phoneNational.replace(/\s+/g, '')}`}
      />
    </div>
  );
}

function Field({
  label,
  className = '',
  value,
  defaultValue,
  type = 'text',
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
  value?: string;
  defaultValue?: string;
  type?: string;
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
      <p className="mb-1 text-[9px] font-black uppercase tracking-[1px] text-[#94a3b8]">
        {label}
      </p>
      {type === 'password' ? (
        <PasswordField
          name={name}
          value={value}
          defaultValue={defaultValue}
          onChange={(event) => onChange?.(event.target.value)}
          readOnly={readOnly}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          pattern={pattern}
          title={title}
          autoComplete={name === 'currentPassword' ? 'current-password' : 'new-password'}
          containerClassName="flex h-[43px] w-full items-center rounded-[12px] border border-[#e2e8f0] bg-[#f8fafc] px-3"
          inputClassName="h-full w-full bg-[#f8fafc] text-[14px] font-medium text-[var(--profile-title-color)] outline-none"
          iconClassName="h-4 w-4 text-[#94a3b8]"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          defaultValue={defaultValue}
          onChange={(event) => onChange?.(event.target.value)}
          readOnly={readOnly}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          pattern={pattern}
          title={title}
          className="h-[43px] w-full rounded-[12px] border border-[#e2e8f0] bg-[#f8fafc] px-3 text-[14px] font-medium text-[var(--profile-title-color)]"
        />
      )}
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
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#0f172a]/40 px-4">
      <div className="w-full max-w-[361px] rounded-[16px] bg-white p-4 text-center shadow-[0px_25px_50px_-12px_rgba(15,23,42,0.25)]">
        <h2 className="text-[24px] font-bold tracking-[-0.6px] text-[#0f172b]">
          {title}
        </h2>
        <p className="mt-2 text-[12px] font-medium text-[#64748b]">
          {description}
        </p>
        <div className="mt-4">{children}</div>
        <button
          onClick={onCancel}
          className="mt-2 h-[43px] w-full rounded-[12px] border border-[#dbeafe] bg-white text-[10px] font-black uppercase tracking-[1px] text-[#64748b]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
