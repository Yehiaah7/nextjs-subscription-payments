'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import {
  ChevronLeftFilledIcon,
  ChevronRightFilledIcon
} from '@/components/icons/FilledIcons';
import { MotionCard } from '@/components/motion';
import MotionPage from '@/components/motion/MotionPage';
import {
  cardInteractive,
  focusRingInteractive,
  iconBtnInteractive
} from '@/components/ui/interactive';
import { fadeSlideUp, listVariants } from '@/lib/motion';
import { cn } from '@/utils/cn';
import { canAccessCompany } from '@/utils/access';
import type { CompanySummary } from './company-summary';
import { getCompanyHref } from './navigation';
import CompanySummaryCard from './CompanySummaryCard';

export default function CompaniesScreen({
  companyTracks,
  isPro,
  isTrialActive
}: {
  companyTracks: CompanySummary[];
  isPro: boolean;
  isTrialActive: boolean;
}) {
  return (
    <MotionPage>
      <section>
        <header className="mb-4 flex items-center gap-3">
          <Link
            href="/home"
            className={cn(
              'grid h-9 w-9 place-items-center rounded-button bg-surface-muted text-muted',
              iconBtnInteractive,
              focusRingInteractive
            )}
            aria-label="Back to home"
          >
            <ChevronLeftFilledIcon className="h-5 w-5" />
          </Link>
          <h1 className="t-title">All Companies</h1>
        </header>
        <motion.div
          className="space-y-4 pb-8"
          variants={listVariants}
          initial="initial"
          animate="animate"
        >
          {companyTracks.map((track) => {
            const boundedProgress = Math.max(0, Math.min(100, track.progress));
            const locked = !canAccessCompany({
              companySlug: track.name,
              isPro,
              isTrialActive
            });
            const ctaLabel = locked
              ? 'Unlock Pro'
              : boundedProgress === 0
                ? 'Start'
                : 'Continue';

            return (
              <motion.div key={track.id} variants={fadeSlideUp}>
                <MotionCard>
                  <Link
                    href={locked ? '/home?upgrade=1' : getCompanyHref(track.id)}
                    className={cn(
                      'app-card block cursor-pointer',
                      locked && 'bg-slate-50 opacity-75',
                      cardInteractive,
                      focusRingInteractive
                    )}
                    aria-label={`Open ${track.name}`}
                  >
                    <CompanySummaryCard
                      company={track}
                      className="p-0"
                      footer={
                        <div className="flex items-center gap-3">
                          {locked ? (
                            <Lock className="h-4 w-4 text-muted" />
                          ) : null}
                          <span className="t-label ml-auto text-primary">
                            {ctaLabel}
                          </span>
                          <span
                            className={cn(
                              'grid h-8 w-8 place-items-center rounded-pill bg-primary-soft text-primary',
                              iconBtnInteractive
                            )}
                            aria-hidden="true"
                          >
                            {locked ? (
                              <Lock className="h-4 w-4" />
                            ) : (
                              <ChevronRightFilledIcon className="h-4 w-4" />
                            )}
                          </span>
                        </div>
                      }
                    />
                  </Link>
                </MotionCard>
              </motion.div>
            );
          })}
        </motion.div>
      </section>
    </MotionPage>
  );
}
