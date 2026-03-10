'use client';

import { BadgeCheck, CheckCircle2 } from 'lucide-react';

type ProGymPassCardProps = {
  onUpgrade?: () => void;
  variant?: 'profile' | 'plans';
  id?: string;
};

export default function ProGymPassCard({ onUpgrade, variant = 'profile', id }: ProGymPassCardProps) {
  const buttonClassName =
    variant === 'plans'
      ? 'mt-3 h-[49px] w-full rounded-[16px] bg-[#155dfc] px-[72px] py-4 text-[12px] font-bold uppercase tracking-[1.2px] text-white'
      : 'mt-3 inline-flex h-[43px] w-full items-center justify-center rounded-[999px] bg-white text-[10px] font-black uppercase tracking-[1px] text-[#1c398e]';

  return (
    <section id={id} className="rounded-[16px] border border-[#1447e6] bg-[#447dfd] p-3 text-white">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[rgba(255,255,255,0.2)] text-white">
          <BadgeCheck className="h-4 w-4" />
        </span>
        <h2 className="text-[16px] font-bold tracking-[-0.4px]">Pro Gym Pass</h2>
      </div>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-[1px] text-[#dbeafe]">Foundation Level</p>
      <ul className="mt-3 space-y-1 text-[12px] font-medium leading-4 text-[#dbeafe]">
        <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white" />All company assignments unlocked</li>
        <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white" />Unlimited daily challenges</li>
        <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white" />Decision quality analytics</li>
      </ul>
      <button type="button" onClick={onUpgrade} className={buttonClassName}>
        Upgrade to Pro
      </button>
    </section>
  );
}
