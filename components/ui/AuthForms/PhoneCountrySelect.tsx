'use client';

import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  DEFAULT_PHONE_COUNTRY,
  PHONE_COUNTRY_OPTIONS
} from '@/lib/auth/phone-countries';
import { cn } from '@/utils/cn';
import {
  btnInteractive,
  focusRingInteractive,
  tabInteractive
} from '@/components/ui/interactive';

type PhoneCountrySelectProps = {
  name?: string;
  defaultValue?: string;
};

export default function PhoneCountrySelect({
  name = 'phone_country',
  defaultValue = DEFAULT_PHONE_COUNTRY
}: PhoneCountrySelectProps) {
  const [selectedCode, setSelectedCode] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);

  const selectedCountry = useMemo(
    () =>
      PHONE_COUNTRY_OPTIONS.find((country) => country.code === selectedCode) ??
      PHONE_COUNTRY_OPTIONS[0],
    [selectedCode]
  );

  return (
    <div className="relative inline-flex max-w-[52%] shrink-0">
      <input type="hidden" name={name} value={selectedCountry.code} />
      <button
        type="button"
        className={cn(
          'inline-flex h-8 max-w-full items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-0 pl-2 pr-2 text-sm font-semibold text-slate-700 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
          btnInteractive,
          focusRingInteractive
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Phone country code"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="shrink-0">{selectedCountry.flag}</span>
        <span className="truncate">{selectedCountry.label}</span>
        <span className="shrink-0 text-slate-500">
          {selectedCountry.dialCode}
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
      </button>

      {isOpen && (
        <div
          className="absolute left-0 top-full z-20 mt-2 max-h-64 w-max min-w-full max-w-[min(82vw,22rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.14)]"
          role="listbox"
        >
          {PHONE_COUNTRY_OPTIONS.map((country) => (
            <button
              key={country.code}
              type="button"
              className={cn(
                'flex w-full items-center gap-2 whitespace-nowrap rounded-xl px-2.5 py-2 text-left text-sm font-semibold',
                tabInteractive,
                focusRingInteractive,
                selectedCountry.code === country.code
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-700 hover:bg-slate-50'
              )}
              role="option"
              aria-selected={selectedCountry.code === country.code}
              onClick={() => {
                setSelectedCode(country.code);
                setIsOpen(false);
              }}
            >
              <span>{country.flag}</span>
              <span>{country.label}</span>
              <span className="text-slate-500">{country.dialCode}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
