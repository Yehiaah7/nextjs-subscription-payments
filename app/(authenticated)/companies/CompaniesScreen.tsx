'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MotionCard } from '@/components/motion';
import MotionPage from '@/components/motion/MotionPage';
import {
  cardInteractive,
  focusRingInteractive,
  iconBtnInteractive
} from '@/components/ui/interactive';
import { fadeSlideUp, listVariants } from '@/lib/motion';
import { cn } from '@/utils/cn';
import type { CompanySummary } from './company-summary';
import { getCompanyHref } from './navigation';
import CompanySummaryCard from './CompanySummaryCard';

export default function CompaniesScreen({
  companyTracks
}: {
  companyTracks: CompanySummary[];
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
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="t-title">All Companies</h1>
        </header>
        <motion.div
          className="space-y-4 pb-8"
          variants={listVariants}
          initial="initial"
          animate="animate"
        >
          {companyTracks.map((track) => (
            <motion.div key={track.id} variants={fadeSlideUp}>
              <MotionCard>
                <Link
                  href={getCompanyHref(track.id)}
                  className={cn(
                    'app-card block cursor-pointer',
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
                        <span className="t-label ml-auto text-primary">Resume</span>
                        <span
                          className={cn(
                            'grid h-8 w-8 place-items-center rounded-pill bg-primary-soft text-primary',
                            iconBtnInteractive
                          )}
                          aria-hidden="true"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </span>
                      </div>
                    }
                  />
                </Link>
              </MotionCard>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </MotionPage>
  );
}
