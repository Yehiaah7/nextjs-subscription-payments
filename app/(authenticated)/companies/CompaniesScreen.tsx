'use client';

import {
  Building2,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  UserRound
} from 'lucide-react';
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
import { getCompanyHref } from './navigation';

export type CompanyTrack = {
  id: string;
  title: string;
  focus: string;
  challengesCount: number;
  practicingCount: string;
  progress: number;
};

export default function CompaniesScreen({
  companyTracks
}: {
  companyTracks: CompanyTrack[];
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
              >
                <div className="mb-3 flex items-start gap-3">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-card bg-container text-muted">
                    <Building2 className="h-7 w-7" aria-hidden />
                  </div>
                  <div>
                    <h2 className="t-card-title text-[22px]">{track.title}</h2>
                    {track.focus ? (
                      <p className="t-body-muted">Focus: {track.focus}</p>
                    ) : null}
                    <div className="t-label mt-1 flex items-center gap-3 text-muted">
                      <span className="flex items-center gap-1">
                        <CircleDot className="h-4 w-4" />
                        {track.challengesCount} Challenges
                      </span>
                      <span className="flex items-center gap-1">
                        <UserRound className="h-4 w-4" />
                        {track.practicingCount} Practicing
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2.5 flex-1 rounded-pill bg-surface-soft">
                    <div
                      className="h-full rounded-pill bg-primary"
                      style={{
                        width: `${Math.max(0, Math.min(100, track.progress))}%`
                      }}
                    />
                  </div>
                  <span className="t-label text-primary">Resume</span>
                  <span
                    className={cn(
                      'grid h-8 w-8 place-items-center rounded-pill bg-primary-soft text-primary',
                      iconBtnInteractive
                    )}
                    aria-label={`Resume ${track.title}`}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
              </MotionCard>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </MotionPage>
  );
}
