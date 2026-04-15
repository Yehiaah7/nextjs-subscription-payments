'use client';

import { motion } from 'framer-motion';
import { PropsWithChildren } from 'react';
import { pageVariants, useReducedMotionPref } from '@/lib/motion';

export default function MotionPage({ children }: PropsWithChildren) {
  const reducedMotion = useReducedMotionPref();

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      {...(reducedMotion
        ? {
            initial: { opacity: 1 },
            animate: { opacity: 1 },
            exit: { opacity: 1 }
          }
        : {})}
    >
      {children}
    </motion.div>
  );
}
