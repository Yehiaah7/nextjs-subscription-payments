'use client';

import { Loader2 } from 'lucide-react';
import { ComponentPropsWithoutRef, ReactNode } from 'react';
import { MotionButton } from '@/components/motion';
import { cn } from '@/utils/cn';

type LoadingButtonProps = Omit<ComponentPropsWithoutRef<typeof MotionButton>, 'children'> & {
  children: ReactNode;
  loading?: boolean;
  spinnerClassName?: string;
};

export default function LoadingButton({
  children,
  className,
  disabled,
  loading = false,
  spinnerClassName,
  ...props
}: LoadingButtonProps) {
  const isDisabled = loading || disabled;

  return (
    <MotionButton
      disabled={isDisabled}
      aria-disabled={isDisabled}
      className={cn('inline-flex items-center justify-center', className)}
      {...props}
    >
      <span>{children}</span>
      <span className="ml-2 grid h-4 w-4 place-items-center" aria-hidden="true">
        {loading ? (
          <Loader2 className={cn('h-4 w-4 animate-spin', spinnerClassName)} />
        ) : (
          <span className="h-4 w-4" />
        )}
      </span>
    </MotionButton>
  );
}
