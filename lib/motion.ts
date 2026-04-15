'use client';

import { useReducedMotion, type Variants } from 'framer-motion';

export const springTransition = {
  type: 'spring',
  stiffness: 420,
  damping: 32,
  mass: 0.6
} as const;

export const easeOutTransition = {
  duration: 0.2,
  ease: 'easeOut'
} as const;

export const useReducedMotionPref = () => Boolean(useReducedMotion());

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: easeOutTransition },
  exit: { opacity: 0, y: 6, transition: { duration: 0.18, ease: 'easeOut' } }
};

export const cardVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: easeOutTransition }
};

export const listVariants: Variants = {
  initial: { opacity: 1 },
  animate: { opacity: 1, transition: { staggerChildren: 0.03 } }
};

export const fadeSlideUp: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: easeOutTransition }
};

export const tapScale = {
  card: { scale: 0.985 },
  cta: { scale: 0.98 },
  none: { scale: 1 }
} as const;
