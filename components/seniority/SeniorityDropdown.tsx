'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { SENIORITY_LABELS, SENIORITY_OPTIONS, Seniority } from './constants';

export default function SeniorityDropdown({
  selected,
  onSelect
}: {
  selected: Seniority;
  onSelect: (seniority: Seniority) => void;
}) {
  const [showSeniorityMenu, setShowSeniorityMenu] = useState(false);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={() => setShowSeniorityMenu((current) => !current)}
        className="inline-flex items-center gap-1 rounded-pill bg-primary-soft px-2 py-0.5 text-primary"
        aria-haspopup="menu"
        aria-expanded={showSeniorityMenu}
      >
        {SENIORITY_LABELS[selected]}
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {showSeniorityMenu && (
        <div className="absolute left-0 top-full z-10 mt-1 min-w-[120px] rounded-card border border-line bg-container p-1 shadow-card">
          {SENIORITY_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onSelect(option);
                setShowSeniorityMenu(false);
              }}
              className={`block w-full rounded-md px-2 py-1 text-left text-[12px] font-semibold leading-[1.35] ${
                selected === option
                  ? 'bg-primary-soft text-primary'
                  : 'text-text hover:bg-surface-soft'
              }`}
            >
              {SENIORITY_LABELS[option]}
            </button>
          ))}
        </div>
      )}
    </span>
  );
}
