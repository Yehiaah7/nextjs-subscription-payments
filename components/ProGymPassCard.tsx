'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { BadgeCheck, CheckCircle2 } from 'lucide-react';
import { getStripe } from '@/utils/stripe/client';
import { checkoutWithDefaultPrice } from '@/utils/stripe/server';
import { getErrorRedirect } from '@/utils/helpers';

type ProGymPassCardProps = {
  onUpgrade?: () => void;
  managePlansHref?: string;
  managePlansLabel?: string;
  variant?: 'profile' | 'plans';
  id?: string;
};

export default function ProGymPassCard({
  onUpgrade,
  managePlansHref = '/plans',
  managePlansLabel = 'View Plans',
  variant = 'profile',
  id
}: ProGymPassCardProps) {
  const router = useRouter();
  const currentPath = usePathname();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    if (onUpgrade) {
      onUpgrade();
      return;
    }

    setIsUpgrading(true);

    const { errorRedirect, sessionId } = await checkoutWithDefaultPrice(currentPath);

    if (errorRedirect) {
      setIsUpgrading(false);
      return router.push(errorRedirect);
    }

    if (!sessionId) {
      setIsUpgrading(false);
      return router.push(
        getErrorRedirect(
          currentPath,
          'An unknown error occurred.',
          'Please try again later or contact a system administrator.'
        )
      );
    }

    const stripe = await getStripe();
    await stripe?.redirectToCheckout({ sessionId });

    setIsUpgrading(false);
  };

  const primaryButtonClassName =
    variant === 'plans'
      ? 'mt-3 inline-flex h-[49px] w-full items-center justify-center rounded-full bg-white px-6 py-4 text-[12px] font-bold uppercase tracking-[1.2px] text-[#1c398e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c398e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#447dfd]'
      : 'mt-3 inline-flex h-[43px] w-full items-center justify-center rounded-full bg-white text-[10px] font-black uppercase tracking-[1px] text-[#1c398e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c398e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#447dfd]';

  const secondaryButtonClassName =
    variant === 'plans'
      ? 'mt-2 inline-flex h-[49px] w-full items-center justify-center rounded-full border border-white bg-transparent px-6 py-4 text-[12px] font-bold uppercase tracking-[1.2px] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#447dfd]'
      : 'mt-2 inline-flex h-[43px] w-full items-center justify-center rounded-full border border-white bg-transparent text-[10px] font-black uppercase tracking-[1px] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#447dfd]';

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
      <button type="button" onClick={handleUpgrade} disabled={isUpgrading} className={primaryButtonClassName}>
        {isUpgrading ? 'Loading...' : 'Upgrade to Pro'}
      </button>
      <Link href={managePlansHref} className={secondaryButtonClassName}>
        {managePlansLabel}
      </Link>
    </section>
  );
}
