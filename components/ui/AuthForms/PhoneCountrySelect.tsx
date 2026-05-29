'use client';

import { ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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

type DropdownPosition = {
  left: number;
  top: number;
  minWidth: number;
};

const DROPDOWN_OFFSET = 8;
const DROPDOWN_MAX_WIDTH = 352;

export default function PhoneCountrySelect({
  name = 'phone_country',
  defaultValue = DEFAULT_PHONE_COUNTRY
}: PhoneCountrySelectProps) {
  const [selectedCode, setSelectedCode] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] =
    useState<DropdownPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCountry = useMemo(
    () =>
      PHONE_COUNTRY_OPTIONS.find((country) => country.code === selectedCode) ??
      PHONE_COUNTRY_OPTIONS[0],
    [selectedCode]
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const updateDropdownPosition = () => {
      const trigger = triggerRef.current;

      if (!trigger) {
        return;
      }

      const rect = trigger.getBoundingClientRect();
      const viewportPadding = 8;
      const maxDropdownWidth = Math.min(
        window.innerWidth * 0.82,
        DROPDOWN_MAX_WIDTH
      );
      const maxLeft = Math.max(
        viewportPadding,
        window.innerWidth - maxDropdownWidth - viewportPadding
      );

      setDropdownPosition({
        left: Math.min(Math.max(rect.left, viewportPadding), maxLeft),
        top: rect.bottom + DROPDOWN_OFFSET,
        minWidth: rect.width
      });
    };

    updateDropdownPosition();
    window.addEventListener('resize', updateDropdownPosition);
    window.addEventListener('scroll', updateDropdownPosition, true);

    return () => {
      window.removeEventListener('resize', updateDropdownPosition);
      window.removeEventListener('scroll', updateDropdownPosition, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (
        triggerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }

      setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const dropdown =
    isOpen && dropdownPosition
      ? createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[100] max-h-64 w-max max-w-[min(82vw,22rem)] overflow-y-auto rounded-2xl border border-border bg-white p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.14)]"
            style={{
              left: dropdownPosition.left,
              top: dropdownPosition.top,
              minWidth: dropdownPosition.minWidth
            }}
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
          </div>,
          document.body
        )
      : null;

  return (
    <div className="relative inline-flex max-w-[52%] shrink-0 overflow-visible">
      <input type="hidden" name={name} value={selectedCountry.code} />
      <button
        ref={triggerRef}
        type="button"
        className={cn(
          'inline-flex h-8 max-w-full items-center gap-1.5 rounded-xl border border-border bg-slate-50 py-0 pl-2 pr-2 text-sm font-semibold text-slate-700 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
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

      {dropdown}
    </div>
  );
}
