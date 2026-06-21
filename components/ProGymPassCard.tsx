'use client';

import { CheckCircleFilledIcon } from '@/components/icons/FilledIcons';
import LoadingButton from '@/components/ui/LoadingButton';
import { useLemonSqueezyUpgrade } from '@/components/useLemonSqueezyUpgrade';
import { PRODUCT_GYM_MONTHLY_PRICE_LABEL } from '@/utils/pricing-display';
import {
  calculateTrialDaysLeft,
  formatTrialCountdownLabel
} from '@/utils/trial';

type ProGymPassCardProps = {
  onUpgrade?: () => void;
  variant?: 'profile' | 'plans';
  subscriptionState?: 'trial' | 'expired' | 'pro';
  trialDaysLeft?: number;
  trialEndAt?: string | Date | null;
  trialStartedAt?: string | Date | null;
  id?: string;
};

function AirbnbLogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 47 50"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M46.25 35.5C46 34.9 45.75 34.25 45.5 33.7C45.1 32.8 44.7 31.95 44.35 31.15L44.3 31.1C40.85 23.6 37.15 16 33.25 8.5L33.1 8.2C32.7 7.45 32.3 6.65 31.9 5.85C31.4 4.95 30.9 4 30.1 3.1C28.5 1.1 26.2 0 23.75 0C21.25 0 19 1.1 17.35 3C16.6 3.9 16.05 4.85 15.55 5.75C15.15 6.55 14.75 7.35 14.35 8.1L14.2 8.4C10.35 15.9 6.6 23.5 3.15002 31L3.10002 31.1C2.75002 31.9 2.35002 32.75 1.95002 33.65C1.70002 34.2 1.45002 34.8 1.20002 35.45C0.550016 37.3 0.350017 39.05 0.600016 40.85C1.15002 44.6 3.65002 47.75 7.1 49.15C8.4 49.7 9.75 49.95 11.15 49.95C11.55 49.95 12.05 49.9 12.45 49.85C14.1 49.65 15.8 49.1 17.45 48.15C19.5 47 21.45 45.35 23.65 42.95C25.85 45.35 27.85 47 29.85 48.15C31.5 49.1 33.2 49.65 34.85 49.85C35.25 49.9 35.75 49.95 36.15 49.95C37.55 49.95 38.95 49.7 40.2 49.15C43.7 47.75 46.15 44.55 46.7 40.85C47.1 39.1 46.9 37.35 46.25 35.5ZM23.7 38.1C21 34.7 19.25 31.5 18.65 28.8C18.4 27.65 18.35 26.65 18.5 25.75C18.6 24.95 18.9 24.25 19.3 23.65C20.25 22.3 21.85 21.45 23.7 21.45C25.55 21.45 27.2 22.25 28.1 23.65C28.5 24.25 28.8 24.95 28.9 25.75C29.05 26.65 29 27.7 28.75 28.8C28.15 31.45 26.4 34.65 23.7 38.1ZM43.65 40.45C43.3 43.05 41.55 45.3 39.1 46.3C37.9 46.8 36.6 46.95 35.3 46.8C34.05 46.65 32.8 46.25 31.5 45.5C29.7 44.5 27.9 42.95 25.8 40.65C29.1 36.6 31.1 32.9 31.85 29.6C32.2 28.05 32.25 26.65 32.1 25.35C31.9 24.1 31.45 22.95 30.75 21.95C29.2 19.7 26.6 18.4 23.7 18.4C20.8 18.4 18.2 19.75 16.65 21.95C15.95 22.95 15.5 24.1 15.3 25.35C15.1 26.65 15.15 28.1 15.55 29.6C16.3 32.9 18.35 36.65 21.6 40.7C19.55 43 17.7 44.55 15.9 45.55C14.6 46.3 13.35 46.7 12.1 46.85C10.75 47 9.45 46.8 8.3 46.35C5.85 45.35 4.10002 43.1 3.75002 40.5C3.60002 39.25 3.70002 38 4.20002 36.6C4.35002 36.1 4.60002 35.6 4.85002 35C5.2 34.2 5.6 33.35 6 32.5L6.05 32.4C9.5 24.95 13.2 17.35 17.05 9.95L17.2 9.65C17.6 8.9 18 8.1 18.4 7.35C18.8 6.55 19.25 5.8 19.8 5.15C20.85 3.95 22.25 3.3 23.8 3.3C25.35 3.3 26.75 3.95 27.8 5.15C28.35 5.8 28.8 6.55 29.2 7.35C29.6 8.1 30 8.9 30.4 9.65L30.55 9.95C34.35 17.4 38.05 25 41.5 32.45V32.5C41.9 33.3 42.25 34.2 42.65 35C42.9 35.6 43.15 36.1 43.3 36.6C43.7 37.9 43.85 39.15 43.65 40.45Z"
        fill="currentColor"
      />
    </svg>
  );
}

function UberLogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 155.8 52.3"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M7.7,31.8V0H0v32.2c0,12.1,8.5,20.1,19.5,20.1c5.4,0,10.1-2.1,13.6-5.7v4.8h7.6V0H33v31.8c0,8.2-5.5,13.7-12.6,13.7C13.2,45.4,7.7,40.1,7.7,31.8z M48.3,51.5h7.3v-4.7c3.4,3.5,8.2,5.6,13.4,5.6c11,0,19.7-8.7,19.7-19.6c0-10.9-8.7-19.6-19.7-19.6c-5.2,0-9.9,2.1-13.3,5.6V0h-7.4V51.5z M55.6,32.8c0-7.3,5.8-13,12.9-13c7.1,0,12.9,5.7,12.9,13c0,7.2-5.8,13-12.9,13C61.3,45.8,55.6,40,55.6,32.8z M93.1,32.7c0,11.2,8.7,19.6,19.9,19.6c6.8,0,12.4-3,16.2-8l-5.4-4c-2.8,3.7-6.5,5.5-10.8,5.5c-6.3,0-11.4-4.6-12.4-10.7h30.5v-2.4c0-11.2-7.9-19.5-18.7-19.5C101.4,13.2,93.1,22.1,93.1,32.7z M112.2,19.7c5.5,0,10.1,3.8,11.4,9.6h-22.9C102.1,23.5,106.7,19.7,112.2,19.7z M155.8,20.6v-6.9h-2.6c-4.1,0-7.1,1.9-9,4.9V14H137v37.5h7.4V30.1c0-5.8,3.5-9.6,8.4-9.6H155.8z" />
    </svg>
  );
}

