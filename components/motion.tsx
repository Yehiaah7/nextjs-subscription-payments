'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

const transition = { duration: 0.18, ease: 'easeOut' } as const;

export function MotionCard({
  children,
  className,
  disabled,
  ...props
}: {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
} & ComponentPropsWithoutRef<typeof motion.div>) {
  const reducedMotion = Boolean(useReducedMotion());

  return (
    <motion.div
      {...props}
      whileHover={
        reducedMotion || disabled
          ? undefined
          : { y: -2, scale: 1.01 }
      }
      whileTap={reducedMotion || disabled ? undefined : { scale: 0.99 }}
      transition={transition}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

export function MotionButton({
  className,
  children,
  disabled,
  ...props
}: ComponentPropsWithoutRef<typeof motion.button>) {
  const reducedMotion = Boolean(useReducedMotion());

  return (
    <motion.button
      {...props}
      disabled={disabled}
      whileHover={
        reducedMotion || disabled
          ? undefined
          : { scale: 1.01, filter: 'brightness(1.02)' }
      }
      whileTap={reducedMotion || disabled ? undefined : { scale: 0.98 }}
      transition={transition}
      className={cn(className)}
    >
      {children}
    </motion.button>
  );
}

export function MotionIconButton({
  className,
  children,
  disabled,
  ...props
}: ComponentPropsWithoutRef<typeof motion.button>) {
  const reducedMotion = Boolean(useReducedMotion());

  return (
    <motion.button
      {...props}
      disabled={disabled}
      whileHover={reducedMotion || disabled ? undefined : { scale: 1.05 }}
      whileTap={reducedMotion || disabled ? undefined : { scale: 0.96 }}
      transition={transition}
      className={cn('rounded-full', className)}
    >
      {children}
    </motion.button>
  );
}

export function MotionInput({
  className,
  children
}: {
  className?: string;
  children: ReactNode;
}) {
  const reducedMotion = Boolean(useReducedMotion());

  return (
    <motion.div
      whileHover={reducedMotion ? undefined : { scale: 1.002 }}
      transition={transition}
      className={cn(
        'transition-shadow focus-within:shadow-[0_0_0_2px_rgba(37,99,235,0.12)]',
        className
      )}
    >
      {children}
    </motion.div>
  );
}
