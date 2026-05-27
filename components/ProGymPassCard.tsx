'use client';

import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { CheckCircleFilledIcon } from '@/components/icons/FilledIcons';
import LoadingButton from '@/components/ui/LoadingButton';
import { getStripe } from '@/utils/stripe/client';
import { checkoutWithDefaultPrice } from '@/utils/stripe/server';
import { getErrorRedirect } from '@/utils/helpers';
import { calculateTrialDaysLeft, formatTrialCountdownLabel } from '@/utils/trial';

type ProGymPassCardProps = {
  onUpgrade?: () => void;
  variant?: 'profile' | 'plans';
  subscriptionState?: 'trial' | 'expired' | 'pro';
  trialDaysLeft?: number;
  trialEndAt?: string | Date | null;
  trialStartedAt?: string | Date | null;
  id?: string;
};

export default function ProGymPassCard({
  onUpgrade,
  variant = 'profile',
  subscriptionState = 'trial',
  trialDaysLeft = 7,
  trialEndAt,
  trialStartedAt,
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
      ? 'mt-3 inline-flex h-[49px] w-full items-center justify-center rounded-full bg-white px-6 py-4 text-[12px] font-bold uppercase tracking-[1.2px] text-[var(--color-brand-green-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-brand-green-strong)]'
      : 'mt-3 inline-flex h-[43px] w-full items-center justify-center rounded-full bg-white text-[10px] font-black uppercase tracking-[1px] text-[var(--color-brand-green-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-brand-green-strong)]';

  const isTrial = subscriptionState === 'trial';
  const isPro = subscriptionState === 'pro';
  const hasExpiredTrial = subscriptionState === 'expired';

  const calculatedTrialDaysLeft = calculateTrialDaysLeft({
    trialEndAt,
    trialStartedAt,
    trialDurationDays: trialDaysLeft
  });

  const trialDaysLabel = formatTrialCountdownLabel(calculatedTrialDaysLeft);

  return (
    <section id={id} className="rounded-[16px] border border-[#18833D] bg-[var(--color-brand-green-strong)] p-3 text-white">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[rgba(255,255,255,0.2)] text-white">
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
            </svg>
          </span>

          <div>
            <h2 className="text-[16px] font-bold tracking-[-0.4px]">Pro Gym Pass</h2>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[1px] text-[#E6F8DE]">
              {isPro ? 'Pro Active' : 'Free Trial'}
            </p>
          </div>
        </div>

        {isTrial || hasExpiredTrial ? (
          <span className="rounded-full bg-white/20 px-2 py-1 text-[10px] font-black uppercase tracking-[1px] text-white">
            {trialDaysLabel}
          </span>
        ) : null}
      </div>

      {isTrial ? (
        <div className="mt-3">
          <p className="text-[11px] font-bold uppercase tracking-[1px] text-[#E6F8DE]">
            Included in your 7-day free trial:
          </p>

          <ul className="mt-2 space-y-2 text-[12px] font-medium leading-4 text-[#F2FBEF]">
            <li className="flex items-center gap-2.5">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white">
                <Image src="/airbnb.svg" alt="Airbnb" width={16} height={16} className="h-4 w-4 object-contain" />
              </span>
              <span>Airbnb unlocked</span>
            </li>

            <li className="flex items-center gap-2.5">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white">
                <Image src="/Uber.svg" alt="Uber" width={16} height={16} className="h-4 w-4 object-contain" />
              </span>
              <span>Uber unlocked</span>
            </li>
          </ul>
        </div>
      ) : null}

      <p className="mt-3 text-[11px] font-bold uppercase tracking-[1px] text-[#E6F8DE]">
        {isPro ? 'Pro benefits:' : 'Upgrade to Pro to unlock:'}
      </p>

      <ul className="mt-1 space-y-1 text-[12px] font-medium leading-4 text-[#F2FBEF]">
        <li className="flex items-start gap-2">
          <CheckCircleFilledIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white" />
          <span>All company assignments unlocked</span>
        </li>

        <li className="flex items-start gap-2">
          <CheckCircleFilledIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white" />
          <span>Unlimited daily challenges</span>
        </li>

        <li className="flex items-start gap-2">
          <CheckCircleFilledIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white" />
          <span>Decision quality analytics</span>
        </li>
      </ul>

      {isPro ? (
        <p className="mt-3 text-center text-[11px] font-bold uppercase tracking-[0.8px] text-white">
          Pro plan active
        </p>
      ) : (
        <>
          <LoadingButton type="button" onClick={handleUpgrade} loading={isUpgrading} className={primaryButtonClassName}>
            Upgrade to Pro
          </LoadingButton>

          <p className="mt-2 text-center text-[10px] font-medium text-[#E6F8DE]">Cancel anytime</p>
        </>
      )}
    </section>
  );
}