export default function ProGymPassCard({
  onUpgrade,
  variant = 'profile',
  subscriptionState = 'trial',
  trialDaysLeft = 7,
  trialEndAt,
  trialStartedAt,
  id
}: ProGymPassCardProps) {
  const { handleUpgrade, isUpgrading } = useLemonSqueezyUpgrade(onUpgrade);

  const primaryButtonClassName =
    variant === 'plans'
      ? 'mt-3 inline-flex h-[49px] w-full items-center justify-center rounded-full bg-productGym-ink px-6 py-4 text-[12px] font-bold uppercase tracking-[1.2px] text-white shadow-sm shadow-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 focus-visible:ring-offset-productGym-yellow'
      : 'mt-3 inline-flex h-[43px] w-full items-center justify-center rounded-full bg-productGym-ink text-[10px] font-black uppercase tracking-[1px] text-white shadow-sm shadow-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 focus-visible:ring-offset-productGym-yellow';

  const isTrial = subscriptionState === 'trial';
  const isPro = subscriptionState === 'pro';
  const hasExpiredTrial = subscriptionState === 'expired';

  const calculatedTrialDaysLeft = calculateTrialDaysLeft({
    trialEndAt,
    trialStartedAt,
    trialDurationDays: trialDaysLeft
  });

  const trialDaysLabel = formatTrialCountdownLabel(calculatedTrialDaysLeft);

  if (isPro) {
    return (
      <section
        id={id}
        className="rounded-[16px] border border-amber-200/80 bg-[#fff4c7] p-[14px] text-[#1f2933] shadow-sm shadow-amber-900/5"
      >
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#d69e2e] text-white shadow-sm shadow-amber-900/15">
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              className="h-4 w-4"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
            </svg>
          </span>

          <div className="min-w-0">
            <h2 className="text-[16px] font-black tracking-[-0.4px] text-[#18181b]">
              Pro Plan Active
            </h2>
            <p className="mt-1 text-[12px] font-semibold leading-5 text-[#3f3f46]">
              You’re currently on Product Gym Pro.
            </p>
            <p className="mt-3 inline-flex rounded-full bg-[#8a5a00] px-3 py-1 text-[10px] font-black uppercase tracking-[0.9px] text-white shadow-sm shadow-amber-900/10">
              All companies unlocked
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id={id}
      className="rounded-[16px] bg-productGym-yellow p-[14px] text-productGym-ink shadow-sm shadow-black/5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2">
          <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-productGym-ink shadow-sm shadow-black/10">
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              className="h-4 w-4"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
            </svg>
          </span>

          <div className="min-w-0">
            <h2 className="text-[16px] font-bold tracking-[-0.4px]">
              Pro Gym Pass
            </h2>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[1px] text-productGym-ink/80">
              {isPro
                ? 'Pro Active'
                : hasExpiredTrial
                  ? 'Free Trial Ended'
                  : 'Free Trial'}
            </p>
            {isTrial || hasExpiredTrial ? (
              <p className="mt-1 inline-flex rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[1px] text-productGym-ink shadow-sm shadow-black/10">
                {hasExpiredTrial ? 'Free trial ended' : trialDaysLabel}
              </p>
            ) : null}
          </div>
        </div>

        <div className="shrink-0 pt-1 text-right text-[15px] font-black leading-none tracking-[-0.03em] text-productGym-ink">
          {PRODUCT_GYM_MONTHLY_PRICE_LABEL}
        </div>
      </div>

      {isTrial ? (
        <div className="mt-3">
          <p className="text-[11px] font-bold uppercase tracking-[1px] text-productGym-ink/80">
            Included in your 7-day free trial:
          </p>

          <ul className="mt-2 space-y-2 text-[12px] font-medium leading-4 text-productGym-ink">
            <li className="flex items-center gap-2.5">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#ff5a5f] text-white shadow-sm shadow-black/10">
                <AirbnbLogoMark className="h-4 w-4" />
              </span>
              <span>Airbnb unlocked</span>
            </li>

            <li className="flex items-center gap-2.5">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-black text-white shadow-sm shadow-black/10">
                <UberLogoMark className="h-2.5 w-[18px]" />
              </span>
              <span>Uber unlocked</span>
            </li>
          </ul>
        </div>
      ) : null}

      {hasExpiredTrial ? (
        <p className="mt-3 text-[12px] font-semibold leading-5 text-productGym-ink/85">
          Upgrade to Pro to unlock all companies and continue practicing.
        </p>
      ) : null}

      <p className="mt-3 text-[11px] font-bold uppercase tracking-[1px] text-productGym-ink/80">
        {isPro ? 'Pro benefits:' : 'Upgrade to Pro to unlock:'}
      </p>

      <ul className="mt-1 space-y-1 text-[12px] font-medium leading-4 text-productGym-ink">
        <li className="flex items-start gap-2">
          <CheckCircleFilledIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-productGym-ink" />
          <span>All company assignments unlocked</span>
        </li>

        <li className="flex items-start gap-2">
          <CheckCircleFilledIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-productGym-ink" />
          <span>Unlimited daily challenges</span>
        </li>

        <li className="flex items-start gap-2">
          <CheckCircleFilledIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-productGym-ink" />
          <span>Decision quality analytics</span>
        </li>
      </ul>

      {isPro ? (
        <p className="mt-3 text-center text-[11px] font-bold uppercase tracking-[0.8px] text-productGym-ink/80">
          Pro plan active
        </p>
      ) : (
        <>
          <LoadingButton
            type="button"
            onClick={handleUpgrade}
            loading={isUpgrading}
            className={primaryButtonClassName}
          >
            Upgrade to Pro
          </LoadingButton>

          <p className="mt-2 text-center text-[10px] font-medium text-productGym-ink/75">
            Cancel anytime
          </p>
        </>
      )}
    </section>
  );
}
