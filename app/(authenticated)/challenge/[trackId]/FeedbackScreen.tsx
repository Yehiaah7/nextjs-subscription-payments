'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import MotionPage from '@/components/motion/MotionPage';
import { tapScale, useReducedMotionPref } from '@/lib/motion';

export default function FeedbackScreen({
  variant
}: {
  variant: 'correct' | 'wrong';
}) {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('company');
  const returnToTrackHref = companyId ? `/companies/${companyId}` : '/home';
  const reducedMotion = useReducedMotionPref();

  return (
    <MotionPage>
      <section className="mx-auto flex w-full max-w-[361px] flex-col gap-4 rounded-2xl bg-white p-4 text-[#0f172b]">
        <h1 className="text-2xl font-bold">
          {variant === 'correct' ? 'Great decision' : 'Try again'}
        </h1>
        <p className="text-sm text-[#62748e]">
          {variant === 'correct'
            ? 'You can continue to the next step.'
            : 'Review the feedback and retry this step to proceed.'}
        </p>
        <motion.div whileTap={reducedMotion ? undefined : tapScale.cta}>
          <Link
            href={returnToTrackHref}
            className="inline-flex h-[45px] w-full items-center justify-center rounded-2xl bg-[#155dfc] text-sm font-bold text-white"
          >
            Back to Challenges
          </Link>
        </motion.div>
      </section>
    </MotionPage>
  );
}
