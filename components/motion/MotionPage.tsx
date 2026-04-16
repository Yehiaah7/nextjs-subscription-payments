'use client';

import { motion } from 'framer-motion';
import { PropsWithChildren } from 'react';
import { pageVariants, useReducedMotionPref } from '@/lib/motion';

export default function MotionPage({ children }: PropsWithChildren) {
  const reducedMotion = useReducedMotionPref();
  const reducedProps = reducedMotion
    ? {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 }
      }
    : {
        variants: pageVariants,
        initial: 'initial' as const,
        animate: 'animate' as const,
        exit: 'exit' as const
      };

  return (
    <motion.div {...reducedProps}>
      {children}
    </motion.div>
  );
}
